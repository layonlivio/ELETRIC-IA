// NBR 5410 — Dimensionamento de circuitos elétricos
// Tabelas e regras baseadas na NBR 5410:2005/2022 e NBR 13571 (capacidade de condução)
// Esta camada é separada da interface e pode ser atualizada independentemente.

// ============================================================
// TABELAS NBR 5410
// ============================================================

// Capacidade de condução de corrente (Amp) — NBR 13571 / NBR 5410
// Condutores cobre, PVC (70°C) e EPR/XLPE (90°C)
// Método de instalação B1 (eletroduto de seção circular em parede)
interface ConductorEntry {
  secao: number; // mm²
  pvc: number; // A — isolamento PVC 70°C
  epr: number; // A — isolamento EPR/XLPE 90°C
}

export const TABELA_CAPACIDADE_CONDUCAO: ConductorEntry[] = [
  { secao: 0.5, pvc: 9, epr: 11 },
  { secao: 0.75, pvc: 11, epr: 14 },
  { secao: 1.0, pvc: 13.5, epr: 17 },
  { secao: 1.5, pvc: 17.5, epr: 19.5 },
  { secao: 2.5, pvc: 24, epr: 27 },
  { secao: 4, pvc: 32, epr: 36 },
  { secao: 6, pvc: 41, epr: 46 },
  { secao: 10, pvc: 57, epr: 63 },
  { secao: 16, pvc: 76, epr: 85 },
  { secao: 25, pvc: 101, epr: 112 },
  { secao: 35, pvc: 125, epr: 138 },
  { secao: 50, pvc: 151, epr: 168 },
  { secao: 70, pvc: 192, epr: 213 },
  { secao: 95, pvc: 232, epr: 258 },
  { secao: 120, pvc: 269, epr: 299 },
  { secao: 150, pvc: 308, epr: 344 },
  { secao: 185, pvc: 354, epr: 392 },
  { secao: 240, pvc: 415, epr: 461 },
  { secao: 300, pvc: 473, epr: 530 },
];

// Disjuntor padrão — correntes nominais disponíveis no mercado
export const DISJUNTORES_PADRAO = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400];

// Queda de tensão máxima permitida — NBR 5410
// Instalações alimentadas diretamente pelo ramal de ligação: 7%
// Instalações alimentadas por transformador próprio: 5%
// Circuitos terminais: 4% (ligação direta) / 7% total
// Circuitos de iluminação: 4% (ramal) / 7% total
export const QUEDA_TENSAO_MAXIMA = {
  circuito_terminal_direta: 4, // %
  circuito_terminal_transformador: 5, // %
  instalacao_direta_total: 7, // %
  instalacao_transformador_total: 5, // %
};

// Fator de correção por agrupamento (NBR 5410, método B1)
// Número de circuitos agrupados
export const FATOR_AGRUPAMENTO: Record<number, number> = {
  1: 1.0,
  2: 0.80,
  3: 0.70,
  4: 0.65,
  5: 0.60,
  6: 0.57,
  7: 0.54,
  8: 0.52,
  9: 0.50,
  10: 0.48,
  12: 0.43,
  14: 0.41,
  16: 0.38,
  20: 0.34,
};

// Resistividade dos condutores (ohm·km) — cobre e alumínio
export const RESISTIVIDADE = {
  cobre: 22.5, // ohm·mm²/km a 70°C
  aluminio: 35.7, // ohm·mm²/km a 70°C
};

// Reatância indutiva aproximada (ohm/km) para condutores em eletroduto
export const REATANCIA = 0.082; // ohm/km

// Diâmetro externo aproximado de condutores (mm) — para cálculo de ocupação de eletroduto
export const DIAMETRO_CONDUTOR: Record<number, number> = {
  0.5: 1.8,
  0.75: 2.0,
  1.0: 2.2,
  1.5: 2.6,
  2.5: 3.1,
  4: 3.7,
  6: 4.3,
  10: 5.3,
  16: 6.1,
  25: 7.3,
  35: 8.3,
  50: 9.9,
  70: 11.3,
  95: 12.8,
  120: 14.1,
  150: 15.6,
  185: 17.3,
  240: 19.6,
};

// Diâmetro interno de eletrodutos (mm)
export const DIAMETRO_ELETRODUTO: Record<string, number> = {
  '1/2': 16,
  '3/4': 21,
  '1': 27,
  '1-1/4': 35,
  '1-1/2': 41,
  '2': 53,
  '2-1/2': 66,
  '3': 78,
};

