# 🚀 CONFIGURAÇÃO RÁPIDA - SIGA ESTES PASSOS

## Passo 1: Criar arquivo .env.local

1. Crie um **novo arquivo** chamado `.env.local` dentro da pasta `server/`
   - Caminho completo: `c:\Users\Admin\Desktop\produto\server\.env.local`

2. Cole este conteúdo no arquivo:

```env
# Cole suas credenciais do Mercado Pago aqui
MP_PUBLIC_KEY=
MP_ACCESS_TOKEN=
PORT=3001
```

## Passo 2: Obter credenciais do Mercado Pago

1. Acesse: https://www.mercadopago.com.br/developers/panel/app
2. Faça login
3. Selecione ou crie uma aplicação
4. Vá em "Credenciais de teste" (para começar)
5. Copie:
   - **Public Key** (começa com TEST-)
   - **Access Token** (começa com TEST-)

## Passo 3: Cole as credenciais no .env.local

Edite o arquivo `.env.local` que você criou e cole assim:

```env
MP_PUBLIC_KEY=TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
MP_ACCESS_TOKEN=TEST-xxxxxxxxxxxx-xxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PORT=3001
```

⚠️ **IMPORTANTE:** Troque os `xxx` pelas suas credenciais reais!

## Passo 4: Reiniciar o servidor backend

No terminal onde o servidor backend está rodando:
1. Pressione `Ctrl+C` para parar
2. Execute novamente: `npm start`

Você verá:
```
✅ Mercado Pago inicializado com sucesso!
🚀 Servidor rodando em http://localhost:3001
💳 Mercado Pago: ✅ Configurado
```

## Passo 5: Testar

1. Acesse: http://localhost:3000
2. Clique em "Login Nexus"
3. Login: `admin@nexus.com` / Senha: `123456`
4. Vá em "Produtos" → "Visualizar Checkout" em qualquer produto
5. Teste fazer um pagamento PIX ou Cartão!

---

## 🆘 Se algo der errado

### Servidor backend mostra "⚠️ Não configurado"
✅ Verifique se o arquivo `.env.local` está na pasta `server/`
✅ Verifique se as credenciais estão corretas (sem espaços)
✅ Reinicie o servidor

### Frontend mostra erro "Servidor backend não está rodando"
✅ Certifique-se que `npm start` está rodando na pasta `server/`
✅ Acesse http://localhost:3001/health para verificar

---

**Depois de configurar pelas aí que eu vejo se está tudo funcionando!** 👍
