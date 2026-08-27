import { CONFIG } from './config.js';

import {
  initializeApp
} from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js';

import {
  getDatabase,
  ref,
  get,
  runTransaction
} from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js';


/* =========================================================
   🔥 FIREBASE
========================================================= */

let db = null;

try {
  if (
    CONFIG &&
    CONFIG.firebaseConfig &&
    CONFIG.firebaseConfig.apiKey
  ) {
    const app = initializeApp(CONFIG.firebaseConfig);
    db = getDatabase(app);

    console.log('✅ Firebase conectado.');
  } else {
    console.warn('⚠️ Firebase não configurado em config.js.');
  }
} catch (erro) {
  console.error('❌ Erro ao iniciar Firebase:', erro);
}


/* =========================================================
   🎟️ ESCOLHER NÚMEROS
========================================================= */

const abrirCartelas =
  document.getElementById('abrirCartelas');

if (abrirCartelas) {
  abrirCartelas.addEventListener('click', () => {
    window.location.href = 'cartela.html';
  });
}


/* =========================================================
   🍀 SUGERIR NÚMERO
========================================================= */

const sugerir =
  document.getElementById('sugerir');

if (sugerir) {
  sugerir.addEventListener('click', () => {
    window.location.href =
      'cartela.html?sugerir=1';
  });
}


/* =========================================================
   🔢 VERIFICAR NÚMERO
========================================================= */

const numeroDireto =
  document.getElementById('numeroDireto');

const verificarNumeroBotao =
  document.getElementById('verificarNumero');

const numeroStatus =
  document.getElementById('numeroStatus');

const reservarNumero =
  document.getElementById('reservarNumero');

const pixArea =
  document.querySelector('.pix-area');


/* =========================================================
   🎟️ RESERVAR NÚMERO
========================================================= */

if (reservarNumero) {
  reservarNumero.style.display = 'none';
  reservarNumero.hidden = false;
}


/* =========================================================
   🟢 STATUS
========================================================= */

function mostrarStatus(mensagem, tipo) {
  if (!numeroStatus) return;

  numeroStatus.style.display = 'flex';
  numeroStatus.textContent = mensagem;

  numeroStatus.classList.remove(
    'disponivel',
    'indisponivel',
    'verificando',
    'erro'
  );

  numeroStatus.classList.add(tipo);
}


/* =========================================================
   🧹 LIMPAR STATUS
========================================================= */

function limparNumeroStatus() {
  if (numeroStatus) {
    numeroStatus.style.display = 'none';
    numeroStatus.textContent = '';

    numeroStatus.classList.remove(
      'disponivel',
      'indisponivel',
      'verificando',
      'erro'
    );
  }

  if (reservarNumero) {
    reservarNumero.style.display = 'none';
    reservarNumero.disabled = false;
    reservarNumero.textContent =
      '🎟️ RESERVAR NÚMERO';

    delete reservarNumero.dataset.numero;
  }
}


/* =========================================================
   🔎 VERIFICAR SE ESTÁ OCUPADO
========================================================= */

function numeroEstaOcupado(dados) {
  if (!dados) return false;

  const status = String(
    dados.status ||
    dados.situacao ||
    ''
  ).toLowerCase();

  return (
    status === 'reservado' ||
    status === 'vendido' ||
    status === 'pago' ||
    status === 'ocupado' ||
    status === 'indisponivel' ||

    dados.reservado === true ||
    dados.vendido === true ||
    dados.pago === true ||
    dados.ocupado === true
  );
}


/* =========================================================
   🟢 DISPONÍVEL
========================================================= */

function mostrarDisponivel(numero) {
  mostrarStatus(
    `🟢 NÚMERO ${numero} DISPONÍVEL`,
    'disponivel'
  );

  if (reservarNumero) {
    reservarNumero.style.display = 'flex';
    reservarNumero.hidden = false;
    reservarNumero.disabled = false;

    reservarNumero.textContent =
      `🎟️ RESERVAR ${numero}`;

    reservarNumero.dataset.numero = numero;
  }
}


/* =========================================================
   🔴 INDISPONÍVEL
========================================================= */

function mostrarIndisponivel(numero) {
  mostrarStatus(
    `🔴 NÚMERO ${numero} NÃO DISPONÍVEL`,
    'indisponivel'
  );

  if (reservarNumero) {
    reservarNumero.style.display = 'none';
    delete reservarNumero.dataset.numero;
  }
}


/* =========================================================
   ⚠️ ERRO
========================================================= */

