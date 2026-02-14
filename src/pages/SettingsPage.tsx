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
        // Check for common response structures
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
      // Optimistic update for UI snappiness
      setSettings(prev => ({ ...prev, [field]: value }));
      
      const { data } = await api.patch('/admin/settings', { [field]: value });
      if (!data.success) {
        // Rollback if server fails
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
    <div className="p-8 flex items-center gap-3 text-slate-400 font-medium h-full justify-center">
      <Loader2 className="animate-spin text-blue-600" /> 
      <span>Loading configuration...</span>
    </div>
  );

  return (
    <div className="max-w-5xl space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Clinic Configuration</h1>
          <p className="text-slate-500 text-sm">Manage your AI automation and integration settings.</p>
        </div>
        {!isSuperAdmin && (
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold shadow-sm">
            <ShieldAlert size={16} />
            VIEW-ONLY MODE
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Automation Toggles */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="font-bold text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-4">
              <Bot size={20} className="text-blue-600" /> 
              Automation & Features
            </h2>
            
            <div className="grid gap-4">
              <ToggleItem 
                icon={<Bot size={18} />}
                label="AI Appointment Agent" 
                desc="AI will chat with patients and book slots automatically." 
                active={settings?.aiEnabled ?? false} 
                onToggle={() => handleToggle('aiEnabled', !settings.aiEnabled)}
                disabled={!isSuperAdmin || saving}
                color="purple"
              />
              <ToggleItem 
                icon={<Mail size={18} />}
                label="Email Notifications" 
                desc="Send instant booking confirmations to patients." 
                active={settings?.emailEnabled ?? false} 
                onToggle={() => handleToggle('emailEnabled', !settings.emailEnabled)}
                disabled={!isSuperAdmin || saving}
                color="blue"
              />
              <ToggleItem 
                icon={<Table size={18} />}
                label="Google Sheets Sync" 
                desc="Export all new leads to your clinic spreadsheet." 
                active={settings?.sheetsEnabled ?? false} 
                onToggle={() => handleToggle('sheetsEnabled', !settings.sheetsEnabled)}
                disabled={!isSuperAdmin || saving}
                color="emerald"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Identity & Contact */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="font-bold text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-4">
              <Globe size={20} className="text-blue-600" />
              Clinic Identity
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Clinic Name</label>
                <div className="mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold">
                  {settings?.clinicName || 'Gulf Clinic'}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">WhatsApp Business</label>
                <div className="mt-1 flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-mono text-sm">
                  <MessageSquare size={16} className="text-emerald-500" />
                  {settings?.whatsappNumber || 'Not Configured'}
                </div>
              </div>

              <div className="pt-2">
                <p className="text-[10px] text-slate-400 italic leading-relaxed">
                  * Branding and WhatsApp numbers are locked. Contact support to modify core business identifiers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ToggleItem = ({ icon, label, desc, active, onToggle, disabled, color }: any) => {
  const colorMap: any = {
    purple: 'bg-purple-100 text-purple-600',
    blue: 'bg-blue-100 text-blue-600',
    emerald: 'bg-emerald-100 text-emerald-600',
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50/50 border border-slate-100 transition-all hover:border-slate-200">
      <div className="flex items-center gap-4">
        <div className={`p-2.5 rounded-lg ${colorMap[color] || 'bg-slate-200'}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800">{label}</p>
          <p className="text-xs text-slate-500">{desc}</p>
        </div>
      </div>
      <button 
        onClick={onToggle}
        disabled={disabled}
        className={`w-12 h-6 rounded-full transition-all relative ${active ? 'bg-blue-600' : 'bg-slate-300'} ${disabled && 'opacity-50 cursor-not-allowed'}`}
      >
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${active ? 'left-7' : 'left-1'}`} />
      </button>
    </div>
  );
};

export default SettingsPage;