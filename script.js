import { GoogleGenerativeAI } from "@google/generative-ai";

document.getElementById("siteForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const url = document.getElementById("url").value;
  const resultado = document.getElementById("resultado");
  const preview = document.getElementById("preview");

  resultado.innerHTML = `
    <p>Você pediu para verificar:</p>
    <strong>${url}</strong>
  `;

  const apiKey = "SUA_CHAVE_SCREENSHOTAPI";
  const apiUrl = `https://shot.screenshotapi.net/screenshot?token=${apiKey}&url=${encodeURIComponent(url)}&full_page=true&output=image&file_type=png&base64=true`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    // a API retorna algo como { data: "iVBORw0KGgoAAAANSUhEUg..." }
    const base64 = data.data;

    preview.innerHTML = `
      <h3>Screenshot (base64):</h3>
      <img src="data:image/png;base64,${base64}" alt="Screenshot de ${url}" style="max-width:100%; border:1px solid #ccc; border-radius:8px;">
    `;
  } catch (err) {
    preview.innerHTML = `<p style="color:red;">Erro: ${err.message}</p>`;
  }


  // --- teste rápido com o Gemini (texto) ---
  const genAI = new GoogleGenerativeAI("AIzaSyBDQYKwIZiJVFQ7lkvUNBy47pcWWchmFsU");
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const res = await model.generateContent("Diga apenas 'OK' se você está funcionando.");
  const texto = res.response.text();

  preview.innerHTML += `
    <h3>Resultado da IA (teste):</h3>
    <p>${texto}</p>
  `;
  
});
