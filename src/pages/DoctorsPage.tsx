import { useEffect, useState } from 'react';
import { UserRound, Plus, Pencil, PowerOff, Power, Loader2, X, ShieldAlert, Trash2 } from 'lucide-react';
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
    slug: string | null;
    location: string | null;
    languages: string[];
    order: number;
}

interface FormState {
    name: string;
    specialty: string;
    image: string;
    bio: string;
    location: string;
    languages: string[];
    order: number;
}
const emptyForm: FormState = { name: '', specialty: '', image: '', bio: '', location: '', languages: [], order: 0 };

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
            location: doc.location ?? '',
            languages: doc.languages ?? [],
            order: doc.order ?? 0,
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
                location: form.location || null,
                languages: form.languages,
                order: form.order,
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

    const handlePermanentDelete = async (doc: Doctor) => {
        if (!isSuperAdmin) return;
        if (!confirm(`Permanently delete ${doc.name}? This cannot be undone.`)) return;
        try {
            await api.delete(`/admin/doctors/${doc.id}/permanent`);
            await fetchDoctors();
        } catch {
            alert('Failed to permanently delete doctor.');
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
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Doctors</h1>
                    <p className="text-slate-500 text-sm">
                        {activeDoctors.length} active · {inactiveDoctors.length} inactive
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {!isSuperAdmin && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-[10px] font-bold shadow-sm uppercase tracking-wider">
                            <ShieldAlert size={14} />
                            VIEW-ONLY
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
                                onPermanentDelete={() => handlePermanentDelete(doc)}
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
                                onPermanentDelete={() => handlePermanentDelete(doc)}
                            />
                        ))}
                    </div>
                </div>
            )}
            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm sm:px-4" onClick={closeModal}>
                    <div className="bg-white sm:rounded-2xl shadow-2xl w-full h-full sm:h-auto sm:max-w-lg p-6 space-y-5 overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center bg-white sticky top-0 pb-2 z-10 border-b border-slate-50 sm:border-none">
                            <h2 className="text-lg font-bold text-slate-800">
                                {editTarget ? 'Edit Doctor' : 'Add Doctor'}
                            </h2>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 p-2">
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

                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Location</label>
                                <select
                                    value={form.location}
                                    onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                                    className="mt-1 w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">— Select location —</option>
                                    <option value="Salmiya">Salmiya</option>
                                    <option value="Sabah Al-Salem">Sabah Al-Salem</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Languages</label>
                                <div className="mt-2 flex gap-4">
                                    {['Arabic', 'English', 'French'].map(lang => (
                                        <label key={lang} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={form.languages.includes(lang)}
                                                onChange={e => {
                                                    if (e.target.checked) {
                                                        setForm(f => ({ ...f, languages: [...f.languages, lang] }));
                                                    } else {
                                                        setForm(f => ({ ...f, languages: f.languages.filter(l => l !== lang) }));
                                                    }
                                                }}
                                                className="rounded"
                                            />
                                            {lang}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Display Order</label>
                                <input
                                    type="number"
                                    value={form.order}
                                    onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) || 0 }))}
                                    className="mt-1 w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    min={0}
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

const DoctorRow = ({ doc, isSuperAdmin, onEdit, onToggle, onPermanentDelete }: {
    doc: Doctor;
    isSuperAdmin: boolean;
    onEdit: () => void;
    onToggle: () => void;
    onPermanentDelete: () => void;
}) => (
    <div className={`flex flex-col sm:flex-row sm:items-center gap-4 px-4 sm:px-6 py-5 hover:bg-slate-50 transition-colors ${!doc.isActive ? 'opacity-50' : ''}`}>
        <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200">
                {doc.image ? (
                    <img src={doc.image} alt={doc.name} className="w-full h-full object-cover" />
                ) : (
                    <UserRound size={24} className="text-slate-400" />
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{doc.name}</p>
                <p className="text-xs text-slate-500 truncate">{doc.specialty}</p>
            </div>

            <div className="sm:hidden">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${doc.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                    {doc.isActive ? 'ACTIVE' : 'INACTIVE'}
                </span>
            </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-4 border-t border-slate-50 pt-3 sm:pt-0 sm:border-none">
            {/* Status badge - Larger screen only */}
            <span className={`hidden sm:inline-block text-[10px] font-bold px-2.5 py-1 rounded-full ${doc.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                {doc.isActive ? 'ACTIVE' : 'INACTIVE'}
            </span>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0 ml-auto">
                <button
                    onClick={onEdit}
                    className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border border-transparent hover:border-blue-100"
                    title="Edit"
                >
                    <Pencil size={16} />
                </button>
                {isSuperAdmin && (
                    <button
                        onClick={onToggle}
                        className={`p-2.5 rounded-xl transition-colors border border-transparent ${doc.isActive ? 'text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-100'}`}
                        title={doc.isActive ? 'Deactivate' : 'Reactivate'}
                    >
                        {doc.isActive ? <PowerOff size={16} /> : <Power size={16} />}
                    </button>
                )}
                {isSuperAdmin && (
                    <button
                        onClick={onPermanentDelete}
                        className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100"
                        title="Permanent Delete"
                    >
                        <Trash2 size={16} />
                    </button>
                )}
            </div>
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