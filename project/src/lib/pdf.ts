// Geração de PDF — Memória de cálculo
// Usa janela de impressão do navegador para gerar PDF

import type { Project } from './project-utils';
import { verificarConformidade } from './nbr5410';

export function gerarPDFMemoria(project: Project): void {
  const win = window.open('', '_blank');
  if (!win) return;

  let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Memória de Cálculo — ${project.client_name}</title>`;
  html += `<style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1a1a1a; }
    h1 { font-size: 24px; color: #0f172a; margin-bottom: 8px; }
    h2 { font-size: 18px; color: #1e40af; margin: 24px 0 12px; border-bottom: 2px solid #1e40af; padding-bottom: 4px; }
    h3 { font-size: 14px; color: #334155; margin: 16px 0 8px; }
    .header { text-align: center; margin-bottom: 32px; }
    .header h1 { font-size: 28px; }
    .header p { color: #64748b; font-size: 14px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 24px; }
    .info-item { padding: 8px 12px; background: #f1f5f9; border-radius: 6px; font-size: 13px; }
    .info-item strong { color: #0f172a; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    th { background: #1e40af; color: white; padding: 10px; text-align: left; font-size: 12px; }
    td { padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; }
    tr:nth-child(even) { background: #f8fafc; }
    .status-aprovado { color: #16a34a; font-weight: bold; }
    .status-alerta { color: #d97706; font-weight: bold; }
    .status-reprovado { color: #dc2626; font-weight: bold; }
    .justificativa { background: #f8fafc; padding: 12px; margin: 8px 0; border-left: 3px solid #1e40af; font-size: 12px; }
    .referencia { color: #64748b; font-size: 11px; font-style: italic; }
    .alerta { background: #fef3c7; padding: 8px 12px; border-left: 3px solid #d97706; font-size: 12px; margin: 4px 0; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 11px; }
    @media print { body { padding: 20px; } }
  </style></head><body>`;

  html += `<div class="header"><h1>Memória de Cálculo</h1><p>Projeto elétrico — NBR 5410</p></div>`;

  html += `<h2>Dados do Projeto</h2>`;
  html += `<div class="info-grid">`;
  html += `<div class="info-item"><strong>Cliente:</strong> ${project.client_name || '—'}</div>`;
  html += `<div class="info-item"><strong>Telefone:</strong> ${project.client_phone || '—'}</div>`;
  html += `<div class="info-item"><strong>Endereço:</strong> ${project.address || '—'}</div>`;
  html += `<div class="info-item"><strong>Tensão:</strong> ${project.voltage} V</div>`;
  html += `<div class="info-item"><strong>Sistema:</strong> ${project.phases === 3 ? 'Trifásico' : project.phases === 2 ? 'Bifásico' : 'Monofásico'}</div>`;
  html += `<div class="info-item"><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</div>`;
  html += `</div>`;

  if (project.notes) {
    html += `<h3>Observações</h3><p style="font-size:13px;color:#475569">${project.notes}</p>`;
  }

  html += `<h2>Circuitos</h2>`;

  for (const c of project.circuits) {
    if (!c.results) continue;
    const r = c.results;
    const conf = verificarConformidade(r);
    const statusClass = `status-${conf.status}`;

    html += `<h3>${c.name} — ${c.environment || 'Ambiente'}</h3>`;
    html += `<table><tr><th>Parâmetro</th><th>Valor</th></tr>`;
    html += `<tr><td>Tipo de circuito</td><td>${c.circuit_type}</td></tr>`;
    html += `<tr><td>Tipo de carga</td><td>${c.load_type}</td></tr>`;
    html += `<tr><td>Potência</td><td>${c.power_w} W</td></tr>`;
    html += `<tr><td>Tensão</td><td>${c.voltage} V</td></tr>`;
    html += `<tr><td>Fases</td><td>${c.phases === 3 ? 'Trifásico' : c.phases === 2 ? 'Bifásico' : 'Monofásico'}</td></tr>`;
    html += `<tr><td>Distância</td><td>${c.distance_m} m</td></tr>`;
    html += `<tr><td>Material do condutor</td><td>${c.conductor_material}</td></tr>`;
    html += `<tr><td>Método de instalação</td><td>${c.installation_method}</td></tr>`;
    html += `<tr><td>Pontos</td><td>${c.points_count}</td></tr>`;
    html += `<tr><td><strong>Corrente</strong></td><td><strong>${r.corrente} A</strong></td></tr>`;
    html += `<tr><td><strong>Seção do condutor</strong></td><td><strong>${r.secao_cabo} mm²</strong></td></tr>`;
    html += `<tr><td><strong>Disjuntor</strong></td><td><strong>${r.disjuntor} A</strong></td></tr>`;
    html += `<tr><td>Queda de tensão</td><td>${r.queda_tensao}% / ${r.queda_tensao_max}% máx.</td></tr>`;
    html += `<tr><td>Eletroduto</td><td>${r.eletroduto}" (ocupação ${r.taxa_ocupacao}%)</td></tr>`;
    html += `<tr><td>Fator de potência</td><td>${r.fator_potencia}</td></tr>`;
    html += `<tr><td>Potência aparente</td><td>${r.potencia_aparente} VA</td></tr>`;
    html += `<tr><td><strong>Status</strong></td><td class="${statusClass}">${conf.status === 'aprovado' ? 'APROVADO' : conf.status === 'alerta' ? 'ATENÇÃO' : 'REPROVADO'}</td></tr>`;
    html += `</table>`;

    html += `<h3>Justificativa técnica</h3>`;
    for (const j of r.justificativas) {
      html += `<div class="justificativa">${j}</div>`;
    }

    if (r.alertas.length > 0) {
      html += `<h3>Alertas</h3>`;
      for (const a of r.alertas) {
        html += `<div class="alerta">${a}</div>`;
      }
    }

    html += `<h3>Referências</h3>`;
    for (const ref of r.referencias) {
      html += `<div class="referencia">${ref}</div>`;
    }
  }

  html += `<div class="footer">Documento gerado por Eletricista IA — ${new Date().toLocaleDateString('pt-BR')} | Baseado na NBR 5410</div>`;
  html += `</body></html>`;

  win.document.write(html);
  win.document.close();
  setTimeout(() => win.print(), 500);
}
