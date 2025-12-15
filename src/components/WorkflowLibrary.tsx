import React, { useState } from 'react';
import { Search, Filter, Copy, ArrowRight, Zap, MessageCircle, Mail, Database, ShoppingCart, Calendar, Check, Star, Clock } from 'lucide-react';
import { WorkflowTemplate } from '../types';

interface WorkflowLibraryProps {
  onUseTemplate: (prompt: string) => void;
  customWorkflows?: WorkflowTemplate[];
}

// MOCK DATA - A subset of the "200" flows to demonstrate structure
const STATIC_WORKFLOWS: WorkflowTemplate[] = [
  // WHATSAPP
  {
    id: 'wa-01',
    title: 'WhatsApp Chatbot com OpenAI (GPT-4)',
    description: 'Recebe mensagem no WhatsApp, envia para a OpenAI processar o contexto e responde automaticamente ao cliente.',
    category: 'WhatsApp',
    complexity: 'Intermediário',
    nodes: ['WhatsApp Trigger', 'OpenAI', 'HTTP Request'],
    json: `{
  "nodes": [
    {
      "parameters": {},
      "name": "Start",
      "type": "n8n-nodes-base.start",
      "typeVersion": 1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "updates": ["messages.upsert"]
      },
      "name": "WhatsApp Trigger",
      "type": "n8n-nodes-base.whatsappTrigger",
      "typeVersion": 1,
      "position": [450, 300]
    }
  ]
}`,
    prompt: "Crie um fluxo que atue como chatbot de WhatsApp. Ele deve receber a mensagem via Webhook (API Oficial ou Evolution API), enviar o texto para o node da OpenAI (ChatGPT) com um prompt de sistema de vendedor, e devolver a resposta para o WhatsApp."
  },
  {
    id: 'wa-02',
    title: 'Menu de Autoatendimento WhatsApp',
    description: 'Envia um menu numérico (1. Suporte, 2. Vendas) e roteia a conversa baseado na resposta.',
    category: 'WhatsApp',
    complexity: 'Iniciante',
    nodes: ['Switch', 'WhatsApp Sender'],
    prompt: "Crie um fluxo de menu para WhatsApp. Se o usuário digitar '1', encaminhe para o time de suporte. Se digitar '2', envie o link do catálogo. Use um node Switch para a lógica."
  },
  {
    id: 'wa-03',
    title: 'Disparo em Massa Personalizado',
    description: 'Lê uma lista do Google Sheets e envia mensagens individuais no WhatsApp respeitando delay para evitar bloqueio.',
    category: 'WhatsApp',
    complexity: 'Intermediário',
    nodes: ['Google Sheets', 'Split In Batches', 'Wait', 'WhatsApp'],
    prompt: "Crie um fluxo de disparo em massa. 1. Leia dados do Google Sheets. 2. Use Split in Batches de 1 em 1. 3. Adicione um node Wait de 15 segundos entre envios. 4. Envie a mensagem personalizada."
  },
  
  // MARKETING
  {
    id: 'mkt-01',
    title: 'Facebook Lead Ads para Google Sheets',
    description: 'Salva automaticamente novos leads do Facebook/Instagram Ads em uma planilha e notifica no Slack.',
    category: 'Marketing',
    complexity: 'Iniciante',
    nodes: ['Facebook Trigger', 'Google Sheets', 'Slack'],
    prompt: "Crie uma automação que dispara quando entra um novo Lead no Facebook Lead Ads. Salve o nome, email e telefone no Google Sheets e envie um alerta no Slack."
  },
  {
    id: 'mkt-02',
    title: 'Enriquecimento de Leads (Clearbit/LinkedIn)',
    description: 'Quando um lead chega, busca dados públicos da empresa e adiciona ao CRM antes de contatar.',
    category: 'Marketing',
    complexity: 'Avançado',
    nodes: ['Webhook', 'HTTP Request', 'Pipedrive'],
    prompt: "Crie um fluxo de enriquecimento de dados. Receba um email via Webhook, consulte uma API de dados (como Clearbit ou Google Search) para achar o cargo da pessoa e atualize o Pipedrive."
  },
  {
    id: 'mkt-03',
    title: 'Monitoramento de Comentários Instagram',
    description: 'Analisa sentimento de comentários no Instagram com IA e alerta sobre críticas negativas.',
    category: 'Marketing',
    complexity: 'Intermediário',
    nodes: ['Instagram Trigger', 'AWS Comprehend/OpenAI', 'Email'],
    prompt: "Monitore comentários do Instagram. Use IA para classificar como 'Positivo', 'Neutro' ou 'Negativo'. Se for Negativo, envie um email urgente para o suporte."
  },

  // CRM & VENDAS
  {
    id: 'crm-01',
    title: 'Recuperação de Carrinho (WooCommerce)',
    description: 'Identifica abandono de carrinho, aguarda 1 hora e envia cupom de desconto via WhatsApp.',
    category: 'Vendas',
    complexity: 'Intermediário',
    nodes: ['WooCommerce Trigger', 'Wait', 'WhatsApp'],
    prompt: "Crie um fluxo de recuperação de carrinho para WooCommerce. Espere 1 hora após o evento de 'cart_abandoned'. Se não houver compra, envie mensagem no WhatsApp com cupom de 5%."
  },
  {
    id: 'crm-02',
    title: 'Pipedrive para Trello',
    description: 'Cria um card no Trello automaticamente quando um negócio é ganho no Pipedrive.',
    category: 'CRM',
    complexity: 'Iniciante',
    nodes: ['Pipedrive Trigger', 'Trello'],
    prompt: "Integre Pipedrive e Trello. Quando um negócio mudar para status 'Won' no Pipedrive, crie um card na lista 'A Fazer' do Trello com os dados do cliente."
  },
  
  // PRODUTIVIDADE
  {
    id: 'prod-01',
    title: 'Resumo Diário de Vendas',
    description: 'Todo dia às 18h, soma as vendas do Stripe/MercadoPago e envia relatório no Telegram.',
    category: 'Produtividade',
    complexity: 'Intermediário',
    nodes: ['Cron', 'Stripe', 'Telegram'],
    prompt: "Crie um relatório diário. Use um Cron Trigger para rodar às 18h. Busque todas as transações do dia no Stripe, some os valores e envie o total no Telegram."
  },
  {
    id: 'prod-02',
    title: 'Transcrever Áudio do WhatsApp',
    description: 'Recebe áudio no WhatsApp, transcreve com OpenAI Whisper e salva o texto no Notion.',
    category: 'Produtividade',
    complexity: 'Avançado',
    nodes: ['WhatsApp', 'OpenAI Whisper', 'Notion'],
    prompt: "Automação de áudio: Receba áudio do WhatsApp, faça download do arquivo, envie para a API Whisper da OpenAI para transcrever e salve o texto resultante em uma página do Notion."
  }
];

