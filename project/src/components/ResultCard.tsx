import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import type { CalcResult } from '@/lib/nbr5410';
import { verificarConformidade } from '@/lib/nbr5410';

interface ResultCardProps {
  result: CalcResult;
  compact?: boolean;
}

export default function ResultCard({ result, compact }: ResultCardProps) {
  const conf = verificarConformidade(result);

  const statusConfig = {
    aprovado: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', label: 'APROVADO' },
    alerta: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', label: 'ATENÇÃO' },
    reprovado: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', label: 'REPROVADO' },
  };
  const cfg = statusConfig[conf.status];
  const StatusIcon = cfg.icon;

  return (
    <div className="space-y-3">
      <div className={`flex items-center gap-2 p-3 rounded-xl border ${cfg.bg} ${cfg.border}`}>
        <StatusIcon size={24} className={cfg.color} />
        <span className={`font-bold text-sm ${cfg.color}`}>{cfg.label}</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="card p-3">
          <p className="text-xs text-slate-500 mb-1">Corrente</p>
          <p className="text-xl font-bold text-slate-900">{result.corrente} <span className="text-sm font-normal text-slate-500">A</span></p>
        </div>
        <div className="card p-3">
          <p className="text-xs text-slate-500 mb-1">Condutor</p>
          <p className="text-xl font-bold text-slate-900">{result.secao_cabo} <span className="text-sm font-normal text-slate-500">mm²</span></p>
        </div>
        <div className="card p-3">
          <p className="text-xs text-slate-500 mb-1">Disjuntor</p>
          <p className="text-xl font-bold text-slate-900">{result.disjuntor} <span className="text-sm font-normal text-slate-500">A</span></p>
        </div>
        <div className="card p-3">
          <p className="text-xs text-slate-500 mb-1">Queda de tensão</p>
          <p className={`text-xl font-bold ${result.queda_tensao_ok ? 'text-green-600' : 'text-red-600'}`}>
            {result.queda_tensao}<span className="text-sm font-normal text-slate-500">%</span>
          </p>
        </div>
        <div className="card p-3">
          <p className="text-xs text-slate-500 mb-1">Eletroduto</p>
          <p className="text-xl font-bold text-slate-900">{result.eletroduto}"</p>
        </div>
        <div className="card p-3">
          <p className="text-xs text-slate-500 mb-1">Ocupação</p>
          <p className={`text-xl font-bold ${result.taxa_ocupacao_ok ? 'text-green-600' : 'text-amber-600'}`}>
            {result.taxa_ocupacao}<span className="text-sm font-normal text-slate-500">%</span>
          </p>
        </div>
      </div>

      {!compact && (
        <>
          {result.alertas.length > 0 && (
            <div className="space-y-2">
              {result.alertas.map((a, i) => (
                <div key={i} className="flex gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800">{a}</p>
                </div>
              ))}
            </div>
          )}

          <div className="card">
            <h4 className="text-sm font-bold text-slate-900 mb-2">Justificativa técnica</h4>
            <div className="space-y-1.5">
              {result.justificativas.map((j, i) => (
                <p key={i} className="text-xs text-slate-600 leading-relaxed">{j}</p>
              ))}
            </div>
          </div>

          <div className="card">
            <h4 className="text-sm font-bold text-slate-900 mb-2">Referências</h4>
            <div className="space-y-1">
              {result.referencias.map((r, i) => (
                <p key={i} className="text-xs text-slate-500 italic">{r}</p>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
