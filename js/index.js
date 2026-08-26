import { CONFIG } from './config.js';

import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js';
import { getDatabase, ref, get, runTransaction } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js';

/* =========================================================
   FIREBASE
========================================================= */
let db = null;
try {
  if (CONFIG?.firebaseConfig?.apiKey) {
    const app = initializeApp(CONFIG.firebaseConfig);
    db = getDatabase(app);
    console.log('Firebase conectado.');
  } else {
    console.warn('Firebase não configurado em config.js.');
  }
} catch (erro) {
  console.error('Erro ao iniciar Firebase:', erro);
}

/* =========================================================
   NAVEGAÇÃO
========================================================= */
const abrirCartelas = document.getElementById('abrirCartelas');
if (abrirCartelas) abrirCartelas.addEventListener('click', () => { window.location.href = 'cartela.html'; });

const sugerir = document.getElementById('sugerir');
if (sugerir) sugerir.addEventListener('click', () => { window.location.href = 'cartela.html?sugerir=1'; });

/* =========================================================
   NÚMERO — VERIFICAR / RESERVAR
========================================================= */
const numeroDireto = document.getElementById('numeroDireto');
const verificarNumeroBotao = document.getElementById('verificarNumero');
const numeroStatus = document.getElementById('numeroStatus');
const reservarNumero = document.getElementById('reservarNumero');

function mostrarStatus(mensagem, tipo = 'erro') {
  if (!numeroStatus) return;
  numeroStatus.style.display = 'flex';
  numeroStatus.textContent = mensagem;
  const estilos = {
    disponivel: ['#e8fff0','#12843b','1px solid #8de0aa'],
    indisponivel: ['#fff0f0','#c62828','1px solid #f0a0a0'],
    verificando: ['#eef6ff','#1766a5','1px solid #a8cff2'],
    erro: ['#fff7e6','#9a6500','1px solid #efd28a']
  };
  const [background, color, border] = estilos[tipo] || estilos.erro;
  numeroStatus.style.background = background;
  numeroStatus.style.color = color;
  numeroStatus.style.border = border;
}

function limparNumeroStatus() {
  if (numeroStatus) {
    numeroStatus.style.display = 'none';
    numeroStatus.textContent = '';
  }
  if (reservarNumero) {
    reservarNumero.style.display = 'none';
    reservarNumero.disabled = false;
    reservarNumero.textContent = '🎟️ RESERVAR NÚMERO';
    delete reservarNumero.dataset.numero;
  }
}

function numeroEstaOcupado(dados) {
  if (!dados) return false;
  const status = String(dados.status ?? dados.situacao ?? '').toLowerCase().trim();
  return ['reservado','vendido','pago','ocupado','indisponivel'].includes(status) ||
    dados.reservado === true || dados.vendido === true || dados.pago === true || dados.ocupado === true;
}

function mostrarDisponivel(numero) {
  mostrarStatus(`🟢 NÚMERO ${numero} DISPONÍVEL`, 'disponivel');
  if (reservarNumero) {
    reservarNumero.style.display = 'flex';
    reservarNumero.disabled = false;
    reservarNumero.textContent = `🎟️ RESERVAR ${numero}`;
    reservarNumero.dataset.numero = numero;
  }
}

function mostrarIndisponivel(numero) {
  mostrarStatus(`🔴 NÚMERO ${numero} NÃO DISPONÍVEL`, 'indisponivel');
  if (reservarNumero) {
    reservarNumero.style.display = 'none';
    delete reservarNumero.dataset.numero;
  }
}

async function verificarNumero() {
  if (!numeroDireto) return;
  const valor = numeroDireto.value.trim();
  if (valor === '') return mostrarStatus('⚠️ Digite um número entre 000 e 999.', 'erro');
  const numeroInteiro = Number(valor);
  if (!Number.isInteger(numeroInteiro) || numeroInteiro < 0 || numeroInteiro > 999) {
    return mostrarStatus('⚠️ Digite um número entre 000 e 999.', 'erro');
  }
  const numero = String(numeroInteiro).padStart(3, '0');
  numeroDireto.value = numero;
  mostrarStatus('🔎 Verificando disponibilidade...', 'verificando');
  if (!db) return mostrarStatus('⚠️ Firebase não está conectado. Verifique o config.js.', 'erro');
  try {
    const snapshot = await get(ref(db, `rifa/numeros/${numero}`));
    if (!snapshot.exists()) return mostrarDisponivel(numero);
    const dados = snapshot.val();
    if (numeroEstaOcupado(dados)) mostrarIndisponivel(numero);
    else mostrarDisponivel(numero);
  } catch (erro) {
    console.error('Erro ao verificar número:', erro);
    mostrarStatus('⚠️ Não foi possível verificar o número.', 'erro');
  }
}