const WorkflowLibrary: React.FC<WorkflowLibraryProps> = ({ onUseTemplate, customWorkflows = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowTemplate | null>(null);

  const categories = ['Todos', 'Meus Fluxos', 'WhatsApp', 'Marketing', 'CRM', 'Vendas', 'Produtividade'];
  
  const allWorkflows = [...customWorkflows, ...STATIC_WORKFLOWS];

  const filteredWorkflows = allWorkflows.filter(wf => {
    // 1. Search Filter
    const matchesSearch = wf.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          wf.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 2. Category Filter Logic
    let matchesCategory = false;
    if (selectedCategory === 'Todos') {
       matchesCategory = true;
    } else if (selectedCategory === 'Meus Fluxos') {
       // Only show workflows that have the "gen-" ID prefix (Generated by AI)
       matchesCategory = wf.id.startsWith('gen-');
    } else {
       // Strict category match
       matchesCategory = wf.category === selectedCategory;
    }

    return matchesSearch && matchesCategory;
  });

  const handleCopyJson = (json: string) => {
    navigator.clipboard.writeText(json);
    alert('JSON copiado para a área de transferência!');
  };

  return (
    <div className="flex flex-col h-full w-full bg-gray-50/50 relative">
      
      {/* Top Bar */}
      <div className="h-20 border-b border-gray-100 flex items-center justify-between px-8 bg-white/80 backdrop-blur-sm sticky top-0 z-20">
         <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
               <Database className="w-5 h-5 text-purple-600" />
               Biblioteca de Fluxos
            </h2>
            <p className="text-xs text-purple-600 font-bold bg-purple-100 px-2 py-0.5 rounded-full inline-block mt-1">
               PREMIUM
            </p>
         </div>
         
         <div className="flex items-center gap-4">
            <div className="relative">
               <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
               <input 
                  type="text" 
                  placeholder="Buscar fluxo..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:bg-white transition-all w-64"
               />
            </div>
         </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden flex">
         
         {/* Sidebar Categories */}
         <div className="w-64 bg-white border-r border-gray-100 p-6 hidden md:block overflow-y-auto">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Categorias</h3>
            <div className="space-y-2">
               {categories.map(cat => (
                  <button
                     key={cat}
                     onClick={() => setSelectedCategory(cat)}
                     className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-between ${
                        selectedCategory === cat 
                        ? 'bg-purple-50 text-purple-700 shadow-sm' 
                        : 'text-gray-600 hover:bg-gray-50'
                     }`}
                  >
                     <span className="flex items-center gap-2">
                        {cat === 'Meus Fluxos' && <Clock className="w-3 h-3" />}
                        {cat}
                     </span>
                     {selectedCategory === cat && <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>}
                  </button>
               ))}
            </div>

            <div className="mt-8 p-4 bg-gradient-to-br from-orange-100 to-pink-100 rounded-2xl border border-orange-200">
               <div className="flex items-center gap-2 text-orange-700 font-bold text-sm mb-2">
                  <Star className="w-4 h-4 fill-orange-500 text-orange-500" />
                  Dica Pro
               </div>
               <p className="text-xs text-orange-800/80 leading-relaxed">
                  Não achou o que procura? Clique em "Criar Novo" no topo e peça para a IA montar um fluxo exclusivo para você.
               </p>
            </div>
         </div>

         {/* Grid Area */}
         <div className="flex-1 p-8 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {filteredWorkflows.map(wf => (
                  <div key={wf.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-purple-200 transition-all group flex flex-col h-full relative overflow-hidden">
                     {/* New Label for Generated Flows */}
                     {wf.complexity === 'Gerado' && (
                        <div className="absolute top-0 right-0 bg-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl z-10">
                           RECÉM CRIADO
                        </div>
                     )}

                     <div className="flex justify-between items-start mb-4 mt-2">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border ${
                           wf.category === 'WhatsApp' ? 'bg-green-50 text-green-600 border-green-100' :
                           wf.category === 'Marketing' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                           wf.category === 'CRM' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                           wf.category === 'Meus Fluxos' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                           'bg-gray-50 text-gray-600 border-gray-100'
                        }`}>
                           {wf.category}
                        </span>
                        {wf.complexity === 'Iniciante' && <div className="flex gap-0.5"><div className="w-1.5 h-3 bg-green-400 rounded-sm"></div><div className="w-1.5 h-3 bg-gray-200 rounded-sm"></div><div className="w-1.5 h-3 bg-gray-200 rounded-sm"></div></div>}
                        {wf.complexity === 'Intermediário' && <div className="flex gap-0.5"><div className="w-1.5 h-3 bg-yellow-400 rounded-sm"></div><div className="w-1.5 h-3 bg-yellow-400 rounded-sm"></div><div className="w-1.5 h-3 bg-gray-200 rounded-sm"></div></div>}
                        {wf.complexity === 'Avançado' && <div className="flex gap-0.5"><div className="w-1.5 h-3 bg-red-400 rounded-sm"></div><div className="w-1.5 h-3 bg-red-400 rounded-sm"></div><div className="w-1.5 h-3 bg-red-400 rounded-sm"></div></div>}
                        {wf.complexity === 'Gerado' && <div className="flex gap-0.5"><div className="w-1.5 h-3 bg-purple-500 rounded-sm animate-pulse"></div><div className="w-1.5 h-3 bg-purple-500 rounded-sm animate-pulse delay-75"></div><div className="w-1.5 h-3 bg-purple-500 rounded-sm animate-pulse delay-150"></div></div>}
                     </div>

                     <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight group-hover:text-purple-600 transition-colors line-clamp-2">
                        {wf.title}
                     </h3>
                     <p className="text-sm text-gray-500 mb-6 leading-relaxed flex-1 line-clamp-4">
                        {wf.description}
                     </p>

                     <div className="flex items-center gap-2 mb-6 flex-wrap">
                        {wf.nodes.slice(0, 3).map((node, i) => (
                           <div key={i} className="bg-gray-100 px-2 py-1 rounded-md text-[10px] font-mono text-gray-600 border border-gray-200">
                              {node}
                           </div>
                        ))}
                        {wf.nodes.length > 3 && <span className="text-[10px] text-gray-400">+{wf.nodes.length - 3}</span>}
                     </div>

                     <button 
                        onClick={() => setSelectedWorkflow(wf)}
                        className="w-full py-2.5 rounded-xl border border-purple-200 text-purple-700 font-bold text-sm hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-all flex items-center justify-center gap-2"
                     >
                        Ver Detalhes
                     </button>
                  </div>
               ))}
            </div>

            {/* Load More Placeholder */}
            {filteredWorkflows.length > 0 && (
               <div className="mt-12 text-center">
                  <p className="text-gray-400 text-sm mb-4">Mostrando {filteredWorkflows.length} de {200 + customWorkflows.length}+ fluxos disponíveis</p>
                  <button className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full text-sm font-medium transition-colors">
                     Carregar Mais
                  </button>
               </div>
            )}
            
            {filteredWorkflows.length === 0 && (
               <div className="flex flex-col items-center justify-center h-full text-center py-20">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                     <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Nenhum fluxo encontrado</h3>
                  <p className="text-gray-500 text-sm">Tente buscar por outro termo ou categoria.</p>
               </div>
            )}
         </div>
      </div>

      {/* Detail Modal */}
      {selectedWorkflow && (
         <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
               <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50">
                  <div>
                     <h3 className="text-2xl font-bold text-gray-900 mb-1">{selectedWorkflow.title}</h3>
                     <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="bg-white border px-2 py-0.5 rounded-md">{selectedWorkflow.complexity}</span>
                        <span>•</span>
                        <span>{selectedWorkflow.category}</span>
                        {selectedWorkflow.createdAt && (
                           <>
                              <span>•</span>
                              <span>{selectedWorkflow.createdAt.toLocaleDateString()}</span>
                           </>
                        )}
                     </div>
                  </div>
                  <button onClick={() => setSelectedWorkflow(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                     <span className="text-2xl leading-none text-gray-500">&times;</span>
                  </button>
               </div>
               
               <div className="p-8 overflow-y-auto space-y-6">
                  <div>
                     <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2"><MessageCircle className="w-4 h-4 text-purple-600"/> Como funciona</h4>
                     <p className="text-gray-600 leading-relaxed">{selectedWorkflow.description}</p>
                  </div>

                  <div>
                     <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2"><Zap className="w-4 h-4 text-orange-500"/> Nodes Utilizados</h4>
                     <div className="flex flex-wrap gap-2">
                        {selectedWorkflow.nodes.map((node, i) => (
                           <span key={i} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-mono border border-gray-200">
                              {node}
                           </span>
                        ))}
                     </div>
                  </div>

                  {selectedWorkflow.json ? (
                     <div>
                        <div className="flex justify-between items-center mb-2">
                           <h4 className="font-bold text-gray-900 flex items-center gap-2"><Database className="w-4 h-4 text-blue-600"/> Código JSON</h4>
                           <button onClick={() => handleCopyJson(selectedWorkflow.json!)} className="text-xs text-purple-600 font-bold hover:underline flex items-center gap-1">
                              <Copy className="w-3 h-3" /> Copiar
                           </button>
                        </div>
                        <div className="bg-[#1e1e2e] rounded-xl p-4 overflow-hidden relative group">
                           <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#1e1e2e]/90 pointer-events-none"></div>
                           <pre className="text-xs font-mono text-purple-200 opacity-70 h-32 overflow-hidden">
                              {selectedWorkflow.json}
                           </pre>
                           <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                              <button 
                                 onClick={() => handleCopyJson(selectedWorkflow.json!)}
                                 className="px-6 py-2 bg-white text-gray-900 rounded-full font-bold text-xs shadow-lg hover:scale-105 transition-transform"
                              >
                                 Copiar JSON Completo
                              </button>
                           </div>
                        </div>
                     </div>
                  ) : (
                     <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100 text-center">
                        <h4 className="text-purple-900 font-bold mb-2">Fluxo Complexo / Gerado Parcialmente</h4>
                        <p className="text-sm text-purple-700 mb-4">
                           A IA não retornou um JSON estruturado para este pedido ou é um fluxo conceitual.
                        </p>
                        <button 
                           onClick={() => {
                              if(selectedWorkflow.prompt) onUseTemplate(selectedWorkflow.prompt);
                              setSelectedWorkflow(null);
                           }}
                           className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-purple-200 transition-all flex items-center justify-center gap-2 mx-auto"
                        >
                           <Zap className="w-4 h-4" /> Refazer com IA
                        </button>
                     </div>
                  )}
               </div>

               <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                  <button 
                     onClick={() => {
                        if(selectedWorkflow.prompt) onUseTemplate(selectedWorkflow.prompt);
                        setSelectedWorkflow(null);
                     }}
                     className="text-sm text-gray-500 hover:text-purple-600 font-medium transition-colors flex items-center justify-center gap-1"
                  >
                     Quero personalizar este fluxo <ArrowRight className="w-3 h-3" />
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default WorkflowLibrary;