import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Trash2, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { sendChatMessage, loadChatHistory, clearChatHistory, type ChatMessage } from '@/lib/ai';
import { PLAN_FEATURES } from '@/lib/plans';
import type { CalcResult } from '@/lib/nbr5410';

interface AIScreenProps {
  projectId?: string;
  projectContext?: {
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

export default function AIScreen({ projectId, projectContext }: AIScreenProps) {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const plan = (profile?.plan as 'normal' | 'pro') || 'normal';
  const aiEnabled = PLAN_FEATURES[plan].ai_enabled;

  useEffect(() => {
    if (!user) return;
    loadChatHistory(user.id, projectId).then((msgs) => {
      if (msgs.length === 0) {
        setMessages([{
          id: 'welcome',
          role: 'assistant',
          content: 'Olá! Sou o Eletricista IA, sua consultoria técnica em elétrica. Posso ajudar com dimensionamento de circuitos, NBR 5410, queda de tensão, disjuntores, TUG/TUE, DR e mais. O que você precisa saber?',
          created_at: new Date().toISOString(),
        }]);
      } else {
        setMessages(msgs);
      }
    });
  }, [user, projectId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || !user || loading) return;
    const msg = input.trim();
    setInput('');
    setLoading(true);

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: msg,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const answer = await sendChatMessage(msg, user.id, projectId, projectContext ? { project: projectContext } : undefined);
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: answer,
        created_at: new Date().toISOString(),
      }]);
    } catch {
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Erro ao processar sua mensagem. Tente novamente.',
        created_at: new Date().toISOString(),
      }]);
    }
    setLoading(false);
  }

  async function handleClear() {
    if (!user) return;
    await clearChatHistory(user.id, projectId);
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: 'Conversa reiniciada. Como posso ajudar?',
      created_at: new Date().toISOString(),
    }]);
  }

  if (!aiEnabled) {
    return (
      <div className="px-4 py-6">
        <div className="card text-center py-12">
          <Lock size={40} className="text-slate-300 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900 mb-1">Recurso PRO</h2>
          <p className="text-sm text-slate-500">A IA consultora está disponível no plano PRO. Faça upgrade para acessar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">Eletricista IA</h1>
            <p className="text-xs text-slate-500">{projectContext ? `Projeto: ${projectContext.client_name}` : 'Consultoria técnica'}</p>
          </div>
        </div>
        <button onClick={handleClear} className="p-2 rounded-lg hover:bg-slate-100">
          <Trash2 size={18} className="text-slate-500" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 no-scrollbar">
        {messages.map((m) => (
          <div key={m.id} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${m.role === 'user' ? 'bg-blue-600' : 'bg-slate-900'}`}>
              {m.role === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
            </div>
            <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white text-slate-800 rounded-tl-sm border border-slate-200'}`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center flex-shrink-0">
              <Bot size={16} className="text-white" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 py-3 bg-white border-t border-slate-200 safe-bottom">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Pergunte sobre elétrica, NBR 5410..."
            className="input-field flex-1"
            disabled={loading}
          />
          <button onClick={handleSend} disabled={loading || !input.trim()} className="btn-primary px-4">
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