if (verificarNumeroBotao) verificarNumeroBotao.addEventListener('click', verificarNumero);
if (numeroDireto) {
  numeroDireto.addEventListener('input', () => {
    numeroDireto.value = numeroDireto.value.replace(/\D/g, '').slice(0, 3);
    limparNumeroStatus();
  });
  numeroDireto.addEventListener('keydown', evento => {
    if (evento.key === 'Enter') { evento.preventDefault(); verificarNumero(); }
  });
}

if (reservarNumero) {
  reservarNumero.style.display = 'none';
  reservarNumero.addEventListener('click', async () => {
    const numero = reservarNumero.dataset.numero;
    if (!numero) return;
    if (!db) return alert('⚠️ Firebase não está conectado.');
    reservarNumero.disabled = true;
    reservarNumero.textContent = '⏳ RESERVANDO...';
    try {
      const numeroRef = ref(db, `rifa/numeros/${numero}`);
      const resultado = await runTransaction(numeroRef, atual => {
        if (atual === null) return { numero, status: 'reservado', reservado: true, dataReserva: new Date().toISOString() };
        if (numeroEstaOcupado(atual)) return;
        return { ...atual, numero, status: 'reservado', reservado: true, dataReserva: new Date().toISOString() };
      });
      if (!resultado.committed) {
        mostrarIndisponivel(numero);
        return alert(`❌ O número ${numero} acabou de ser reservado por outra pessoa.`);
      }
      mostrarStatus(`✅ NÚMERO ${numero} RESERVADO COM SUCESSO`, 'disponivel');
      reservarNumero.style.display = 'none';
      alert(`✅ Número ${numero} reservado!\n\nAgora faça o pagamento pelo PIX e depois envie o comprovante.`);
      setTimeout(() => { window.location.href = `cartela.html?numero=${numero}`; }, 700);
    } catch (erro) {
      console.error('Erro ao reservar número:', erro);
      reservarNumero.disabled = false;
      reservarNumero.style.display = 'flex';
      reservarNumero.textContent = `🎟️ RESERVAR ${numero}`;
      mostrarStatus('⚠️ Não foi possível reservar o número.', 'erro');
      alert('❌ Não foi possível reservar o número. Verifique sua conexão e tente novamente.');
    }
  });
}

/* =========================================================
   PIX — COPIAR
========================================================= */
const copiarPix = document.getElementById('copiarPix');
if (copiarPix) {
  copiarPix.addEventListener('click', async () => {
    const chave = String(CONFIG?.pixChave ?? '').trim();
    if (!chave || chave === 'COLOQUE_AQUI_A_CHAVE_PIX') return alert('⚠️ Chave PIX não configurada.');
    try {
      await navigator.clipboard.writeText(chave);
      copiarPix.textContent = '✅ PIX COPIADO!';
      setTimeout(() => { copiarPix.textContent = '💠 COPIAR CHAVE PIX'; }, 1800);
    } catch (erro) {
      console.warn('Clipboard indisponível:', erro);
      const campo = document.createElement('textarea');
      campo.value = chave; campo.style.position = 'fixed'; campo.style.left = '-9999px';
      document.body.appendChild(campo); campo.focus(); campo.select();
      const copiou = document.execCommand('copy'); campo.remove();
      if (copiou) {
        copiarPix.textContent = '✅ PIX COPIADO!';
        setTimeout(() => { copiarPix.textContent = '💠 COPIAR CHAVE PIX'; }, 1800);
      } else alert(`Copie manualmente a chave PIX:\n\n${chave}`);
    }
  });
}

/* =========================================================
   RASPADINHA — PRÊMIOS E IMAGENS
   Se o HTML possuir canvas + .scratch-area, ativa a raspadinha.
========================================================= */
const canvas = document.getElementById('scratchCanvas');
const area = document.querySelector('.scratch-area');
const premio = document.getElementById('scratchPremio');

