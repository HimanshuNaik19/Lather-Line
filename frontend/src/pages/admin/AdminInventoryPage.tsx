import { useState } from 'react';
import { Package, Plus, AlertTriangle, PenSquare } from 'lucide-react';
import { useInventoryItems, useCreateInventoryItem, useUpdateInventoryItem } from '@/hooks/useInventory';
import type { InventoryItem } from '@/types';

export default function AdminInventoryPage() {
  const { data: items, isLoading } = useInventoryItems();
  const createMutation = useCreateInventoryItem();
  const updateMutation = useUpdateInventoryItem();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    unit: 'Liters',
    quantityInStock: 0,
    costPerUnit: 0,
    lowStockThreshold: 0
  });

  const handleOpenModal = (item?: InventoryItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        unit: item.unit,
        quantityInStock: item.quantityInStock,
        costPerUnit: item.costPerUnit,
        lowStockThreshold: item.lowStockThreshold
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        unit: 'Liters',
        quantityInStock: 0,
        costPerUnit: 0,
        lowStockThreshold: 0
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, item: formData }, {
        onSuccess: () => setIsModalOpen(false)
      });
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => setIsModalOpen(false)
      });
    }
  };

  if (isLoading) return <div className="text-white">Loading inventory...</div>;

  return (
    <div className="space-y-6 text-white pb-24">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-display">Inventory Tracking</h1>
          <p className="text-gray-400 text-sm mt-1">Manage detergents, hangers, and covers</p>
        </div>
        <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-brand-gradient rounded-lg font-semibold flex items-center gap-2 hover:shadow-glow-brand transition-all">
          <Plus size={18} /> Add Item
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items?.map((item: any) => (
          <div key={item.id} className="bg-surface-dark border border-surface-border rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center">
                  <Package size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  <p className="text-sm text-gray-400">Rs {item.costPerUnit} / {item.unit}</p>
                </div>
              </div>
              <button onClick={() => handleOpenModal(item)} className="text-gray-400 hover:text-white p-2"><PenSquare size={16} /></button>
            </div>

            <div className="pt-4 border-t border-surface-border flex justify-between items-end">
              <div>
                <p className="text-sm text-gray-400 mb-1">In Stock</p>
                <p className={`text-2xl font-bold font-mono ${item.quantityInStock <= item.lowStockThreshold ? 'text-red-400' : 'text-white'}`}>
                  {item.quantityInStock} <span className="text-sm font-normal text-gray-500">{item.unit}</span>
                </p>
              </div>
              {item.quantityInStock <= item.lowStockThreshold && (
                <div className="flex items-center gap-1.5 text-red-400 text-sm font-medium px-2.5 py-1 bg-red-500/10 rounded-full">
                  <AlertTriangle size={14} /> Low Stock
                </div>
              )}
            </div>
          </div>
        ))}
        {items?.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-400 border border-dashed border-surface-border rounded-2xl">
            No inventory items tracked yet.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-dark border border-surface-border rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">{editingItem ? 'Edit' : 'Add'} Inventory Item</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-surface-input border border-surface-border rounded-lg px-4 py-2 focus:border-brand-500 outline-none" placeholder="e.g. Premium Detergent" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Unit</label>
                  <input required type="text" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="w-full bg-surface-input border border-surface-border rounded-lg px-4 py-2 focus:border-brand-500 outline-none" placeholder="e.g. Liters, Pieces" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Cost per Unit (Rs)</label>
                  <input required type="number" step="0.01" value={formData.costPerUnit} onChange={e => setFormData({...formData, costPerUnit: parseFloat(e.target.value)})} className="w-full bg-surface-input border border-surface-border rounded-lg px-4 py-2 focus:border-brand-500 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Stock Quantity</label>
                  <input required type="number" step="0.01" value={formData.quantityInStock} onChange={e => setFormData({...formData, quantityInStock: parseFloat(e.target.value)})} className="w-full bg-surface-input border border-surface-border rounded-lg px-4 py-2 focus:border-brand-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Low Stock Alert</label>
                  <input required type="number" step="0.01" value={formData.lowStockThreshold} onChange={e => setFormData({...formData, lowStockThreshold: parseFloat(e.target.value)})} className="w-full bg-surface-input border border-surface-border rounded-lg px-4 py-2 focus:border-brand-500 outline-none" />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 border border-surface-border rounded-lg font-semibold hover:bg-surface-border transition-colors">Cancel</button>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="flex-1 py-2 bg-brand-gradient rounded-lg font-semibold text-white">Save Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