// Taxa máxima de ocupação de eletroduto — NBR 5410
// 1 condutor: 53%
// 2 condutores: 31%
// 3 ou mais: 40%
export const TAXA_OCUPACAO_MAX = {
  1: 0.53,
  2: 0.31,
  3: 0.40,
};

// Tipos de carga e seus fatores de potência típicos
export const FATORES_POTENCIA: Record<string, number> = {
  resistiva: 1.0, // aquecedor, chuveiro
  iluminacao: 0.92, // lâmpadas LED
  motor_monofasico: 0.80,
  motor_trifasico: 0.85,
  ar_condicionado: 0.85,
  computador: 0.65,
  bomba: 0.80,
  geral: 0.80,
};

// Tipos de circuito
export const TIPOS_CIRCUITO = {
  iluminacao: 'Iluminação',
  tomadas: 'Tomadas (TUG)',
  tomadas_uso_especifico: 'Tomadas (TUE)',
  chuveiro: 'Chuveiro / Aquecedor',
  ar_condicionado: 'Ar Condicionado',
  motor: 'Motor',
  cocina: 'Cooktop / Forno',
  lavadora: 'Lavadora / Secadora',
  geral: 'Geral',
};

// Métodos de instalação — NBR 5410
export const METODOS_INSTALACAO: Record<string, string> = {
  eletroduto: 'Eletroduto em parede (B1)',
  embutido: 'Embutido diretamente na parede (A1)',
  moldura: 'Na moldura (A2)',
  parede: 'Aparente fixado na parede (C)',
  bandeja: 'Sobre bandeja (E/F)',
  espaco: 'Em espaço de construção (B2)',
  ar: 'Ao ar livre (F)',
};

// ============================================================
// TIPOS
// ============================================================

export interface CalcInput {
  power_w: number;
  voltage: number;
  phases: number; // 1 = monofásico, 2 = bifásico, 3 = trifásico
  distance_m: number;
  conductor_material: 'cobre' | 'aluminio';
  insulation: 'pvc' | 'epr';
  installation_method: string;
  circuit_type: string;
  load_type: string;
  points_count: number;
  grouping_count: number; // número de circuitos agrupados
  supply_type: 'direta' | 'transformador'; // alimentação direta ou transformador
}

export interface CalcResult {
  corrente: number;
  corrente_projeto: number;
  secao_cabo: number;
  disjuntor: number;
  queda_tensao: number;
  queda_tensao_max: number;
  queda_tensao_ok: boolean;
  capacidade_ok: boolean;
  eletroduto: string;
  taxa_ocupacao: number;
  taxa_ocupacao_ok: boolean;
  fator_potencia: number;
  potencia_aparente: number;
  justificativas: string[];
  referencias: string[];
  alertas: string[];
  tug_minimo?: number;
  tue_minimo?: number;
}

// ============================================================
// FUNÇÕES DE CÁLCULO
// ============================================================

export function calcularCorrente(input: CalcInput): { corrente: number; fp: number; potencia_aparente: number } {
  const fp = FATORES_POTENCIA[input.load_type] ?? 0.80;
  const potencia_aparente = input.power_w / fp;
  let corrente: number;

  if (input.phases === 3) {
    // Trifásico: I = P / (√3 × V × FP)
    corrente = input.power_w / (Math.sqrt(3) * input.voltage * fp);
  } else if (input.phases === 2) {
    // Bifásico: I = P / (2 × V_neutro × FP) aproximado
    corrente = input.power_w / (2 * (input.voltage / 2) * fp);
  } else {
    // Monofásico: I = P / (V × FP)
    corrente = input.power_w / (input.voltage * fp);
  }

  return { corrente, fp, potencia_aparente };
}

export function selecionarDisjuntor(corrente: number): number {
  for (const d of DISJUNTORES_PADRAO) {
    if (d >= corrente) return d;
  }
  return DISJUNTORES_PADRAO[DISJUNTORES_PADRAO.length - 1];
}

export function dimensionarCondutor(corrente: number, input: CalcInput): number {
  const fatorAgrupamento = FATOR_AGRUPAMENTO[input.grouping_count] ?? 1.0;
  const correnteProjeto = corrente / fatorAgrupamento;
  const tipo = input.insulation;

  for (const entry of TABELA_CAPACIDADE_CONDUCAO) {
    const capacidade = tipo === 'pvc' ? entry.pvc : entry.epr;
    if (capacidade >= correnteProjeto) {
      return entry.secao;
    }
  }

  return TABELA_CAPACIDADE_CONDUCAO[TABELA_CAPACIDADE_CONDUCAO.length - 1].secao;
}

