import type { CalcInput, CalcResult } from './nbr5410';
import { verificarConformidade } from './nbr5410';

export interface ProjectCircuit {
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

export interface Project {
  id: string;
  client_name: string;
  client_phone: string;
  address: string;
  voltage: number;
  phases: number;
  notes: string;
  status: string;
  created_at: string;
  circuits: ProjectCircuit[];
}

export interface MaterialItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  unit_price: number;
}

// Gera lista de materiais a partir dos circuitos calculados
export function gerarListaMateriais(circuits: ProjectCircuit[]): MaterialItem[] {
  const materiais: MaterialItem[] = [];

  for (const c of circuits) {
    if (!c.results) continue;
    const r = c.results;

    // Condutor (fase + neutro + terra)
    const numFios = c.phases === 3 ? 4 : 3;
    const metragem = Math.ceil(c.distance_m * 1.1); // 10% de margem
    materiais.push({
      id: `cab-${c.id}`,
      name: `Cabo ${c.conductor_material} ${r.secao_cabo} mm² (${c.name})`,
      quantity: numFios * metragem,
      unit: 'm',
      unit_price: precoCondutor(r.secao_cabo, c.conductor_material),
    });

    // Disjuntor
    materiais.push({
      id: `dj-${c.id}`,
      name: `Disjuntor ${r.disjuntor} A (${c.name})`,
      quantity: 1,
      unit: 'un',
      unit_price: precoDisjuntor(r.disjuntor),
    });

    // Eletroduto
    materiais.push({
      id: `elt-${c.id}`,
      name: `Eletroduto corrugado ${r.eletroduto}" (${c.name})`,
      quantity: metragem,
      unit: 'm',
      unit_price: precoEletroduto(r.eletroduto),
    });

    // Pontos (tomadas / luminárias)
    if (c.circuit_type === 'iluminacao') {
      materiais.push({
        id: `lum-${c.id}`,
        name: `Luminária LED (${c.name})`,
        quantity: c.points_count,
        unit: 'un',
        unit_price: 25,
      });
    }
    if (c.circuit_type === 'tomadas' || c.circuit_type === 'tomadas_uso_especifico') {
      materiais.push({
        id: `tom-${c.id}`,
        name: `Tomada 2P+T (${c.name})`,
        quantity: c.points_count,
        unit: 'un',
        unit_price: 12,
      });
    }

    // Interruptores
    if (c.circuit_type === 'iluminacao') {
      materiais.push({
        id: `int-${c.id}`,
        name: `Interruptor simples (${c.name})`,
        quantity: Math.ceil(c.points_count / 2),
        unit: 'un',
        unit_price: 8,
      });
    }

    // Caixas de passagem
    materiais.push({
      id: `cx-${c.id}`,
      name: `Caixa de passagem 4x4 (${c.name})`,
      quantity: Math.max(1, Math.ceil(c.distance_m / 8)),
      unit: 'un',
      unit_price: 6,
    });
  }

  return materiais;
}

function precoCondutor(secao: number, material: string): number {
  const base: Record<number, number> = {
    1.5: 2.5,
    2.5: 3.8,
    4: 5.5,
    6: 7.5,
    10: 12,
    16: 18,
    25: 28,
    35: 38,
    50: 52,
    70: 72,
    95: 98,
    120: 125,
  };
  const preco = base[secao] ?? 15;
  return material === 'aluminio' ? preco * 0.8 : preco;
}

function precoDisjuntor(corrente: number): number {
  if (corrente <= 16) return 18;
  if (corrente <= 25) return 25;
  if (corrente <= 40) return 35;
  if (corrente <= 63) return 55;
  return 85;
}

function precoEletroduto(diametro: string): number {
  const precos: Record<string, number> = {
    '1/2': 4,
    '3/4': 5.5,
    '1': 8,
    '1-1/4': 12,
    '1-1/2': 16,
    '2': 24,
    '2-1/2': 32,
    '3': 42,
  };
  return precos[diametro] ?? 8;
}

export function calcularOrcamento(materiais: MaterialItem[]): { total: number; itens: number } {
  const total = materiais.reduce((sum, m) => sum + m.quantity * m.unit_price, 0);
  return { total: parseFloat(total.toFixed(2)), itens: materiais.length };
}

// Gera texto do orçamento para WhatsApp
export function gerarTextoOrcamento(project: Project, materiais: MaterialItem[]): string {
  const { total } = calcularOrcamento(materiais);
  let texto = `*ORÇAMENTO ELÉTRICO*\n\n`;
  texto += `*Cliente:* ${project.client_name}\n`;
  if (project.client_phone) texto += `*Telefone:* ${project.client_phone}\n`;
  if (project.address) texto += `*Endereço:* ${project.address}\n`;
  texto += `\n*MATERIAIS:*\n`;
  for (const m of materiais) {
    texto += `• ${m.name}: ${m.quantity} ${m.unit} x R$ ${m.unit_price.toFixed(2)} = R$ ${(m.quantity * m.unit_price).toFixed(2)}\n`;
  }
  texto += `\n*TOTAL: R$ ${total.toFixed(2)}*\n`;
  texto += `\nOrçamento gerado por Eletricista IA`;
  return encodeURIComponent(texto);
}

// Gera texto da memória de cálculo para WhatsApp
export function gerarTextoMemoria(project: Project): string {
  let texto = `*MEMÓRIA DE CÁLCULO*\n\n`;
  texto += `*Projeto:* ${project.client_name}\n`;
  if (project.address) texto += `*Endereço:* ${project.address}\n`;
  texto += `*Tensão:* ${project.voltage}V | *Fases:* ${project.phases === 3 ? 'Trifásico' : project.phases === 2 ? 'Bifásico' : 'Monofásico'}\n`;
  texto += `\n*CIRCUITOS:*\n`;

  for (const c of project.circuits) {
    if (!c.results) continue;
    const r = c.results;
    const conf = verificarConformidade(r);
    texto += `\n*${c.name}* (${c.environment})\n`;
    texto += `  Potência: ${c.power_w} W\n`;
    texto += `  Corrente: ${r.corrente} A\n`;
    texto += `  Condutor: ${r.secao_cabo} mm²\n`;
    texto += `  Disjuntor: ${r.disjuntor} A\n`;
    texto += `  Queda de tensão: ${r.queda_tensao}% (limite ${r.queda_tensao_max}%)\n`;
    texto += `  Eletroduto: ${r.eletroduto}" (ocupação ${r.taxa_ocupacao}%)\n`;
    texto += `  Status: ${conf.status === 'aprovado' ? 'APROVADO' : conf.status === 'alerta' ? 'ATENÇÃO' : 'REPROVADO'}\n`;
  }

  texto += `\nMemória gerada por Eletricista IA`;
  return encodeURIComponent(texto);
}

export function enviarWhatsApp(texto: string, telefone?: string): void {
  const numero = telefone ? telefone.replace(/\D/g, '') : '';
  const url = `https://wa.me/${numero ? '55' + numero : ''}?text=${texto}`;
  window.open(url, '_blank');
}