function mostrarErro(mensagem) {
  mostrarStatus(
    `⚠️ ${mensagem}`,
    'erro'
  );

  if (reservarNumero) {
    reservarNumero.style.display = 'none';
  }
}


/* =========================================================
   🔎 VERIFICAR NÚMERO NO FIREBASE
========================================================= */

async function verificarNumero() {
  if (!numeroDireto) return;

  const valor =
    numeroDireto.value.trim();

  if (valor === '') {
    mostrarErro(
      'Digite um número entre 000 e 999.'
    );
    return;
  }

  const numeroInteiro =
    Number(valor);

  if (
    !Number.isInteger(numeroInteiro) ||
    numeroInteiro < 0 ||
    numeroInteiro > 999
  ) {
    mostrarErro(
      'Digite um número entre 000 e 999.'
    );
    return;
  }

  const numero =
    String(numeroInteiro).padStart(3, '0');

  numeroDireto.value = numero;

  mostrarStatus(
    '🔎 Verificando disponibilidade...',
    'verificando'
  );

  if (!db) {
    mostrarErro(
      'Firebase não está conectado. Verifique o config.js.'
    );
    return;
  }

  try {
    const numeroRef =
      ref(db, `rifa/numeros/${numero}`);

    const snapshot =
      await get(numeroRef);

    if (!snapshot.exists()) {
      mostrarDisponivel(numero);
      return;
    }

    const dados =
      snapshot.val();

    if (numeroEstaOcupado(dados)) {
      mostrarIndisponivel(numero);
    } else {
      mostrarDisponivel(numero);
    }

  } catch (erro) {
    console.error(
      '❌ Erro ao verificar número:',
      erro
    );

    mostrarErro(
      'Não foi possível verificar o número.'
    );
  }
}


/* =========================================================
   🔎 BOTÃO VERIFICAR
========================================================= */

if (verificarNumeroBotao) {
  verificarNumeroBotao.addEventListener(
    'click',
    verificarNumero
  );
}


/* =========================================================
   🔢 DIGITAÇÃO DO NÚMERO
========================================================= */

if (numeroDireto) {

  numeroDireto.addEventListener(
    'input',
    () => {
      numeroDireto.value =
        numeroDireto.value
          .replace(/\D/g, '')
          .slice(0, 3);

      limparNumeroStatus();
    }
  );

  numeroDireto.addEventListener(
    'keydown',
    evento => {
      if (evento.key === 'Enter') {
        evento.preventDefault();
        verificarNumero();
      }
    }
  );
}


/* =========================================================
   🎟️ RESERVAR NÚMERO
========================================================= */

if (reservarNumero) {

  reservarNumero.addEventListener(
    'click',
    async () => {

      const numero =
        reservarNumero.dataset.numero;

      if (!numero) return;

      if (!db) {
        alert(
          '⚠️ Firebase não está conectado.'
        );
        return;
      }

      reservarNumero.disabled = true;

      reservarNumero.textContent =
        '⏳ RESERVANDO...';

      try {

        const numeroRef =
          ref(
            db,
            `rifa/numeros/${numero}`
          );

        const resultado =
          await runTransaction(
            numeroRef,
            atual => {

              if (atual === null) {
                return {
                  numero: numero,
                  status: 'reservado',
                  reservado: true,
                  dataReserva:
                    new Date().toISOString()
                };
              }

              if (numeroEstaOcupado(atual)) {
                return;
              }

              return {
                ...atual,
                numero: numero,
                status: 'reservado',
                reservado: true,
                dataReserva:
                  new Date().toISOString()
              };
            }
          );

        if (!resultado.committed) {

          mostrarIndisponivel(numero);

          alert(
            `❌ O número ${numero} acabou de ser reservado por outra pessoa.`
          );

          return;
        }

        mostrarStatus(
          `✅ NÚMERO ${numero} RESERVADO COM SUCESSO`,
          'disponivel'
        );

        reservarNumero.style.display =
          'none';

        alert(
          `✅ Número ${numero} reservado!\n\n` +
          `Agora faça o pagamento pelo PIX ` +
          `e depois envie o comprovante.`
        );

        setTimeout(() => {
          window.location.href =
            `cartela.html?numero=${numero}`;
        }, 700);

      } catch (erro) {

        console.error(
          '❌ Erro ao reservar número:',
          erro
        );

        reservarNumero.disabled = false;

        reservarNumero.style.display =
          'flex';

        reservarNumero.textContent =
          `🎟️ RESERVAR ${numero}`;

        mostrarErro(
          'Não foi possível reservar o número.'
        );

        alert(
          '❌ Não foi possível reservar o número. Verifique sua conexão e tente novamente.'
        );
      }
    }
  );
}


