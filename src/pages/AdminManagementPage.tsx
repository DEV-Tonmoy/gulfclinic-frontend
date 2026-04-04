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

    const openAdd = () => { setEditTarget(null); setForm(emptyForm); setError(''); setShowModal(true); };
    const openEdit = (a: AdminUser) => { setEditTarget(a); setForm({ email: a.email, password: '', role: a.role }); setError(''); setShowModal(true); };
    const closeModal = () => { setShowModal(false); setEditTarget(null); setForm(emptyForm); setError(''); };

    const handleSave = async () => {
        if (!editTarget && (!form.email.trim() || !form.password.trim())) { setError('Email and password are required.'); return; }
        try {
            setSaving(true); setError('');
            if (editTarget) { await api.patch(`/admin/management/${editTarget.id}`, { role: form.role }); }
            else { await api.post('/admin/management', { email: form.email.trim(), password: form.password, role: form.role }); }
            await fetchAdmins(); closeModal();
        } catch (err: any) {
            setError(err?.response?.data?.message ?? 'Failed to save. Please try again.');
        } finally { setSaving(false); }
    };

    const handleToggleActive = async (a: AdminUser) => {
        if (a.id === admin?.id) return;
        try { await api.patch(`/admin/management/${a.id}`, { isActive: !a.isActive }); await fetchAdmins(); }
        catch { alert('Failed to update admin status.'); }
    };

    if (!isSuperAdmin) return (
        <div className="flex flex-col items-center justify-center h-full gap-4 text-[#8A8A8A] py-20">
            <ShieldAlert size={48} />
            <p className="font-semibold text-lg text-[#F0EDE8]">Access Denied</p>
            <p className="text-sm">Only SUPER_ADMIN can manage admin users.</p>
        </div>
    );

    if (loading) return (
        <div className="p-8 flex items-center gap-3 text-[#8A8A8A] font-medium h-full justify-center">
            <Loader2 className="animate-spin text-[#126209]" /> <span>Loading admins...</span>
        </div>
    );

    const activeAdmins = admins.filter(a => a.isActive);
    const inactiveAdmins = admins.filter(a => !a.isActive);

    return (
        <div className="max-w-5xl space-y-6 animate-fade-in">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="heading-lg">Admin Management</h1>
                    <p className="text-body mt-1">{activeAdmins.length} active · {inactiveAdmins.length} inactive</p>
                </div>
                <button onClick={openAdd} className="btn-primary flex items-center gap-2">
                    <Plus size={16} /> Add Admin
                </button>
            </div>

            {/* Active table */}
            <div className="card-surface overflow-hidden">
                <div className="px-5 py-3.5 border-b border-[#2A2A2A] flex items-center gap-2 bg-[#1C1C1C]">
                    <ShieldCheck size={16} className="text-[#126209]" />
                    <h2 className="font-semibold text-sm text-[#F0EDE8] tracking-heading">Active Admins</h2>
                </div>
                {activeAdmins.length === 0 ? (
                    <div className="p-8 text-center text-[#8A8A8A] text-sm">No active admins.</div>
                ) : (
                    <div className="divide-y divide-[#1C1C1C]">
                        {activeAdmins.map(a => (
                            <AdminRow key={a.id} a={a} currentAdminId={admin?.id??''} onEdit={()=>openEdit(a)} onToggle={()=>handleToggleActive(a)}/>
                        ))}
                    </div>
                )}
            </div>

            {/* Inactive table */}
            {inactiveAdmins.length > 0 && (
                <div className="card-surface overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-[#2A2A2A] flex items-center gap-2 bg-[#1C1C1C]">
                        <PowerOff size={16} className="text-[#555555]" />
                        <h2 className="font-semibold text-sm text-[#8A8A8A] tracking-heading">Inactive Admins</h2>
                    </div>
                    <div className="divide-y divide-[#1C1C1C]">
                        {inactiveAdmins.map(a => (
                            <AdminRow key={a.id} a={a} currentAdminId={admin?.id??''} onEdit={()=>openEdit(a)} onToggle={()=>handleToggleActive(a)}/>
                        ))}
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:px-4" onClick={closeModal}>
                    <div className="bg-[#141414] border border-[#2A2A2A] rounded-t-2xl sm:rounded-2xl shadow-elevated-lg w-full sm:max-w-md p-6 space-y-5 animate-slide-up-sheet sm:animate-modal-in max-h-[90vh] sm:max-h-[85vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
                        <div className="sm:hidden flex justify-center mb-2"><div className="w-10 h-1 bg-[#3A3A3A] rounded-full"/></div>
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-[#F0EDE8] tracking-heading">{editTarget?'Edit Admin':'Add Admin'}</h2>
                            <button onClick={closeModal} className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-[#1C1C1C] rounded-lg transition-all duration-200 ease-in-out"><X size={18} className="text-[#8A8A8A]"/></button>
                        </div>
                        {error && <div className="px-3 py-2.5 bg-[#C0392B]/10 border border-[#C0392B]/20 text-[#F87171] text-sm rounded-lg">{error}</div>}
                        <div className="space-y-4">
                            {!editTarget && (<>
                                <div><label className="label-caps text-[10px]">Email *</label>
                                  <input className="input-field mt-1" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="admin@clinic.com"/></div>
                                <div><label className="label-caps text-[10px]">Password *</label>
                                  <input type="password" className="input-field mt-1" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} placeholder="Min 8 characters"/></div>
                            </>)}
                            <div><label className="label-caps text-[10px]">Role</label>
                              <select value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value as any}))}
                                className="input-field mt-1"><option value="ADMIN">ADMIN</option><option value="SUPER_ADMIN">SUPER_ADMIN</option></select></div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <button onClick={closeModal} className="flex-1 btn-secondary min-h-[44px]">Cancel</button>
                            <button onClick={handleSave} disabled={saving} className="flex-1 btn-primary min-h-[44px] flex items-center justify-center gap-2 disabled:opacity-50">
                                {saving&&<Loader2 size={14} className="animate-spin"/>}{saving?'Saving...':editTarget?'Save Changes':'Add Admin'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const AdminRow = ({a,currentAdminId,onEdit,onToggle}:{a:AdminUser;currentAdminId:string;onEdit:()=>void;onToggle:()=>void}) => (
    <div className={`flex items-center gap-4 px-5 py-3.5 hover:bg-[#141414] transition-colors duration-150 ${!a.isActive?'opacity-50':''}`}>
        <div className="w-8 h-8 rounded-full bg-[#1C1C1C] border border-[#2A2A2A] flex items-center justify-center text-xs font-semibold text-[#8A8A8A] uppercase shrink-0">
            {a.email?.charAt(0)||'A'}
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#F0EDE8] truncate">{a.email}</p>
            <p className="text-[10px] text-[#555555] uppercase tracking-[0.06em]">{a.role}</p>
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${a.isActive?'bg-[#126209]/20 text-[#4ADE80]':'pill-completed'}`}>
            {a.isActive?'ACTIVE':'INACTIVE'}
        </span>
        <div className="flex items-center gap-1 shrink-0">
            <button onClick={onEdit} className="p-1.5 text-[#8A8A8A] hover:text-[#F0EDE8] hover:bg-[#1C1C1C] rounded-lg transition-colors" title="Edit Role"><Pencil size={15}/></button>
            {a.id!==currentAdminId && (
                <button onClick={onToggle} className={`p-1.5 rounded-lg transition-colors ${a.isActive?'text-[#8A8A8A] hover:text-[#F87171] hover:bg-[#C0392B]/10':'text-[#8A8A8A] hover:text-[#4ADE80] hover:bg-[#126209]/10'}`}
                  title={a.isActive?'Deactivate':'Reactivate'}>
                    {a.isActive?<PowerOff size={15}/>:<Power size={15}/>}
                </button>
            )}
        </div>
    </div>
);

export default AdminManagementPage;