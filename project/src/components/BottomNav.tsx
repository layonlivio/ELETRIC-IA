import { Home, Calculator, FolderOpen, Bot, User } from 'lucide-react';

export type Tab = 'home' | 'calculator' | 'projects' | 'ai' | 'profile';

interface BottomNavProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Início', icon: Home },
  { id: 'calculator', label: 'Cálculo', icon: Calculator },
  { id: 'projects', label: 'Projetos', icon: FolderOpen },
  { id: 'ai', label: 'IA', icon: Bot },
  { id: 'profile', label: 'Perfil', icon: User },
];

export default function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 safe-bottom z-50">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors"
            >
              <Icon
                size={22}
                className={isActive ? 'text-blue-600' : 'text-slate-400'}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className={`text-xs font-medium ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
