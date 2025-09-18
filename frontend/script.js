document.getElementById("siteForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const url = document.getElementById("url").value;
    const resultadoContainer = document.getElementById("resultado-container");
    const analysisTextSection = document.getElementById("analysis-text-section");
    const screenshotSection = document.getElementById("screenshot-section");
    
    // Exibe o contêiner de resultado e a mensagem de "analisando"
    resultadoContainer.style.display = 'block';
    analysisTextSection.innerHTML = `
        <p>Analisando a URL:</p>
        <strong>${url}</strong>
        <p>Aguarde, isso pode levar alguns segundos...</p>
    `;
    screenshotSection.innerHTML = ''; // Limpa a seção da imagem

    try {
        const response = await fetch('http://localhost:3000/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: url })
        });

        const data = await response.json();

        if (response.ok) {
            // Remove a mensagem de "analisando"
            analysisTextSection.innerHTML = `<h3>Resultado da Análise de Acessibilidade:</h3>`;

            // Processa o texto da análise para formatar a lista
            const formattedAnalysis = formatAnalysisText(data.analysis);
            analysisTextSection.innerHTML += formattedAnalysis;

            // Exibimos a imagem na tela
            screenshotSection.innerHTML = `
                <h3>Screenshot da Página:</h3>
                <img src="${data.screenshot_url}" alt="Screenshot de ${url}">
            `;
        } else {
            throw new Error(data.error || 'Erro na requisição.');
        }

    } catch (err) {
        console.error("Erro no front-end:", err);
        analysisTextSection.innerHTML = `<p style="color:red;">Ocorreu um erro na análise: ${err.message}</p>`;
        screenshotSection.innerHTML = '';
    }
});

// Nova função mais robusta para formatar o texto da análise.
function formatAnalysisText(text) {
    // Substitui as quebras de linha duplas por parágrafos
    let formattedText = text.replace(/\n\n/g, '</p><p>');

    // Substitui títulos com "##" ou "###"
    formattedText = formattedText.replace(/###\s*(.*)/g, '<h4>$1</h4>');
    formattedText = formattedText.replace(/##\s*(.*)/g, '<h3>$1</h3>');

    // Remove asteriscos duplos e underscores
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formattedText = formattedText.replace(/__(.*?)__/g, '<strong>$1</strong>');

    // Converte listas numeradas e com asteriscos em HTML
    formattedText = formattedText.replace(/^\*\s*(.*)/gm, '<li>$1</li>');
    formattedText = formattedText.replace(/^\d+\.\s*(.*)/gm, '<li>$1</li>');
    if (formattedText.includes('<li>')) {
        formattedText = `<ul>${formattedText}</ul>`;
    }

    // Envolve o texto restante em parágrafos
    if (!formattedText.startsWith('<p>') && !formattedText.startsWith('<ul>') && !formattedText.startsWith('<h3>') && !formattedText.startsWith('<h4>')) {
        formattedText = `<p>${formattedText}</p>`;
    }

    // Trata o início e fim de listas
    formattedText = formattedText.replace(/<\/li>\n<li>/g, '</li><li>');
    formattedText = formattedText.replace(/<\/ul>\n<ul>/g, '</ul><ul>');
    
    return formattedText;
}
