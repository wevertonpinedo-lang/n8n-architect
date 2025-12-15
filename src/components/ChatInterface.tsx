import React, { useState, useRef, useEffect } from 'react';
import { ChatState, Message, WorkflowTemplate } from '../types';
import { sendMessageStream } from '../services/openaiService';
import MarkdownRenderer from './MarkdownRenderer';
import { Send, Sparkles, StopCircle, ArrowRight, Bot, User, Eraser, Save, Zap, Clock, Rocket, CheckCircle2 } from 'lucide-react';

interface ChatInterfaceProps {
  initialPrompt?: string;
  onWorkflowGenerated?: (workflow: WorkflowTemplate) => void;
}

// Motivational phrases for the loading overlay
const LOADING_PHRASES = [
  { text: "Seu fluxo está ficando maravilhoso! ✨", subtext: "Você está economizando pelo menos 3 horas de trabalho" },
  { text: "Analisando as melhores práticas...", subtext: "Garantindo que seu fluxo seja profissional" },
  { text: "Configurando nodes inteligentes...", subtext: "Cada conexão é pensada para máxima eficiência" },
  { text: "Sua automação está quase pronta!", subtext: "Em segundos você terá um fluxo completo" },
  { text: "Otimizando a arquitetura do fluxo...", subtext: "Menos erros, mais resultados" },
  { text: "Construindo algo incrível para você!", subtext: "Isso levaria horas manualmente" },
  { text: "Aplicando lógica de automação...", subtext: "O n8n nunca foi tão fácil" },
  { text: "Validando as conexões entre nodes...", subtext: "Seu tempo é precioso" },
];

