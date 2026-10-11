import {
  ArrowUpRight,
  Bot,
  Calculator,
  Cable,
  ChevronRight,
  FileText,
  FolderKanban,
  Plus,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import type { Tab } from '@/components/BottomNav';
import { useAuth } from '@/contexts/AuthContext';

interface HomeScreenProps {
  onNavigate: (tab: Tab) => void;
  onNewProject: () => void;
  onQuickCalc: () => void;
}

export default function HomeScreen({ onNavigate, onNewProject, onQuickCalc }: HomeScreenProps) {
  const { profile, user } = useAuth();
  const newProjectAction = user ? onNewProject : () => onNavigate('projects');
  const greeting = profile?.name?.split(' ')[0] || 'Eletricista';

  const actions = [
    {
      label: 'Cálculo rápido',
      description: 'Dimensione em minutos',
      icon: Calculator,
      tone: 'bg-amber-400 text-slate-950',
      onClick: onQuickCalc,
    },
    {
      label: 'Novo projeto',
      description: user ? 'Organize sua obra' : 'Abrir projetos',
      icon: FolderKanban,
      tone: 'bg-cyan-400 text-slate-950',
      onClick: newProjectAction,
    },
    {
      label: 'Falar com a IA',
      description: 'Tire uma dúvida técnica',
      icon: Bot,
      tone: 'bg-violet-400 text-slate-950',
      onClick: () => onNavigate('ai'),
    },
    {
      label: 'Orçamento',
      description: 'Materiais e mão de obra',
      icon: FileText,
      tone: 'bg-emerald-400 text-slate-950',
      onClick: () => onNavigate('projects'),
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07111f] text-white">
      <div className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full bg-amber-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-24 top-[32rem] h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative mx-auto max-w-2xl px-5 pb-10 pt-7">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-400 shadow-[0_0_28px_rgba(251,191,36,0.35)]">
              <Zap size={24} className="text-slate-950" fill="currentColor" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-amber-300">Eletricista</p>
              <p className="text-sm font-semibold text-white">IA de campo</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-cyan-200">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
            Operacional
          </div>
        </header>

        <section className="mt-9 rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#12253d] via-[#0d1b2e] to-[#0b1626] p-6 shadow-2xl shadow-black/20">
          <div className="flex items-start justify-between gap-5">
            <div className="max-w-[18rem]">
              <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
                <Sparkles size={14} /> Seu painel de campo
              </p>
              <h1 className="text-3xl font-black leading-[1.05] tracking-tight text-white">
                Olá, {greeting}.
                <span className="mt-1 block text-amber-300">Vamos energizar sua obra?</span>
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-slate-300">
                Cálculos, decisões técnicas e orçamentos organizados em um só lugar.
              </p>
            </div>
            <div className="hidden h-24 w-24 shrink-0 items-center justify-center rounded-[1.75rem] border border-amber-300/25 bg-amber-300/10 sm:flex">
              <Zap size={50} className="text-amber-300" strokeWidth={1.4} />
            </div>
          </div>

          <button
            onClick={onQuickCalc}
            className="mt-6 flex w-full items-center justify-between rounded-2xl bg-amber-400 px-4 py-3.5 text-left font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition-transform active:scale-[0.98]"
          >
            <span className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950/10">
                <Calculator size={19} />
              </span>
              Começar um cálculo
            </span>
            <ArrowUpRight size={20} />
          </button>
        </section>

        <section className="mt-5 grid grid-cols-3 gap-3">
          {[
            { value: 'NBR 5410', label: 'Base técnica', icon: ShieldCheck },
            { value: '4%', label: 'Queda máxima', icon: Cable },
            { value: '24/7', label: 'Acesso rápido', icon: Zap },
          ].map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.label} className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
                <Icon size={16} className="mb-3 text-cyan-300" />
                <p className="text-sm font-black text-white">{metric.value}</p>
                <p className="mt-1 text-[10px] font-medium leading-tight text-slate-400">{metric.label}</p>
              </div>
            );
          })}
        </section>

        <section className="mt-8">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-300">Atalhos de trabalho</p>
              <h2 className="mt-1 text-xl font-bold text-white">O que você precisa agora?</h2>
            </div>
            <span className="text-xs text-slate-500">Acesso completo</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={action.onClick}
                  className="group rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-4 text-left transition-all hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.1] active:scale-[0.98]"
                >
                  <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${action.tone}`}>
                    <Icon size={21} />
                  </span>
                  <span className="mt-4 block text-sm font-bold text-white">{action.label}</span>
                  <span className="mt-1 block text-xs text-slate-400">{action.description}</span>
                  <span className="mt-4 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 transition-colors group-hover:text-cyan-300">
                    Abrir <ChevronRight size={13} />
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-8 rounded-[1.75rem] border border-cyan-300/15 bg-cyan-300/[0.07] p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-300/15 text-cyan-300">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">Checklist de segurança</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                Antes de fechar o quadro, confira proteção, seção do condutor e queda de tensão. Segurança vem antes da pressa.
              </p>
            </div>
          </div>
          <button onClick={() => onNavigate('calculator')} className="mt-4 flex items-center gap-2 text-xs font-bold text-white">
            Revisar dimensionamento <ArrowUpRight size={15} className="text-cyan-300" />
          </button>
        </section>

        <button
          onClick={newProjectAction}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 bg-transparent px-4 py-3 text-sm font-semibold text-slate-300 transition-colors hover:border-amber-300/50 hover:text-amber-300"
        >
          <Plus size={17} /> Criar projeto de instalação
        </button>
      </div>
    </div>
  );
}