if (canvas && area && premio) {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  let raspando = false;
  let finalizada = false;

  const premios = [
    { nome: 'LIQUIDIFICADOR', imagem: 'img/liquidificador.png' },
    { nome: 'FERRO ELÉTRICO', imagem: 'img/ferro.png' }
  ];
  const premioEscolhido = premios[Math.floor(Math.random() * premios.length)];

  function ajustarCanvas() {
    const rect = area.getBoundingClientRect();
    const largura = Math.max(1, Math.round(rect.width));
    const altura = Math.max(1, Math.round(rect.height));
    const escala = window.devicePixelRatio || 1;
    canvas.width = largura * escala;
    canvas.height = altura * escala;
    canvas.style.width = `${largura}px`;
    canvas.style.height = `${altura}px`;
    ctx.setTransform(escala, 0, 0, escala, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    const gradiente = ctx.createLinearGradient(0, 0, largura, altura);
    gradiente.addColorStop(0, '#c7ccd1'); gradiente.addColorStop(.5, '#9da4aa'); gradiente.addColorStop(1, '#c7ccd1');
    ctx.fillStyle = gradiente; ctx.fillRect(0, 0, largura, altura);
    ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = 10;
    for (let x = -altura; x < largura + altura; x += 35) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + altura, altura); ctx.stroke(); }
    ctx.fillStyle = '#62686d'; ctx.font = '900 20px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('RASPE AQUI', largura / 2, altura / 2);
  }

  function obterPosicao(evento) {
    const rect = canvas.getBoundingClientRect();
    const toque = evento.touches?.[0];
    const clientX = toque ? toque.clientX : evento.clientX;
    const clientY = toque ? toque.clientY : evento.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  function raspar(evento) {
    if (!raspando || finalizada) return;
    evento.preventDefault();
    const { x, y } = obterPosicao(evento);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath(); ctx.arc(x, y, 28, 0, Math.PI * 2); ctx.fill();
  }

  function iniciar(evento) {
    if (finalizada) return;
    raspando = true;
    evento.preventDefault();
    raspar(evento);
  }

  function parar() { if (!raspando) return; raspando = false; verificarProgresso(); }

  function mostrarPremio() {
    finalizada = true;
    premio.innerHTML = `<img class="scratch-premio-imagem" src="${premioEscolhido.imagem}" alt="${premioEscolhido.nome}"><strong class="scratch-premio-nome">🎉 ${premioEscolhido.nome}</strong><small>PARABÉNS! VOCÊ GANHOU!</small>`;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function verificarProgresso() {
    if (finalizada) return;
    try {
      const imagem = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let transparentes = 0;
      for (let i = 3; i < imagem.data.length; i += 4) if (imagem.data[i] === 0) transparentes++;
      const porcentagem = transparentes / (imagem.data.length / 4);
      if (porcentagem >= 0.35) mostrarPremio();
    } catch (erro) { console.warn('Não foi possível medir a raspadinha:', erro); }
  }

  canvas.addEventListener('mousedown', iniciar);
  canvas.addEventListener('mousemove', raspar);
  window.addEventListener('mouseup', parar);
  canvas.addEventListener('touchstart', iniciar, { passive: false });
  canvas.addEventListener('touchmove', raspar, { passive: false });
  canvas.addEventListener('touchend', parar, { passive: true });
  canvas.addEventListener('touchcancel', parar, { passive: true });
  window.addEventListener('resize', () => { if (!finalizada) ajustarCanvas(); });
  ajustarCanvas();
}

/* =========================================================
   COMPROVANTE + WHATSAPP
========================================================= */
const comprovante = document.getElementById('comprovante');
const comprovanteNome = document.getElementById('comprovanteNome');
const enviarWhatsApp = document.getElementById('enviarWhatsApp');
const comprovanteMsg = document.getElementById('comprovanteMsg');

if (comprovante) {
  comprovante.addEventListener('change', () => {
    const arquivo = comprovante.files?.[0];
    if (!arquivo) {
      if (comprovanteNome) comprovanteNome.textContent = 'Nenhum arquivo selecionado.';
      if (enviarWhatsApp) enviarWhatsApp.disabled = true;
      if (comprovanteMsg) comprovanteMsg.textContent = '';
      return;
    }
    if (arquivo.size > 10 * 1024 * 1024) {
      comprovante.value = '';
      if (comprovanteNome) comprovanteNome.textContent = 'Nenhum arquivo selecionado.';
      if (enviarWhatsApp) enviarWhatsApp.disabled = true;
      if (comprovanteMsg) comprovanteMsg.textContent = '⚠️ O arquivo deve ter no máximo 10 MB.';
      return;
    }
    if (comprovanteNome) comprovanteNome.textContent = `✅ ${arquivo.name}`;
    if (enviarWhatsApp) enviarWhatsApp.disabled = false;
    if (comprovanteMsg) comprovanteMsg.textContent = 'Comprovante pronto para envio.';
  });
}

if (enviarWhatsApp) {
  enviarWhatsApp.addEventListener('click', async () => {
    const arquivo = comprovante?.files?.[0];
    if (!arquivo) return;
    const mensagem = 'Olá! Estou enviando o comprovante de pagamento da Rifa Solidária — GILFEST.';
    try {
      const dados = { files: [arquivo], text: mensagem, title: mensagem };
      if (navigator.share && (!navigator.canShare || navigator.canShare(dados))) {
        await navigator.share(dados);
        if (comprovanteMsg) comprovanteMsg.textContent = '✅ Escolha o WhatsApp e envie o comprovante com a mensagem.';
        return;
      }
      throw new Error('Compartilhamento de arquivo indisponível.');
    } catch (erro) {
      if (erro?.name === 'AbortError') {
        if (comprovanteMsg) comprovanteMsg.textContent = 'Compartilhamento cancelado.';
        return;
      }
      const numeroWhatsApp = '5579999145044';
      const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      if (comprovanteMsg) comprovanteMsg.textContent = '📲 WhatsApp aberto. Anexe o comprovante na conversa.';
    }
  });
}
