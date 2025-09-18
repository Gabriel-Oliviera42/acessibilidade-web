import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Buffer } from 'buffer';
import puppeteer from 'puppeteer';

// Configuração do servidor Express
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;

// Middleware para permitir requisições de outras origens e para processar JSON
app.use(cors());
app.use(express.json());

// Rota principal para servir o frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// Rota para analisar a URL
app.post('/analyze', async (req, res) => {
    const { url } = req.body;

    // Garante que uma URL foi fornecida
    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        // Chave da API do Gemini
        const geminiApiKey = 'AIzaSyBRE42e2I4yX7EUEAXtJPw6_xAe7hXpY3o';

        // Passo 1: Obter um screenshot da página usando o Puppeteer
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });

        const imageBuffer = await page.screenshot({ fullPage: true });
        const base64Image = imageBuffer.toString('base64');
        const mimeType = 'image/jpeg';
        
        await browser.close();

        // Instruções para a IA baseadas nas regras da WCAG 2.2
        const userQuery = `
            Análise de Acessibilidade (WCAG 2.2):
            1. Qual o nível de conformidade (A, AA ou AAA) que o design da página na imagem parece seguir? Justifique brevemente.
            2. Analise a imagem e identifique de 3 a 5 regras da WCAG 2.2 que parecem estar sendo violadas. Para cada regra:
               - Cite o nome e o número da regra (ex: "1.4.3 Contraste (Mínimo)").
               - Descreva a violação específica que você identificou na imagem.
               - Dê uma sugestão prática de como corrigir o problema.
        `;

        // Passo 2: Chamar a API do Gemini para a análise de acessibilidade
        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${geminiApiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: userQuery },
                        { inlineData: { mimeType, data: base64Image } }
                    ]
                }]
            })
        });

        const geminiData = await geminiResponse.json();

        // Trata a resposta da API do Gemini
        if (!geminiResponse.ok) {
            console.error('Erro na API do Gemini:', geminiData);
            throw new Error(`Erro na API do Gemini: ${geminiData.error.message}`);
        }

        const analysisText = geminiData.candidates[0].content.parts[0].text;
        res.json({ analysis: analysisText, screenshot_url: `data:${mimeType};base64,${base64Image}` });

    } catch (error) {
        // Captura e responde a erros inesperados
        console.error('Erro no backend:', error);
        res.status(500).json({ error: `Ocorreu um erro no backend: ${error.message}` });
    }
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
