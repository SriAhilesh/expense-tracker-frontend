import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api';
import { 
  Wallet, LogOut, Plus, Trash2, Calendar, Tag, DollarSign, Text, 
  TrendingDown, PlusCircle, Search, Filter, RefreshCw, Layers, Sparkles 
} from 'lucide-react';

interface Expense {
  id: number;
  title: string;
  amount: number;
  category: string;
  date: string;
  createdAt: string;
}

interface Summary {
  total: number;
  count: number;
  categoryBreakdown: Array<{ name: string; amount: number }>;
}

const CATEGORIES = [
  'Food & Dining',
  'Bills & Utilities',
  'Entertainment',
  'Shopping',
  'Transportation',
  'Healthcare',
  'Education',
  'Miscellaneous'
];

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  
  // Dashboard state
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<Summary>({ total: 0, count: 0, categoryBreakdown: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [expensesRes, summaryRes] = await Promise.all([
        API.get('/expenses'),
        API.get('/expenses/summary')
      ]);
      setExpenses(expensesRes.data);
      setSummary(summaryRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to sync with account data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || !category || !date) {
      setError('Please provide all expense details.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await API.post('/expenses', {
        title,
        amount: Number(amount),
        category,
        date
      });

      // Clear form
      setTitle('');
      setAmount('');
      setCategory(CATEGORIES[0]);
      setDate(new Date().toISOString().split('T')[0]);

      // Refresh listings
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to record expense.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExpense = async (id: number) => {
    setError(null);
    try {
      await API.delete(`/expenses/${id}`);
      // Optimistic update of local states to prevent flickering
      setExpenses(prev => prev.filter(e => e.id !== id));
      // Re-fetch totals
      const summaryRes = await API.get('/expenses/summary');
      setSummary(summaryRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove expense.');
    }
  };

  // Filter computation
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          expense.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategoryFilter === 'All' || expense.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      'Food & Dining': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      'Bills & Utilities': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      'Entertainment': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      'Shopping': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
      'Transportation': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      'Healthcare': 'bg-red-500/10 text-red-400 border-red-500/20',
      'Education': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      'Miscellaneous': 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    };
    return colors[cat] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Dynamic glow effect */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Modern Navigation Header */}
      <nav className="glass-panel sticky top-0 z-40 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-900/20 ring-1 ring-purple-400/20">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-lg text-white tracking-wide">Antigravity Pay</span>
                <span className="text-purple-400 text-xs font-semibold uppercase tracking-wider block leading-none">Smart Ledger</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-sm font-semibold text-slate-200">{user?.name || 'Guest User'}</span>
                <span className="text-xs text-slate-400">{user?.email}</span>
              </div>
              <button 
                onClick={logout}
                className="flex items-center space-x-2 bg-slate-900/80 hover:bg-red-500/10 text-slate-300 hover:text-red-400 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-red-500/20 transition-all text-sm font-medium cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full z-10">
        
        {/* Error notification banner */}
        {error && (
          <div className="mb-6 bg-red-500/15 border border-red-500/30 text-red-200 text-sm p-4 rounded-xl flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-200 text-xs font-bold px-2">Dismiss</button>
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT PANEL: Overview & Action forms */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* Glossy Balance Summary Card */}
            <div className="relative overflow-hidden rounded-2xl glass-panel p-6 shadow-xl border-l-4 border-purple-500">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Sparkles className="w-24 h-24 text-white" />
              </div>
              <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Total Expenses</p>
              <h3 className="text-4xl font-extrabold text-white mt-1 tracking-tight flex items-baseline">
                <span className="text-purple-400 text-2xl font-medium mr-1">$</span>
                {summary.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              
              <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-sm">
                <span className="text-slate-400">Recorded Transactions</span>
                <span className="bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/20 font-bold">{summary.count} items</span>
              </div>
            </div>

            {/* Quick Add Expense Form Card */}
            <div className="glass-panel rounded-2xl p-6 shadow-xl relative">
              <div className="flex items-center space-x-2 mb-4">
                <PlusCircle className="w-5 h-5 text-purple-400" />
                <h4 className="text-lg font-bold text-white tracking-wide">Record Expense</h4>
              </div>

              <form onSubmit={handleAddExpense} className="space-y-4">
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center">
                    <Text className="w-3 h-3 mr-1" /> Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Grocery Shopping"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-800 rounded-lg py-2 px-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                {/* Amount */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center">
                    <DollarSign className="w-3 h-3 mr-1" /> Amount ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-800 rounded-lg py-2 px-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                {/* Category Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center">
                    <Tag className="w-3 h-3 mr-1" /> Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-800 rounded-lg py-2 px-3 text-sm text-slate-100 focus:outline-none focus:border-purple-500 transition-colors cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="bg-slate-900 text-slate-100">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center">
                    <Calendar className="w-3 h-3 mr-1" /> Date
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-800 rounded-lg py-2 px-3 text-sm text-slate-100 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium py-2 px-4 rounded-lg shadow-lg hover:shadow-purple-500/10 active:translate-y-0.5 transition-all flex items-center justify-center space-x-2 cursor-pointer mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Recording...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Add Expense</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Category breakdown visual charts */}
            <div className="glass-panel rounded-2xl p-6 shadow-xl">
              <div className="flex items-center space-x-2 mb-4">
                <Layers className="w-5 h-5 text-purple-400" />
                <h4 className="text-lg font-bold text-white tracking-wide">Category Share</h4>
              </div>

              {summary.categoryBreakdown.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-6">No data visual share available.</p>
              ) : (
                <div className="space-y-4">
                  {summary.categoryBreakdown
                    .sort((a, b) => b.amount - a.amount)
                    .map((item) => {
                      const percentage = summary.total > 0 ? (item.amount / summary.total) * 100 : 0;
                      return (
                        <div key={item.name} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-300 font-medium">{item.name}</span>
                            <span className="text-slate-400 font-bold">{percentage.toFixed(0)}% (${item.amount.toFixed(0)})</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

          </div>

          {/* RIGHT PANEL: List of expenses with search & filter */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Filters Dashboard Toolbar */}
            <div className="glass-panel rounded-2xl p-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              {/* Search input */}
              <div className="relative flex-grow">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Search expense titles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              {/* Category filter */}
              <div className="flex items-center space-x-2">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider whitespace-nowrap flex items-center">
                  <Filter className="w-3.5 h-3.5 mr-1" /> Category:
                </span>
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="bg-slate-900/60 border border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-purple-500 transition-colors cursor-pointer"
                >
                  <option value="All">All Categories</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reset action button */}
              <button 
                onClick={fetchData}
                title="Sync from cloud"
                className="bg-slate-950 hover:bg-slate-900 p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-slate-200 transition-all cursor-pointer flex items-center justify-center shrink-0 self-end md:self-auto"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

            </div>

            {/* Expenses List Panel */}
            <div className="glass-panel rounded-2xl shadow-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-900/60 flex items-center justify-between">
                <h4 className="text-lg font-bold text-white tracking-wide">Ledger Transactions</h4>
                <span className="text-slate-400 text-xs font-semibold">Showing {filteredExpenses.length} of {expenses.length}</span>
              </div>

              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center">
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-4 border-purple-500/20"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-t-purple-500 animate-spin"></div>
                  </div>
                  <p className="mt-4 text-slate-500 text-sm font-medium">Syncing transactions...</p>
                </div>
              ) : filteredExpenses.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-center px-4">
                  <div className="w-12 h-12 rounded-full bg-slate-900/80 border border-slate-800 flex items-center justify-center mb-4">
                    <TrendingDown className="w-6 h-6 text-slate-500" />
                  </div>
                  <p className="text-slate-400 font-semibold text-lg">No expenses matching filters</p>
                  <p className="text-slate-500 text-sm mt-1 max-w-sm">Create a new expense or clear your search inputs to check other items.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-900 text-slate-400 text-xs uppercase font-bold bg-slate-900/30">
                        <th className="px-6 py-3">Expense Details</th>
                        <th className="px-6 py-3">Category</th>
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3 text-right">Amount</th>
                        <th className="px-6 py-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      {filteredExpenses.map((expense) => (
                        <tr 
                          key={expense.id} 
                          className="hover:bg-slate-900/40 transition-colors group"
                        >
                          {/* Expense Title */}
                          <td className="px-6 py-4">
                            <span className="font-semibold text-slate-100 group-hover:text-purple-300 transition-colors block text-sm">
                              {expense.title}
                            </span>
                          </td>

                          {/* Category Badge */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getCategoryColor(expense.category)}`}>
                              {expense.category}
                            </span>
                          </td>

                          {/* Date */}
                          <td className="px-6 py-4 whitespace-nowrap text-slate-400 text-xs">
                            {new Date(expense.date).toLocaleDateString(undefined, { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </td>

                          {/* Amount */}
                          <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-white text-sm">
                            ${expense.amount.toFixed(2)}
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <button
                              onClick={() => handleDeleteExpense(expense.id)}
                              className="text-slate-500 hover:text-red-400 p-1.5 rounded-md hover:bg-red-500/10 border border-transparent hover:border-red-500/20 active:scale-95 transition-all cursor-pointer"
                              title="Delete Transaction"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>

        </div>

      </main>
    </div>
  );
};