/* =========================================================
   💠 COPIAR PIX
========================================================= */

const copiarPix =
  document.getElementById('copiarPix');

if (copiarPix) {

  copiarPix.addEventListener(
    'click',
    async () => {

      const chave =
        CONFIG &&
        CONFIG.pixChave
          ? String(CONFIG.pixChave).trim()
          : '';

      if (!chave) {
        alert(
          '⚠️ Chave PIX não configurada.'
        );
        return;
      }

      try {

        await navigator.clipboard.writeText(
          chave
        );

        copiarPix.textContent =
          '✅ PIX COPIADO!';

        setTimeout(() => {
          copiarPix.textContent =
            '💠 COPIAR CHAVE PIX';
        }, 1800);

      } catch {

        try {

          const campo =
            document.createElement('textarea');

          campo.value = chave;
          campo.style.position = 'fixed';
          campo.style.left = '-9999px';

          document.body.appendChild(campo);

          campo.focus();
          campo.select();

          const copiou =
            document.execCommand('copy');

          campo.remove();

          if (copiou) {

            copiarPix.textContent =
              '✅ PIX COPIADO!';

            setTimeout(() => {
              copiarPix.textContent =
                '💠 COPIAR CHAVE PIX';
            }, 1800);

          } else {
            throw new Error();
          }

        } catch {

          alert(
            `Copie manualmente a chave PIX:\n\n${chave}`
          );
        }
      }
    }
  );
}


/* =========================================================
   🍀 RASPADINHA DA AMIZADE
========================================================= */

const canvas =
  document.getElementById('scratchCanvas');

const area =
  document.querySelector('.scratch-area');

const premio =
  document.getElementById('scratchPremio');


