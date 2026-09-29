import { useState } from 'react';
import { ArrowLeft, ArrowRight, Zap, Lightbulb, Plug, Droplets, AirVent, WashingMachine, Cpu, Flame } from 'lucide-react';
import { calcular, type CalcInput, type CalcResult, TIPOS_CIRCUITO } from '@/lib/nbr5410';
import ResultCard from '@/components/ResultCard';

interface QuickCalcScreenProps {
  onBack: () => void;
  onSaveToProject?: (result: CalcResult, input: CalcInput) => void;
}

const circuitTypes = [
  { id: 'iluminacao', label: 'Iluminação', icon: Lightbulb },
  { id: 'tomadas', label: 'Tomadas (TUG)', icon: Plug },
  { id: 'tomadas_uso_especifico', label: 'TUE', icon: Cpu },
  { id: 'chuveiro', label: 'Chuveiro', icon: Droplets },
  { id: 'ar_condicionado', label: 'Ar Condicionado', icon: AirVent },
  { id: 'lavadora', label: 'Lavadora', icon: WashingMachine },
  { id: 'cooking', label: 'Cooktop', icon: Flame },
  { id: 'motor', label: 'Motor', icon: Zap },
];

const loadTypes: Record<string, string> = {
  iluminacao: 'iluminacao',
  tomadas: 'geral',
  tomadas_uso_especifico: 'resistiva',
  chuveiro: 'resistiva',
  ar_condicionado: 'ar_condicionado',
  lavadora: 'motor_monofasico',
  cooking: 'resistiva',
  motor: 'motor_trifasico',
};

const powerPresets: Record<string, number> = {
  iluminacao: 300,
  tomadas: 1000,
  tomadas_uso_especifico: 1500,
  chuveiro: 5500,
  ar_condicionado: 2500,
  lavadora: 1500,
  cooking: 3000,
  motor: 2000,
};

