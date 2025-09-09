document.getElementById("siteForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const url = document.getElementById("url").value;
  const resultado = document.getElementById("resultado");
  const preview = document.getElementById("preview");

  resultado.innerHTML = `
    <p>Você pediu para verificar:</p>
    <strong>${url}</strong>
  `;

  // Coloque aqui sua chave do screenshotapi.net
  const apiKey = "0WHMWHX-4EGM5SM-N6NKE3F-2HK9QKW";
  const imageUrl = `https://shot.screenshotapi.net/screenshot?token=${apiKey}&url=${encodeURIComponent(url)}&full_page=true`;

  preview.innerHTML = `
    <h3>Screenshot:</h3>
    <img src="${imageUrl}" alt="Screenshot de ${url}" style="max-width:100%; border:1px solid #ccc; border-radius:8px;">
  `;
});