if (canvas && area && premio) {

  const ctx =
    canvas.getContext(
      '2d',
      {
        willReadFrequently: true
      }
    );

  let raspando = false;
  let finalizada = false;

  const premios = [
    {
      nome: 'LIQUIDIFICADOR',
      imagem: 'img/liquidificador.png'
    },
    {
      nome: 'FERRO ELÉTRICO',
      imagem: 'img/ferro.png'
    }
  ];

  const premioEscolhido =
    premios[
      Math.floor(
        Math.random() * premios.length
      )
    ];


  /* =======================================================
     📐 AJUSTAR CANVAS
  ======================================================= */

  function ajustarCanvas() {

    const rect =
      area.getBoundingClientRect();

    const largura =
      Math.max(
        1,
        Math.round(rect.width)
      );

    const altura =
      Math.max(
        1,
        Math.round(rect.height)
      );

    const escala =
      window.devicePixelRatio || 1;

    canvas.width =
      largura * escala;

    canvas.height =
      altura * escala;

    canvas.style.width =
      `${largura}px`;

    canvas.style.height =
      `${altura}px`;

    ctx.setTransform(
      escala,
      0,
      0,
      escala,
      0,
      0
    );

    ctx.globalCompositeOperation =
      'source-over';


    /* -----------------------------------------------------
       FUNDO METÁLICO
    ----------------------------------------------------- */

    const gradiente =
      ctx.createLinearGradient(
        0,
        0,
        largura,
        altura
      );

    gradiente.addColorStop(
      0,
      '#d5d9dd'
    );

    gradiente.addColorStop(
      0.25,
      '#9aa1a7'
    );

    gradiente.addColorStop(
      0.5,
      '#cdd2d6'
    );

    gradiente.addColorStop(
      0.75,
      '#8f969c'
    );

    gradiente.addColorStop(
      1,
      '#d6dade'
    );

    ctx.fillStyle =
      gradiente;

    ctx.fillRect(
      0,
      0,
      largura,
      altura
    );


    /* -----------------------------------------------------
       BRILHO METÁLICO
    ----------------------------------------------------- */

    ctx.strokeStyle =
      'rgba(255,255,255,.25)';

    ctx.lineWidth = 8;

    for (
      let x = -altura;
      x < largura + altura;
      x += 32
    ) {

      ctx.beginPath();

      ctx.moveTo(
        x,
        0
      );

      ctx.lineTo(
        x + altura,
        altura
      );

      ctx.stroke();
    }


    /* -----------------------------------------------------
       BORDA INTERNA
    ----------------------------------------------------- */

    ctx.strokeStyle =
      'rgba(70,80,90,.25)';

    ctx.lineWidth = 2;

    ctx.strokeRect(
      1,
      1,
      largura - 2,
      altura - 2
    );


    /* -----------------------------------------------------
       TEXTO RASPE AQUI
    ----------------------------------------------------- */

    ctx.fillStyle =
      '#555d63';

    ctx.font =
      '900 20px Arial';

    ctx.textAlign =
      'center';

    ctx.textBaseline =
      'middle';

    ctx.fillText(
      'RASPE AQUI',
      largura / 2,
      altura / 2
    );
  }


  /* =======================================================
     📍 POSIÇÃO
  ======================================================= */

  function obterPosicao(evento) {

    const rect =
      canvas.getBoundingClientRect();

    let clientX;
    let clientY;

    if (
      evento.touches &&
      evento.touches.length
    ) {

      clientX =
        evento.touches[0].clientX;

      clientY =
        evento.touches[0].clientY;

    } else {

      clientX =
        evento.clientX;

      clientY =
        evento.clientY;
    }

    return {
      x:
        clientX - rect.left,

      y:
        clientY - rect.top
    };
  }


  /* =======================================================
     ✏️ RASPAR
  ======================================================= */

  function raspar(evento) {

    if (
      !raspando ||
      finalizada
    ) {
      return;
    }

    evento.preventDefault();

    const pos =
      obterPosicao(evento);

    ctx.globalCompositeOperation =
      'destination-out';

    ctx.beginPath();

    ctx.arc(
      pos.x,
      pos.y,
      28,
      0,
      Math.PI * 2
    );

    ctx.fill();

    verificarProgresso();
  }


  /* =======================================================
     🖐️ INICIAR
  ======================================================= */

  function iniciar(evento) {

    if (finalizada) return;

    raspando = true;

    evento.preventDefault();

    raspar(evento);
  }


  /* =======================================================
     ✋ PARAR
  ======================================================= */

  function parar() {

    if (!raspando) return;

    raspando = false;

    verificarProgresso();
  }


  /* =======================================================
     🎉 MOSTRAR PRÊMIO
  ======================================================= */

  function mostrarPremio() {

    finalizada = true;

    premio.innerHTML = `

      <img
        class="scratch-premio-imagem"
        src="${premioEscolhido.imagem}"
        alt="${premioEscolhido.nome}"
      >

      <strong>
        🎉 ${premioEscolhido.nome}
      </strong>

      <small>
        PARABÉNS! VOCÊ GANHOU!
      </small>

    `;

    premio.classList.add('revelado');

    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );
  }


  /* =======================================================
     📊 PROGRESSO
  ======================================================= */

  function verificarProgresso() {

    if (finalizada) return;

    const largura =
      canvas.width;

    const altura =
      canvas.height;

    let imagem;

    try {

      imagem =
        ctx.getImageData(
          0,
          0,
          largura,
          altura
        );

    } catch {
      return;
    }

    let transparentes = 0;

    const total =
      imagem.data.length / 4;

    for (
      let i = 3;
      i < imagem.data.length;
      i += 4
    ) {

      if (
        imagem.data[i] === 0
      ) {
        transparentes++;
      }
    }

    const porcentagem =
      transparentes / total;

    if (
      porcentagem >= 0.40
    ) {
      mostrarPremio();
    }
  }


  /* =======================================================
     🖱️ MOUSE
  ======================================================= */

  canvas.addEventListener(
    'mousedown',
    iniciar
  );

  canvas.addEventListener(
    'mousemove',
    raspar
  );

  window.addEventListener(
    'mouseup',
    parar
  );


  /* =======================================================
     📱 TOUCH
  ======================================================= */

  canvas.addEventListener(
    'touchstart',
    iniciar,
    {
      passive: false
    }
  );

  canvas.addEventListener(
    'touchmove',
    raspar,
    {
      passive: false
    }
  );

  canvas.addEventListener(
    'touchend',
    parar,
    {
      passive: true
    }
  );

  canvas.addEventListener(
    'touchcancel',
    parar,
    {
      passive: true
    }
  );


  /* =======================================================
     🔄 REDIMENSIONAMENTO
  ======================================================= */

  window.addEventListener(
    'resize',
    () => {

      if (!finalizada) {
        ajustarCanvas();
      }

    }
  );


  /* =======================================================
     🚀 INICIAR
  ======================================================= */

  ajustarCanvas();
}


/* =========================================================
   📲 COMPROVANTE
========================================================= */

const comprovante =
  document.getElementById('comprovante');

const comprovanteNome =
  document.getElementById('comprovanteNome');

const enviarWhatsApp =
  document.getElementById('enviarWhatsApp');

const comprovanteMsg =
  document.getElementById('comprovanteMsg');


