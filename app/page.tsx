'use client';

import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { PlusCircle, MinusCircle, TrendingUp, TrendingDown, Calendar, Wallet, Download, Upload } from 'lucide-react';

interface Transaction {
  id: string;
  date: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
}

export default function KathaManagement() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    type: 'expense' as 'income' | 'expense',
    amount: '',
    category: '',
    description: '',
  });

  useEffect(() => {
    const saved = localStorage.getItem('katha-transactions');
    if (saved) {
      setTransactions(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('katha-transactions', JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      date: formData.date,
      type: formData.type,
      amount: parseFloat(formData.amount),
      category: formData.category,
      description: formData.description,
    };
    setTransactions([...transactions, newTransaction]);
    setFormData({
      date: format(new Date(), 'yyyy-MM-dd'),
      type: 'expense',
      amount: '',
      category: '',
      description: '',
    });
    setShowForm(false);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const getMonthlyStats = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);

    const monthlyTransactions = transactions.filter(t => {
      const transDate = parseISO(t.date);
      return transDate >= monthStart && transDate <= monthEnd;
    });

    const income = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return { income, expense, balance: income - expense };
  };

  const getDailyTransactions = (date: Date) => {
    return transactions.filter(t => isSameDay(parseISO(t.date), date));
  };

  const exportData = () => {
    const dataStr = JSON.stringify(transactions, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `katha-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
    link.click();
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string);
          setTransactions(imported);
        } catch (error) {
          alert('Invalid file format');
        }
      };
      reader.readAsText(file);
    }
  };

  const stats = getMonthlyStats();
  const monthDays = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <Wallet className="text-indigo-600" />
              Katha Management
            </h1>
            <div className="flex gap-2">
              <button
                onClick={exportData}
                className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                title="Export Data"
              >
                <Download size={20} />
              </button>
              <label className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition cursor-pointer" title="Import Data">
                <Upload size={20} />
                <input type="file" accept=".json" onChange={importData} className="hidden" />
              </label>
            </div>
          </div>

          {/* Monthly Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-2">
                <TrendingUp size={20} />
                <span className="font-semibold">Income</span>
              </div>
              <div className="text-2xl font-bold text-green-800 dark:text-green-300">
                ₹{stats.income.toFixed(2)}
              </div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-400 mb-2">
                <TrendingDown size={20} />
                <span className="font-semibold">Expense</span>
              </div>
              <div className="text-2xl font-bold text-red-800 dark:text-red-300">
                ₹{stats.expense.toFixed(2)}
              </div>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl">
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 mb-2">
                <Wallet size={20} />
                <span className="font-semibold">Balance</span>
              </div>
              <div className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-indigo-800 dark:text-indigo-300' : 'text-red-800 dark:text-red-300'}`}>
                ₹{stats.balance.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition"
            >
              Previous
            </button>
            <div className="flex items-center gap-2 text-lg font-semibold text-gray-700 dark:text-gray-300">
              <Calendar size={20} />
              {format(currentDate, 'MMMM yyyy')}
            </div>
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition"
            >
              Next
            </button>
          </div>
        </div>

        {/* Add Transaction Button */}
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full mb-6 bg-indigo-600 text-white p-4 rounded-2xl shadow-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2 font-semibold"
        >
          <PlusCircle size={24} />
          Add Transaction
        </button>

        {/* Transaction Form */}
        {showForm && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
            <form onSubmit={addTransaction} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Food, Transport, Salary, etc."
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Details about this transaction"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition font-semibold"
                >
                  Save Transaction
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-500 text-white p-3 rounded-lg hover:bg-gray-600 transition font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Calendar View */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Daily Transactions</h2>
          <div className="space-y-4">
            {monthDays.map((day) => {
              const dailyTrans = getDailyTransactions(day);
              if (dailyTrans.length === 0) return null;

              const dailyIncome = dailyTrans.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
              const dailyExpense = dailyTrans.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

              return (
                <div key={day.toISOString()} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-800 dark:text-white">{format(day, 'EEEE, MMM dd')}</h3>
                    <div className="flex gap-4 text-sm">
                      <span className="text-green-600 dark:text-green-400">+₹{dailyIncome.toFixed(2)}</span>
                      <span className="text-red-600 dark:text-red-400">-₹{dailyExpense.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {dailyTrans.map((trans) => (
                      <div
                        key={trans.id}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          trans.type === 'income'
                            ? 'bg-green-50 dark:bg-green-900/20'
                            : 'bg-red-50 dark:bg-red-900/20'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {trans.type === 'income' ? (
                            <PlusCircle className="text-green-600 dark:text-green-400" size={20} />
                          ) : (
                            <MinusCircle className="text-red-600 dark:text-red-400" size={20} />
                          )}
                          <div>
                            <div className="font-medium text-gray-800 dark:text-white">{trans.description}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{trans.category}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div
                            className={`font-bold ${
                              trans.type === 'income'
                                ? 'text-green-700 dark:text-green-400'
                                : 'text-red-700 dark:text-red-400'
                            }`}
                          >
                            {trans.type === 'income' ? '+' : '-'}₹{trans.amount.toFixed(2)}
                          </div>
                          <button
                            onClick={() => deleteTransaction(trans.id)}
                            className="text-red-500 hover:text-red-700 transition"
                            title="Delete"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
