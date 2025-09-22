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
            // Exibimos a imagem na tela e o resultado da análise
            preview.innerHTML = `
                <h3>Screenshot:</h3>
                <img src="${data.screenshot_url}" alt="Screenshot de ${url}" style="max-width:100%; border:1px solid #ccc; border-radius:8px;">
            `;
            
            resultado.innerHTML = `
                <h3>Resultado da Análise de Acessibilidade:</h3>
                <pre>${data.analysis}</pre>
            `;
        } else {
            throw new Error(data.error || 'Erro na requisição.');
        }

    } catch (err) {
        console.error("Erro no front-end:", err);
        resultado.innerHTML = `<p style="color:red;">Ocorreu um erro na análise: ${err.message}</p>`;
    }
    // Apenas um exemplo para simular a busca de dados
function fetchData() {
  const loadingBar = document.querySelector('.loading-bar');
  const resultadoDiv = document.getElementById('resultado');

  // 1. Mostrar a barra de carregamento e limpar o resultado
  loadingBar.style.width = '20%';
  resultadoDiv.innerHTML = '';
  resultadoDiv.classList.remove('loaded');

  // 2. Simular a requisição HTTP com um atraso de 2 segundos
  setTimeout(() => {
    loadingBar.style.width = '100%';

    // 3. Simular o retorno dos dados
    setTimeout(() => {
      // 4. Preencher o resultado e aplicar a animação de entrada
      resultadoDiv.innerHTML = 'Dados carregados com sucesso!';
      resultadoDiv.classList.add('loaded'); // Adiciona a classe para a animação
      loadingBar.style.width = '0'; // Esconde a barra de carregamento
    }, 500); // Pequeno atraso para a animação da barra
  }, 2000);
}

// Chame a função quando o botão for clicado
document.querySelector('button').addEventListener('click', (e) => {
  e.preventDefault(); // Impede o envio do formulário padrão
  fetchData();
});
});
