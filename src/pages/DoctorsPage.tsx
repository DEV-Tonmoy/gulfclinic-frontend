import { useEffect, useState } from 'react';
import { UserRound, Plus, Pencil, PowerOff, Power, Loader2, X, ShieldAlert, Trash2, MapPin, Globe } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';

interface Doctor {
    id: string; name: string; specialty: string; image: string | null; bio: string | null;
    isActive: boolean; createdAt: string; slug: string | null; location: string | null;
    languages: string[]; order: number;
}
interface FormState { name: string; specialty: string; image: string; bio: string; location: string; languages: string[]; order: number; }
const emptyForm: FormState = { name:'', specialty:'', image:'', bio:'', location:'', languages:[], order:0 };

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
        try { setLoading(true); const { data } = await api.get('/admin/doctors'); if (data.success) setDoctors(data.data); }
        catch { setError('Failed to load doctors.'); } finally { setLoading(false); }
    };
    useEffect(() => { fetchDoctors(); }, []);

    const openAdd = () => { setEditTarget(null); setForm(emptyForm); setError(''); setShowModal(true); };
    const openEdit = (doc: Doctor) => {
        setEditTarget(doc);
        setForm({ name:doc.name, specialty:doc.specialty, image:doc.image??'', bio:doc.bio??'', location:doc.location??'', languages:doc.languages??[], order:doc.order??0 });
        setError(''); setShowModal(true);
    };
    const closeModal = () => { setShowModal(false); setEditTarget(null); setForm(emptyForm); setError(''); };

    const handleSave = async () => {
        if (!form.name.trim()||!form.specialty.trim()) { setError('Name and specialty are required.'); return; }
        try {
            setSaving(true); setError('');
            const payload = { name:form.name.trim(), specialty:form.specialty.trim(), image:form.image.trim()||null, bio:form.bio.trim()||null, location:form.location||null, languages:form.languages, order:form.order };
            if (editTarget) await api.patch(`/admin/doctors/${editTarget.id}`, payload);
            else await api.post('/admin/doctors', payload);
            await fetchDoctors(); closeModal();
        } catch { setError('Failed to save. Please try again.'); } finally { setSaving(false); }
    };

    const handleToggleActive = async (doc: Doctor) => {
        if (!isSuperAdmin) return;
        try { await api.patch(`/admin/doctors/${doc.id}`, { isActive: !doc.isActive }); await fetchDoctors(); }
        catch { alert('Failed to update doctor status.'); }
    };
    const handlePermanentDelete = async (doc: Doctor) => {
        if (!isSuperAdmin) return;
        if (!confirm(`Permanently delete ${doc.name}? This cannot be undone.`)) return;
        try { await api.delete(`/admin/doctors/${doc.id}/permanent`); await fetchDoctors(); }
        catch { alert('Failed to permanently delete doctor.'); }
    };

    const activeDoctors = doctors.filter(d => d.isActive);
    const inactiveDoctors = doctors.filter(d => !d.isActive);

    if (loading) return (
        <div className="p-8 flex items-center gap-3 text-[#8A8A8A] font-medium h-full justify-center">
            <Loader2 className="animate-spin text-[#126209]" /> <span>Loading doctors...</span>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="heading-lg">Our Doctors</h1>
                    <p className="text-body mt-1 flex items-center gap-3">
                        Manage your medical team
                        <span className="pill-confirmed">{activeDoctors.length} Active</span>
                        {inactiveDoctors.length > 0 && <span className="pill-completed">{inactiveDoctors.length} Inactive</span>}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {!isSuperAdmin && (
                        <div className="pill-pending flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.06em]">
                            <ShieldAlert size={14}/> View Only
                        </div>
                    )}
                    {isSuperAdmin && (
                        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
                            <Plus size={16}/> Add Doctor
                        </button>
                    )}
                </div>
            </div>

            {/* Active */}
            <Section title="Active Doctors" color="green">
                {activeDoctors.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activeDoctors.map(doc => (
                            <DoctorCard key={doc.id} doc={doc} isSuperAdmin={isSuperAdmin}
                                onEdit={()=>openEdit(doc)} onToggle={()=>handleToggleActive(doc)} onDelete={()=>handlePermanentDelete(doc)}/>
                        ))}
                    </div>
                )}
            </Section>

            {/* Inactive */}
            {inactiveDoctors.length > 0 && (
                <Section title="Inactive Doctors" color="gray">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-60">
                        {inactiveDoctors.map(doc => (
                            <DoctorCard key={doc.id} doc={doc} isSuperAdmin={isSuperAdmin}
                                onEdit={()=>openEdit(doc)} onToggle={()=>handleToggleActive(doc)} onDelete={()=>handlePermanentDelete(doc)}/>
                        ))}
                    </div>
                </Section>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4" onClick={closeModal}>
                    <div className="bg-[#141414] border border-[#2A2A2A] w-full sm:max-w-2xl rounded-t-2xl sm:rounded-2xl shadow-elevated-lg flex flex-col h-[90vh] sm:h-auto sm:max-h-[85vh] overflow-hidden animate-slide-up-sheet sm:animate-modal-in" onClick={e=>e.stopPropagation()}>
                        <div className="flex-shrink-0 border-b border-[#2A2A2A] px-5 py-4 sm:px-6 sm:py-5">
                            <div className="sm:hidden flex justify-center mb-3"><div className="w-10 h-1 bg-[#3A3A3A] rounded-full"/></div>
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-lg sm:text-xl font-semibold text-[#F0EDE8] tracking-heading">{editTarget?'Edit Doctor Profile':'Add New Doctor'}</h2>
                                    <p className="text-[#8A8A8A] text-sm mt-1">{editTarget?'Update doctor information':'Register a new doctor'}</p>
                                </div>
                                <button onClick={closeModal} className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-[#1C1C1C] rounded-lg transition-all duration-200 ease-in-out"><X size={20} className="text-[#8A8A8A]"/></button>
                            </div>
                        </div>
                        <div className="flex-grow overflow-y-auto px-6 py-5 space-y-5">
                            {error && <div className="p-3 bg-[#C0392B]/10 border border-[#C0392B]/20 rounded-lg text-[#F87171] text-sm font-medium">{error}</div>}
                            <div>
                                <h3 className="label-caps text-[10px] mb-3">Basic Information</h3>
                                <div className="space-y-3">
                                    <FField label="Full Name *" value={form.name} onChange={v=>setForm(f=>({...f,name:v}))} placeholder="Dr. Ahmed Al-Rashidi"/>
                                    <FField label="Specialty *" value={form.specialty} onChange={v=>setForm(f=>({...f,specialty:v}))} placeholder="e.g., Orthodontics"/>
                                </div>
                            </div>
                            <div>
                                <h3 className="label-caps text-[10px] mb-3">Media</h3>
                                <FField label="Image URL" value={form.image} onChange={v=>setForm(f=>({...f,image:v}))} placeholder="https://example.com/image.jpg"/>
                            </div>
                            <div>
                                <h3 className="label-caps text-[10px] mb-3">Professional Details</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs font-medium text-[#8A8A8A] uppercase tracking-wide block mb-1.5">Bio</label>
                                        <textarea rows={3} value={form.bio} onChange={e=>setForm(f=>({...f,bio:e.target.value}))}
                                            placeholder="Brief professional background..." className="input-field resize-none"/>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs font-medium text-[#8A8A8A] uppercase tracking-wide mb-1.5 flex items-center gap-1.5"><MapPin size={14} className="text-[#126209]"/> Location</label>
                                            <select value={form.location} onChange={e=>setForm(f=>({...f,location:e.target.value}))} className="input-field">
                                                <option value="">Select location</option>
                                                <option value="Salmiya">Salmiya</option>
                                                <option value="Sabah Al-Salem">Sabah Al-Salem</option>
                                                <option value="Both Branches">Both Branches</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-[#8A8A8A] uppercase tracking-wide block mb-1.5">Display Order</label>
                                            <input type="number" value={form.order} onChange={e=>setForm(f=>({...f,order:parseInt(e.target.value)||0}))} className="input-field" min={0}/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-[#8A8A8A] uppercase tracking-wide mb-2 flex items-center gap-1.5"><Globe size={14} className="text-[#B5810A]"/> Languages</label>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {['Arabic','English','French','Hindi'].map(lang=>(
                                        <label key={lang} className={`flex items-center gap-2 px-3 min-h-[44px] border rounded-lg cursor-pointer text-sm transition-all duration-200 ease-in-out ${form.languages.includes(lang)?'border-[#126209] bg-[#126209]/10 text-[#4ADE80]':'border-[#2A2A2A] text-[#8A8A8A] hover:border-[#3A3A3A] hover:text-[#F0EDE8]'}`}>
                                            <input type="checkbox" checked={form.languages.includes(lang)} className="hidden"
                                                onChange={e=>{if(e.target.checked)setForm(f=>({...f,languages:[...f.languages,lang]}));else setForm(f=>({...f,languages:f.languages.filter(l=>l!==lang)}));}}/>
                                            {lang}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex-shrink-0 border-t border-[#2A2A2A] px-6 py-4 flex gap-3 bg-[#1C1C1C]/50">
                            <button onClick={closeModal} className="flex-1 btn-secondary">Cancel</button>
                            <button onClick={handleSave} disabled={saving} className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50">
                                {saving&&<Loader2 size={14} className="animate-spin"/>}{saving?'Saving...':editTarget?'Save Changes':'Add Doctor'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

/* ── Sub-components ── */
const Section = ({title,color,children}:{title:string;color:string;children:React.ReactNode}) => (
    <div>
        <div className="mb-4">
            <h2 className="text-lg font-semibold text-[#F0EDE8] tracking-heading">{title}</h2>
            <div className={`h-0.5 w-10 rounded-full mt-2 ${color==='green'?'bg-[#126209]':'bg-[#3A3A3A]'}`}/>
        </div>
        {children}
    </div>
);

const EmptyState = () => (
    <div className="rounded-xl border border-dashed border-[#2A2A2A] bg-[#141414] p-12 text-center">
        <div className="flex justify-center mb-3"><div className="rounded-full bg-[#1C1C1C] p-4 border border-[#2A2A2A]"><UserRound size={28} className="text-[#555555]"/></div></div>
        <p className="text-[#F0EDE8] font-medium text-sm">No active doctors yet</p>
        <p className="text-[#8A8A8A] text-xs mt-1">Add your first doctor to get started</p>
    </div>
);

const DoctorCard = ({doc,isSuperAdmin,onEdit,onToggle,onDelete}:{doc:Doctor;isSuperAdmin:boolean;onEdit:()=>void;onToggle:()=>void;onDelete:()=>void}) => (
    <div className="group card-surface overflow-hidden hover:border-[#3A3A3A] transition-all duration-200 flex flex-col">
        <div className="h-0.5 bg-gradient-to-r from-[#126209] via-[#126209]/40 to-transparent"/>
        <div className="px-5 py-4 border-b border-[#2A2A2A]/50">
            <div className="flex items-start justify-between mb-3">
                <div className="relative">
                    <div className="w-14 h-14 rounded-xl bg-[#1C1C1C] border border-[#2A2A2A] overflow-hidden">
                        {doc.image?<img src={doc.image} alt={doc.name} className="w-full h-full object-cover"/>:
                        <div className="flex items-center justify-center h-full"><UserRound size={24} className="text-[#555555]"/></div>}
                    </div>
                    {doc.isActive && <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#2ECC71] border-2 border-[#141414] rounded-full"/>}
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${doc.isActive?'bg-[#126209]/20 text-[#4ADE80]':'bg-[#1C1C1C] text-[#555555]'}`}>
                    {doc.isActive?'ACTIVE':'INACTIVE'}
                </span>
            </div>
            <h3 className="text-sm font-semibold text-[#F0EDE8]">{doc.name}</h3>
            <p className="text-xs text-[#126209] font-medium mt-0.5">{doc.specialty}</p>
        </div>
        <div className="flex-grow px-5 py-3 space-y-2">
            {doc.location && <div className="flex items-center gap-2"><MapPin size={13} className="text-[#555555]"/><span className="text-xs text-[#8A8A8A]">{doc.location}</span></div>}
            {doc.languages?.length>0 && (
                <div className="flex items-center gap-2"><Globe size={13} className="text-[#555555]"/>
                    <div className="flex flex-wrap gap-1">{doc.languages.map(l=><span key={l} className="text-[10px] px-1.5 py-0.5 bg-[#1C1C1C] text-[#8A8A8A] rounded border border-[#2A2A2A]">{l}</span>)}</div>
                </div>
            )}
            {doc.bio && <p className="text-xs text-[#8A8A8A] line-clamp-2 pt-1">{doc.bio}</p>}
        </div>
        <div className="px-5 py-3 border-t border-[#2A2A2A]/50 flex gap-2 bg-[#1C1C1C]/30">
            <button onClick={onEdit} className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-medium text-[#8A8A8A] hover:text-[#F0EDE8] hover:bg-[#1C1C1C] rounded-lg transition-colors border border-[#2A2A2A]">
                <Pencil size={13}/> Edit
            </button>
            {isSuperAdmin && (<>
                <button onClick={onToggle} className={`p-1.5 rounded-lg border border-[#2A2A2A] transition-colors ${doc.isActive?'text-[#8A8A8A] hover:text-[#F87171] hover:bg-[#C0392B]/10':'text-[#8A8A8A] hover:text-[#4ADE80] hover:bg-[#126209]/10'}`} title={doc.isActive?'Deactivate':'Reactivate'}>
                    {doc.isActive?<PowerOff size={14}/>:<Power size={14}/>}
                </button>
                <button onClick={onDelete} className="p-1.5 text-[#8A8A8A] hover:text-[#F87171] hover:bg-[#C0392B]/10 rounded-lg border border-[#2A2A2A] transition-colors" title="Delete"><Trash2 size={14}/></button>
            </>)}
        </div>
    </div>
);

const FField = ({label,value,onChange,placeholder}:{label:string;value:string;onChange:(v:string)=>void;placeholder?:string}) => (
    <div>
        <label className="text-xs font-medium text-[#8A8A8A] uppercase tracking-wide block mb-1.5">{label}</label>
        <input type="text" value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} className="input-field"/>
    </div>
);

export default DoctorsPage;