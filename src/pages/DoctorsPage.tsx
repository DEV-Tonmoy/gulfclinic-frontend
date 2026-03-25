import { useEffect, useState } from 'react';
import { UserRound, Plus, Pencil, PowerOff, Power, Loader2, X, ShieldAlert } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';

interface Doctor {
    id: string;
    name: string;
    specialty: string;
    image: string | null;
    bio: string | null;
    isActive: boolean;
    createdAt: string;
}

interface FormState {
    name: string;
    specialty: string;
    image: string;
    bio: string;
}

const emptyForm: FormState = { name: '', specialty: '', image: '', bio: '' };

const DoctorsPage = () => {
    const { admin } = useAuth();
    const isSuperAdmin = admin?.role === 'SUPER_ADMIN';

    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [editTarget, setEditTarget] = useState<Doctor | null>(null);
    const [form, setForm] = useState<FormState>(emptyForm);

    const fetchDoctors = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/admin/doctors');
            if (data.success) setDoctors(data.data);
        } catch {
            setError('Failed to load doctors.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDoctors(); }, []);

    const openAdd = () => {
        setEditTarget(null);
        setForm(emptyForm);
        setError('');
        setShowModal(true);
    };

    const openEdit = (doc: Doctor) => {
        setEditTarget(doc);
        setForm({
            name: doc.name,
            specialty: doc.specialty,
            image: doc.image ?? '',
            bio: doc.bio ?? '',
        });
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
        if (!form.name.trim() || !form.specialty.trim()) {
            setError('Name and specialty are required.');
            return;
        }
        try {
            setSaving(true);
            setError('');
            const payload = {
                name: form.name.trim(),
                specialty: form.specialty.trim(),
                image: form.image.trim() || null,
                bio: form.bio.trim() || null,
            };
            if (editTarget) {
                await api.patch(`/admin/doctors/${editTarget.id}`, payload);
            } else {
                await api.post('/admin/doctors', payload);
            }
            await fetchDoctors();
            closeModal();
        } catch {
            setError('Failed to save. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleActive = async (doc: Doctor) => {
        if (!isSuperAdmin) return;
        try {
            await api.patch(`/admin/doctors/${doc.id}`, { isActive: !doc.isActive });
            await fetchDoctors();
        } catch {
            alert('Failed to update doctor status.');
        }
    };

    const activeDoctors = doctors.filter(d => d.isActive);
    const inactiveDoctors = doctors.filter(d => !d.isActive);

    if (loading) return (
        <div className="p-8 flex items-center gap-3 text-slate-400 font-medium h-full justify-center">
            <Loader2 className="animate-spin text-blue-600" />
            <span>Loading doctors...</span>
        </div>
    );

    return (
        <div className="max-w-5xl space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Doctors</h1>
                    <p className="text-slate-500 text-sm">
                        {activeDoctors.length} active · {inactiveDoctors.length} inactive
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {!isSuperAdmin && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold shadow-sm">
                            <ShieldAlert size={16} />
                            VIEW-ONLY MODE
                        </div>
                    )}
                    <button
                        onClick={openAdd}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
                    >
                        <Plus size={16} />
                        Add Doctor
                    </button>
                </div>
            </div>

            {/* Active Doctors */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                    <UserRound size={18} className="text-blue-600" />
                    <h2 className="font-bold text-slate-700">Active Doctors</h2>
                </div>
                {activeDoctors.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm">No active doctors.</div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {activeDoctors.map(doc => (
                            <DoctorRow
                                key={doc.id}
                                doc={doc}
                                isSuperAdmin={isSuperAdmin}
                                onEdit={() => openEdit(doc)}
                                onToggle={() => handleToggleActive(doc)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Inactive Doctors */}
            {inactiveDoctors.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                        <PowerOff size={18} className="text-slate-400" />
                        <h2 className="font-bold text-slate-500">Inactive Doctors</h2>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {inactiveDoctors.map(doc => (
                            <DoctorRow
                                key={doc.id}
                                doc={doc}
                                isSuperAdmin={isSuperAdmin}
                                onEdit={() => openEdit(doc)}
                                onToggle={() => handleToggleActive(doc)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-5">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-bold text-slate-800">
                                {editTarget ? 'Edit Doctor' : 'Add Doctor'}
                            </h2>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        {error && (
                            <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <Field label="Full Name *" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="Dr. Ahmed Al-Rashidi" />
                            <Field label="Specialty *" value={form.specialty} onChange={v => setForm(f => ({ ...f, specialty: v }))} placeholder="Orthodontics" />
                            <Field label="Image URL" value={form.image} onChange={v => setForm(f => ({ ...f, image: v }))} placeholder="https://..." />
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bio</label>
                                <textarea
                                    rows={3}
                                    value={form.bio}
                                    onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                                    placeholder="Brief professional background..."
                                    className="mt-1 w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={closeModal}
                                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                                {saving ? 'Saving...' : editTarget ? 'Save Changes' : 'Add Doctor'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const DoctorRow = ({ doc, isSuperAdmin, onEdit, onToggle }: {
    doc: Doctor;
    isSuperAdmin: boolean;
    onEdit: () => void;
    onToggle: () => void;
}) => (
    <div className={`flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors ${!doc.isActive ? 'opacity-50' : ''}`}>
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
            {doc.image ? (
                <img src={doc.image} alt={doc.name} className="w-full h-full object-cover" />
            ) : (
                <UserRound size={20} className="text-slate-400" />
            )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate">{doc.name}</p>
            <p className="text-xs text-slate-500 truncate">{doc.specialty}</p>
        </div>

        {/* Status badge */}
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${doc.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
            {doc.isActive ? 'ACTIVE' : 'INACTIVE'}
        </span>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
            <button
                onClick={onEdit}
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit"
            >
                <Pencil size={15} />
            </button>
            {isSuperAdmin && (
                <button
                    onClick={onToggle}
                    className={`p-2 rounded-lg transition-colors ${doc.isActive ? 'text-slate-400 hover:text-red-500 hover:bg-red-50' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}`}
                    title={doc.isActive ? 'Deactivate' : 'Reactivate'}
                >
                    {doc.isActive ? <PowerOff size={15} /> : <Power size={15} />}
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

export default DoctorsPage;