import { supabase } from './supabase';
import type { CalcInput, CalcResult } from './nbr5410';
import { verificarConformidade } from './nbr5410';
import { TIPOS_CIRCUITO, METODOS_INSTALACAO } from './nbr5410';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface AIContext {
  project?: {
    client_name: string;
    voltage: number;
    phases: number;
    circuits: Array<{
      name: string;
      environment: string;
      circuit_type: string;
      load_type: string;
      power_w: number;
      voltage: number;
      phases: number;
      distance_m: number;
      results: CalcResult | null;
    }>;
  };
}

// Base de conhecimento técnica do app para respostas locais
const KNOWLEDGE_BASE: Array<{ keywords: string[]; answer: string }> = [
  {
    keywords: ['nbr 5410', 'norma', 'resumo'],
    answer: 'A NBR 5410 é a norma brasileira que estabelece as condições para o projeto e execução das instalações elétricas de baixa tensão (até 1000V em CA). Ela cobre dimensionamento de condutores, proteção contra sobrecorrentes, queda de tensão, seccionamento, proteção contra choques elétricos, entre outros. Os principais pontos: seção mínima de 1.5mm² para iluminação e 2.5mm² para tomadas; queda de tensão máxima de 4% em circuitos terminais (alimentação direta) ou 5% (transformador); proteção contra choques por equipotencialização e dispositivos DR.',
  },
  {
    keywords: ['queda de tensao', 'queda tensao', 'tensao'],
    answer: 'A queda de tensão máxima permitida pela NBR 5410 é:\n• 4% em circuitos terminais (instalação alimentada diretamente pelo ramal de ligação)\n• 5% em circuitos terminais (instalação alimentada por transformador próprio)\n• 7% no total (da origem até o ponto de utilização) para alimentação direta\n• 5% no total para alimentação por transformador\n\nA queda de tensão depende da corrente, seção do condutor, distância e material do cabo. Se a queda exceder o limite, aumente a seção do condutor ou reduza a distância.',
  },
  {
    keywords: ['disjuntor', 'protecao', 'sobrecorrente'],
    answer: 'O disjuntor deve ser dimensionado para proteger o circuito contra sobrecorrentes (sobrecarga e curto-circuito). A corrente nominal do disjuntor deve ser:\n• Maior ou igual à corrente de projeto do circuito\n• Menor ou igual à capacidade de condução do condutor\n\nDisjuntores padrão: 6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250 A.\n\nPara proteção contra choques elétricos, use dispositivos DR (diferencial-residual) com sensibilidade de 30mA em circuitos de áreas molhadas, tomadas de uso geral e iluminação.',
  },
  {
    keywords: ['condutor', 'cabo', 'secao', 'dimensionamento', 'fio'],
    answer: 'O dimensionamento do condutor considera três fatores:\n1. Capacidade de condução de corrente (não pode ser menor que a corrente de projeto)\n2. Queda de tensão (não pode exceder o limite normativo)\n3. Seção mínima (1.5mm² para iluminação, 2.5mm² para tomadas)\n\nO material mais comum é o cobre. O isolamento pode ser PVC (70°C) ou EPR/XLPE (90°C). O método de instalação afeta a capacidade de condução (eletroduto em parede = método B1). Fatores de correção por agrupamento também devem ser aplicados quando há múltiplos circuitos no mesmo eletroduto.',
  },
  {
    keywords: ['tug', 'tomada de uso geral'],
    answer: 'TUG (Tomada de Uso Geral) — NBR 5410:\n• Cômodos com área ≤ 6m²: no mínimo 1 TUG\n• 6m² < área ≤ 10m²: no mínimo 2 TUG\n• 10m² < área: no mínimo 3 TUG (1 a cada 5m ou fração de perímetro)\n\nCada TUG deve ser de no mínimo 10A para 127V e 15A para 220V ou superior. Em cozinhas, copas e áreas de serviço, deve prever 1 TUE (tomada de uso específico) para cada 1000W ou fração.',
  },
  {
    keywords: ['tue', 'tomada de uso especifico'],
    answer: 'TUE (Tomada de Uso Específico) — NBR 5410:\n• Deve ser prevista para cada equipamento de uso específico (chuveiro, ar condicionado, fogão, máquina de lavar, etc.)\n• Cada TUE deve ser dimensionada individualmente conforme a potência do equipamento\n• TUEs devem ser alimentadas por circuitos independentes quando a potência for superior a 1000VA\n• Em cozinhas, copas, copas-cozinhas e áreas de serviço: 1 TUE para cada 1000W ou fração',
  },
  {
    keywords: ['eletroduto', 'ocupacao', 'conduite'],
    answer: 'A taxa de ocupação máxima de eletrodutos pela NBR 5410 é:\n• 1 condutor: 53% da área interna\n• 2 condutores: 31%\n• 3 ou mais condutores: 40%\n\nOs condutores devem poder ser instalados/removidos facilmente. Para eletrodutos corrugados flexíveis, considere uma margem adicional. Em nenhum caso a soma das seções dos condutores deve exceder os limites acima.',
  },
  {
    keywords: ['dr', 'diferencial', 'choque', 'protecao contra choque'],
    answer: 'Dispositivo Diferencial-Residual (DR) — NBR 5410:\n• Obrigatório em circuitos de áreas molhadas (banheiros, cozinhas, áreas de serviço, externas)\n• Sensibilidade de 30mA para proteção contra choques elétricos\n• Deve proteger circuitos de iluminação e tomadas de uso geral\n• Recomendado em todos os circuitos de residências\n• Não substitui o disjuntor termomagnético (protege contra correntes de fuga, não sobrecorrentes)',
  },
  {
    keywords: ['potencia', 'corrente', 'calculo', 'formula'],
    answer: 'Fórmulas de cálculo elétrico:\n\nMonofásico: I = P / (V × FP)\nBifásico: I = P / (2 × V_neutro × FP)\nTrifásico: I = P / (√3 × V × FP)\n\nOnde:\n• I = corrente (A)\n• P = potência ativa (W)\n• V = tensão (V)\n• FP = fator de potência\n\nPotência aparente: S = P / FP (VA)\nQueda de tensão: ΔV% = (ΔV / V) × 100',
  },
];

