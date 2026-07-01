import { useState } from 'react';
import { Plus, Receipt, Calendar } from 'lucide-react';
import { useExpenses, useCreateExpense } from '@/hooks/useExpenses';
import { format } from 'date-fns';

export default function AdminExpensesPage() {
  const { data: expenses, isLoading } = useExpenses();
  const createMutation = useCreateExpense();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    amount: 0,
    category: 'RESTOCK',
    expenseDate: format(new Date(), 'yyyy-MM-dd'),
    description: ''
  });

  const categories = ['RESTOCK', 'RENT', 'SALARY', 'UTILITIES', 'MARKETING', 'OTHER'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData, {
      onSuccess: () => {
        setIsModalOpen(false);
        setFormData({ ...formData, amount: 0, description: '' });
      }
    });
  };

  if (isLoading) return <div className="text-white">Loading expenses...</div>;

  return (
    <div className="space-y-6 text-white pb-24 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-display">Expenses</h1>
          <p className="text-gray-400 text-sm mt-1">Log and track operating expenses</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-brand-gradient rounded-lg font-semibold flex items-center gap-2 hover:shadow-glow-brand transition-all">
          <Plus size={18} /> Log Expense
        </button>
      </div>

      <div className="bg-surface-dark border border-surface-border rounded-2xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-surface-dark/50 text-gray-400 border-b border-surface-border">
            <tr>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Category</th>
              <th className="px-6 py-4 font-medium">Description</th>
              <th className="px-6 py-4 font-medium text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {expenses?.map((exp: any) => (
              <tr key={exp.id} className="hover:bg-surface-border/30 transition-colors">
                <td className="px-6 py-4 flex items-center gap-2">
                  <Calendar size={14} className="text-gray-500" />
                  {format(new Date(exp.expenseDate), 'MMM dd, yyyy')}
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 bg-surface-border rounded-full text-xs font-medium text-gray-300">
                    {exp.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-300">{exp.description || '—'}</td>
                <td className="px-6 py-4 text-right font-mono font-medium text-red-400">
                  -Rs {exp.amount}
                </td>
              </tr>
            ))}
            {expenses?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-400">No expenses logged yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-dark border border-surface-border rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Receipt size={20} className="text-brand-400"/> Log Expense</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Date</label>
                <input required type="date" value={formData.expenseDate} onChange={e => setFormData({...formData, expenseDate: e.target.value})} className="w-full bg-surface-input border border-surface-border rounded-lg px-4 py-2 focus:border-brand-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Category</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-surface-input border border-surface-border rounded-lg px-4 py-2 focus:border-brand-500 outline-none">
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Amount (Rs)</label>
                <input required type="number" step="0.01" min="0" value={formData.amount} onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})} className="w-full bg-surface-input border border-surface-border rounded-lg px-4 py-2 focus:border-brand-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Description (Optional)</label>
                <textarea rows={2} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-surface-input border border-surface-border rounded-lg px-4 py-2 focus:border-brand-500 outline-none resize-none" placeholder="e.g. Paid monthly rent" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 border border-surface-border rounded-lg font-semibold hover:bg-surface-border transition-colors">Cancel</button>
                <button type="submit" disabled={createMutation.isPending} className="flex-1 py-2 bg-brand-gradient rounded-lg font-semibold text-white">Save Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
