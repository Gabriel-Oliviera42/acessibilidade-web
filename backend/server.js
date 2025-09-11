import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Obter o __dirname em módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;

// Middleware para permitir requisições de outras origens (CORS)
app.use(cors());

// Middleware para parsear o body das requisições como JSON
app.use(express.json());

// Rota para servir a página de análise
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// Rota para analisar a URL
app.post('/analyze', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        // === PASSO 1: OBTÉM UM SCREENSHOT DA PÁGINA ===
        const screenshotResponse = await fetch('https://api.apiflash.com/v1/urltoimage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                access_key: 'sua-chave-aqui', // **Substitua pela sua chave**
                url: url,
                format: 'jpeg',
                full_page: true
            })
        });

        const screenshotData = await screenshotResponse.json();

        if (!screenshotResponse.ok) {
            console.error('Erro na API de screenshot:', screenshotData);
            throw new Error(`Erro na API de screenshot: ${screenshotData.error.message}`);
        }

        // === PASSO 2: CONVERTE A IMAGEM PARA BASE64 ===
        // Baixa a imagem da URL retornada pela API de screenshot.
        const imageResponse = await fetch(screenshotData.screenshot);
        // CONSERTO: Usa .arrayBuffer() para obter dados binários, já que .buffer() não existe no fetch nativo do Node.js.
        const imageArrayBuffer = await imageResponse.arrayBuffer();
        const imageBuffer = Buffer.from(imageArrayBuffer);
        // Converte o buffer da imagem para o formato Base64.
        const base64Image = imageBuffer.toString('base64');
        const mimeType = 'image/jpeg';
        const imageDataUrl = `data:${mimeType};base64,${base64Image}`;

        // === PASSO 3: CHAMA A API DO GEMINI PARA ANÁLISE ===
        const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=', {
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

        if (!geminiResponse.ok) {
            console.error('Erro na API do Gemini:', geminiData);
            throw new Error(`Erro na API do Gemini: ${geminiData.error.message}`);
        }

        const analysisText = geminiData.candidates[0].content.parts[0].text;
        res.json({ analysis: analysisText });

    } catch (error) {
        console.error('Erro no backend:', error);
        res.status(500).json({ error: `Ocorreu um erro no backend: ${error.message}` });
    }
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