function findLocalAnswer(question: string): string | null {
  const q = question.toLowerCase();
  for (const entry of KNOWLEDGE_BASE) {
    for (const kw of entry.keywords) {
      if (q.includes(kw)) {
        return entry.answer;
      }
    }
  }
  return null;
}

function buildContextSummary(context?: AIContext): string {
  if (!context?.project) return '';
  const p = context.project;
  let summary = `\n\n--- CONTEXTO DO PROJETO ATUAL ---\n`;
  summary += `Cliente: ${p.client_name}\n`;
  summary += `Tensão: ${p.voltage}V | Sistema: ${p.phases === 3 ? 'Trifásico' : p.phases === 2 ? 'Bifásico' : 'Monofásico'}\n`;
  summary += `Circuitos:\n`;
  for (const c of p.circuits) {
    summary += `  • ${c.name} (${c.environment || 's/ambiente'}) — ${c.power_w}W, ${c.voltage}V, ${c.distance_m}m`;
    if (c.results) {
      const conf = verificarConformidade(c.results);
      summary += ` → Condutor: ${c.results.secao_cabo}mm², Disjuntor: ${c.results.disjuntor}A, Queda: ${c.results.queda_tensao}%, Status: ${conf.status}`;
    }
    summary += `\n`;
  }
  return summary;
}

