import { Zap, Home, Bot, FileText, DollarSign, Lock } from 'lucide-react';
import type { Tab } from '@/components/BottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { PLAN_FEATURES } from '@/lib/plans';

interface HomeScreenProps {
  onNavigate: (tab: Tab) => void;
  onNewProject: () => void;
  onQuickCalc: () => void;
}

export default function HomeScreen({ onNavigate, onNewProject, onQuickCalc }: HomeScreenProps) {
  const { profile } = useAuth();
  const plan = (profile?.plan as 'normal' | 'pro') || 'normal';
  const isPro = plan === 'pro';

  const shortcuts = [
    { icon: Zap, label: 'Cálculo rápido', color: 'bg-amber-500', onClick: onQuickCalc },
    { icon: Home, label: 'Novo projeto', color: 'bg-blue-600', onClick: onNewProject },
    { icon: Bot, label: 'Perguntar à IA', color: 'bg-slate-800', onClick: () => onNavigate('ai'), locked: !PLAN_FEATURES[plan].ai_enabled },
    { icon: FileText, label: 'Meus relatórios', color: 'bg-slate-700', onClick: () => onNavigate('projects') },
    { icon: DollarSign, label: 'Orçamento', color: 'bg-green-600', onClick: () => onNavigate('projects'), locked: !PLAN_FEATURES[plan].budget },
  ];

  return (
    <div className="px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Olá, {profile?.name || 'Eletricista'}</h1>
        <p className="text-slate-500 mt-1">O que você precisa fazer hoje?</p>
      </div>

      <div className="flex items-center gap-2">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isPro ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
          {isPro ? 'Plano PRO' : 'Plano Normal'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {shortcuts.map((s, i) => {
          const Icon = s.icon;
          return (
            <button
              key={i}
              onClick={s.onClick}
              className="card flex flex-col items-start gap-3 active:scale-[0.98] transition-transform relative"
            >
              {s.locked && (
                <Lock size={16} className="absolute top-3 right-3 text-slate-400" />
              )}
              <div className={`w-12 h-12 rounded-xl ${s.color} flex items-center justify-center`}>
                <Icon size={24} className="text-white" />
              </div>
              <p className="font-semibold text-slate-900 text-sm">{s.label}</p>
            </button>
          );
        })}
      </div>

      <div className="card bg-gradient-to-br from-slate-900 to-slate-800 border-0">
        <div className="flex items-center gap-3 mb-2">
          <Zap size={20} className="text-amber-400" />
          <h3 className="font-bold text-white">Dica do dia</h3>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">
          Sempre verifique a queda de tensão em circuitos longos. A NBR 5410 limita a queda máxima em 4% para circuitos terminais com alimentação direta.
        </p>
      </div>

      {!isPro && (
        <button
          onClick={() => onNavigate('profile')}
          className="card w-full flex items-center justify-between active:scale-[0.98] transition-transform border-blue-200 bg-blue-50"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <Zap size={20} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">Fazer upgrade para PRO</p>
              <p className="text-xs text-slate-500">IA, PDF e orçamentos ilimitados</p>
            </div>
          </div>
        </button>
      )}
    </div>
  );
}