export default function QuickCalcScreen({ onBack, onSaveToProject }: QuickCalcScreenProps) {
  const [step, setStep] = useState(0);
  const [circuitType, setCircuitType] = useState('tomadas');
  const [power, setPower] = useState(1000);
  const [voltage, setVoltage] = useState(220);
  const [phases, setPhases] = useState(1);
  const [distance, setDistance] = useState(10);
  const [conductor, setConductor] = useState<'cobre' | 'aluminio'>('cobre');
  const [result, setResult] = useState<CalcResult | null>(null);

  const input: CalcInput = {
    power_w: power,
    voltage,
    phases,
    distance_m: distance,
    conductor_material: conductor,
    insulation: 'pvc',
    installation_method: 'eletroduto',
    circuit_type: circuitType,
    load_type: loadTypes[circuitType] || 'geral',
    points_count: circuitType === 'iluminacao' ? 1 : circuitType === 'tomadas' ? 1 : 1,
    grouping_count: 1,
    supply_type: 'direta',
  };

  function handleCalculate() {
    setResult(calcular(input));
    setStep(5);
  }

  function selectCircuitType(id: string) {
    setCircuitType(id);
    setPower(powerPresets[id] || 1000);
    if (id === 'motor') setPhases(3);
    if (id === 'chuveiro' || id === 'ar_condicionado') setPhases(1);
  }

  const steps = [
    // Step 0: Tipo de circuito
    {
      title: 'Tipo de circuito',
      content: (
        <div className="grid grid-cols-2 gap-3">
          {circuitTypes.map((c) => {
            const Icon = c.icon;
            return (
              <button
                key={c.id}
                onClick={() => { selectCircuitType(c.id); setStep(1); }}
                className={`card flex flex-col items-center gap-2 py-4 active:scale-95 transition-transform ${circuitType === c.id ? 'border-blue-500 ring-2 ring-blue-100' : ''}`}
              >
                <Icon size={28} className={circuitType === c.id ? 'text-blue-600' : 'text-slate-600'} />
                <span className="text-sm font-medium text-slate-700">{c.label}</span>
              </button>
            );
          })}
        </div>
      ),
    },
    // Step 1: Potência
    {
      title: 'Potência (W)',
      content: (
        <div className="space-y-4">
          <input
            type="number"
            value={power}
            onChange={(e) => setPower(Number(e.target.value))}
            className="input-field text-2xl font-bold text-center"
            placeholder="Potência em Watts"
          />
          <div className="flex flex-wrap gap-2">
            {[100, 300, 500, 1000, 1500, 2000, 2500, 4000, 5500, 8000].map((p) => (
              <button
                key={p}
                onClick={() => setPower(p)}
                className={`chip ${power === p ? 'chip-active' : 'chip-inactive'}`}
              >
                {p}W
              </button>
            ))}
          </div>
        </div>
      ),
    },
    // Step 2: Tensão e fases
    {
      title: 'Tensão e sistema',
      content: (
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-slate-600 mb-2">Tensão</p>
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
            <p className="text-sm font-medium text-slate-600 mb-2">Sistema</p>
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
        </div>
      ),
    },
    // Step 3: Distância
    {
      title: 'Distância (m)',
      content: (
        <div className="space-y-4">
          <input
            type="number"
            value={distance}
            onChange={(e) => setDistance(Number(e.target.value))}
            className="input-field text-2xl font-bold text-center"
            placeholder="Distância em metros"
          />
          <div className="flex flex-wrap gap-2">
            {[5, 10, 15, 20, 30, 50, 80, 100].map((d) => (
              <button
                key={d}
                onClick={() => setDistance(d)}
                className={`chip ${distance === d ? 'chip-active' : 'chip-inactive'}`}
              >
                {d}m
              </button>
            ))}
          </div>
        </div>
      ),
    },
    // Step 4: Material do condutor
    {
      title: 'Material do condutor',
      content: (
        <div className="space-y-4">
          <div className="flex gap-3">
            <button
              onClick={() => setConductor('cobre')}
              className={`card flex-1 flex items-center justify-center gap-2 py-4 ${conductor === 'cobre' ? 'border-blue-500 ring-2 ring-blue-100' : ''}`}
            >
              <span className="text-2xl">🟤</span>
              <span className="font-semibold text-slate-700">Cobre</span>
            </button>
            <button
              onClick={() => setConductor('aluminio')}
              className={`card flex-1 flex items-center justify-center gap-2 py-4 ${conductor === 'aluminio' ? 'border-blue-500 ring-2 ring-blue-100' : ''}`}
            >
              <span className="text-2xl">⚪</span>
              <span className="font-semibold text-slate-700">Alumínio</span>
            </button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex items-center gap-3 px-4 py-4 bg-white border-b border-slate-200 sticky top-0 z-10">
        <button onClick={onBack} className="p-2 -ml-2 rounded-lg hover:bg-slate-100">
          <ArrowLeft size={22} className="text-slate-700" />
        </button>
        <h1 className="text-lg font-bold text-slate-900">Cálculo rápido</h1>
      </div>

      {result ? (
        <div className="px-4 py-6 space-y-4">
          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={18} className="text-amber-500" />
              <h3 className="font-bold text-slate-900">{TIPOS_CIRCUITO[circuitType as keyof typeof TIPOS_CIRCUITO] || circuitType}</h3>
            </div>
            <div className="text-sm text-slate-600 space-y-1 mb-4">
              <p>Potência: {power}W | Tensão: {voltage}V | {phases === 3 ? 'Trifásico' : phases === 2 ? 'Bifásico' : 'Monofásico'}</p>
              <p>Distância: {distance}m | Condutor: {conductor}</p>
            </div>
          </div>
          <ResultCard result={result} />
          <div className="flex gap-3">
            <button onClick={() => { setResult(null); setStep(0); }} className="btn-secondary flex-1">
              Novo cálculo
            </button>
            {onSaveToProject && (
              <button onClick={() => onSaveToProject(result, input)} className="btn-primary flex-1">
                Salvar em projeto
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="px-4 py-6">
          {/* Progress bar */}
          <div className="flex gap-1.5 mb-6">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-blue-600' : 'bg-slate-200'}`}
              />
            ))}
          </div>

          <div className="mb-4">
            <p className="text-sm text-slate-500 mb-1">Passo {step + 1} de {steps.length + 1}</p>
            <h2 className="text-xl font-bold text-slate-900">{steps[step].title}</h2>
          </div>

          <div className="mb-6 animate-fade-in">{steps[step].content}</div>

          <div className="flex gap-3">
            {step > 0 && (
              <button onClick={() => setStep(step - 1)} className="btn-secondary flex-1">
                <ArrowLeft size={18} /> Voltar
              </button>
            )}
            {step < steps.length - 1 ? (
              <button onClick={() => setStep(step + 1)} className="btn-primary flex-1">
                Avançar <ArrowRight size={18} />
              </button>
            ) : (
              <button onClick={handleCalculate} className="btn-success flex-1">
                <Zap size={18} /> Calcular
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