export async function sendChatMessage(
  message: string,
  userId: string,
  projectId?: string,
  context?: AIContext
): Promise<string> {
  // 1. Salvar mensagem do usuário
  await supabase.from('chat_history').insert({
    user_id: userId,
    project_id: projectId || null,
    role: 'user',
    content: message,
  });

  // 2. Tentar resposta local (base de conhecimento)
  const localAnswer = findLocalAnswer(message);

  // 3. Se há contexto de projeto, enriquecer a resposta
  let answer: string;

  if (localAnswer) {
    answer = localAnswer;
    // Se pergunta sobre resultados e há contexto, adicionar info
    if (context?.project && message.toLowerCase().includes('result')) {
      answer += buildContextSummary(context);
    }
  } else {
    // 4. Chamar edge function para IA (se disponível)
    try {
      const { data: session } = await supabase.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/eletricista-ai`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            message,
            context: context ? buildContextSummary(context) : '',
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        answer = data.answer || 'Não consegui processar sua pergunta. Tente reformular.';
      } else {
        answer = generateFallbackAnswer(message, context);
      }
    } catch {
      answer = generateFallbackAnswer(message, context);
    }
  }

  // 5. Salvar resposta da IA
  await supabase.from('chat_history').insert({
    user_id: userId,
    project_id: projectId || null,
    role: 'assistant',
    content: answer,
  });

  return answer;
}

function generateFallbackAnswer(message: string, context?: AIContext): string {
  const msg = message.toLowerCase();

  if (msg.includes('olá') || msg.includes('ola') || msg.includes('oi') || msg.includes('bom dia') || msg.includes('boa tarde')) {
    return 'Olá! Sou o Eletricista IA, sua consultoria técnica em elétrica. Posso ajudar com:\n• Dimensionamento de circuitos (NBR 5410)\n• Queda de tensão\n• Seleção de disjuntores e condutores\n• TUG, TUE e DR\n• Interpretação de resultados de cálculos\n\nO que você precisa saber?';
  }

  if (msg.includes('ajuda') || msg.includes('help') || msg.includes('o que voce faz') || msg.includes('o que você faz')) {
    return 'Sou o Eletricista IA. Posso:\n\n1. Explicar conceitos de elétrica e NBR 5410\n2. Ajudar a interpretar resultados de cálculos\n3. Orientar sobre dimensionamento de condutores, disjuntores e quedas de tensão\n4. Explicar TUG, TUE, DR e outros dispositivos\n5. Responder dúvidas sobre o seu projeto atual\n\nPergunte sobre qualquer tema elétrico!';
  }

  if (context?.project) {
    return `Entendi sua pergunta sobre "${message}".\n\nAnalisei o projeto de ${context.project.client_name} com ${context.project.circuits.length} circuito(s) cadastrado(s).\n\nPara esta dúvida específica, recomendo consultar a NBR 5410 diretamente ou um engenheiro eletricista para validação técnica. Posso ajudar com conceitos gerais sobre dimensionamento, queda de tensão, disjuntores, TUG/TUE, DR e outros temas cobertos pela norma.`;
  }

  return `Entendi sua pergunta sobre "${message}".\n\nPosso ajudar com os seguintes temas:\n• NBR 5410 (norma geral)\n• Queda de tensão\n• Dimensionamento de condutores e disjuntores\n• TUG e TUE\n• Eletrodutos e taxa de ocupação\n• Dispositivos DR\n• Fórmulas de cálculo elétrico\n\nTente perguntar sobre um desses temas, ou seja mais específico. Quando houver informação insuficiente para uma resposta segura, sempre indico a necessidade de verificação técnica.`;
}

export async function loadChatHistory(userId: string, projectId?: string): Promise<ChatMessage[]> {
  let query = supabase
    .from('chat_history')
    .select('id, role, content, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(50);

  if (projectId) {
    query = query.eq('project_id', projectId);
  } else {
    query = query.is('project_id', null);
  }

  const { data, error } = await query;
  if (error) return [];
  return (data || []) as ChatMessage[];
}

export async function clearChatHistory(userId: string, projectId?: string): Promise<void> {
  let query = supabase
    .from('chat_history')
    .delete()
    .eq('user_id', userId);

  if (projectId) {
    query = query.eq('project_id', projectId);
  } else {
    query = query.is('project_id', null);
  }

  await query;
}
