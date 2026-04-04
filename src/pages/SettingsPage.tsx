import { useEffect, useState } from 'react';
import { Bot, Mail, MessageSquare, Table, ShieldAlert, Loader2, Globe } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';

const SettingsPage = () => {
  const { admin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    clinicName: 'Gulf Clinic',
    whatsappNumber: '',
    aiEnabled: false,
    emailEnabled: false,
    sheetsEnabled: false,
  });

  const isSuperAdmin = admin?.role === 'SUPER_ADMIN';

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/admin/settings');
        if (response.data && response.data.success) {
          setSettings(response.data.data || response.data.settings || settings);
        }
      } catch (err) {
        console.error("Failed to load settings - Route might not be implemented yet");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleToggle = async (field: string, value: boolean) => {
    if (!isSuperAdmin) return;
    try {
      setSaving(true);
      setSettings(prev => ({ ...prev, [field]: value }));
      const { data } = await api.patch('/admin/settings', { [field]: value });
      if (!data.success) {
        setSettings(prev => ({ ...prev, [field]: !value }));
        alert("Server failed to update setting.");
      }
    } catch (err) {
      setSettings(prev => ({ ...prev, [field]: !value }));
      alert("Update failed. Please check your permissions or network.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="p-8 flex items-center gap-3 text-[#8A8A8A] font-medium h-full justify-center">
      <Loader2 className="animate-spin text-[#126209]" />
      <span>Loading configuration...</span>
    </div>
  );

  return (
    <div className="max-w-5xl space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="heading-lg">Clinic Configuration</h1>
          <p className="text-body mt-1">Manage your AI automation and integration settings.</p>
        </div>
        {!isSuperAdmin && (
          <div className="pill-pending flex items-center gap-2 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.06em]">
            <ShieldAlert size={14} /> VIEW-ONLY
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Toggles */}
        <div className="lg:col-span-2">
          <div className="card-surface p-5 space-y-5">
            <h2 className="font-semibold text-[#F0EDE8] flex items-center gap-2 border-b border-[#2A2A2A] pb-4 text-sm tracking-heading">
              <Bot size={18} className="text-[#126209]" /> Automation & Features
            </h2>
            <div className="grid gap-3">
              <ToggleRow icon={<Bot size={16}/>} label="AI Appointment Agent" desc="AI will chat with patients and book slots automatically."
                active={settings.aiEnabled} onToggle={() => handleToggle('aiEnabled', !settings.aiEnabled)} disabled={!isSuperAdmin||saving} color="purple"/>
              <ToggleRow icon={<Mail size={16}/>} label="Email Notifications" desc="Send instant booking confirmations to patients."
                active={settings.emailEnabled} onToggle={() => handleToggle('emailEnabled', !settings.emailEnabled)} disabled={!isSuperAdmin||saving} color="blue"/>
              <ToggleRow icon={<Table size={16}/>} label="Google Sheets Sync" desc="Export all new leads to your clinic spreadsheet."
                active={settings.sheetsEnabled} onToggle={() => handleToggle('sheetsEnabled', !settings.sheetsEnabled)} disabled={!isSuperAdmin||saving} color="green"/>
            </div>
          </div>
        </div>

        {/* Right: Identity */}
        <div>
          <div className="card-surface p-5 space-y-5">
            <h2 className="font-semibold text-[#F0EDE8] flex items-center gap-2 border-b border-[#2A2A2A] pb-4 text-sm tracking-heading">
              <Globe size={18} className="text-[#B5810A]" /> Clinic Identity
            </h2>
            <div className="space-y-4">
              <div>
                <label className="label-caps text-[10px]">Clinic Name</label>
                <div className="mt-1.5 p-2.5 bg-[#1C1C1C] border border-[#2A2A2A] rounded-lg text-[#F0EDE8] font-medium text-sm">
                  {settings.clinicName || 'Gulf Clinic'}
                </div>
              </div>
              <div>
                <label className="label-caps text-[10px]">WhatsApp Business</label>
                <div className="mt-1.5 flex items-center gap-2.5 p-2.5 bg-[#1C1C1C] border border-[#2A2A2A] rounded-lg text-[#8A8A8A] font-mono text-sm">
                  <MessageSquare size={15} className="text-[#2ECC71] shrink-0" />
                  {settings.whatsappNumber || 'Not Configured'}
                </div>
              </div>
              <p className="text-[10px] text-[#555555] italic leading-relaxed pt-1">
                * Branding and WhatsApp numbers are locked. Contact support to modify core business identifiers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ToggleRow = ({ icon, label, desc, active, onToggle, disabled, color }: any) => {
  const cm: any = { purple:'bg-purple-500/15 text-purple-400', blue:'bg-[#3498DB]/15 text-[#3498DB]', green:'bg-[#126209]/15 text-[#4ADE80]' };
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-lg bg-[#1C1C1C]/50 border border-[#2A2A2A] hover:border-[#3A3A3A] transition-colors duration-200 gap-3">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg shrink-0 ${cm[color]||'bg-[#1C1C1C] text-[#8A8A8A]'}`}>{icon}</div>
        <div>
          <p className="text-sm font-medium text-[#F0EDE8]">{label}</p>
          <p className="text-xs text-[#8A8A8A] mt-0.5">{desc}</p>
        </div>
      </div>
      <div className="flex justify-end sm:block">
        <button onClick={onToggle} disabled={disabled}
          className={`toggle-track ${active?'bg-[#126209] shadow-[0_0_10px_rgba(18,98,9,0.3)]':'bg-[#3A3A3A]'} ${disabled&&'opacity-40 cursor-not-allowed'}`}>
          <div className={`toggle-thumb ${active?'left-[22px]':'left-1'}`}/>
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;