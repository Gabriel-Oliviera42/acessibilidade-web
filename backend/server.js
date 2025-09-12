import express from 'express';
import cors from 'cors';
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
        // Chave da API de screenshot que comprovadamente funciona com screenshotapi.net
        const SCREENSHOT_API_TOKEN = '0RMJ6EW-MC2MSHH-GCFJMN9-3JZJPTZ';

        // === PASSO 1: OBTÉM UM SCREENSHOT DA PÁGINA ===
        // Usamos a API do screenshotapi.net com a chave e formato corretos
        const screenshotResponse = await fetch(`https://shot.screenshotapi.net/screenshot?token=${SCREENSHOT_API_TOKEN}&url=${url}&output=json&full_page=true`);

        const screenshotData = await screenshotResponse.json();

        if (!screenshotResponse.ok) {
            console.error('Erro na API de screenshot:', screenshotData);
            throw new Error(`Erro na API de screenshot: ${screenshotData.error}`);
        }

        // Retornamos a URL da imagem para o frontend.
        res.json({ screenshot_url: screenshotData.screenshot });

    } catch (error) {
        console.error('Erro no backend:', error);
        res.status(500).json({ error: `Ocorreu um erro no backend: ${error.message}` });
    }
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