if (
  comprovante &&
  comprovanteNome &&
  enviarWhatsApp
) {

  comprovante.addEventListener(
    'change',
    () => {

      const arquivo =
        comprovante.files &&
        comprovante.files[0];

      if (!arquivo) {

        comprovanteNome.textContent =
          'Nenhum arquivo selecionado.';

        enviarWhatsApp.disabled =
          true;

        if (comprovanteMsg) {
          comprovanteMsg.textContent = '';
        }

        return;
      }

      const tamanhoMaximo =
        10 * 1024 * 1024;

      if (
        arquivo.size >
        tamanhoMaximo
      ) {

        comprovante.value = '';

        comprovanteNome.textContent =
          'Nenhum arquivo selecionado.';

        enviarWhatsApp.disabled =
          true;

        if (comprovanteMsg) {
          comprovanteMsg.textContent =
            '⚠️ O arquivo deve ter no máximo 10 MB.';
        }

        return;
      }

      comprovanteNome.textContent =
        `✅ ${arquivo.name}`;

      enviarWhatsApp.disabled =
        false;

      if (comprovanteMsg) {
        comprovanteMsg.textContent =
          'Comprovante pronto para envio.';
      }
    }
  );


  /* =======================================================
     📲 ENVIAR PELO WHATSAPP
  ======================================================= */

  enviarWhatsApp.addEventListener(
    'click',
    async () => {

      const arquivo =
        comprovante.files &&
        comprovante.files[0];

      if (!arquivo) {

        if (comprovanteMsg) {
          comprovanteMsg.textContent =
            '⚠️ Selecione o comprovante primeiro.';
        }

        return;
      }


      const mensagem =
        'Olá! Estou enviando o comprovante de pagamento da Rifa Solidária — GILFEST.';


      /*
       * IMPORTANTE:
       * O navegador não consegue anexar automaticamente
       * um arquivo ao WhatsApp usando apenas wa.me.
       *
       * Por isso tentamos primeiro o compartilhamento
       * nativo do celular/computador.
       */

      try {

        const dados = {
          files: [arquivo],
          text: mensagem,
          title: mensagem
        };

        if (
          navigator.share &&
          navigator.canShare &&
          navigator.canShare(dados)
        ) {

          await navigator.share(dados);

          if (comprovanteMsg) {
            comprovanteMsg.textContent =
              '✅ Escolha o WhatsApp e envie o comprovante.';
          }

          return;
        }

      } catch (erro) {

        if (
          erro &&
          erro.name === 'AbortError'
        ) {

          if (comprovanteMsg) {
            comprovanteMsg.textContent =
              'Compartilhamento cancelado.';
          }

          return;
        }

        console.log(
          'Compartilhamento:',
          erro
        );
      }


      /*
       * FALLBACK:
       * Abre diretamente o WhatsApp.
       * O usuário precisa anexar o arquivo manualmente.
       */

      const numeroWhatsApp =
        '5579999145044';

      const url =
        `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;

      window.open(
        url,
        '_blank'
      );

      if (comprovanteMsg) {
        comprovanteMsg.textContent =
          '📲 WhatsApp aberto. Anexe o comprovante na conversa.';
      }
    }
  );
}


/* =========================================================
   ✨ ANIMAÇÃO SUAVE DOS CARTÕES
========================================================= */

document.addEventListener(
  'DOMContentLoaded',
  () => {

    const cards =
      document.querySelectorAll(
        '.card'
      );

    cards.forEach(
      (card, indice) => {

        card.style.animation =
          `cardEntrada .6s ease ${indice * 0.06}s both`;
      }
    );

  }
);


/* =========================================================
   🛡️ GARANTIR QUE A RASPADINHA FIQUE VISÍVEL
========================================================= */

const scratchCard =
  document.querySelector('.scratch');

if (scratchCard) {

  scratchCard.style.display =
    'block';

  scratchCard.style.width =
    '100%';

}


/* =========================================================
   🛡️ GARANTIR QUE OS CARTÕES FIQUEM UM ABAIXO DO OUTRO
========================================================= */

const stepsGrid =
  document.querySelector('.steps-grid');

if (stepsGrid) {

  stepsGrid.style.display =
    'flex';

  stepsGrid.style.flexDirection =
    'column';

  stepsGrid.style.width =
    '100%';

}


/* =========================================================
   🛡️ GARANTIR TAMANHO DA RASPADINHA
========================================================= */

if (area) {

  area.style.width =
    'min(100%, 700px)';

  area.style.margin =
    '18px auto';

  area.style.position =
    'relative';

  area.style.overflow =
    'hidden';
}
