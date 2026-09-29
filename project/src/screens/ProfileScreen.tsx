import { useState } from 'react';
import { User, Mail, Phone, CreditCard, LogOut, ChevronRight, Zap, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PLAN_FEATURES, PLAN_PRICES, type PlanType, type PeriodType } from '@/lib/plans';
import Modal from '@/components/Modal';

export default function ProfileScreen() {
  const { user, profile, signOut, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile?.name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [showPlans, setShowPlans] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('pro');
  const [period, setPeriod] = useState<PeriodType>('monthly');

  const plan = (profile?.plan as PlanType) || 'normal';

  async function handleSave() {
    await updateProfile({ name, phone });
    setEditing(false);
  }

  return (
    <div className="px-4 py-6 space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Perfil</h1>

      {/* Profile card */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-full bg-slate-900 flex items-center justify-center">
            <User size={28} className="text-white" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900">{profile?.name || 'Eletricista'}</h2>
            <p className="text-sm text-slate-500">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-3 py-2">
            <Mail size={18} className="text-slate-400" />
            <span className="text-sm text-slate-700">{user?.email}</span>
          </div>
          <div className="flex items-center gap-3 py-2">
            <Phone size={18} className="text-slate-400" />
            <span className="text-sm text-slate-700">{profile?.phone || 'Não informado'}</span>
          </div>
        </div>

        <button onClick={() => setEditing(true)} className="btn-secondary w-full mt-3">
          Editar perfil
        </button>
      </div>

      {/* Plan card */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CreditCard size={20} className="text-slate-700" />
            <h3 className="font-bold text-slate-900">Plano atual</h3>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${plan === 'pro' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
            {plan === 'pro' ? 'PRO' : 'NORMAL'}
          </span>
        </div>

        <div className="space-y-2 mb-3">
          {[
            { label: 'Projetos', value: `${PLAN_FEATURES[plan].max_projects}` },
            { label: 'Circuitos por projeto', value: `${PLAN_FEATURES[plan].max_circuits_per_project}` },
            { label: 'IA consultora', value: PLAN_FEATURES[plan].ai_enabled ? 'Disponível' : 'Indisponível' },
            { label: 'Gerar PDF', value: PLAN_FEATURES[plan].pdf_enabled ? 'Disponível' : 'Indisponível' },
            { label: 'WhatsApp', value: PLAN_FEATURES[plan].whatsapp_enabled ? 'Disponível' : 'Indisponível' },
            { label: 'Orçamentos', value: PLAN_FEATURES[plan].budget ? 'Disponível' : 'Indisponível' },
          ].map((f) => (
            <div key={f.label} className="flex items-center justify-between text-sm">
              <span className="text-slate-600">{f.label}</span>
              <span className={`font-medium ${f.value === 'Disponível' ? 'text-green-600' : f.value === 'Indisponível' ? 'text-slate-400' : 'text-slate-900'}`}>
                {f.value}
              </span>
            </div>
          ))}
        </div>

        {plan !== 'pro' && (
          <button onClick={() => setShowPlans(true)} className="btn-primary w-full">
            <Zap size={18} /> Fazer upgrade para PRO
          </button>
        )}
      </div>

      {/* Settings */}
      <div className="card">
        <button onClick={signOut} className="flex items-center justify-between w-full active:text-red-600 transition-colors">
          <div className="flex items-center gap-2">
            <LogOut size={20} className="text-slate-700" />
            <span className="font-medium text-slate-700">Sair da conta</span>
          </div>
          <ChevronRight size={18} className="text-slate-400" />
        </button>
      </div>

      <p className="text-center text-xs text-slate-400 pt-2">Eletricista IA v1.0 — Baseado na NBR 5410</p>

      {/* Edit Modal */}
      <Modal open={editing} onClose={() => setEditing(false)} title="Editar perfil">
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-slate-600 mb-1 block">Nome</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600 mb-1 block">Telefone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field" placeholder="(00) 00000-0000" />
          </div>
          <button onClick={handleSave} className="btn-primary w-full">Salvar</button>
        </div>
      </Modal>

      {/* Plans Modal */}
      <Modal open={showPlans} onClose={() => setShowPlans(false)} title="Planos">
        <div className="space-y-4">
          {/* Period toggle */}
          <div className="flex gap-2">
            {[
              { id: 'monthly' as const, label: 'Mensal' },
              { id: 'yearly' as const, label: 'Anual (2 meses grátis)' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={`chip flex-1 ${period === p.id ? 'chip-active' : 'chip-inactive'}`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Normal Plan */}
          <div className={`card border-2 ${selectedPlan === 'normal' ? 'border-blue-500' : 'border-slate-200'}`}>
            <button onClick={() => setSelectedPlan('normal')} className="w-full text-left">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-slate-900">Normal</h3>
                {selectedPlan === 'normal' && <Check size={20} className="text-blue-600" />}
              </div>
              <p className="text-2xl font-bold text-slate-900">Grátis</p>
              <ul className="mt-3 space-y-1 text-sm text-slate-600">
                <li>• Até 3 projetos</li>
                <li>• Até 5 circuitos por projeto</li>
                <li>• Lista de materiais</li>
                <li>• Cálculos NBR 5410</li>
              </ul>
            </button>
          </div>

          {/* Pro Plan */}
          <div className={`card border-2 ${selectedPlan === 'pro' ? 'border-blue-500' : 'border-slate-200'} bg-gradient-to-br from-slate-900 to-slate-800`}>
            <button onClick={() => setSelectedPlan('pro')} className="w-full text-left">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-white">PRO</h3>
                {selectedPlan === 'pro' && <Check size={20} className="text-blue-400" />}
              </div>
              <p className="text-2xl font-bold text-white">
                R$ {PLAN_PRICES.pro[period].toFixed(2)}
                <span className="text-sm font-normal text-slate-400">/{period === 'monthly' ? 'mês' : 'ano'}</span>
              </p>
              <ul className="mt-3 space-y-1 text-sm text-slate-300">
                <li>• Projetos ilimitados</li>
                <li>• Circuitos ilimitados</li>
                <li>• IA consultora técnica</li>
                <li>• Gerar PDF (memória de cálculo)</li>
                <li>• Orçamentos e WhatsApp</li>
                <li>• Suporte prioritário</li>
              </ul>
            </button>
          </div>

          <button
            onClick={() => {
              // In production, this would redirect to Mercado Pago
              alert('Integração com Mercado Pago está preparada. Configure as credenciais para ativar os pagamentos.');
              setShowPlans(false);
            }}
            className="btn-success w-full"
          >
            Assinar {selectedPlan === 'pro' ? `PRO ${period === 'monthly' ? 'Mensal' : 'Anual'}` : 'Normal'}
          </button>
          <p className="text-xs text-slate-400 text-center">Pagamento via Mercado Pago (Pix e cartão)</p>
        </div>
      </Modal>
    </div>
  );
}
