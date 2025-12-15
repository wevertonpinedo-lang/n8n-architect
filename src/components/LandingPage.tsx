import React, { useState } from 'react';
import { Zap, CheckCircle, ArrowRight, XCircle, ChevronDown, ChevronUp, Search, Menu, X, Brain, Layers, ShieldCheck, Copy, Terminal, MousePointerClick } from 'lucide-react';

interface LandingPageProps {
   onStart: () => void;
}

const faqs = [
   { q: "Ele funciona com n8n self-hosted?", a: "Sim. O JSON gerado é padrão nativo do n8n, compatível com qualquer versão (Cloud ou Self-hosted)." },
   { q: "Preciso saber programar?", a: "Não. Basta saber descrever o que você quer automatizar em português. A IA cuida dos códigos e expressões." },
   { q: "Os fluxos funcionam mesmo?", a: "Sim. A IA gera estruturas válidas e lógicas para importação direta. Em casos muito complexos, pode ser necessário apenas ajustar suas credenciais." },
   { q: "Posso usar em projetos de clientes?", a: "Sim, sem restrições. Você gera o fluxo e pode vender a automação para seus clientes livremente." },
   { q: "Posso usar em português?", a: "Sim. O N8N Architect é totalmente otimizado para comandos em português." }
];

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
   const [openFaq, setOpenFaq] = useState<number | null>(null);
   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

   return (
      <div className="flex flex-col min-h-screen w-full font-sans text-gray-900 bg-white selection:bg-blue-100 selection:text-blue-900">

         {/* --- NAVBAR --- */}


         {/* --- 1. HERO SECTION --- */}
         {/* --- 1. HERO SECTION --- */}
         <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-32 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 space-y-12">

               {/* 1. HORIZONTAL HEADLINE (Top) */}
               <div className="text-center max-w-5xl mx-auto">
                  <h1 className="text-4xl lg:text-7xl font-bold text-gray-900 leading-[1.1] tracking-tight">
                     Construa automações complexas no n8n em minutos — <span className="text-blue-600 block sm:inline">sem quebrar a cabeça</span>
                  </h1>
               </div>

               {/* 2. CONTENT GRID (Description left, Visual right) */}
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                  {/* Left Column: Copy & CTA */}
                  <div className="space-y-8 animate-fade-in-up order-2 lg:order-1">
                     <p className="text-xl text-gray-500 font-light leading-relaxed">
                        Pergunte o que você quer automatizar e receba o fluxo n8n pronto em JSON, pronto para importar e usar.
                     </p>

                     <ul className="space-y-3">
                        {[
                           "Fluxos n8n gerados por IA",
                           "Somente JSON válido (pronto para importar)",
                           "Economize horas de tentativa e erro",
                           "Ideal para iniciantes e avançados"
                        ].map((item, i) => (
                           <li key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                 <CheckCircle className="w-3.5 h-3.5" />
                              </div>
                              {item}
                           </li>
                        ))}
                     </ul>

                     <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button
                           onClick={onStart}
                           className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-lg shadow-xl shadow-blue-900/10 hover:shadow-2xl transition-all flex items-center justify-center gap-2 transform hover:-translate-y-1"
                        >
                           👉 Quero gerar meus fluxos agora
                        </button>
                     </div>

                     <div className="flex items-center gap-2 text-sm text-gray-400 pl-2">
                        <Zap className="w-4 h-4 text-yellow-500" /> Teste agora com acesso imediato
                     </div>
                  </div>

                  {/* Right Column: Visual */}
                  <div className="relative order-1 lg:order-2">
                     <div className="absolute top-10 right-0 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-3xl -z-10 mix-blend-multiply"></div>
                     <div className="absolute bottom-10 left-0 w-[400px] h-[400px] bg-purple-100/50 rounded-full blur-3xl -z-10 mix-blend-multiply"></div>

                     <div className="bg-white rounded-[2rem] border border-gray-100 shadow-2xl p-6 relative overflow-hidden transform rotate-1">
                        {/* Simulation of AI generating Layout */}
                        <div className="space-y-4">
                           <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl">
                              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white"><Brain className="w-4 h-4" /></div>
                              <div className="flex-1">
                                 <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse mb-2"></div>
                                 <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
                              </div>
                           </div>
                           <div className="p-6 bg-gray-900 rounded-2xl text-white font-mono text-xs overflow-hidden relative">
                              <div className="absolute top-2 right-2 flex gap-1">
                                 <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                 <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                 <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              </div>
                              <span className="text-pink-400">const</span> <span className="text-blue-300">workflow</span> = <span className="text-yellow-300">JSON</span>.<span className="text-blue-300">parse</span>(response);<br />
                              <span className="text-gray-500">// Gerando Nodes...</span><br />
                              <span className="text-green-400">✔ Webhook Configurado</span><br />
                              <span className="text-green-400">✔ OpenAI Agent Adicionado</span><br />
                              <span className="text-green-400">✔ Google Sheets Integrado</span><br />
                              <span className="text-green-400">✔ Slack Notification</span><br />
                           </div>
                           <div className="flex justify-center">
                              <button className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg animate-bounce">
                                 <Copy className="w-4 h-4" /> Copiar JSON
                              </button>
                           </div>
                        </div>
                     </div>
                  </div>

               </div>
            </div>
         </section>

         {/* --- 2. THE PROBLEM --- */}
         <section className="py-20 bg-gray-50">
            <div className="max-w-4xl mx-auto px-6 text-center">
               <h2 className="text-3xl font-bold text-gray-900 mb-12">Se você usa n8n, já passou por isso:</h2>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                  {[
                     "Você sabe O QUE quer automatizar, mas não sabe COMO montar o fluxo",
                     "Passa horas ajustando nodes, credenciais e expressões",
                     "Copia fluxos da internet que não funcionam",
                     "Documentação confusa e exemplos incompletos",
                     "Fluxos “quase prontos” que sempre quebram",
                     "Automação deveria economizar tempo — mas muitas vezes faz você perder ainda mais"
                  ].map((pain, i) => (
                     <div key={i} className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-gray-700 font-medium">{pain}</p>
                     </div>
                  ))}
               </div>
            </div>
         </section>

         {/* --- 3. THE SOLUTION --- */}
         <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-6">
               <div className="flex flex-col lg:flex-row items-center gap-16">
                  <div className="w-full lg:w-1/2">
                     <div className="bg-blue-50 rounded-[2.5rem] p-8 md:p-12 relative">
                        <div className="space-y-6">
                           <div className="bg-white p-6 rounded-2xl shadow-xl flex items-center gap-4">
                              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">1</div>
                              <div>
                                 <p className="text-xs text-gray-500 uppercase font-bold">Você pede</p>
                                 <p className="font-medium text-gray-900">"Quero um fluxo que salve leads do Facebook no Pipedrive."</p>
                              </div>
                           </div>
                           <div className="flex justify-center"><ArrowRight className="w-6 h-6 text-blue-300 transform rotate-90" /></div>
                           <div className="bg-gray-900 p-6 rounded-2xl shadow-xl text-white flex items-center gap-4">
                              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xl"><CheckCircle className="w-6 h-6" /></div>
                              <div>
                                 <p className="text-xs text-gray-400 uppercase font-bold">N8N Architect Entrega</p>
                                 <p className="font-mono text-green-400 text-sm">JSON Pronto: [Webhook] &rarr; [Pipedrive] &rarr; [Slack]</p>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="w-full lg:w-1/2 space-y-8">
                     <h2 className="text-4xl font-bold text-gray-900">O N8N Architect resolve isso em um <span className="text-blue-600">único passo</span>.</h2>
                     <p className="text-xl text-gray-500">
                        Você descreve sua automação em linguagem natural. <br />
                        O N8N Architect faz o resto.
                     </p>

                     <div className="space-y-4">
                        <h4 className="font-bold text-gray-900 uppercase text-sm tracking-widest">O QUE ELE ENTREGA:</h4>
                        <ul className="space-y-3">
                           {[
                              "🧠 Interpreta sua necessidade",
                              "🧱 Define a arquitetura do fluxo",
                              "🔗 Escolhe os nodes corretos",
                              "⚙️ Configura parâmetros",
                              "📦 Entrega APENAS o JSON final, limpo e funcional"
                           ].map((item, i) => (
                              <li key={i} className="flex items-center gap-3 text-gray-700">
                                 <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                 {item}
                              </li>
                           ))}
                        </ul>
                     </div>

                     <div className="pt-4">
                        <p className="text-lg font-bold text-blue-600 flex items-center gap-2">
                           👉 É só importar no n8n e rodar.
                        </p>
                     </div>
                  </div>
               </div>
            </div>
         </section>

         {/* --- 4. HOW IT WORKS --- */}
         <section id="how" className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-6 text-center">
               <h2 className="text-3xl font-bold text-gray-900 mb-16">Como Funciona</h2>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-lg relative">
                     <div className="w-12 h-12 bg-gray-900 text-white rounded-xl flex items-center justify-center text-xl font-bold mb-6 mx-auto">1</div>
                     <h3 className="text-xl font-bold mb-4">Descreva o que quer</h3>
                     <p className="text-gray-500 text-sm leading-relaxed mb-4">
                        "Quero capturar leads de um formulário, enriquecer dados e qualificar por IA."
                     </p>
                     <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-xs text-gray-400 font-mono text-left">
                        Prompt...
                     </div>
                  </div>

                  <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-lg relative">
                     <div className="absolute top-1/2 -left-4 w-8 h-8 bg-white border border-gray-100 rounded-full flex items-center justify-center shadow-md hidden md:flex text-gray-400 transform -translate-y-1/2">
                        <ArrowRight className="w-4 h-4" />
                     </div>
                     <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center text-xl font-bold mb-6 mx-auto">2</div>
                     <h3 className="text-xl font-bold mb-4">IA Cria o Fluxo</h3>
                     <ul className="text-gray-500 text-sm space-y-2 text-left bg-blue-50/50 p-4 rounded-xl">
                        <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-blue-500" /> Escolhe Nodes</li>
                        <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-blue-500" /> Faz Conexões</li>
                        <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-blue-500" /> Define Lógica</li>
                     </ul>
                  </div>

                  <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-lg relative">
                     <div className="absolute top-1/2 -left-4 w-8 h-8 bg-white border border-gray-100 rounded-full flex items-center justify-center shadow-md hidden md:flex text-gray-400 transform -translate-y-1/2">
                        <ArrowRight className="w-4 h-4" />
                     </div>
                     <div className="w-12 h-12 bg-green-500 text-white rounded-xl flex items-center justify-center text-xl font-bold mb-6 mx-auto">3</div>
                     <h3 className="text-xl font-bold mb-4">Copie o JSON</h3>
                     <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2 bg-gray-100 py-2 rounded-lg text-sm font-medium text-gray-700">
                           <Copy className="w-4 h-4" /> Copiar Código
                        </div>
                        <div className="flex items-center justify-center gap-2 bg-green-50 py-2 rounded-lg text-sm font-medium text-green-700">
                           <Terminal className="w-4 h-4" /> Importar no n8n
                        </div>
                     </div>
                     <p className="mt-4 text-gray-900 font-bold">Pronto!</p>
                  </div>
               </div>
            </div>
         </section>

         {/* --- 5. DIFERENCIAL --- */}
         <section id="comparison" className="py-20 bg-white">
            <div className="max-w-4xl mx-auto px-6">
               <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900">Por que o N8N Architect é diferente?</h2>
                  <p className="text-gray-500 mt-2">Comparado a perguntar no ChatGPT comum.</p>
               </div>

               <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-xl">
                  <table className="w-full">
                     <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                           <th className="py-4 px-6 text-left text-sm font-bold text-gray-500 uppercase tracking-wider w-1/2">ChatGPT Genérico</th>
                           <th className="py-4 px-6 text-left text-sm font-bold text-blue-600 uppercase tracking-wider w-1/2 bg-blue-50">N8N Architect</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                        {[
                           ["Respostas Explicativas", "Fluxos Prontos (Json)"],
                           ["Genérico", "Específico para n8n"],
                           ["Inconsistente", "Padrão Profissional"],
                           ["Precisa ajustar tudo", "Pronto para uso"],
                           ["Sem conhecimento de nodes", "Especialista em nodes"]
                        ].map((row, i) => (
                           <tr key={i} className="hover:bg-gray-50/50">
                              <td className="py-4 px-6 text-gray-500">{row[0]}</td>
                              <td className="py-4 px-6 font-bold text-gray-900 bg-blue-50/20 shadow-inner flex items-center gap-2">
                                 <CheckCircle className="w-4 h-4 text-green-500" /> {row[1]}
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
               <p className="text-center mt-8 text-lg font-medium text-gray-700">
                  Você não paga pela IA. <span className="text-blue-600 font-bold">Você paga pelo resultado pronto.</span>
               </p>
            </div>
         </section>

         {/* --- 6. TARGET AUDIENCE --- */}
         <section className="py-20 bg-gray-50">
            <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12">

               <div className="bg-white p-8 rounded-3xl shadow-lg border-t-4 border-green-500">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Esse produto é para você se:</h3>
                  <ul className="space-y-4">
                     {[
                        "Usa n8n (ou está começando)",
                        "Quer economizar tempo",
                        "Trabalha com automação",
                        "Faz freelas ou tem agência",
                        "Quer vender automações",
                        "Odeia ficar “quebrando fluxo”"
                     ].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 font-medium text-gray-700">
                           <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /> {item}
                        </li>
                     ))}
                  </ul>
               </div>

               <div className="bg-white p-8 rounded-3xl shadow-lg border-t-4 border-red-400 opacity-80 grayscale-[0.5] hover:grayscale-0 transition-all">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Não é para quem:</h3>
                  <ul className="space-y-4">
                     {[
                        "Não usa e não pretende usar n8n",
                        "Não quer automatizar nada",
                        "Prefere fazer tudo manualmente do zero",
                     ].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 font-medium text-gray-500">
                           <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" /> {item}
                        </li>
                     ))}
                  </ul>
               </div>

            </div>
         </section>

         {/* --- 7. PRICING --- */}
         <section id="pricing" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-6">
               <div className="text-center mb-16">
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">Investimento Simples</h2>
                  <p className="text-gray-500">Escolha o plano ideal para sua necessidade.</p>
               </div>

               <div className="flex flex-col lg:flex-row justify-center items-center lg:items-stretch gap-8 max-w-4xl mx-auto">

                  {/* Monthly Plan */}
                  <div className="w-full lg:w-1/2 bg-white p-10 rounded-[2.5rem] border border-gray-200 shadow-xl flex flex-col">
                     <h3 className="text-2xl font-bold text-gray-900">Plano Mensal</h3>
                     <div className="my-6">
                        <span className="text-5xl font-bold text-gray-900">R$ 29</span>
                        <span className="text-gray-500 font-medium text-xl">,90 / mês</span>
                     </div>

                     <ul className="space-y-4 mb-8 flex-1">
                        <li className="flex items-center gap-3 text-gray-700"><CheckCircle className="w-5 h-5 text-blue-500" /> Acesso total à IA</li>
                        <li className="flex items-center gap-3 text-gray-700"><CheckCircle className="w-5 h-5 text-blue-500" /> Fluxos ilimitados</li>
                        <li className="flex items-center gap-3 text-gray-700"><CheckCircle className="w-5 h-5 text-blue-500" /> Atualizações contínuas</li>
                        <li className="flex items-center gap-3 text-gray-700"><CheckCircle className="w-5 h-5 text-blue-500" /> Ideal para uso recorrente</li>
                     </ul>
                     <button onClick={onStart} className="w-full py-4 rounded-xl border-2 border-blue-600 text-blue-600 font-bold text-lg hover:bg-blue-50 transition-colors">
                        👉 Assinar agora
                     </button>
                  </div>

                  {/* Lifetime Plan */}
                  <div className="w-full lg:w-1/2 bg-gray-900 p-10 rounded-[2.5rem] shadow-2xl shadow-blue-900/30 text-white flex flex-col relative transform lg:scale-105 z-10 border border-gray-800">
                     <div className="absolute top-0 right-0 bg-yellow-400 text-gray-900 text-xs font-black px-4 py-2 rounded-bl-xl uppercase tracking-widest">
                        ⭐ Mais Vendido
                     </div>
                     <h3 className="text-2xl font-bold text-white">Vitalício</h3>
                     <div className="my-6">
                        <span className="text-6xl font-bold text-white">R$ 149</span>
                        <span className="text-gray-400 font-medium text-xl">,90</span>
                     </div>
                     <p className="text-gray-400 text-sm mb-6 uppercase tracking-widest font-bold">Pagamento Único</p>

                     <ul className="space-y-4 mb-8 flex-1">
                        <li className="flex items-center gap-3 text-gray-200"><CheckCircle className="w-5 h-5 text-green-400" /> Acesso Vitalício</li>
                        <li className="flex items-center gap-3 text-gray-200"><CheckCircle className="w-5 h-5 text-green-400" /> Sem mensalidade</li>
                        <li className="flex items-center gap-3 text-gray-200"><CheckCircle className="w-5 h-5 text-green-400" /> Todas atualizações futuras</li>
                        <li className="flex items-center gap-3 text-gray-200"><CheckCircle className="w-5 h-5 text-green-400" /> Melhor custo-benefício</li>
                     </ul>
                     <button onClick={onStart} className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-lg shadow-lg transition-transform hover:-translate-y-1">
                        👉 Quero acesso vitalício
                     </button>
                  </div>

               </div>
            </div>
         </section>

         {/* --- 8. GUARANTEE --- */}
         <section className="py-16 bg-blue-50">
            <div className="max-w-3xl mx-auto px-6 text-center">
               <ShieldCheck className="w-16 h-16 text-blue-600 mx-auto mb-6" />
               <h2 className="text-3xl font-bold text-gray-900 mb-4">Risco Zero</h2>
               <p className="text-xl text-gray-600 leading-relaxed">
                  Se o N8N Architect não te ajudar a criar automações melhores,<br />
                  você pode cancelar ou pedir reembolso sem burocracia.
               </p>
            </div>
         </section>

         {/* --- 9. FAQ --- */}
         <section id="faq" className="py-24 bg-white">
            <div className="max-w-3xl mx-auto px-6">
               <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Dúvidas Frequentes (FAQ)</h2>
               <div className="space-y-4">
                  {faqs.map((faq, index) => (
                     <div key={index} className="border border-gray-200 rounded-2xl overflow-hidden hover:border-blue-200 transition-colors">
                        <button
                           onClick={() => setOpenFaq(openFaq === index ? null : index)}
                           className="w-full flex items-center justify-between p-6 text-left bg-white"
                        >
                           <span className="font-bold text-gray-900 flex items-center gap-3">
                              <span className="text-blue-600 font-black text-lg">?</span> {faq.q}
                           </span>
                           {openFaq === index ? <ChevronUp className="w-5 h-5 text-blue-600" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                        </button>
                        {openFaq === index && (
                           <div className="px-6 pb-6 text-gray-600 leading-relaxed bg-gray-50 border-t border-gray-100 pt-4 pl-12">
                              {faq.a}
                           </div>
                        )}
                     </div>
                  ))}
               </div>
            </div>
         </section>

         {/* --- 10. FINAL CTA --- */}
         <section className="py-24 bg-gray-900 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            <div className="max-w-4xl mx-auto px-6 relative z-10">
               <h2 className="text-4xl md:text-5xl font-bold mb-8">Pare de perder tempo montando fluxos do zero</h2>
               <p className="text-xl text-gray-400 mb-10">Gere automações profissionais em minutos com o N8N Architect.</p>

               <div className="flex flex-col sm:flex-row justify-center gap-6">
                  <button onClick={onStart} className="px-8 py-4 bg-white text-gray-900 hover:bg-gray-100 rounded-full font-bold text-lg transition-colors">
                     Assinar agora
                  </button>
                  <button onClick={onStart} className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-lg shadow-xl shadow-blue-900/50 transition-colors">
                     👉 Quero acesso vitalício
                  </button>
               </div>
            </div>
         </section>

         {/* --- FOOTER --- */}
         <footer className="bg-gray-50 border-t border-gray-200 py-16">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
               <div className="flex flex-col items-center md:items-start gap-4">
                  <div className="flex items-center gap-2">
                     {/* Minimalist Icon */}
                     <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                           <path d="M12 2L2 7l10 5 10-5-10-5z" />
                           <path d="M2 17l10 5 10-5" />
                           <path d="M2 12l10 5 10-5" />
                        </svg>
                     </div>
                     <span className="text-base font-bold text-gray-900">N8N <span className="text-blue-600">Architect</span></span>
                  </div>
                  <p className="text-gray-500 text-sm">Made for n8n users.</p>
               </div>

               <div className="text-sm text-gray-400">
                  &copy; {new Date().getFullYear()} N8N Architect. Todos os direitos reservados.
               </div>
            </div>
         </footer>

      </div>
   );
};

export default LandingPage;