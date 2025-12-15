import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShieldCheck, Lock, CreditCard, Smartphone, CheckCircle2, Gift, Shield, Loader2, Copy, AlertTriangle } from 'lucide-react';
import { NexusProduct, NexusSettings, PaymentRequest } from '../types';
import { createPayment } from '../services/backend';

interface NexusCheckoutProps {
   product: NexusProduct;
   settings?: NexusSettings;
   onBack: () => void;
}

declare global {
   interface Window {
      MercadoPago: any;
      fbq: any;
      gtag: any;
   }
}

const NexusCheckout: React.FC<NexusCheckoutProps> = ({ product, settings, onBack }) => {
   const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'pix'>('credit_card');
   const [orderBumpSelected, setOrderBumpSelected] = useState(false);
   const [isProcessing, setIsProcessing] = useState(false);
   const [isSuccess, setIsSuccess] = useState(false);
   const [errorMsg, setErrorMsg] = useState<string | null>(null);

   // Pix Specific State
   const [pixQrCode, setPixQrCode] = useState<string | null>(null);
   const [pixCopyPaste, setPixCopyPaste] = useState<string | null>(null);

   // State for Form Inputs
   const [formData, setFormData] = useState({
      name: '',
      email: '',
      phone: '',
      cardNumber: '',
      cardName: '',
      cardExpiry: '',
      cardCvv: '',
      docNumber: '', // CPF is critical for MP
      installments: 1
   });

   // Dynamic values
   const bumpPrice = product.orderBumpPrice || 27.90;
   const bumpName = product.orderBumpName || "Pack Secreto de Templates";
   const total = product.price + (orderBumpSelected ? bumpPrice : 0);

   // INITIALIZE MP SDK
   useEffect(() => {
      if (settings?.mercadoPagoPublicKey && window.MercadoPago) {
         // Initialize SDK only once
         const mp = new window.MercadoPago(settings.mercadoPagoPublicKey);
         console.log("✅ SDK Mercado Pago Inicializado");
      }
   }, [settings]);

   // TRACKING SCRIPTS INJECTION
   const injectTrackingScripts = () => {
      if (!settings) return;

      // Facebook
      if (settings.facebookPixelId && !window.fbq) {
         const script = document.createElement('script');
         script.innerHTML = `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${settings.facebookPixelId}');
          fbq('track', 'PageView');
        `;
         document.head.appendChild(script);
      }
      // Google
      if (settings.googleAnalyticsId && !window.gtag) {
         const script1 = document.createElement('script');
         script1.async = true;
         script1.src = `https://www.googletagmanager.com/gtag/js?id=${settings.googleAnalyticsId}`;
         document.head.appendChild(script1);
         const script2 = document.createElement('script');
         script2.innerHTML = `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${settings.googleAnalyticsId}');
        `;
         document.head.appendChild(script2);
      }
   };

   const handlePayment = async () => {
      setErrorMsg(null);
      setIsProcessing(true);
      injectTrackingScripts();

      try {
         if (!settings?.mercadoPagoPublicKey || !settings?.mercadoPagoAccessToken) {
            throw new Error("Chaves do Mercado Pago não configuradas no Admin.");
         }

         if (!formData.email || !formData.name || !formData.docNumber) {
            throw new Error("Preencha Nome, Email e CPF para continuar.");
         }

         let token = undefined;

         // 1. IF CREDIT CARD: GENERATE TOKEN (FRONTEND SIDE)
         if (paymentMethod === 'credit_card') {
            const mp = new window.MercadoPago(settings.mercadoPagoPublicKey);

            // Extract Month/Year
            const [expMonth, expYear] = formData.cardExpiry.split('/');
            if (!expMonth || !expYear) throw new Error("Data de validade inválida (Use MM/AA)");

            const cardToken = await mp.createCardToken({
               cardNumber: formData.cardNumber.replace(/\s/g, ''),
               cardholderName: formData.cardName,
               cardExpirationMonth: expMonth,
               cardExpirationYear: "20" + expYear, // Assuming 20xx
               securityCode: formData.cardCvv,
               identification: {
                  type: "CPF",
                  number: formData.docNumber.replace(/\D/g, '')
               }
            });

            if (!cardToken || !cardToken.id) {
               throw new Error("Erro ao validar cartão. Verifique os dados.");
            }
            token = cardToken.id;
         }

         // 2. PREPARE PAYLOAD FOR BACKEND
         const payload: PaymentRequest = {
            transaction_amount: Number(total.toFixed(2)),
            token: token,
            description: product.name + (orderBumpSelected ? " + Bump" : ""),
            installments: Number(formData.installments),
            payment_method_id: paymentMethod === 'credit_card' ? 'master' : 'pix', // Simple fallback, real MP needs guessing
            payer: {
               email: formData.email,
               first_name: formData.name.split(' ')[0],
               last_name: formData.name.split(' ').slice(1).join(' '),
               identification: {
                  type: "CPF",
                  number: formData.docNumber.replace(/\D/g, '')
               }
            }
         };

         // 3. CALL BACKEND SERVICE (API REAL)
         const result = await processBackendPayment(payload, settings);

         if (result.status === 'rejected') {
            throw new Error(`Pagamento recusado: ${result.status_detail}`);
         }

         // 4. HANDLE SUCCESS TYPES
         if (paymentMethod === 'pix') {
            // Show QR Code
            if (result.point_of_interaction?.transaction_data) {
               setPixCopyPaste(result.point_of_interaction.transaction_data.qr_code || "");
               setPixQrCode(result.point_of_interaction.transaction_data.qr_code_base64 || "");
               setIsSuccess(true); // Move to Success/Pix Screen
            } else {
               throw new Error("QR Code Pix não retornado pela API.");
            }
         } else {
            // Card Approved
            setIsSuccess(true);
            fireTrackingEvents();
         }

      } catch (err: any) {
         console.error(err);
         setErrorMsg(err.message || "Erro ao processar pagamento.");
      } finally {
         setIsProcessing(false);
      }
   };

   const fireTrackingEvents = () => {
      if (settings?.facebookPixelId && window.fbq) {
         window.fbq('track', 'Purchase', { value: total, currency: 'BRL', content_name: product.name });
      }
      if (settings?.googleAnalyticsId && window.gtag) {
         window.gtag('event', 'purchase', { transaction_id: "T_" + Date.now(), value: total, currency: "BRL" });
      }
   };

   // SUCCESS SCREEN (Dynamic for Pix vs Card)
   if (isSuccess) {
      return (
         <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-100 animate-in zoom-in duration-300">

               {paymentMethod === 'pix' ? (
                  <>
                     <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Smartphone className="w-8 h-8 text-green-600" />
                     </div>
                     <h2 className="text-xl font-bold text-gray-900 mb-2">Escaneie o QR Code</h2>
                     <p className="text-sm text-gray-500 mb-6">Abra o app do seu banco e pague via Pix.</p>

                     {pixQrCode && (
                        <div className="flex justify-center mb-6">
                           <img src={`data:image/png;base64,${pixQrCode}`} alt="Pix QR Code" className="w-48 h-48 border rounded-lg" />
                        </div>
                     )}

                     <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-6 relative group">
                        <p className="text-[10px] text-gray-400 font-mono break-all text-left line-clamp-3">
                           {pixCopyPaste}
                        </p>
                        <button
                           onClick={() => { navigator.clipboard.writeText(pixCopyPaste || ""); alert("Copiado!"); }}
                           className="absolute right-2 top-2 bg-white shadow-sm border p-1.5 rounded hover:bg-gray-100"
                        >
                           <Copy className="w-4 h-4 text-purple-600" />
                        </button>
                     </div>

                     <button onClick={onBack} className="w-full py-3 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors">
                        Já realizei o pagamento
                     </button>
                  </>
               ) : (
                  <>
                     <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                     </div>
                     <h2 className="text-2xl font-bold text-gray-900 mb-2">Pagamento Aprovado!</h2>
                     <p className="text-gray-500 mb-8">
                        Seu acesso ao <strong>{product.name}</strong> foi enviado para o seu e-mail <b>{formData.email}</b>.
                     </p>
                     <button onClick={onBack} className="w-full py-3 bg-[#2F9E44] text-white font-bold rounded-xl hover:bg-[#288b3c] transition-colors">
                        Voltar ao Painel
                     </button>
                  </>
               )}
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-gray-50 text-gray-800 font-sans pb-12 relative">

         {/* Processing Overlay */}
         {isProcessing && (
            <div className="absolute inset-0 bg-white/80 z-50 flex flex-col items-center justify-center backdrop-blur-sm animate-in fade-in">
               <Loader2 className="w-12 h-12 text-[#2F9E44] animate-spin mb-4" />
               <h3 className="text-xl font-bold text-gray-800">Processando...</h3>
               <p className="text-gray-500 text-sm">Validando transação segura</p>
            </div>
         )}

         {/* Header */}
         <div className="bg-white border-b border-gray-200 h-20 flex items-center justify-center sticky top-0 z-20 shadow-sm">
            <div className="max-w-6xl w-full px-6 flex justify-between items-center">
               <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#2F9E44] rounded-lg flex items-center justify-center text-white font-bold text-lg">N</div>
                  <span className="font-bold text-xl tracking-tight text-gray-900">NexusPay</span>
               </div>
               <div className="flex items-center gap-1.5 text-gray-500 text-xs font-medium">
                  <Lock className="w-3 h-3" /> COMPRA 100% SEGURA
               </div>
            </div>
         </div>

         {/* Back Button */}
         <div className="max-w-6xl mx-auto px-6 mt-6">
            <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-gray-700 text-sm transition-colors mb-4">
               <ArrowLeft className="w-4 h-4" /> Voltar ao Admin
            </button>

            {/* Error Message Display */}
            {errorMsg && (
               <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2 text-sm font-medium animate-in slide-in-from-top-2">
                  <AlertTriangle className="w-5 h-5" />
                  {errorMsg}
               </div>
            )}
         </div>

         <div className="max-w-6xl mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* LEFT COLUMN - INPUTS */}
            <div className="lg:col-span-7 space-y-6 animate-fade-in">

               {/* Section 1: Personal Data */}
               <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100">
                  <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-3">
                     <span className="w-7 h-7 bg-[#2F9E44] text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                     Dados Pessoais
                  </h2>
                  <div className="space-y-4">
                     <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-600 ml-1">Nome Completo</label>
                        <input
                           type="text"
                           placeholder="Digite seu nome completo"
                           value={formData.name}
                           onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                           className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#2F9E44] focus:border-[#2F9E44] outline-none transition-all placeholder-gray-400"
                        />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                           <label className="text-xs font-semibold text-gray-600 ml-1">E-mail</label>
                           <input
                              type="email"
                              placeholder="seu@email.com"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#2F9E44] focus:border-[#2F9E44] outline-none transition-all placeholder-gray-400"
                           />
                        </div>
                        <div className="space-y-1">
                           <label className="text-xs font-semibold text-gray-600 ml-1">CPF</label>
                           <input
                              type="text"
                              placeholder="000.000.000-00"
                              value={formData.docNumber}
                              onChange={(e) => setFormData({ ...formData, docNumber: e.target.value })}
                              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#2F9E44] focus:border-[#2F9E44] outline-none transition-all placeholder-gray-400"
                           />
                        </div>
                     </div>
                     <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-600 ml-1">Celular</label>
                        <input
                           type="tel"
                           placeholder="(00) 00000-0000"
                           value={formData.phone}
                           onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                           className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#2F9E44] focus:border-[#2F9E44] outline-none transition-all placeholder-gray-400"
                        />
                     </div>
                  </div>
               </div>

               {/* Section 2: Payment */}
               <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100">
                  <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-3">
                     <span className="w-7 h-7 bg-[#2F9E44] text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                     Pagamento
                  </h2>

                  {/* Payment Tabs */}
                  <div className="flex gap-3 mb-6">
                     <button
                        onClick={() => setPaymentMethod('credit_card')}
                        className={`flex-1 py-3 border rounded-lg flex items-center justify-center gap-2 transition-all ${paymentMethod === 'credit_card' ? 'border-[#2F9E44] bg-[#2F9E44]/5 text-[#2F9E44]' : 'border-gray-200 hover:bg-gray-50 text-gray-500'}`}
                     >
                        <CreditCard className="w-5 h-5" />
                        <span className="font-semibold text-sm">Cartão</span>
                     </button>
                     <button
                        onClick={() => setPaymentMethod('pix')}
                        className={`flex-1 py-3 border rounded-lg flex items-center justify-center gap-2 transition-all ${paymentMethod === 'pix' ? 'border-[#2F9E44] bg-[#2F9E44]/5 text-[#2F9E44]' : 'border-gray-200 hover:bg-gray-50 text-gray-500'}`}
                     >
                        <Smartphone className="w-5 h-5" />
                        <span className="font-semibold text-sm">PIX</span>
                     </button>
                  </div>

                  {/* Credit Card Form */}
                  {paymentMethod === 'credit_card' && (
                     <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                        <div className="space-y-1">
                           <label className="text-xs font-semibold text-gray-600 ml-1">Número do Cartão</label>
                           <div className="relative">
                              <input
                                 type="text"
                                 placeholder="0000 0000 0000 0000"
                                 value={formData.cardNumber}
                                 onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                                 className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 pl-10 text-sm focus:ring-2 focus:ring-[#2F9E44] focus:border-[#2F9E44] outline-none transition-all"
                              />
                              <CreditCard className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                           </div>
                        </div>

                        <div className="space-y-1">
                           <label className="text-xs font-semibold text-gray-600 ml-1">Nome impresso no cartão</label>
                           <input
                              type="text"
                              placeholder="Como no cartão"
                              value={formData.cardName}
                              onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
                              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#2F9E44] focus:border-[#2F9E44] outline-none transition-all"
                           />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1">
                              <label className="text-xs font-semibold text-gray-600 ml-1">Validade</label>
                              <input
                                 type="text"
                                 placeholder="MM/AA"
                                 value={formData.cardExpiry}
                                 onChange={(e) => setFormData({ ...formData, cardExpiry: e.target.value })}
                                 className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#2F9E44] focus:border-[#2F9E44] outline-none transition-all"
                              />
                           </div>
                           <div className="space-y-1">
                              <label className="text-xs font-semibold text-gray-600 ml-1">CVV</label>
                              <input
                                 type="text"
                                 placeholder="123"
                                 value={formData.cardCvv}
                                 onChange={(e) => setFormData({ ...formData, cardCvv: e.target.value })}
                                 className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#2F9E44] focus:border-[#2F9E44] outline-none transition-all"
                              />
                           </div>
                        </div>

                        <div className="space-y-1">
                           <label className="text-xs font-semibold text-gray-600 ml-1">Parcelamento</label>
                           <select
                              value={formData.installments}
                              onChange={(e) => setFormData({ ...formData, installments: parseInt(e.target.value) })}
                              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#2F9E44] focus:border-[#2F9E44] outline-none transition-all text-gray-700"
                           >
                              <option value={1}>1x de R$ {total.toFixed(2)} (Sem juros)</option>
                              <option value={2}>2x de R$ {(total / 2).toFixed(2)}</option>
                              <option value={3}>3x de R$ {(total / 3).toFixed(2)}</option>
                           </select>
                        </div>
                     </div>
                  )}

                  {/* PIX Info */}
                  {paymentMethod === 'pix' && (
                     <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200 animate-in fade-in slide-in-from-top-2">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-gray-100">
                           <Smartphone className="w-6 h-6 text-[#2F9E44]" />
                        </div>
                        <h3 className="font-bold text-gray-800 text-sm mb-1">Aprovação Imediata</h3>
                        <p className="text-gray-500 text-xs">O código QR Code será gerado após clicar em "Pagar Agora".</p>
                     </div>
                  )}
               </div>
            </div>

            {/* RIGHT COLUMN - SUMMARY */}
            <div className="lg:col-span-5 space-y-6">
               <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 sticky top-28">
                  {/* Product Header */}
                  <div className="flex gap-4 mb-6 pb-6 border-b border-gray-100">
                     <div className="w-16 h-16 bg-gray-50 rounded-lg flex-shrink-0 flex items-center justify-center border border-gray-100">
                        <Gift className="w-8 h-8 text-gray-400" />
                     </div>
                     <div>
                        <h3 className="font-bold text-gray-900 text-base leading-tight mb-1">{product.name}</h3>
                        <div className="flex items-center gap-1">
                           <div className="flex text-yellow-400">
                              {"★★★★★".split("").map((s, i) => <span key={i} className="text-xs">{s}</span>)}
                           </div>
                           <span className="text-[10px] text-gray-400">(4.9/5.0)</span>
                        </div>
                     </div>
                  </div>

                  {/* Price Details */}
                  <div className="space-y-2 mb-6">
                     <div className="flex justify-between text-gray-500 text-sm">
                        <span>Preço</span>
                        <span>R$ {product.price.toFixed(2)}</span>
                     </div>
                     {product.orderBumpActive && orderBumpSelected && (
                        <div className="flex justify-between text-[#2F9E44] text-sm font-medium animate-in slide-in-from-top-1">
                           <span>+ {bumpName}</span>
                           <span>R$ {bumpPrice.toFixed(2)}</span>
                        </div>
                     )}
                     <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-4">
                        <span className="text-gray-800 font-bold">Total</span>
                        <span className="text-2xl font-extrabold text-[#2F9E44]">R$ {total.toFixed(2)}</span>
                     </div>
                  </div>

                  {/* ORDER BUMP */}
                  {product.orderBumpActive && (
                     <div className={`p-4 rounded-lg border-2 border-dashed transition-all cursor-pointer mb-6 relative overflow-hidden group ${orderBumpSelected ? 'border-[#2F9E44] bg-[#2F9E44]/5' : 'border-gray-300 hover:border-gray-400'}`}
                        onClick={() => setOrderBumpSelected(!orderBumpSelected)}
                     >
                        {orderBumpSelected && <div className="absolute top-0 right-0 w-8 h-8 bg-[#2F9E44] text-white flex items-center justify-center rounded-bl-xl"><CheckCircle2 className="w-4 h-4" /></div>}
                        <div className="flex items-start gap-3">
                           <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${orderBumpSelected ? 'bg-[#2F9E44] border-[#2F9E44]' : 'bg-white border-gray-300'}`}>
                              {orderBumpSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                           </div>
                           <div>
                              <p className="text-sm font-bold text-gray-900 leading-tight">
                                 <span className="text-red-500 mr-1 animate-pulse">OFERTA ESPECIAL:</span>
                                 Adicionar {bumpName}
                              </p>
                              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                 Leve agora por apenas <strong className="text-gray-800">R$ {bumpPrice.toFixed(2)}</strong>.
                              </p>
                           </div>
                        </div>
                     </div>
                  )}

                  {/* CTA */}
                  <button
                     onClick={handlePayment}
                     disabled={isProcessing}
                     className="w-full bg-[#2F9E44] hover:bg-[#2b8a3e] text-white font-bold py-4 rounded-lg text-lg shadow-lg shadow-green-600/10 hover:shadow-green-600/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                     {paymentMethod === 'pix' ? 'GERAR PIX AGORA' : 'PAGAR AGORA'}
                  </button>

                  {/* Trust Badges */}
                  <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-gray-400">
                     <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                        <Lock className="w-3 h-3" /> Pagamento Seguro
                     </div>
                     <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                        <ShieldCheck className="w-3 h-3" /> Garantia de 7 Dias
                     </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-100">
                     <p className="text-[10px] text-gray-400 text-center mt-3">
                        Essa compra aparecerá no seu extrato como <span className="uppercase font-bold">NexusPay*Produtos</span>
                     </p>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default NexusCheckout;