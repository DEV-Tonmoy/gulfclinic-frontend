import { useEffect, useState } from 'react';
import { UserRound, Plus, Pencil, PowerOff, Power, Loader2, X, ShieldAlert, Trash2, MapPin, Globe } from 'lucide-react';
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
            {/* Header Section */}
            <div className="sticky top-0 z-40 border-b border-slate-200/50 backdrop-blur-xl bg-white/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex-1">
                            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">Our Doctors</h1>
                            <p className="text-slate-600 mt-2 text-sm sm:text-base">
                                Manage your medical team
                                <span className="ml-3 inline-flex items-center gap-3 text-xs font-semibold text-slate-500">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200/50">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                        {activeDoctors.length} Active
                                    </span>
                                    {inactiveDoctors.length > 0 && (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full border border-slate-200">
                                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                                            {inactiveDoctors.length} Inactive
                                        </span>
                                    )}
                                </span>
                            </p>
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            {!isSuperAdmin && (
                                <div className="flex items-center gap-2 px-3 py-2 bg-amber-50/80 text-amber-700 border border-amber-200/50 rounded-lg text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                                    <ShieldAlert size={14} />
                                    <span>View Only</span>
                                </div>
                            )}
                            {isSuperAdmin && (
                                <button
                                    onClick={openAdd}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                                >
                                    <Plus size={18} />
                                    <span>Add Doctor</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-in fade-in duration-500">
                {/* Active Doctors Section */}
                <div className="mb-12 sm:mb-16">
                    <div className="mb-6">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Active Doctors</h2>
                        <div className="h-1 w-12 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full mt-2"></div>
                    </div>
                    
                    {activeDoctors.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-12 text-center">
                            <div className="flex justify-center mb-4">
                                <div className="rounded-full bg-slate-100 p-4">
                                    <UserRound size={32} className="text-slate-400" />
                                </div>
                            </div>
                            <p className="text-slate-600 font-medium">No active doctors yet</p>
                            <p className="text-slate-500 text-sm mt-1">Add your first doctor to get started</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {activeDoctors.map(doc => (
                                <DoctorCard
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

                {/* Inactive Doctors Section */}
                {inactiveDoctors.length > 0 && (
                    <div>
                        <div className="mb-6">
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-700">Inactive Doctors</h2>
                            <div className="h-1 w-12 bg-gradient-to-r from-slate-400 to-slate-300 rounded-full mt-2"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 opacity-60">
                            {inactiveDoctors.map(doc => (
                                <DoctorCard
                                    key={doc.id}
                                    doc={doc}
                                    isSuperAdmin={isSuperAdmin}
                                    onEdit={() => openEdit(doc)}
                                    onToggle={() => handleToggleActive(doc)}
                                    onPermanentDelete={() => handlePermanentDelete(doc)}
                                    isInactive
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div 
                    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-0" 
                    onClick={closeModal}
                >
                    <div 
                        className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col h-screen sm:h-auto sm:max-h-[85vh] overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex-shrink-0 border-b border-slate-200/50 px-6 py-5 sm:py-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                                        {editTarget ? 'Edit Doctor Profile' : 'Add New Doctor'}
                                    </h2>
                                    <p className="text-slate-500 text-sm mt-1">
                                        {editTarget ? 'Update doctor information' : 'Register a new doctor in the system'}
                                    </p>
                                </div>
                                <button 
                                    onClick={closeModal} 
                                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 hover:text-slate-700"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Modal Content - Scrollable */}
                        <div className="flex-grow overflow-y-auto px-6 py-6 sm:py-7 space-y-6">
                            {error && (
                                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200/50 rounded-xl sticky top-0 z-10 shadow-sm">
                                    <div className="flex-shrink-0 mt-0.5">
                                        <div className="flex items-center justify-center h-5 w-5 rounded-full bg-red-100">
                                            <span className="text-red-600 font-bold text-xs">!</span>
                                        </div>
                                    </div>
                                    <p className="text-red-700 text-sm font-medium">{error}</p>
                                </div>
                            )}

                            {/* Form Sections */}
                            <div className="space-y-6">
                                {/* Basic Info Section */}
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-400 mb-4">Basic Information</h3>
                                    <div className="space-y-4">
                                        <FormField label="Full Name *" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="Dr. Ahmed Al-Rashidi" />
                                        <FormField label="Specialty *" value={form.specialty} onChange={v => setForm(f => ({ ...f, specialty: v }))} placeholder="e.g., Orthodontics, General Dentistry" />
                                    </div>
                                </div>

                                {/* Media Section */}
                                <div>
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Media</h3>
                                    <FormField label="Image URL" value={form.image} onChange={v => setForm(f => ({ ...f, image: v }))} placeholder="https://example.com/image.jpg" />
                                </div>

                                {/* Details Section */}
                                <div>
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Professional Details</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-semibold text-slate-700 block mb-2">Bio</label>
                                            <textarea
                                                rows={4}
                                                value={form.bio}
                                                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                                                placeholder="Brief professional background, experience, qualifications..."
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-semibold text-slate-700 block mb-2 flex items-center gap-2">
                                                    <MapPin size={16} className="text-blue-600" />
                                                    Location
                                                </label>
                                                <select
                                                    value={form.location}
                                                    onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                >
                                                    <option value="">Select location</option>
                                                    <option value="Salmiya">Salmiya</option>
                                                    <option value="Sabah Al-Salem">Sabah Al-Salem</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="text-sm font-semibold text-slate-700 block mb-2">Display Order</label>
                                                <input
                                                    type="number"
                                                    value={form.order}
                                                    onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) || 0 }))}
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                    min={0}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Languages Section */}
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 block mb-3 flex items-center gap-2">
                                        <Globe size={16} className="text-blue-600" />
                                        Languages
                                    </label>
                                    <div className="flex flex-wrap gap-3">
                                        {['Arabic', 'English', 'French'].map(lang => (
                                            <label key={lang} className="flex items-center gap-3 px-4 py-2 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer group">
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
                                                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                />
                                                <span className="text-sm font-medium text-slate-700 group-hover:text-blue-700 transition-colors">{lang}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer - Sticky */}
                        <div className="flex-shrink-0 border-t border-slate-200/50 px-6 py-4 bg-gradient-to-r from-slate-50/50 to-blue-50/50 flex gap-3">
                            <button
                                onClick={closeModal}
                                className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-all active:scale-95"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-400 disabled:to-slate-400 text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:shadow-none active:scale-95"
                            >
                                {saving && <Loader2 size={16} className="animate-spin" />}
                                <span>{saving ? 'Saving...' : editTarget ? 'Save Changes' : 'Add Doctor'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const DoctorCard = ({ doc, isSuperAdmin, onEdit, onToggle, onPermanentDelete, isInactive }: {
    doc: Doctor;
    isSuperAdmin: boolean;
    onEdit: () => void;
    onToggle: () => void;
    onPermanentDelete: () => void;
    isInactive?: boolean;
}) => (
    <div className="group relative bg-white border border-slate-200/50 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-blue-200/50 flex flex-col h-full">
        {/* Background accent */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-blue-400 to-transparent"></div>

        {/* Card Content */}
        <div className="flex flex-col h-full">
            {/* Header with Avatar */}
            <div className="px-6 py-6 pb-4 border-b border-slate-100/50">
                <div className="flex items-start justify-between mb-4">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-200/30 overflow-hidden shadow-md">
                            {doc.image ? (
                                <img src={doc.image} alt={doc.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <UserRound size={28} className="text-blue-400" />
                                </div>
                            )}
                        </div>
                        {doc.isActive && !isInactive && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full shadow-md"></div>
                        )}
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold tracking-wider ${
                        doc.isActive 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' 
                            : 'bg-slate-100 text-slate-600 border border-slate-200/50'
                    }`}>
                        {doc.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">{doc.name}</h3>
                <p className="text-sm text-blue-600 font-semibold">{doc.specialty}</p>
            </div>

            {/* Body Content */}
            <div className="flex-grow px-6 py-4 space-y-3">
                {doc.location && (
                    <div className="flex items-start gap-2">
                        <MapPin size={14} className="text-slate-400 mt-1 flex-shrink-0" />
                        <span className="text-sm text-slate-600">{doc.location}</span>
                    </div>
                )}

                {doc.languages && doc.languages.length > 0 && (
                    <div className="flex items-start gap-2">
                        <Globe size={14} className="text-slate-400 mt-1 flex-shrink-0" />
                        <div className="flex flex-wrap gap-1.5">
                            {doc.languages.map(lang => (
                                <span key={lang} className="inline-flex px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200/50 rounded-full">
                                    {lang}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {doc.bio && (
                    <p className="text-sm text-slate-600 line-clamp-2 pt-2">{doc.bio}</p>
                )}
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 border-t border-slate-100/50 bg-slate-50/30 flex gap-2">
                <button
                    onClick={onEdit}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-all border border-blue-200/30"
                    title="Edit"
                >
                    <Pencil size={16} />
                    <span className="hidden sm:inline">Edit</span>
                </button>
                {isSuperAdmin && (
                    <>
                        <button
                            onClick={onToggle}
                            className={`flex items-center justify-center p-2 rounded-lg transition-all border ${
                                doc.isActive
                                    ? 'text-red-600 hover:bg-red-50 border-red-200/30'
                                    : 'text-emerald-600 hover:bg-emerald-50 border-emerald-200/30'
                            }`}
                            title={doc.isActive ? 'Deactivate' : 'Reactivate'}
                        >
                            {doc.isActive ? <PowerOff size={16} /> : <Power size={16} />}
                        </button>
                        <button
                            onClick={onPermanentDelete}
                            className="flex items-center justify-center p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all border border-red-200/30"
                            title="Delete"
                        >
                            <Trash2 size={16} />
                        </button>
                    </>
                )}
            </div>
        </div>
    </div>
);

const FormField = ({ label, value, onChange, placeholder }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
}) => (
    <div>
        <label className="text-sm font-semibold text-slate-700 block mb-2">{label}</label>
        <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
    </div>
);

export default DoctorsPage;