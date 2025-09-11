document.getElementById("siteForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const url = document.getElementById("url").value;
    const resultado = document.getElementById("resultado");
    const preview = document.getElementById("preview");

    resultado.innerHTML = `
        <p>Você pediu para verificar:</p>
        <strong>${url}</strong>
        <p>Aguarde, analisando...</p>
    `;
    preview.innerHTML = '';

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
            preview.innerHTML = `
                <h3>Screenshot:</h3>
                <img src="${data.screenshot_url}" alt="Screenshot de ${url}" style="max-width:100%; border:1px solid #ccc; border-radius:8px;">
            `;
            
            resultado.innerHTML = `
                <h3>Resultado da Análise de Acessibilidade:</h3>
                <pre>${data.gemini_response}</pre>
            `;
        } else {
            throw new Error(data.error || 'Erro na requisição.');
        }

    } catch (err) {
        console.error("Erro no front-end:", err);
        resultado.innerHTML = `<p style="color:red;">Ocorreu um erro na análise: ${err.message}</p>`;
    }
});
