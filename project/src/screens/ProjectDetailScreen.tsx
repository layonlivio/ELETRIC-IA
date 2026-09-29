import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Zap, FileText, Package, DollarSign, Save, Calculator } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { calcular, type CalcInput, type CalcResult, TIPOS_CIRCUITO } from '@/lib/nbr5410';
import { verificarConformidade } from '@/lib/nbr5410';
import { gerarListaMateriais, calcularOrcamento, gerarTextoOrcamento, gerarTextoMemoria, enviarWhatsApp, type MaterialItem } from '@/lib/project-utils';
import { gerarPDFMemoria } from '@/lib/pdf';
import { canAddCircuit, PLAN_FEATURES } from '@/lib/plans';
import ResultCard from '@/components/ResultCard';
import Modal from '@/components/Modal';

interface ProjectDetailScreenProps {
  projectId: string;
  onBack: () => void;
}

interface CircuitRow {
  id: string;
  name: string;
  environment: string;
  circuit_type: string;
  load_type: string;
  power_w: number;
  voltage: number;
  phases: number;
  distance_m: number;
  conductor_material: string;
  installation_method: string;
  points_count: number;
  results: CalcResult | null;
}

interface ProjectData {
  id: string;
  client_name: string;
  client_phone: string;
  address: string;
  voltage: number;
  phases: number;
  notes: string;
  status: string;
}

type TabType = 'circuits' | 'materials' | 'budget';

