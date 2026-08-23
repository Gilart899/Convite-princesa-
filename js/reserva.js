import { firebaseConfigured } from './firebase.js';
import { getFunctions, httpsCallable } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-functions.js';
import { CONFIG } from './config.js';

const selecionados =
  JSON.parse(localStorage.getItem('rifaSelecionados') || '[]');

const numerosEl = document.getElementById('numeros');
const totalEl = document.getElementById('total');
const reservarBtn = document.getElementById('reservar');
const nomeEl = document.getElementById('nome');
const telefoneEl = document.getElementById('telefone');
const msgEl = document.getElementById('msg');

numerosEl.textContent =
  selecionados.length
    ? selecionados.join(' • ')
    : 'Nenhum número selecionado';

totalEl.textContent =
  `Total: R$ ${(selecionados.length * CONFIG.valorNumero)
    .toFixed(2)
    .replace('.', ',')}`;


/* PIX */

const pix = document.getElementById('pix');
const copiarPix = document.getElementById('copiarPix');
const pixMsg = document.getElementById('pixMsg');

if (pix) {
  pix.value = CONFIG.pixChave || '';
}

if (copiarPix) {

  copiarPix.onclick = async () => {

    const chave = CONFIG.pixChave || '';

    if (!chave) {
      if (pixMsg) {
        pixMsg.textContent = 'Chave PIX não configurada.';
      }
      return;
    }

    try {

      await navigator.clipboard.writeText(chave);

      if (pixMsg) {
        pixMsg.textContent = '✅ Chave PIX copiada!';
      }

      copiarPix.textContent = '✅ COPIADO!';

      setTimeout(() => {
        copiarPix.textContent = '📋 COPIAR';

        if (pixMsg) {
          pixMsg.textContent = '';
        }
      }, 2000);

    } catch {

      if (pix) {
        pix.focus();
        pix.select();
        pix.setSelectionRange(0, 99999);
      }

      if (pixMsg) {
        pixMsg.textContent =
          'Selecione e copie a chave PIX manualmente.';
      }

    }

  };

}


/* RESERVA */

reservarBtn.onclick = async () => {

  const nome = nomeEl.value.trim();
  const telefone = telefoneEl.value.trim();

  if (!selecionados.length) {
    msgEl.textContent =
      'Selecione pelo menos um número.';
    return;
  }

  if (!nome || !telefone) {
    msgEl.textContent =
      'Preencha nome e WhatsApp.';
    return;
  }

  if (!firebaseConfigured) {
    msgEl.textContent =
      'O Firebase ainda não foi configurado nesta versão.';
    return;
  }

  try {

    reservarBtn.disabled = true;
    reservarBtn.textContent = 'ENVIANDO...';

    msgEl.textContent =
      'Verificando seus números...';

    const functions = getFunctions(
      undefined,
      'southamerica-east1'
    );

    const criarReserva =
      httpsCallable(functions, 'criarReserva');

    const resposta =
      await criarReserva({
        nome,
        telefone,
        numeros: selecionados
      });

    const dados = resposta.data;

    msgEl.textContent =
      `✅ Reserva criada com sucesso! Números: ${
        dados.numeros.join(', ')
      }`;

    localStorage.removeItem('rifaSelecionados');

    reservarBtn.textContent = 'RESERVA ENVIADA!';

  } catch (e) {

    console.error(e);

    if (e?.code === 'functions/failed-precondition') {

      msgEl.textContent =
        e.message || 'Um dos números não está disponível.';

    } else if (e?.code === 'functions/invalid-argument') {

      msgEl.textContent =
        e.message || 'Confira os dados informados.';

    } else {

      msgEl.textContent =
        'Não foi possível criar a reserva. Tente novamente.';

    }

    reservarBtn.disabled = false;
    reservarBtn.textContent = 'ENVIAR RESERVA';

  }

};
