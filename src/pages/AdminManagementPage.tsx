import { useEffect, useState } from 'react';
import { ShieldCheck, Plus, Pencil, PowerOff, Power, Loader2, X, ShieldAlert } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';

interface AdminUser {
    id: string;
    email: string;
    role: 'SUPER_ADMIN' | 'ADMIN';
    isActive: boolean;
    createdAt: string;
}

interface FormState {
    email: string;
    password: string;
    role: 'SUPER_ADMIN' | 'ADMIN';
}

const emptyForm: FormState = { email: '', password: '', role: 'ADMIN' };

const AdminManagementPage = () => {
    const { admin } = useAuth();
    const isSuperAdmin = admin?.role === 'SUPER_ADMIN';

    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editTarget, setEditTarget] = useState<AdminUser | null>(null);
    const [form, setForm] = useState<FormState>(emptyForm);

    const fetchAdmins = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/admin/management');
            if (data.success) setAdmins(data.data);
        } catch {
            setError('Failed to load admins.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (isSuperAdmin) fetchAdmins(); else setLoading(false); }, [isSuperAdmin]);

    const openAdd = () => {
        setEditTarget(null);
        setForm(emptyForm);
        setError('');
        setShowModal(true);
    };

    const openEdit = (a: AdminUser) => {
        setEditTarget(a);
        setForm({ email: a.email, password: '', role: a.role });
        setError('');
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditTarget(null);
        setForm(emptyForm);
        setError('');
    };

    const handleSave = async () => {
        if (!editTarget && (!form.email.trim() || !form.password.trim())) {
            setError('Email and password are required.');
            return;
        }
        try {
            setSaving(true);
            setError('');
            if (editTarget) {
                await api.patch(`/admin/management/${editTarget.id}`, { role: form.role });
            } else {
                await api.post('/admin/management', { email: form.email.trim(), password: form.password, role: form.role });
            }
            await fetchAdmins();
            closeModal();
        } catch (err: any) {
            setError(err?.response?.data?.message ?? 'Failed to save. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleActive = async (a: AdminUser) => {
        if (a.id === admin?.id) return;
        try {
            await api.patch(`/admin/management/${a.id}`, { isActive: !a.isActive });
            await fetchAdmins();
        } catch {
            alert('Failed to update admin status.');
        }
    };

    if (!isSuperAdmin) return (
        <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400">
            <ShieldAlert size={48} />
            <p className="font-bold text-lg">Access Denied</p>
            <p className="text-sm">Only SUPER_ADMIN can manage admin users.</p>
        </div>
    );

    if (loading) return (
        <div className="p-8 flex items-center gap-3 text-slate-400 font-medium h-full justify-center">
            <Loader2 className="animate-spin text-blue-600" />
            <span>Loading admins...</span>
        </div>
    );

    const activeAdmins = admins.filter(a => a.isActive);
    const inactiveAdmins = admins.filter(a => !a.isActive);

    return (
        <div className="max-w-5xl space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Admin Management</h1>
                    <p className="text-slate-500 text-sm">{activeAdmins.length} active · {inactiveAdmins.length} inactive</p>
                </div>
                <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm">
                    <Plus size={16} />
                    Add Admin
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                    <ShieldCheck size={18} className="text-blue-600" />
                    <h2 className="font-bold text-slate-700">Active Admins</h2>
                </div>
                {activeAdmins.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm">No active admins.</div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {activeAdmins.map(a => (
                            <AdminRow key={a.id} a={a} currentAdminId={admin?.id ?? ''} onEdit={() => openEdit(a)} onToggle={() => handleToggleActive(a)} />
                        ))}
                    </div>
                )}
            </div>

            {inactiveAdmins.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                        <PowerOff size={18} className="text-slate-400" />
                        <h2 className="font-bold text-slate-500">Inactive Admins</h2>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {inactiveAdmins.map(a => (
                            <AdminRow key={a.id} a={a} currentAdminId={admin?.id ?? ''} onEdit={() => openEdit(a)} onToggle={() => handleToggleActive(a)} />
                        ))}
                    </div>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-bold text-slate-800">{editTarget ? 'Edit Admin' : 'Add Admin'}</h2>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                        </div>

                        {error && (
                            <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">{error}</div>
                        )}

                        <div className="space-y-4">
                            {!editTarget && (
                                <>
                                    <Field label="Email *" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} placeholder="admin@clinic.com" />
                                    <Field label="Password *" value={form.password} onChange={v => setForm(f => ({ ...f, password: v }))} placeholder="Min 8 characters" />
                                </>
                            )}
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role</label>
                                <select
                                    value={form.role}
                                    onChange={e => setForm(f => ({ ...f, role: e.target.value as 'SUPER_ADMIN' | 'ADMIN' }))}
                                    className="mt-1 w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="ADMIN">ADMIN</option>
                                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button onClick={closeModal} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
                            <button onClick={handleSave} disabled={saving} className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                                {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                                {saving ? 'Saving...' : editTarget ? 'Save Changes' : 'Add Admin'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const AdminRow = ({ a, currentAdminId, onEdit, onToggle }: {
    a: AdminUser;
    currentAdminId: string;
    onEdit: () => void;
    onToggle: () => void;
}) => (
    <div className={`flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors ${!a.isActive ? 'opacity-50' : ''}`}>
        <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate">{a.email}</p>
            <p className="text-xs text-slate-500">{a.role}</p>
        </div>
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${a.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
            {a.isActive ? 'ACTIVE' : 'INACTIVE'}
        </span>
        <div className="flex items-center gap-2 shrink-0">
            <button onClick={onEdit} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Role">
                <Pencil size={15} />
            </button>
            {a.id !== currentAdminId && (
                <button onClick={onToggle} className={`p-2 rounded-lg transition-colors ${a.isActive ? 'text-slate-400 hover:text-red-500 hover:bg-red-50' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}`} title={a.isActive ? 'Deactivate' : 'Reactivate'}>
                    {a.isActive ? <PowerOff size={15} /> : <Power size={15} />}
                </button>
            )}
        </div>
    </div>
);

const Field = ({ label, value, onChange, placeholder }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
}) => (
    <div>
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</label>
        <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className="mt-1 w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
    </div>
);

export default AdminManagementPage;