export default function ProjectDetailScreen({ projectId, onBack }: ProjectDetailScreenProps) {
  const { profile, user } = useAuth();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [circuits, setCircuits] = useState<CircuitRow[]>([]);
  const [tab, setTab] = useState<TabType>('circuits');
  const [loading, setLoading] = useState(true);
  const [showAddCircuit, setShowAddCircuit] = useState(false);
  const [showEditProject, setShowEditProject] = useState(false);
  const [materiais, setMateriais] = useState<MaterialItem[]>([]);

  const plan = (profile?.plan as 'normal' | 'pro') || 'normal';

  useEffect(() => {
    loadProject();
    loadCircuits();
  }, [projectId]);

  useEffect(() => {
    if (circuits.length > 0) {
      setMateriais(gerarListaMateriais(circuits));
    } else {
      setMateriais([]);
    }
  }, [circuits]);

  async function loadProject() {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .maybeSingle();
    if (data) setProject(data as ProjectData);
  }

  async function loadCircuits() {
    setLoading(true);
    const { data } = await supabase
      .from('circuits')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });
    if (data) {
      setCircuits(data.map((c: any) => ({
        ...c,
        results: c.results as CalcResult | null,
      })) as CircuitRow[]);
    }
    setLoading(false);
  }

  async function deleteCircuit(id: string) {
    await supabase.from('circuits').delete().eq('id', id);
    loadCircuits();
  }

  async function saveProjectEdits(data: Partial<ProjectData>) {
    await supabase.from('projects').update(data).eq('id', projectId);
    setProject({ ...project!, ...data });
    setShowEditProject(false);
  }

  const orcamento = calcularOrcamento(materiais);
  const canAdd = canAddCircuit(plan, circuits.length);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex items-center gap-3 px-4 py-4 bg-white border-b border-slate-200 sticky top-0 z-10">
        <button onClick={onBack} className="p-2 -ml-2 rounded-lg hover:bg-slate-100">
          <ArrowLeft size={22} className="text-slate-700" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-slate-900 truncate">{project?.client_name || 'Projeto'}</h1>
          <p className="text-xs text-slate-500 truncate">{project?.address || 'Sem endereço'}</p>
        </div>
        <button onClick={() => setShowEditProject(true)} className="p-2 rounded-lg hover:bg-slate-100">
          <FileText size={20} className="text-slate-600" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-4 py-3 bg-white border-b border-slate-200 sticky top-[57px] z-10">
        {[
          { id: 'circuits' as const, label: 'Circuitos', icon: Zap },
          { id: 'materials' as const, label: 'Materiais', icon: Package },
          { id: 'budget' as const, label: 'Orçamento', icon: DollarSign },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.id ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <Icon size={16} />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="px-4 py-4 pb-24">
        {tab === 'circuits' && (
          <div className="space-y-4">
            {loading ? (
              <p className="text-center text-slate-400 py-8">Carregando...</p>
            ) : circuits.length === 0 ? (
              <div className="text-center py-12">
                <Zap size={40} className="text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">Nenhum circuito</p>
                <p className="text-sm text-slate-400 mt-1">Adicione circuitos ao projeto</p>
              </div>
            ) : (
              circuits.map((c) => {
                const conf = c.results ? verificarConformidade(c.results) : null;
                return (
                  <div key={c.id} className="card">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-slate-900">{c.name}</h3>
                        <p className="text-xs text-slate-500">{c.environment || 'Ambiente'} • {c.power_w}W • {c.voltage}V</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {conf && (
                          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${conf.status === 'aprovado' ? 'bg-green-100 text-green-700' : conf.status === 'alerta' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                            {conf.status === 'aprovado' ? 'OK' : conf.status === 'alerta' ? 'Atenção' : 'Reprovado'}
                          </span>
                        )}
                        <button onClick={() => deleteCircuit(c.id)} className="p-1.5 rounded-lg hover:bg-red-50">
                          <Trash2 size={16} className="text-red-500" />
                        </button>
                      </div>
                    </div>
                    {c.results && <ResultCard result={c.results} compact />}
                  </div>
                );
              })
            )}

            {canAdd ? (
              <button onClick={() => setShowAddCircuit(true)} className="btn-primary w-full">
                <Plus size={18} /> Adicionar circuito
              </button>
            ) : (
              <div className="card bg-amber-50 border-amber-200">
                <p className="text-sm text-amber-800">Limite de circuitos do plano {plan.toUpperCase()} atingido.</p>
              </div>
            )}

            {circuits.length > 0 && (
              <button onClick={() => gerarPDFMemoria({ ...project!, circuits } as any)} className="btn-secondary w-full">
                <FileText size={18} /> Gerar memória de cálculo (PDF)
              </button>
            )}
          </div>
        )}

        {tab === 'materials' && (
          <div className="space-y-3">
            {materiais.length === 0 ? (
              <p className="text-center text-slate-400 py-8">Adicione circuitos para gerar a lista de materiais</p>
            ) : (
              <>
                {materiais.map((m) => (
                  <div key={m.id} className="card flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{m.name}</p>
                      <p className="text-xs text-slate-500">{m.quantity} {m.unit} × R$ {m.unit_price.toFixed(2)}</p>
                    </div>
                    <p className="font-bold text-slate-900">R$ {(m.quantity * m.unit_price).toFixed(2)}</p>
                  </div>
                ))}
                <div className="card bg-slate-900 border-0">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">Total de itens</span>
                    <span className="text-white font-bold text-xl">{materiais.length}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {tab === 'budget' && (
          <div className="space-y-4">
            {materiais.length === 0 ? (
              <p className="text-center text-slate-400 py-8">Adicione circuitos para gerar o orçamento</p>
            ) : (
              <>
                <div className="card bg-gradient-to-br from-green-600 to-green-700 border-0">
                  <p className="text-green-100 text-sm">Total do orçamento</p>
                  <p className="text-white text-3xl font-bold mt-1">R$ {orcamento.total.toFixed(2)}</p>
                  <p className="text-green-100 text-sm mt-1">{orcamento.itens} itens</p>
                </div>

                {PLAN_FEATURES[plan].whatsapp_enabled ? (
                  <>
                    <button
                      onClick={() => enviarWhatsApp(gerarTextoOrcamento({ ...project!, circuits } as any, materiais), project?.client_phone)}
                      className="btn-success w-full"
                    >
                      <DollarSign size={18} /> Enviar orçamento (WhatsApp)
                    </button>
                    <button
                      onClick={() => enviarWhatsApp(gerarTextoMemoria({ ...project!, circuits } as any), project?.client_phone)}
                      className="btn-secondary w-full"
                    >
                      <FileText size={18} /> Enviar memória de cálculo (WhatsApp)
                    </button>
                  </>
                ) : (
                  <div className="card bg-amber-50 border-amber-200">
                    <p className="text-sm text-amber-800">O envio por WhatsApp está disponível no plano PRO.</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Add Circuit Modal */}
      <AddCircuitModal
        open={showAddCircuit}
        onClose={() => setShowAddCircuit(false)}
        projectId={projectId}
        defaultVoltage={project?.voltage || 220}
        defaultPhases={project?.phases || 1}
        onSaved={() => { setShowAddCircuit(false); loadCircuits(); }}
      />

      {/* Edit Project Modal */}
      {project && (
        <EditProjectModal
          open={showEditProject}
          onClose={() => setShowEditProject(false)}
          project={project}
          onSave={saveProjectEdits}
        />
      )}
    </div>
  );
}

function AddCircuitModal({ open, onClose, projectId, defaultVoltage, defaultPhases, onSaved }: {
  open: boolean;
  onClose: () => void;
  projectId: string;
  defaultVoltage: number;
  defaultPhases: number;
  onSaved: () => void;
}) {
  const [name, setName] = useState('');
  const [environment, setEnvironment] = useState('');
  const [circuitType, setCircuitType] = useState('tomadas');
  const [power, setPower] = useState(1000);
  const [voltage, setVoltage] = useState(defaultVoltage);
  const [phases, setPhases] = useState(defaultPhases);
  const [distance, setDistance] = useState(10);
  const [points, setPoints] = useState(1);
  const [conductor, setConductor] = useState('cobre');
  const [result, setResult] = useState<CalcResult | null>(null);

  const loadTypes: Record<string, string> = {
    iluminacao: 'iluminacao',
    tomadas: 'geral',
    tomadas_uso_especifico: 'resistiva',
    chuveiro: 'resistiva',
    ar_condicionado: 'ar_condicionado',
    motor: 'motor_trifasico',
  };

  function handleCalc() {
    const input: CalcInput = {
      power_w: power,
      voltage,
      phases,
      distance_m: distance,
      conductor_material: conductor as 'cobre' | 'aluminio',
      insulation: 'pvc',
      installation_method: 'eletroduto',
      circuit_type: circuitType,
      load_type: loadTypes[circuitType] || 'geral',
      points_count: points,
      grouping_count: 1,
      supply_type: 'direta',
    };
    setResult(calcular(input));
  }

  async function handleSave() {
    if (!result) return;
    await supabase.from('circuits').insert({
      project_id: projectId,
      name: name || `Circuito ${circuitType}`,
      environment,
      circuit_type: circuitType,
      load_type: loadTypes[circuitType] || 'geral',
      power_w: power,
      voltage,
      phases,
      distance_m: distance,
      conductor_material: conductor,
      installation_method: 'eletroduto',
      points_count: points,
      results: result,
    });
    setName('');
    setEnvironment('');
    setResult(null);
    onSaved();
  }

  return (
    <Modal open={open} onClose={onClose} title="Adicionar circuito">
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-slate-600 mb-1 block">Nome do circuito</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="Ex: Iluminação sala" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-600 mb-1 block">Ambiente</label>
          <input value={environment} onChange={(e) => setEnvironment(e.target.value)} className="input-field" placeholder="Ex: Sala de estar" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-600 mb-1 block">Tipo de circuito</label>
          <select value={circuitType} onChange={(e) => setCircuitType(e.target.value)} className="input-field">
            {Object.entries(TIPOS_CIRCUITO).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-slate-600 mb-1 block">Potência (W)</label>
            <input type="number" value={power} onChange={(e) => setPower(Number(e.target.value))} className="input-field" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600 mb-1 block">Distância (m)</label>
            <input type="number" value={distance} onChange={(e) => setDistance(Number(e.target.value))} className="input-field" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600 mb-1 block">Tensão (V)</label>
            <select value={voltage} onChange={(e) => setVoltage(Number(e.target.value))} className="input-field">
              <option value={127}>127V</option>
              <option value={220}>220V</option>
              <option value={380}>380V</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600 mb-1 block">Sistema</label>
            <select value={phases} onChange={(e) => setPhases(Number(e.target.value))} className="input-field">
              <option value={1}>Monofásico</option>
              <option value={2}>Bifásico</option>
              <option value={3}>Trifásico</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600 mb-1 block">Pontos</label>
            <input type="number" value={points} onChange={(e) => setPoints(Number(e.target.value))} className="input-field" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600 mb-1 block">Condutor</label>
            <select value={conductor} onChange={(e) => setConductor(e.target.value)} className="input-field">
              <option value="cobre">Cobre</option>
              <option value="aluminio">Alumínio</option>
            </select>
          </div>
        </div>

        {!result ? (
          <button onClick={handleCalc} className="btn-primary w-full">
            <Calculator size={18} /> Calcular
          </button>
        ) : (
          <>
            <ResultCard result={result} compact />
            <button onClick={handleSave} className="btn-success w-full">
              <Save size={18} /> Salvar circuito
            </button>
          </>
        )}
      </div>
    </Modal>
  );
}

function EditProjectModal({ open, onClose, project, onSave }: {
  open: boolean;
  onClose: () => void;
  project: ProjectData;
  onSave: (data: Partial<ProjectData>) => void;
}) {
  const [clientName, setClientName] = useState(project.client_name);
  const [clientPhone, setClientPhone] = useState(project.client_phone);
  const [address, setAddress] = useState(project.address);
  const [voltage, setVoltage] = useState(project.voltage);
  const [phases, setPhases] = useState(project.phases);
  const [notes, setNotes] = useState(project.notes);

  return (
    <Modal open={open} onClose={onClose} title="Editar projeto">
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-slate-600 mb-1 block">Cliente</label>
          <input value={clientName} onChange={(e) => setClientName(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-600 mb-1 block">Telefone</label>
          <input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} className="input-field" placeholder="(00) 00000-0000" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-600 mb-1 block">Endereço</label>
          <input value={address} onChange={(e) => setAddress(e.target.value)} className="input-field" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-slate-600 mb-1 block">Tensão (V)</label>
            <select value={voltage} onChange={(e) => setVoltage(Number(e.target.value))} className="input-field">
              <option value={127}>127V</option>
              <option value={220}>220V</option>
              <option value={380}>380V</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600 mb-1 block">Sistema</label>
            <select value={phases} onChange={(e) => setPhases(Number(e.target.value))} className="input-field">
              <option value={1}>Monofásico</option>
              <option value={2}>Bifásico</option>
              <option value={3}>Trifásico</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-600 mb-1 block">Observações</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input-field min-h-[80px]" />
        </div>
        <button onClick={() => onSave({ client_name: clientName, client_phone: clientPhone, address, voltage, phases, notes })} className="btn-primary w-full">
          <Save size={18} /> Salvar
        </button>
      </div>
    </Modal>
  );
}
