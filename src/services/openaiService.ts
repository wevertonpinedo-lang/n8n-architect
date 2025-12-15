import OpenAI from 'openai';
import { TRIAGE_PROMPT, ARCHITECT_PROMPT, SYSTEM_INSTRUCTION, SALES_SYSTEM_INSTRUCTION } from "../types";

let client: OpenAI | null = null;
let currentMode: 'automation' | 'sales' = 'automation';

const getClient = () => {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY is missing. Please set it in your environment variables.");
    }
    if (!client) {
        client = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            dangerouslyAllowBrowser: true
        });
    }
    return client;
};

export const initializeChat = (mode: 'automation' | 'sales' = 'automation') => {
    currentMode = mode;
    return getClient();
};

// Função auxiliar para fazer uma chamada simples (sem streaming)
const callOpenAI = async (systemPrompt: string, userMessage: string): Promise<string> => {
    const openai = getClient();
    const response = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        temperature: 0.7,
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage }
        ],
    });
    return response.choices[0]?.message?.content || "";
};

export const sendMessageStream = async (message: string, mode: 'automation' | 'sales' = 'automation') => {
    const openai = getClient();

    if (currentMode !== mode) {
        currentMode = mode;
    }

    // Para modo de vendas, usar prompt simples
    if (mode === 'sales') {
        const stream = await openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            temperature: 0.7,
            messages: [
                { role: "system", content: SALES_SYSTEM_INSTRUCTION },
                { role: "user", content: message }
            ],
            stream: true,
        });

        async function* streamGenerator() {
            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content || "";
                if (content) {
                    yield { text: content };
                }
            }
        }
        return streamGenerator();
    }

    // Para modo automação: Sistema de CADEIA (Triagem → Arquiteto)
    // Etapa 1: Triagem (síncrona, sem streaming)
    let triageResult: string;
    try {
        triageResult = await callOpenAI(TRIAGE_PROMPT, message);
    } catch (e) {
        // Se triagem falhar, usar prompt combinado como fallback
        triageResult = message;
    }

    // Etapa 2: Arquiteto (com streaming para o usuário ver)
    const architectInput = `ESPECIFICAÇÃO DO USUÁRIO:
${message}

ANÁLISE DA TRIAGEM:
${triageResult}

Agora gere o JSON completo do n8n para este fluxo.`;

    const stream = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        temperature: 0.5, // Mais determinístico para código
        messages: [
            { role: "system", content: ARCHITECT_PROMPT },
            { role: "user", content: architectInput }
        ],
        stream: true,
    });

    async function* streamGenerator() {
        // Primeiro, mostrar o resumo da triagem
        yield { text: "**📋 Análise do seu pedido:**\n" };
        yield { text: triageResult };
        yield { text: "\n\n---\n\n**🔧 Gerando o fluxo n8n...**\n\n" };

        // Depois, streamar a resposta do arquiteto
        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
                yield { text: content };
            }
        }
    }

    return streamGenerator();
};