export function calcularQuedaTensao(input: CalcInput, secao: number, corrente: number): number {
  const resistividade = RESISTIVIDADE[input.conductor_material];
  const r = (resistividade * input.distance_m) / (1000 * secao); // ohm
  const x = REATANCIA * (input.distance_m / 1000); // ohm
  const fp = FATORES_POTENCIA[input.load_type] ?? 0.80;
  const sinFi = Math.sqrt(1 - fp * fp);

  let quedaPct: number;
  if (input.phases === 3) {
    const quedaV = Math.sqrt(3) * corrente * (r * fp + x * sinFi);
    quedaPct = (quedaV / input.voltage) * 100;
  } else {
    const quedaV = 2 * corrente * (r * fp + x * sinFi); // ida + volta
    quedaPct = (quedaV / input.voltage) * 100;
  }

  return quedaPct;
}

export function dimensionarEletroduto(secao: number, numCondutores: number): { eletroduto: string; taxa: number } {
  const diametroCondutor = DIAMETRO_CONDUTOR[secao] ?? 5;
  const areaCondutor = (Math.PI * Math.pow(diametroCondutor / 2, 2));
  const areaTotal = areaCondutor * numCondutores;

  const taxaKey = numCondutores <= 1 ? 1 : numCondutores === 2 ? 2 : 3;
  const taxaMax = TAXA_OCUPACAO_MAX[taxaKey];

  for (const [nome, diametroInt] of Object.entries(DIAMETRO_ELETRODUTO)) {
    const areaEletroduto = (Math.PI * Math.pow(diametroInt / 2, 2));
    const taxa = areaTotal / areaEletroduto;
    if (taxa <= taxaMax) {
      return { eletroduto: nome, taxa: taxa * 100 };
    }
  }

  return { eletroduto: '3', taxa: 100 };
}

export function calcularTUG(environment: string, area_m2: number): number {
  // NBR 5410 — TUG por ambiente
  // Cômodos com área ≤ 6m²: 1 TUG
  // 6m² < área ≤ 10m²: 2 TUG
  // 10m² < área: 3 TUG (1 a cada 5m ou fração)
  if (area_m2 <= 0) return 1;
  if (area_m2 <= 6) return 1;
  if (area_m2 <= 10) return 2;
  return Math.max(3, Math.ceil(area_m2 / 5));
}

export function calcularTUE(load_type: string, power_w: number): number {
  // TUE — Tomadas de uso específico
  // 1 TUE por carga específica
  if (load_type === 'chuveiro' || load_type === 'ar_condicionado' || load_type === 'cooking') {
    return 1;
  }
  return 0;
}

