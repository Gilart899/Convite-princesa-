import { CONFIG } from './config.js';

document.getElementById('abrirCartelas').onclick = () => {
  location.href = 'cartela.html';
};

document.getElementById('sugerir').onclick = () => {
  location.href = 'cartela.html?sugerir=1';
};


/* 🎟️ RASPADINHA DA SORTE */

const raspadinha = document.querySelector('.scratch');

if (raspadinha) {

  raspadinha.style.cursor = 'pointer';

  raspadinha.addEventListener('click', () => {
    location.href = 'raspadinha.html';
  });

}


/* 🔢 IR DIRETO PARA UM NÚMERO */

document.getElementById('numeroDireto').addEventListener(
  'keydown',
  e => {
    if (e.key === 'Enter') {
      irParaNumero();
    }
  }
);

document.getElementById('numeroDireto').addEventListener(
  'input',
  e => {
    e.target.value = e.target.value
      .replace(/\D/g, '')
      .slice(0, 3);
  }
);

function irParaNumero() {

  const raw =
    document.getElementById('numeroDireto').value;

  if (raw === '') return;

  const n = Number(raw);

  if (n < 0 || n > 999) {
    return alert(
      'Digite um número entre 000 e 999.'
    );
  }

  location.href =
    `cartela.html?numero=${String(n).padStart(3, '0')}`;
}


/* 💚 COPIAR PIX */

document.getElementById('copiarPix').onclick = async () => {

  const chave = CONFIG.pixChave;

  if (!chave) {
    alert('Chave PIX não configurada.');
    return;
  }

  try {

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(chave);
    } else {
      throw new Error('Clipboard indisponível');
    }

    alert('✅ Chave PIX copiada!');

  } catch {

    try {

      const campo =
        document.createElement('textarea');

      campo.value = chave;
      campo.style.position = 'fixed';
      campo.style.opacity = '0';

      document.body.appendChild(campo);

      campo.focus();
      campo.select();

      document.execCommand('copy');

      campo.remove();

      alert('✅ Chave PIX copiada!');

    } catch {

      alert(
        'Não foi possível copiar automaticamente. ' +
        'Toque e segure a chave PIX para copiar.'
      );

    }

  }

};