const ChatInterface: React.FC<ChatInterfaceProps> = ({ initialPrompt, onWorkflowGenerated }) => {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
  });
  const [inputValue, setInputValue] = useState('');
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasTriggeredInitial = useRef(false);

  // Rotate phrases while loading
  useEffect(() => {
    if (chatState.isLoading) {
      const interval = setInterval(() => {
        setCurrentPhraseIndex(prev => (prev + 1) % LOADING_PHRASES.length);
      }, 3000);
      return () => clearInterval(interval);
    } else {
      setCurrentPhraseIndex(0);
    }
  }, [chatState.isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages]);

  // Handle Initial Prompt
  useEffect(() => {
    if (initialPrompt && !hasTriggeredInitial.current) {
      hasTriggeredInitial.current = true;
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt]);

  const extractNodesFromResponse = (content: string): string[] => {
    const nodeKeywords = ['Webhook', 'HTTP Request', 'Cron', 'Schedule', 'Google Sheets', 'Slack', 'Telegram', 'WhatsApp', 'OpenAI', 'ChatGPT', 'Switch', 'Merge', 'IF', 'Filter', 'SplitInBatches', 'Code', 'Function', 'Set'];
    const found = nodeKeywords.filter(keyword => content.toLowerCase().includes(keyword.toLowerCase()));
    return [...new Set(found)].slice(0, 5);
  };

  const extractJsonFromResponse = (content: string): string | undefined => {
    const match = content.match(/({[\s\S]*"nodes":\s*\[[\s\S]*})/);
    return match ? match[1] : undefined;
  };

  const determineCategory = (content: string): WorkflowTemplate['category'] => {
    const lower = content.toLowerCase();

    if (lower.includes('whatsapp') || lower.includes('wpp') || lower.includes('zap') || lower.includes('mensagem') || lower.includes('chat')) {
      return 'WhatsApp';
    }
    if (lower.includes('facebook') || lower.includes('instagram') || lower.includes('lead') || lower.includes('ads') || lower.includes('marketing') || lower.includes('email') || lower.includes('mail')) {
      return 'Marketing';
    }
    if (lower.includes('crm') || lower.includes('pipedrive') || lower.includes('hubspot') || lower.includes('cliente') || lower.includes('negocio') || lower.includes('funil')) {
      return 'CRM';
    }
    if (lower.includes('venda') || lower.includes('pagamento') || lower.includes('stripe') || lower.includes('woocommerce') || lower.includes('loja') || lower.includes('checkout') || lower.includes('pix')) {
      return 'Vendas';
    }
    return 'Produtividade';
  };

  const handleSendMessage = async (contentOverride?: string) => {
    const content = contentOverride || inputValue;
    if (!content.trim() || chatState.isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content,
      timestamp: new Date(),
    };

    setChatState((prev) => ({
      messages: [...prev.messages, userMessage],
      isLoading: true,
    }));
    setInputValue('');

    try {
      const stream = await sendMessageStream(userMessage.content);

      const botMessageId = (Date.now() + 1).toString();
      let fullContent = '';

      setChatState((prev) => ({
        messages: [
          ...prev.messages,
          {
            id: botMessageId,
            role: 'model',
            content: '',
            timestamp: new Date(),
            isStreaming: true,
          },
        ],
        isLoading: true,
      }));

      for await (const chunk of stream) {
        fullContent += chunk.text;
        setChatState((prev) => ({
          messages: prev.messages.map((msg) =>
            msg.id === botMessageId ? { ...msg, content: fullContent } : msg
          ),
          isLoading: true,
        }));
      }

      setChatState((prev) => ({
        messages: prev.messages.map((msg) =>
          msg.id === botMessageId ? { ...msg, isStreaming: false } : msg
        ),
        isLoading: false,
      }));

      // AUTOMATICALLY SAVE TO LIBRARY (ORDER BUMP LOGIC)
      // Even if the library view is hidden, this logic ensures the value is built up.
      if (onWorkflowGenerated) {
        const json = extractJsonFromResponse(fullContent);
        const nodes = extractNodesFromResponse(fullContent);
        const category = determineCategory(content + " " + fullContent);

        const title = content.length > 50 ? content.substring(0, 50) + "..." : content;

        const newWorkflow: WorkflowTemplate = {
          id: `gen-${Date.now()}`,
          title: title,
          description: "Fluxo gerado automaticamente pelo assistente.",
          category: category,
          complexity: 'Gerado',
          nodes: nodes.length > 0 ? nodes : ['AI Generated'],
          json: json,
          prompt: content,
          createdAt: new Date()
        };

        onWorkflowGenerated(newWorkflow);
      }

    } catch (error: any) {
      console.error('Error sending message:', error);

      let errorMessage = "Desculpe, ocorreu um erro ao processar sua solicitação.";

      if (error.message?.includes("API_KEY")) {
        errorMessage = "⚠️ **Erro de Configuração**: A `API_KEY` não foi encontrada. \n\nPor favor, configure sua chave de API do Google Gemini nas variáveis de ambiente do projeto.";
      }

      setChatState((prev) => ({
        messages: [
          ...prev.messages,
          {
            id: Date.now().toString(),
            role: 'model',
            content: errorMessage,
            timestamp: new Date(),
            isStreaming: false
          },
        ],
        isLoading: false
      }));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (

    <div className="flex flex-col md:flex-row h-full w-full bg-white relative overflow-hidden gap-4 p-4 md:p-6">

      {/* Left Column: Chat Area */}
      <div className="flex-1 flex flex-col bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden relative z-10 transition-all hover:shadow-blue-500/10">

        {/* Top Bar inside the card */}
        <div className="h-16 border-b border-gray-100 flex items-center justify-between px-6 bg-white sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Assistente Ativo</span>
          </div>
          <button
            onClick={() => setChatState({ messages: [], isLoading: false })}
            className="group flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-blue-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-blue-50"
            title="Limpar Conversa"
          >
            <Eraser className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline">Nova Conversa</span>
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-gray-50/50 scroll-smooth relative">

          {/* Loading Overlay with Motivational Phrases */}
          {chatState.isLoading && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-300">
              <div className="text-center space-y-6 max-w-md px-6">
                {/* Animated Icon */}
                <div className="relative mx-auto w-24 h-24">
                  <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping"></div>
                  <div className="relative w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/30 animate-bounce">
                    <Rocket className="w-12 h-12 text-white" />
                  </div>
                </div>

                {/* Motivational Text (rotates) */}
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500" key={currentPhraseIndex}>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {LOADING_PHRASES[currentPhraseIndex].text}
                  </h3>
                  <p className="text-base text-gray-600 leading-relaxed">
                    {LOADING_PHRASES[currentPhraseIndex].subtext}
                  </p>
                </div>

                {/* Progress Dots */}
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          {chatState.messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-in fade-in zoom-in duration-500">
              <div className="relative group">
                <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center transform rotate-3 shadow-lg group-hover:rotate-6 transition-transform border border-blue-100">
                  <Sparkles className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              <div className="space-y-2 max-w-md">
                <h3 className="text-xl font-bold text-gray-900">Como posso ajudar hoje?</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Descreva o fluxo e eu construirei a automação para você.
                </p>
              </div>


            </div>
          )}

          {chatState.messages.map((msg) => {
            // Hides model message while streaming so user only sees loading overlay
            if (msg.role === 'model' && msg.isStreaming) return null;

            return (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                <div className={`flex gap-3 max-w-[95%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm ${msg.role === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                    : 'bg-white text-blue-600 border border-gray-100'
                    }`}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  {/* Bubble */}
                  <div className="flex flex-col gap-1 w-full min-w-0">
                    <div
                      className={`rounded-2xl p-4 shadow-sm text-sm ${msg.role === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none shadow-blue-500/10'
                        : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none shadow-gray-200/50'
                        }`}
                    >
                      {msg.role === 'model' ? (
                        <MarkdownRenderer content={msg.content} />
                      ) : (
                        <p className="whitespace-pre-wrap font-medium">{msg.content}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {chatState.isLoading && chatState.messages[chatState.messages.length - 1]?.role === 'user' && (
            <div className="flex justify-start animate-in fade-in">
              <div className="flex gap-4 max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-white text-blue-600 border border-gray-100 flex items-center justify-center shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-medium">Pensando...</span>
                  <div className="flex gap-1 ml-1">
                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce delay-75"></div>
                    <div className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-100">
          <div className="relative flex items-center w-full">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Descreva o fluxo que você deseja automatizar..."
              className="w-full bg-gray-50 text-gray-800 placeholder-gray-400 rounded-2xl pl-5 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white transition-all resize-none border border-gray-200 shadow-inner text-sm leading-relaxed"
              rows={4}
              style={{ minHeight: '120px' }}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={chatState.isLoading || !inputValue.trim()}
              className="absolute right-2 bottom-2 p-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white transition-all shadow-lg shadow-blue-500/20"
            >
              {chatState.isLoading ? (
                <StopCircle className="w-5 h-5 animate-pulse" />
              ) : (
                <ArrowRight className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Architect Persona Area */}
      <div className="hidden md:flex w-[400px] flex-col justify-end items-center relative animate-fade-in-right">
        {/* Decorative Light behind character */}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-500/20 via-transparent to-transparent rounded-[2.5rem] blur-xl"></div>

        {/* Character Image */}
        <div className="relative z-10 w-full h-[85%] flex items-end justify-center pointer-events-none">
          <img
            src="/src/assets/architect.png"
            alt="AI Architect"
            className="object-contain h-full w-auto drop-shadow-2xl animate-float-slow"
            style={{ filter: 'drop-shadow(0px 10px 20px rgba(37, 99, 235, 0.3))' }}
          />
        </div>


      </div>

    </div>
  );
};

export default ChatInterface;