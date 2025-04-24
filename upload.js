// URL do seu Apps Script publicado como Web App
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzuvc7SZTfvVdYUvwIUEjxCqb6DpUbI0yTlReieoB3i3Lf2OOmhnPIVUdvXCH6IdylH/exec';

const form = document.getElementById('upload-form');
const status = document.getElementById('status');
const btn = document.getElementById('btn-enviar');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  status.textContent = '';
  status.className = '';
  btn.disabled = true;
  btn.textContent = 'Enviando...';

  const nome = document.getElementById('nome').value.trim();
  const files = Array.from(document.getElementById('arquivos').files);

  if (!nome || files.length === 0) {
    status.textContent = 'Por favor, preencha seu nome e selecione ao menos um arquivo.';
    status.classList.add('text-red-500');
    btn.disabled = false;
    btn.textContent = 'Enviar lembranças';
    return;
  }

  try {
    // Converte cada arquivo em base64
    const fileObjs = await Promise.all(files.map(file => {
      return new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result.split(',')[1];
          res({ name: file.name, mimeType: file.type, contentBase64: base64 });
        };
        reader.onerror = rej;
        reader.readAsDataURL(file);
      });
    }));

    // Prepara e envia
    const resp = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, files: fileObjs }),
    });

    const result = await resp.json();
    if (result.status === 'OK') {
      status.textContent = 'Enviado com sucesso! Obrigada por compartilhar com a Duda 💙';
      status.classList.add('text-green-500');
      form.reset();
    } else {
      throw new Error(result.message || 'Erro desconhecido');
    }
  } catch (err) {
    console.error(err);
    status.textContent = 'Ocorreu um erro ao enviar. Tente novamente.';
    status.classList.add('text-red-500');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Enviar lembranças';
  }
});
