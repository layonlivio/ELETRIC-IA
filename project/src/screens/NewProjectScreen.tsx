import { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface NewProjectScreenProps {
  onBack: () => void;
  onCreated: (id: string) => void;
}

export default function NewProjectScreen({ onBack, onCreated }: NewProjectScreenProps) {
  const { user } = useAuth();
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [address, setAddress] = useState('');
  const [voltage, setVoltage] = useState(220);
  const [phases, setPhases] = useState(1);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        client_name: clientName,
        client_phone: clientPhone,
        address,
        voltage,
        phases,
        notes,
        status: 'active',
      })
      .select('id')
      .single();

    if (!error && data) {
      onCreated(data.id);
    }
    setSaving(false);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex items-center gap-3 px-4 py-4 bg-white border-b border-slate-200 sticky top-0 z-10">
        <button onClick={onBack} className="p-2 -ml-2 rounded-lg hover:bg-slate-100">
          <ArrowLeft size={22} className="text-slate-700" />
        </button>
        <h1 className="text-lg font-bold text-slate-900">Novo projeto</h1>
      </div>

      <div className="px-4 py-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-600 mb-1 block">Nome do cliente</label>
          <input value={clientName} onChange={(e) => setClientName(e.target.value)} className="input-field" placeholder="Nome do cliente" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-600 mb-1 block">Telefone do cliente</label>
          <input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} className="input-field" placeholder="(00) 00000-0000" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-600 mb-1 block">Endereço</label>
          <input value={address} onChange={(e) => setAddress(e.target.value)} className="input-field" placeholder="Endereço da obra" />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-600 mb-2 block">Tensão</label>
          <div className="flex gap-2">
            {[127, 220, 380].map((v) => (
              <button
                key={v}
                onClick={() => setVoltage(v)}
                className={`chip flex-1 ${voltage === v ? 'chip-active' : 'chip-inactive'}`}
              >
                {v}V
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-600 mb-2 block">Sistema</label>
          <div className="flex gap-2">
            {[
              { v: 1, l: 'Monofásico' },
              { v: 2, l: 'Bifásico' },
              { v: 3, l: 'Trifásico' },
            ].map((p) => (
              <button
                key={p.v}
                onClick={() => setPhases(p.v)}
                className={`chip flex-1 ${phases === p.v ? 'chip-active' : 'chip-inactive'}`}
              >
                {p.l}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-600 mb-1 block">Observações (opcional)</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input-field min-h-[80px]" placeholder="Notas sobre o projeto..." />
        </div>

        <button onClick={handleSave} disabled={saving || !clientName} className="btn-primary w-full">
          <Save size={18} /> {saving ? 'Salvando...' : 'Criar projeto'}
        </button>
      </div>
    </div>
  );
}
