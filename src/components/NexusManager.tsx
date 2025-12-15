import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, ShoppingBag, Users, CreditCard, Settings,
  LogOut, TrendingUp, DollarSign, Package, Activity,
  Search, Bell, Plus, ExternalLink, Bot, BarChart3,
  CheckCircle2, XCircle, ChevronRight, Wallet, Globe, ShieldCheck,
  ArrowLeft, Save, Image as ImageIcon, Zap, Lock, Facebook, Target
} from 'lucide-react';
import { NexusProduct, NexusSale, NexusCustomer, NexusSettings } from '../types';
import ChatInterface from './ChatInterface';
import NexusCheckout from './NexusCheckout';

// --- MOCK DATA (Initial State) ---
const INITIAL_PRODUCTS: NexusProduct[] = [
  {
    id: '1',
    name: 'Pack Automação WhatsApp',
    price: 97.00,
    type: 'one_time',
    sales: 124,
    revenue: 12028.00,
    active: true,
    orderBumpActive: true,
    orderBumpName: 'Acesso Vitalício à Comunidade',
    orderBumpPrice: 29.90
  },
  {
    id: '2',
    name: 'Mentoria N8N Pro',
    price: 997.00,
    type: 'one_time',
    sales: 12,
    revenue: 11964.00,
    active: true,
    orderBumpActive: false
  },
  {
    id: '3',
    name: 'Comunidade Nexus (Mensal)',
    price: 29.90,
    type: 'subscription',
    sales: 450,
    revenue: 13455.00,
    active: true,
    orderBumpActive: false
  },
];

const MOCK_SALES: NexusSale[] = [
  { id: 'S-9921', customerName: 'Roberto Silva', customerEmail: 'roberto@email.com', productName: 'Pack Automação WhatsApp', amount: 97.00, date: new Date(), status: 'paid', paymentMethod: 'pix' },
  { id: 'S-9920', customerName: 'Ana Souza', customerEmail: 'ana@email.com', productName: 'Comunidade Nexus', amount: 29.90, date: new Date(), status: 'paid', paymentMethod: 'credit_card' },
  { id: 'S-9919', customerName: 'Carlos Lima', customerEmail: 'carlos@email.com', productName: 'Mentoria N8N Pro', amount: 997.00, date: new Date(Date.now() - 86400000), status: 'pending', paymentMethod: 'boleto' },
  { id: 'S-9918', customerName: 'Julia M.', customerEmail: 'julia@email.com', productName: 'Pack Automação WhatsApp', amount: 97.00, date: new Date(Date.now() - 100000000), status: 'refunded', paymentMethod: 'credit_card' },
];

type NexusView = 'login' | 'dashboard' | 'products' | 'create_product' | 'sales' | 'customers' | 'settings' | 'ai_agent' | 'checkout_preview';

interface NexusManagerProps {
  onExit: () => void;
}

