import { useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import {
  useAllServices,
  useCreateService,
  useDeleteService,
  useUpdateService,
} from '@/hooks/useServices';
import type { ServiceType } from '@/types';

type ServiceForm = Omit<ServiceType, 'id'>;

const emptyForm: ServiceForm = {
  businessId: undefined,
  name: '',
  description: '',
  pricePerUnit: 0,
  turnaroundHours: 24,
  active: true,
};

function ServiceModal({
  title,
  value,
  onChange,
  onClose,
  onSubmit,
  isPending,
}: {
  title: string;
  value: ServiceForm;
  onChange: (v: ServiceForm) => void;
  onClose: () => void;
  onSubmit: () => void;
  isPending: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-surface-dark border border-surface-border rounded-2xl p-6 text-white">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-sm font-bold">{title}</h3>
            <p className="text-gray-400 text-xl">Configure service details and pricing per kg.</p>
          </div>
          <button onClick={onClose}><X className="text-gray-400" /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-2">Service Name</label>
            <input className="w-full border border-brand-500 rounded-xl bg-transparent px-4 py-3 text-sm" value={value.name} onChange={(e) => onChange({ ...value, name: e.target.value })} placeholder="e.g. Dry Cleaning" />
          </div>
          <div>
            <label className="block text-sm mb-2">Description</label>
            <textarea className="w-full border border-surface-border rounded-xl bg-transparent px-4 py-3 text-xl min-h-24" value={value.description} onChange={(e) => onChange({ ...value, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2">Price per kg (₹)</label>
              <input type="number" min={0} className="w-full border border-surface-border rounded-xl bg-transparent px-4 py-3 text-sm" value={value.pricePerUnit} onChange={(e) => onChange({ ...value, pricePerUnit: Number(e.target.value) })} />
            </div>
            <div>
              <label className="block text-sm mb-2">Turnaround (Hours)</label>
              <input type="number" min={1} className="w-full border border-surface-border rounded-xl bg-transparent px-4 py-3 text-sm" value={value.turnaroundHours ?? 24} onChange={(e) => onChange({ ...value, turnaroundHours: Number(e.target.value) })} />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-surface-border">
            <div>
              <p className="text-sm font-semibold">Active Status</p>
              <p className="text-gray-400 text-xl">Available to customers</p>
            </div>
            <button onClick={() => onChange({ ...value, active: !value.active })} className={`w-14 h-8 rounded-full ${value.active ? 'bg-brand-500' : 'bg-gray-700'} relative`}>
              <span className={`absolute top-1 w-6 h-6 rounded-full bg-black transition-all ${value.active ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button onClick={onClose} className="px-6 py-3 rounded-xl border border-surface-border text-sm">Cancel</button>
            <button onClick={onSubmit} disabled={isPending} className="px-6 py-3 rounded-xl bg-brand-gradient font-semibold text-sm">Save Service</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminServicesPage() {
  const { data: services, isLoading } = useAllServices();
  const createService = useCreateService();
  const updateService = useUpdateService();
  const deleteService = useDeleteService();

  const [form, setForm] = useState<ServiceForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (service: ServiceType) => {
    setEditingId(service.id);
    setForm({
      businessId: service.businessId,
      name: service.name,
      description: service.description,
      pricePerUnit: service.pricePerUnit,
      turnaroundHours: service.turnaroundHours ?? 24,
      active: service.active,
    });
    setOpen(true);
  };

  const handleSave = () => {
    const onSuccess = () => setOpen(false);
    if (editingId) {
      updateService.mutate({ id: editingId, payload: form }, { onSuccess });
      return;
    }
    createService.mutate(form, { onSuccess });
  };

  return (
    <div className="max-w-7xl mx-auto text-white space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-bold">Services</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your laundry service offerings and pricing.</p>
        </div>
        <button onClick={openNew} className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-brand-gradient text-sm font-semibold">
          <Plus size={20} /> Add Service
        </button>
      </div>

      {isLoading ? <div>Loading...</div> : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {services?.map((service) => (
            <div key={service.id} className="bg-surface-dark border border-surface-border rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-base">{service.name}</h2>
                <span className="px-3 py-1 rounded-xl text-lg bg-brand-500/30 text-brand-300">{service.active ? 'Active' : 'Inactive'}</span>
              </div>
              <p className="text-gray-400 text-sm mt-4 min-h-16">{service.description}</p>
              <div className="bg-surface-input rounded-xl p-4 mt-6 flex items-end justify-between">
                <div>
                  <p className="text-gray-400 text-xl">Rate</p>
                  <p className="text-brand-400 text-lg font-bold">₹{service.pricePerUnit}<span className="text-lg text-gray-300">/kg</span></p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-xl">Time</p>
                  <p className="text-lg font-semibold">{service.turnaroundHours ?? 24} hrs</p>
                </div>
              </div>

              <div className="mt-6 flex justify-end items-center gap-4">
                <button onClick={() => openEdit(service)} className="inline-flex items-center gap-2 px-6 py-2 rounded-xl border border-surface-border text-sm"><Pencil size={16} /> Edit</button>
                <button onClick={() => deleteService.mutate(service.id)} className="text-red-500"><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {open && (
        <ServiceModal
          title={editingId ? 'Edit Service' : 'New Service'}
          value={form}
          onChange={setForm}
          onClose={() => setOpen(false)}
          onSubmit={handleSave}
          isPending={createService.isPending || updateService.isPending}
        />
      )}
    </div>
  );
}
