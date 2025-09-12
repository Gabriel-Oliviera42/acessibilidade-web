import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Buffer } from 'buffer';

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
        // Chaves de API
        const screenshotApiToken = '0RMJ6EW-MC2MSHH-GCFJMN9-3JZJPTZ';
        const geminiApiKey = 'AIzaSyBRE42e2I4yX7EUEAXtJPw6_xAe7hXpY3o';

        // Passo 1: Obter um screenshot da página usando a API
        const screenshotResponse = await fetch(`https://shot.screenshotapi.net/screenshot?token=${screenshotApiToken}&url=${url}&output=json&full_page=true`);
        const screenshotData = await screenshotResponse.json();

        // Trata a resposta da API de screenshot
        if (!screenshotResponse.ok) {
            console.error('Erro na API de screenshot:', screenshotData);
            throw new Error(`Erro na API de screenshot: ${screenshotData.error}`);
        }

        // Passo 2: Baixar a imagem do screenshot e converter para Base64
        const imageResponse = await fetch(screenshotData.screenshot);
        const imageArrayBuffer = await imageResponse.arrayBuffer();
        const base64Image = Buffer.from(imageArrayBuffer).toString('base64');
        const mimeType = 'image/jpeg';

        // Passo 3: Chamar a API do Gemini para a análise de acessibilidade
        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${geminiApiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: `Analise a imagem a seguir e avalie a acessibilidade web, focando em contraste de cores, tamanho e clareza da fonte, e layout geral. Forneça a análise em um parágrafo e, em seguida, liste 3-5 sugestões práticas para melhorar a acessibilidade da página.` },
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
        res.json({ analysis: analysisText, screenshot_url: screenshotData.screenshot });

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