const NexusManager: React.FC<NexusManagerProps> = ({ onExit }) => {
  const [currentView, setCurrentView] = useState<NexusView>('login');

  // State for Products
  const [products, setProducts] = useState<NexusProduct[]>(INITIAL_PRODUCTS);
  const [selectedProductForCheckout, setSelectedProductForCheckout] = useState<NexusProduct | null>(null);

  // State for Global Settings (Integration) - Initialized with default values
  const [settings, setSettings] = useState<NexusSettings>({
    mercadoPagoPublicKey: '',
    mercadoPagoAccessToken: '',
    facebookPixelId: '',
    googleAnalyticsId: ''
  });

  const [settingsForm, setSettingsForm] = useState<NexusSettings>(settings);

  // LOAD SETTINGS FROM LOCAL STORAGE ON MOUNT
  useEffect(() => {
    const savedSettings = localStorage.getItem('nexus_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
        setSettingsForm(parsed);
      } catch (e) {
        console.error("Erro ao carregar configurações", e);
      }
    }
  }, []);

  // State for New Product Form
  const [newProductForm, setNewProductForm] = useState({
    name: '',
    price: '',
    type: 'one_time' as 'one_time' | 'subscription',
    description: '',
    // Order Bump Fields
    enableBump: false,
    bumpName: '',
    bumpPrice: ''
  });

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newProductForm.name || !newProductForm.price) return;

    const newProduct: NexusProduct = {
      id: Date.now().toString(),
      name: newProductForm.name,
      price: parseFloat(newProductForm.price.replace(',', '.')), // Handle comma decimals
      type: newProductForm.type,
      sales: 0,
      revenue: 0,
      active: true,
      // Add Order Bump Data if enabled
      orderBumpActive: newProductForm.enableBump,
      orderBumpName: newProductForm.enableBump ? newProductForm.bumpName : undefined,
      orderBumpPrice: newProductForm.enableBump ? parseFloat(newProductForm.bumpPrice.replace(',', '.')) : undefined,
    };

    setProducts([newProduct, ...products]); // Add to top of list

    // Reset form and go back
    setNewProductForm({
      name: '', price: '', type: 'one_time', description: '',
      enableBump: false, bumpName: '', bumpPrice: ''
    });
    setCurrentView('products');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    // Update State
    setSettings(settingsForm);
    // Persist to Storage
    localStorage.setItem('nexus_settings', JSON.stringify(settingsForm));

    // Visual Feedback
    alert("✅ Configurações salvas e aplicadas com sucesso!");
  };

  // AUTH SCREEN
  if (currentView === 'login') {
    return (
      <div className="min-h-screen bg-[#05050A] flex items-center justify-center p-4 relative overflow-hidden font-sans text-white">
        {/* Background Effects */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px]"></div>

        <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-white rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg overflow-hidden">
              <img src="/logo.jpg" alt="N8N Architect" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">N8N <span className="text-cyan-400">Architect</span></h1>
            <p className="text-gray-400 text-sm mt-2">Dashboard Administrativo Seguro</p>
          </div>

          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setCurrentView('dashboard'); }}>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">E-mail</label>
              <input type="email" defaultValue="admin@nexus.com" className="w-full bg-[#0B0B15] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all mt-1" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Senha</label>
              <input type="password" defaultValue="123456" className="w-full bg-[#0B0B15] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all mt-1" />
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-cyan-900/20 transition-all transform hover:-translate-y-0.5 mt-4">
              Acessar Painel
            </button>
          </form>

          <button onClick={onExit} className="w-full text-center text-gray-500 text-sm mt-6 hover:text-white transition-colors">
            Voltar ao site principal
          </button>
        </div>
      </div>
    );
  }

  // CHECKOUT PREVIEW MODE
  if (currentView === 'checkout_preview' && selectedProductForCheckout) {
    return (
      <NexusCheckout
        product={selectedProductForCheckout}
        settings={settings}
        onBack={() => setCurrentView('products')}
      />
    );
  }

  // MAIN DASHBOARD LAYOUT
  return (
    <div className="flex h-screen bg-[#05050A] text-white font-sans overflow-hidden">

      {/* SIDEBAR */}
      <aside className="w-64 bg-[#0B0B15] border-r border-white/5 flex flex-col hidden md:flex">
        <div className="p-6 flex items-center gap-3">
          <img src="/logo.jpg" alt="N8N Architect" className="h-8 w-auto rounded" />
          <span className="font-bold text-lg tracking-tight">N8N Architect</span>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Visão Geral' },
            { id: 'products', icon: Package, label: 'Produtos' },
            { id: 'sales', icon: ShoppingBag, label: 'Vendas' },
            { id: 'customers', icon: Users, label: 'Clientes' },
            { id: 'ai_agent', icon: Bot, label: 'IA Vendedora', highlight: true },
            { id: 'settings', icon: Settings, label: 'Configurações' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as NexusView)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${currentView === item.id || (item.id === 'products' && currentView === 'create_product')
                ? 'bg-white/10 text-white shadow-inner border border-white/5'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
                } ${item.highlight ? 'text-cyan-400 hover:text-cyan-300' : ''}`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
              {item.highlight && <div className="ml-auto w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button onClick={onExit} className="w-full flex items-center gap-2 text-gray-500 hover:text-red-400 px-4 py-2 transition-colors text-sm font-medium">
            <LogOut className="w-4 h-4" /> Sair do Sistema
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Background Ambient Light */}
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none"></div>

        {/* HEADER */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#05050A]/80 backdrop-blur-md z-10">
          <h2 className="text-xl font-semibold capitalize text-gray-200">
            {currentView === 'ai_agent' ? 'N8N Architect AI' :
              currentView === 'create_product' ? 'Novo Produto' :
                currentView === 'settings' ? 'Integrações' : currentView}
          </h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Bell className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-[#05050A]"></div>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-700 to-gray-600 border border-white/10"></div>
          </div>
        </header>

        {/* CONTENT SCROLLABLE AREA */}
        <div className="flex-1 overflow-y-auto p-8 relative z-0 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">

          {/* --- DASHBOARD VIEW --- */}
          {currentView === 'dashboard' && (
            <div className="space-y-8 animate-fade-in">
              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Faturamento Total', value: 'R$ 42.890,00', change: '+12%', icon: Wallet, color: 'text-green-400', bg: 'bg-green-500/10' },
                  { label: 'Vendas Hoje', value: 'R$ 1.240,00', change: '+5%', icon: TrendingUp, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                  { label: 'Ticket Médio', value: 'R$ 89,90', change: '-2%', icon: BarChart3, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                  { label: 'Clientes Ativos', value: '1,240', change: '+8%', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                ].map((stat, i) => (
                  <div key={i} className="bg-[#0B0B15] border border-white/5 p-6 rounded-2xl hover:border-white/10 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full bg-white/5 ${stat.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                        {stat.change}
                      </span>
                    </div>
                    <h3 className="text-gray-400 text-sm font-medium">{stat.label}</h3>
                    <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Chart & Recent Sales Split */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Mock Chart Area */}
                <div className="lg:col-span-2 bg-[#0B0B15] border border-white/5 rounded-2xl p-6 min-h-[300px] flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg">Receita Recorrente</h3>
                    <select className="bg-white/5 border border-white/10 text-xs rounded-lg px-3 py-1.5 text-gray-300 outline-none">
                      <option>Últimos 30 dias</option>
                      <option>Este Ano</option>
                    </select>
                  </div>
                  <div className="flex-1 flex items-end gap-2 px-2 pb-2">
                    {[35, 45, 30, 60, 75, 50, 65, 80, 70, 90, 85, 95].map((h, i) => (
                      <div key={i} className="flex-1 bg-white/5 hover:bg-cyan-500/50 transition-all rounded-t-sm relative group" style={{ height: `${h}%` }}>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          R$ {h * 100}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-500 px-2">
                    <span>Jan</span><span>Dev</span>
                  </div>
                </div>

                {/* Recent Sales List */}
                <div className="bg-[#0B0B15] border border-white/5 rounded-2xl p-6 flex flex-col">
                  <h3 className="font-bold text-lg mb-4">Últimas Vendas</h3>
                  <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {MOCK_SALES.map((sale) => (
                      <div key={sale.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-transparent hover:border-white/10 transition-all">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${sale.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                            sale.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                            {sale.customerName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{sale.customerName}</p>
                            <p className="text-xs text-gray-400">{sale.productName}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-white">R$ {sale.amount}</p>
                          <p className="text-[10px] text-gray-500">{sale.paymentMethod}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setCurrentView('sales')} className="w-full mt-4 py-2 text-xs font-bold text-cyan-400 border border-cyan-900/50 bg-cyan-900/10 rounded-lg hover:bg-cyan-900/30 transition-all">
                    Ver Todas
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* --- PRODUCTS VIEW --- */}
          {currentView === 'products' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <p className="text-gray-400">Gerencie seu catálogo de infoprodutos.</p>
                <button
                  onClick={() => setCurrentView('create_product')}
                  className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-cyan-900/20 transition-all"
                >
                  <Plus className="w-4 h-4" /> Novo Produto
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div key={product.id} className="bg-[#0B0B15] border border-white/5 rounded-2xl overflow-hidden group hover:border-cyan-500/30 transition-all flex flex-col">
                    <div className="h-32 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative">
                      <Package className="w-12 h-12 text-gray-700 group-hover:text-cyan-500/50 transition-colors" />
                      <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold border border-white/10">
                        {product.type === 'subscription' ? 'Assinatura' : 'Vitalício'}
                      </div>
                      {product.orderBumpActive && (
                        <div className="absolute bottom-3 left-3 bg-green-900/60 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold border border-green-500/30 text-green-300 flex items-center gap-1">
                          <Zap className="w-3 h-3" /> Bump Ativo
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-lg font-bold text-white mb-1 line-clamp-1" title={product.name}>{product.name}</h3>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl font-bold text-cyan-400">R$ {product.price.toFixed(2)}</span>
                        <span className="text-xs text-gray-500">{product.sales} vendas</span>
                      </div>

                      <div className="space-y-2 mt-auto">
                        <button
                          onClick={() => {
                            setSelectedProductForCheckout(product);
                            setCurrentView('checkout_preview');
                          }}
                          className="w-full py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-lg border border-white/5 flex items-center justify-center gap-2 transition-all"
                        >
                          <ExternalLink className="w-4 h-4" /> Visualizar Checkout
                        </button>
                        <button className="w-full py-2 text-gray-400 hover:text-white text-sm font-medium transition-colors">
                          Editar Detalhes
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --- CREATE PRODUCT VIEW --- */}
          {currentView === 'create_product' && (
            <div className="max-w-2xl mx-auto animate-fade-in">
              <button
                onClick={() => setCurrentView('products')}
                className="flex items-center gap-2 text-gray-500 hover:text-white mb-6 text-sm font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Voltar para Produtos
              </button>

              <div className="bg-[#0B0B15] border border-white/5 rounded-2xl p-8 shadow-2xl">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-cyan-500" />
                  </div>
                  Cadastrar Novo Produto
                </h2>

                <form onSubmit={handleSaveProduct} className="space-y-6">

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-400 uppercase tracking-wide">Nome do Produto</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Mentoria Mastermind"
                      value={newProductForm.name}
                      onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })}
                      className="w-full bg-[#161622] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-400 uppercase tracking-wide">Preço (R$)</label>
                      <input
                        type="text" // Text to allow easy decimal input
                        required
                        placeholder="97.00"
                        value={newProductForm.price}
                        onChange={(e) => setNewProductForm({ ...newProductForm, price: e.target.value })}
                        className="w-full bg-[#161622] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-400 uppercase tracking-wide">Tipo de Cobrança</label>
                      <select
                        value={newProductForm.type}
                        onChange={(e) => setNewProductForm({ ...newProductForm, type: e.target.value as any })}
                        className="w-full bg-[#161622] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-all appearance-none"
                      >
                        <option value="one_time">Pagamento Único (Vitalício)</option>
                        <option value="subscription">Assinatura (Mensal)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-400 uppercase tracking-wide">Descrição (Interna)</label>
                    <textarea
                      rows={3}
                      placeholder="Descreva brevemente o produto para controle..."
                      value={newProductForm.description}
                      onChange={(e) => setNewProductForm({ ...newProductForm, description: e.target.value })}
                      className="w-full bg-[#161622] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-all resize-none"
                    />
                  </div>

                  {/* ORDER BUMP TOGGLE */}
                  <div className="pt-4 border-t border-white/5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-white font-bold flex items-center gap-2">Order Bump <span className="text-xs bg-cyan-900/50 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/20">Opcional</span></h3>
                        <p className="text-xs text-gray-500">Oferta complementar no checkout para aumentar o ticket médio.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newProductForm.enableBump}
                          onChange={(e) => setNewProductForm({ ...newProductForm, enableBump: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                      </label>
                    </div>

                    {newProductForm.enableBump && (
                      <div className="grid grid-cols-2 gap-6 bg-[#161622] p-4 rounded-xl border border-white/5 animate-fade-in">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Nome da Oferta Extra</label>
                          <input
                            type="text"
                            placeholder="Ex: Acesso Comunidade VIP"
                            value={newProductForm.bumpName}
                            onChange={(e) => setNewProductForm({ ...newProductForm, bumpName: e.target.value })}
                            className="w-full bg-[#0B0B15] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Preço Extra (R$)</label>
                          <input
                            type="text"
                            placeholder="29.90"
                            value={newProductForm.bumpPrice}
                            onChange={(e) => setNewProductForm({ ...newProductForm, bumpPrice: e.target.value })}
                            className="w-full bg-[#0B0B15] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 flex gap-4">
                    <button
                      type="button"
                      onClick={() => setCurrentView('products')}
                      className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 font-bold hover:bg-white/5 hover:text-white transition-all"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-900/20 transition-all flex items-center justify-center gap-2"
                    >
                      <Save className="w-5 h-5" /> Salvar Produto
                    </button>
                  </div>

                </form>
              </div>
            </div>
          )}

          {/* --- SETTINGS VIEW --- */}
          {currentView === 'settings' && (
            <div className="max-w-4xl mx-auto animate-fade-in">
              <div className="bg-[#0B0B15] border border-white/5 rounded-2xl p-8 shadow-2xl">
                <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                    <Settings className="w-6 h-6 text-cyan-500" />
                  </div>
                  Integrações e Rastreamento
                </h2>

                <form onSubmit={handleSaveSettings} className="space-y-12">

                  {/* MERCADO PAGO SECTION */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                      <CreditCard className="w-5 h-5 text-blue-400" />
                      <h3 className="text-lg font-bold text-gray-200">Mercado Pago</h3>
                    </div>
                    <p className="text-sm text-gray-500">
                      Configure suas credenciais para processar pagamentos.
                      <a href="#" className="text-cyan-500 hover:underline ml-1">Onde encontrar minhas chaves?</a>
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-400 uppercase tracking-wide flex items-center gap-2">
                          Public Key <Lock className="w-3 h-3 text-gray-600" />
                        </label>
                        <input
                          type="text"
                          placeholder="TEST-0000-0000-0000..."
                          value={settingsForm.mercadoPagoPublicKey}
                          onChange={(e) => setSettingsForm({ ...settingsForm, mercadoPagoPublicKey: e.target.value })}
                          className="w-full bg-[#161622] border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-cyan-500 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-400 uppercase tracking-wide flex items-center gap-2">
                          Access Token <Lock className="w-3 h-3 text-gray-600" />
                        </label>
                        <input
                          type="password"
                          placeholder="TEST-0000-0000-0000..."
                          value={settingsForm.mercadoPagoAccessToken}
                          onChange={(e) => setSettingsForm({ ...settingsForm, mercadoPagoAccessToken: e.target.value })}
                          className="w-full bg-[#161622] border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-cyan-500 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* TRACKING SECTION */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                      <Target className="w-5 h-5 text-purple-400" />
                      <h3 className="text-lg font-bold text-gray-200">Pixels e Rastreamento</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-400 uppercase tracking-wide flex items-center gap-2">
                          <Facebook className="w-4 h-4 text-blue-600" /> Facebook Pixel ID
                        </label>
                        <input
                          type="text"
                          placeholder="1234567890"
                          value={settingsForm.facebookPixelId}
                          onChange={(e) => setSettingsForm({ ...settingsForm, facebookPixelId: e.target.value })}
                          className="w-full bg-[#161622] border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-purple-500 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-400 uppercase tracking-wide flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-orange-600" /> Google Analytics (G-XXXX)
                        </label>
                        <input
                          type="text"
                          placeholder="G-ABC123456"
                          value={settingsForm.googleAnalyticsId}
                          onChange={(e) => setSettingsForm({ ...settingsForm, googleAnalyticsId: e.target.value })}
                          className="w-full bg-[#161622] border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-orange-500 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-900/20 transition-all flex items-center justify-center gap-2"
                    >
                      <Save className="w-5 h-5" /> Salvar Configurações
                    </button>
                  </div>

                </form>
              </div>
            </div>
          )}

          {/* --- AI SALES AGENT --- */}
          {currentView === 'ai_agent' && (
            <div className="bg-[#0B0B15] rounded-3xl border border-white/5 h-[calc(100vh-140px)] overflow-hidden shadow-2xl relative">
              <ChatInterface
                initialPrompt="Analise minhas vendas recentes e sugira uma estratégia de upsell para aumentar o ticket médio."
              />
            </div>
          )}

          {/* --- OTHER VIEWS PLACEHOLDERS --- */}
          {(currentView === 'sales' || currentView === 'customers') && (
            <div className="flex flex-col items-center justify-center h-[50vh] text-gray-500 animate-fade-in">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                <Settings className="w-10 h-10 opacity-50" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Módulo em Desenvolvimento</h3>
              <p className="max-w-md text-center">
                Esta funcionalidade estará disponível na próxima atualização do NexusPay Manager.
                Foque no Dashboard e Produtos por enquanto.
              </p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default NexusManager;