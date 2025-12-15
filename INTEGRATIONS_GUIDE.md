# 🚀 Guia de Configuração das Integrações

## 📋 Índice
- [Mercado Pago](#mercado-pago)
- [Facebook Pixel](#facebook-pixel)
- [Google Analytics](#google-analytics)
- [Rodando o Projeto](#rodando-o-projeto)

---

## 💳 Mercado Pago

### 1. Criar Conta de Desenvolvedor

1. Acesse [https://www.mercadopago.com.br/developers](https://www.mercadopago.com.br/developers)
2. Faça login ou crie uma conta
3. Vá em **"Suas integrações"** → **"Criar aplicação"**
4. Escolha um nome para sua aplicação
5. Selecione o modelo **"Pagamentos online"**

### 2. Obter Credenciais

#### Para Testes (Sandbox):
1. No painel da sua aplicação, vá em **"Credenciais de teste"**
2. Copie:
   - **Public Key** (começa com `TEST-`)
   - **Access Token** (começa com `TEST-`)

#### Para Produção:
1. Complete o processo de homologação do Mercado Pago
2. Vá em **"Credenciais de produção"**
3. Copie:
   - **Public Key** (começa com `APP_USR-`)
   - **Access Token** (começa com `APP_USR-`)

### 3. Configurar no Projeto

Edite o arquivo `.env.local` na pasta `server/`:

```env
MP_PUBLIC_KEY=TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
MP_ACCESS_TOKEN=TEST-xxxxxxxxxxxx-xxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**⚠️ IMPORTANTE:** NUNCA commite o arquivo `.env.local` no Git!

### 4. Configurar Webhooks (Opcional - para receber notificações de pagamento)

1. No painel do Mercado Pago, vá em **"Webhooks"**
2. Clique em **"Criar webhook"**
3. Cole a URL do seu servidor: `https://seudominio.com/api/webhooks/mercadopago`
4. Selecione os eventos: **"payments"**
5. Salve

**Para desenvolvimento local:** Use [ngrok](https://ngrok.com/) para expor seu servidor:
```bash
ngrok http 3001
# Use o URL gerado no webhook
```

### 5. Testar Pagamentos

#### Cartões de Teste:
- **Aprovado:** `5031 4332 1540 6351` (Mastercard)
- **Recusado:** `5031 7557 3453 0604`
- **CVV:** qualquer 3 dígitos
- **Data:** qualquer data futura
- **Nome:** qualquer nome

#### PIX de Teste:
- QR Code será gerado normalmente
- Use o ambiente de testes do Mercado Pago para simular pagamento

---

## 📘 Facebook Pixel

### 1. Criar Pixel

1. Acesse [Facebook Business Manager](https://business.facebook.com/)
2. Vá em **"Configurações de negócios"** → **"Fontes de dados"** → **"Pixels"**
3. Clique em **"Adicionar"** → **"Criar Pixel"**
4. Nomeie seu pixel (ex: "N8N Architect Pixel")
5. Copie o **ID do Pixel** (número de 15 dígitos)

### 2. Configurar no Admin

1. Acesse o **NexusManager** → **Login Nexus**
2. Vá em **"Configurações"**
3. Cole o **Facebook Pixel ID** no campo correspondente
4. Salve

### 3. Validar Funcionamento

1. Instale a extensão [Facebook Pixel Helper](https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc)
2. Acesse uma página de checkout do seu app
3. A extensão mostrará um ícone verde indicando que o pixel está ativo
4. Verifique os eventos disparados (PageView, InitiateCheckout, Purchase)

---

## 📊 Google Analytics 4

### 1. Criar Propriedade GA4

1. Acesse [Google Analytics](https://analytics.google.com/)
2. Vá em **"Admin"** → **"Criar propriedade"**
3. Nomeie sua propriedade (ex: "N8N Architect")
4. Configure fuso horário e moeda
5. Em **"Fluxos de dados"**, clique em **"Adicionar fluxo"** → **"Web"**
6. Insira a URL do seu site
7. Copie o **ID de avaliação** (formato: `G-XXXXXXXXXX`)

### 2. Configurar no Admin

1. Acesse o **NexusManager** → **Login Nexus**
2. Vá em **"Configurações"**
3. Cole o **Google Analytics ID** no campo correspondente
4. Salve

### 3. Validar Funcionamento

1. No Google Analytics, vá em **"Relatórios"** → **"Tempo real"**
2. Acesse uma página de checkout do seu app
3. Você verá sua visita aparecendo em tempo real
4. Eventos personalizados (`purchase`, `initiate_checkout`) aparecerão na seção de eventos

---

## 🏃 Rodando o Projeto

### 1. Instalar Dependências

#### Frontend:
```bash
cd produto
npm install
```

#### Backend:
```bash
cd server
npm install
```

### 2. Configurar Variáveis de Ambiente

Crie/edite o arquivo `server/.env.local`:
```env
# Mercado Pago
MP_PUBLIC_KEY=TEST-xxxxxxxx
MP_ACCESS_TOKEN=TEST-xxxxxxxx

# Server
PORT=3001
```

### 3. Iniciar Servidores

#### Terminal 1 - Frontend (Vite):
```bash
cd produto
npm run dev
```

#### Terminal 2 - Backend (Express):
```bash
cd server
npm start
```

### 4. Acessar Aplicação

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **Health Check:** http://localhost:3001/health

---

## ✅ Checklist de Validação

- [ ] Backend rodando sem erros (http://localhost:3001/health retorna `{"status":"ok"}`)
- [ ] Frontend conectando ao backend (sem erros no console do navegador)
- [ ] Mercado Pago Public Key configurado no NexusManager → Configurações
- [ ] Teste de pagamento PIX gerando QR Code corretamente
- [ ] Teste de pagamento Cartão aprovando/recusando conforme esperado
- [ ] Facebook Pixel disparando eventos (verificar com Pixel Helper)
- [ ] Google Analytics recebendo eventos em tempo real

---

## 🆘 Troubleshooting

### Erro: "Servidor backend não está rodando"
- Verifique se o servidor Express está ativo em `http://localhost:3001`
- Execute `cd server && npm start`

### Erro: "Mercado Pago não configurado"
- Verifique se o arquivo `server/.env.local` existe e contém `MP_ACCESS_TOKEN`
- Confirme que as credenciais são válidas no painel do Mercado Pago

### Erro: "QR Code Pix não retornado"
- Verifique se o Access Token tem permissões de pagamento
- Confirme que está usando credenciais de teste (TEST-) ou produção corretas

### Facebook Pixel não dispara eventos
- Verifique se o Pixel ID foi salvo corretamente nas configurações
- Limpe o cache do navegador
- Use o Facebook Pixel Helper para debugar

### Google Analytics não registra eventos
- Aguarde até 24h para eventos aparecerem nos relatórios padrão
- Use **Tempo Real** para validação imediata
- Verifique se o ID começa com `G-`

---

## 📚 Recursos Adicionais

- [Documentação Mercado Pago](https://www.mercadopago.com.br/developers/pt/docs)
- [Documentação Facebook Pixel](https://developers.facebook.com/docs/meta-pixel)
- [Documentação Google Analytics 4](https://support.google.com/analytics/answer/9304153)

---

Feito com 💜 pela equipe N8N Architect