export function calcular(input: CalcInput): CalcResult {
  const justificativas: string[] = [];
  const referencias: string[] = [];
  const alertas: string[] = [];

  // 1. Corrente
  const { corrente, fp, potencia_aparente } = calcularCorrente(input);
  justificativas.push(
    `Corrente calculada: I = P / (V × FP) = ${input.power_w}W / (${input.voltage}V × ${fp}) = ${corrente.toFixed(2)} A`
  );
  referencias.push('Cálculo de corrente — NBR 5410, seção 6.2');

  // 2. Fator de agrupamento
  const fatorAgrupamento = FATOR_AGRUPAMENTO[input.grouping_count] ?? 1.0;
  const correnteProjeto = corrente / fatorAgrupamento;
  if (input.grouping_count > 1) {
    justificativas.push(
      `Fator de agrupamento aplicado: ${fatorAgrupamento} (${input.grouping_count} circuitos agrupados) → corrente de projeto = ${correnteProjeto.toFixed(2)} A`
    );
    referencias.push('Fator de correção por agrupamento — NBR 5410, tabela 42');
  }

  // 3. Dimensionamento do condutor
  const secao = dimensionarCondutor(corrente, input);
  const capacidadeEntry = TABELA_CAPACIDADE_CONDUCAO.find((e) => e.secao === secao)!;
  const capacidade = input.insulation === 'pvc' ? capacidadeEntry.pvc : capacidadeEntry.epr;
  const capacidadeOk = capacidade >= correnteProjeto;

  justificativas.push(
    `Condutor selecionado: ${secao} mm² — capacidade de condução = ${capacidade} A (isolamento ${input.insulation.toUpperCase()}, método ${input.installation_method})`
  );
  referencias.push('Capacidade de condução — NBR 13571 / NBR 5410, tabela 36');

  if (!capacidadeOk) {
    alertas.push(`ATENÇÃO: A capacidade do condutor (${capacidade} A) é insuficiente para a corrente de projeto (${correnteProjeto.toFixed(2)} A). Verifique a seção do cabo.`);
  }

  // 4. Disjuntor
  const disjuntor = selecionarDisjuntor(corrente);
  justificativas.push(
    `Disjuntor selecionado: ${disjuntor} A (corrente nominal ≥ corrente de projeto ${correnteProjeto.toFixed(2)} A)`
  );
  referencias.push('Proteção contra sobrecorrentes — NBR 5410, seção 5.3');

  if (disjuntor < corrente) {
    alertas.push(`ATENÇÃO: Disjuntor ${disjuntor} A pode ser insuficiente. Corrente de projeto = ${correnteProjeto.toFixed(2)} A.`);
  }

  // 5. Queda de tensão
  const quedaTensao = calcularQuedaTensao(input, secao, corrente);
  const quedaMax = input.supply_type === 'direta'
    ? QUEDA_TENSAO_MAXIMA.instalacao_direta_total
    : QUEDA_TENSAO_MAXIMA.instalacao_transformador_total;
  const quedaOk = quedaTensao <= quedaMax;

  justificativas.push(
    `Queda de tensão calculada: ${quedaTensao.toFixed(2)}% (limite máximo: ${quedaMax}% — alimentação ${input.supply_type})`
  );
  referencias.push('Queda de tensão máxima — NBR 5410, seção 6.3');

  if (!quedaOk) {
    alertas.push(`ATENÇÃO: Queda de tensão (${quedaTensao.toFixed(2)}%) excede o limite de ${quedaMax}%. Considere aumentar a seção do condutor ou reduzir a distância.`);
  }

  // 6. Eletroduto
  const numCondutores: number = input.phases === 3 ? 4 : 3; // 3 fases + neutro ou 2 + terra + neutro
  const { eletroduto, taxa } = dimensionarEletroduto(secao, numCondutores);
  const taxaOk = taxa <= (TAXA_OCUPACAO_MAX[numCondutores <= 1 ? 1 : numCondutores === 2 ? 2 : 3] * 100);

  justificativas.push(
    `Eletroduto: ${eletroduto}" — taxa de ocupação ${taxa.toFixed(1)}% (${numCondutores} condutores carregados)`
  );
  referencias.push('Taxa de ocupação de eletroduto — NBR 5410, seção 6.2.5');

  // 7. TUG/TUE
  let tugMinimo: number | undefined;
  let tueMinimo: number | undefined;

  if (input.circuit_type === 'tomadas') {
    tugMinimo = Math.max(1, Math.ceil(input.points_count));
    justificativas.push(`TUG mínimo: ${tugMinimo} tomadas de uso geral neste circuito`);
    referencias.push('TUG — NBR 5410, seção 9.5.2.1');
  }
  if (input.circuit_type === 'tomadas_uso_especifico') {
    tueMinimo = 1;
    justificativas.push(`TUE: 1 tomada de uso específico para esta carga`);
    referencias.push('TUE — NBR 5410, seção 9.5.2.2');
  }

  // Verificação geral
  if (secao < 1.5) {
    alertas.push('ATENÇÃO: A seção mínima para circuitos de força é 1.5 mm² (NBR 5410, tabela 40).');
  }
  if (secao < 2.5 && input.circuit_type === 'tomadas') {
    alertas.push('ATENÇÃO: Para circuitos de tomadas, recomenda-se no mínimo 2.5 mm².');
  }

  return {
    corrente: parseFloat(corrente.toFixed(2)),
    corrente_projeto: parseFloat(correnteProjeto.toFixed(2)),
    secao_cabo: secao,
    disjuntor,
    queda_tensao: parseFloat(quedaTensao.toFixed(2)),
    queda_tensao_max: quedaMax,
    queda_tensao_ok: quedaOk,
    capacidade_ok: capacidadeOk,
    eletroduto,
    taxa_ocupacao: parseFloat(taxa.toFixed(1)),
    taxa_ocupacao_ok: taxaOk,
    fator_potencia: fp,
    potencia_aparente: parseFloat(potencia_aparente.toFixed(2)),
    justificativas,
    referencias,
    alertas,
    tug_minimo: tugMinimo,
    tue_minimo: tueMinimo,
  };
}

// Verificar se um cálculo está dentro das conformidades
export function verificarConformidade(result: CalcResult): { conforme: boolean; status: 'aprovado' | 'alerta' | 'reprovado' } {
  if (!result.capacidade_ok || !result.queda_tensao_ok) {
    return { conforme: false, status: 'reprovado' };
  }
  if (result.alertas.length > 0) {
    return { conforme: true, status: 'alerta' };
  }
  return { conforme: true, status: 'aprovado' };
}
