import { useState, useEffect } from 'react';
import { Plus, FolderOpen, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { canCreateProject, PLAN_FEATURES } from '@/lib/plans';

interface ProjectListProps {
  onOpenProject: (id: string) => void;
  onNewProject: () => void;
}

interface ProjectItem {
  id: string;
  client_name: string;
  address: string;
  voltage: number;
  status: string;
  created_at: string;
  circuit_count: number;
}

export default function ProjectsScreen({ onOpenProject, onNewProject }: ProjectListProps) {
  const { profile, user } = useAuth();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadProjects();
  }, [user]);

  async function loadProjects() {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('projects')
      .select('id, client_name, address, voltage, status, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      const projectsWithCounts = await Promise.all(
        data.map(async (p) => {
          const { count } = await supabase
            .from('circuits')
            .select('id', { count: 'exact', head: true })
            .eq('project_id', p.id);
          return { ...p, circuit_count: count ?? 0 };
        })
      );
      setProjects(projectsWithCounts as ProjectItem[]);
    }
    setLoading(false);
  }

  const plan = (profile?.plan as 'normal' | 'pro') || 'normal';
  const canCreate = canCreateProject(plan, projects.length);

  return (
    <div className="px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Projetos</h1>
        <button
          onClick={onNewProject}
          disabled={!canCreate}
          className="btn-primary py-2 px-4 text-sm"
        >
          <Plus size={18} /> Novo
        </button>
      </div>

      {!canCreate && (
        <div className="card bg-amber-50 border-amber-200">
          <p className="text-sm text-amber-800">
            Você atingiu o limite de {PLAN_FEATURES[plan].max_projects} projetos do plano {plan.toUpperCase()}. Faça upgrade para criar mais.
          </p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-slate-400">
          <p>Carregando projetos...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16">
          <FolderOpen size={48} className="text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Nenhum projeto ainda</p>
          <p className="text-sm text-slate-400 mt-1">Crie seu primeiro projeto elétrico</p>
          <button onClick={onNewProject} className="btn-primary mt-4">
            <Plus size={18} /> Criar projeto
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => onOpenProject(p.id)}
              className="card w-full flex items-center justify-between active:scale-[0.98] transition-transform"
            >
              <div className="text-left flex-1">
                <h3 className="font-bold text-slate-900">{p.client_name || 'Sem nome'}</h3>
                {p.address && <p className="text-sm text-slate-500 truncate">{p.address}</p>}
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-slate-400">{p.voltage}V</span>
                  <span className="text-xs text-slate-400">{p.circuit_count} circuito(s)</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {p.status === 'active' ? 'Ativo' : 'Concluído'}
                  </span>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-400" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
