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

    const app =
      initializeApp(CONFIG.firebaseConfig);

    db =
      getDatabase(app);

    console.log('✅ Firebase conectado.');

  } else {

    console.warn(
      '⚠️ Firebase não configurado em config.js.'
    );

  }

} catch (erro) {

  console.error(
    '❌ Erro ao iniciar Firebase:',
    erro
  );

}


/* =========================================================
   ⚙️ CONFIGURAÇÕES
========================================================= */

const VALOR_NUMERO =
  Number(CONFIG?.valorNumero || 10);

const WHATSAPP =
  '5579999145044';


/* =========================================================
   🎯 ELEMENTOS
========================================================= */

const abrirCartelas =
  document.getElementById('abrirCartelas');

const sugerir =
  document.getElementById('sugerir');

const numeroDireto =
  document.getElementById('numeroDireto');

const verificarNumeroBotao =
  document.getElementById('verificarNumero');

const numeroStatus =
  document.getElementById('numeroStatus');

const reservarNumero =
  document.getElementById('reservarNumero');

const reservaNumeros =
  document.getElementById('reservaNumeros');

const reservaTotal =
  document.getElementById('reservaTotal');

const reservaData =
  document.getElementById('reservaData');

const reservaHora =
  document.getElementById('reservaHora');

const copiarPixReserva =
  document.getElementById('copiarPixReserva');

const pixMsgReserva =
  document.getElementById('pixMsgReserva');

const nomeReserva =
  document.getElementById('nomeReserva');

const telefoneReserva =
  document.getElementById('telefoneReserva');

const reservarReserva =
  document.getElementById('reservarReserva');

const msgReserva =
  document.getElementById('msgReserva');

const limparSelecao =
  document.getElementById('limparSelecao');


/* =========================================================
   🧠 COMPRA ATUAL
========================================================= */

let compraAtual = {
  numeros: [],
  quantidade: 0,
  total: 0,
  data: '',
  hora: '',
  timestamp: ''
};


/* =========================================================
   🎟️ IR PARA CARTELAS
========================================================= */

if (abrirCartelas) {

  abrirCartelas.addEventListener(
    'click',
    () => {

      window.location.href =
        'cartela.html';

    }
  );

}


/* =========================================================
   🍀 SUGERIR NÚMERO
========================================================= */

if (sugerir) {

  sugerir.addEventListener(
    'click',
    () => {

      window.location.href =
        'cartela.html?sugerir=1';

    }
  );

}


/* =========================================================
   🔢 FORMATAR NÚMERO
========================================================= */

function formatarNumero(valor) {

  const numero =
    Number(valor);

  if (
    !Number.isInteger(numero) ||
    numero < 0 ||
    numero > 999
  ) {

    return null;

  }

  return String(numero)
    .padStart(3, '0');

}


/* =========================================================
   📅 DATA E HORA
========================================================= */

function obterDataHora() {

  const agora =
    new Date();

  return {

    data:
      agora.toLocaleDateString(
        'pt-BR'
      ),

    hora:
      agora.toLocaleTimeString(
        'pt-BR',
        {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }
      ),

    timestamp:
      agora.toISOString()

  };

}


/* =========================================================
   💰 FORMATAR VALOR
========================================================= */

function formatarValor(valor) {

  return Number(valor || 0)
    .toLocaleString(
      'pt-BR',
      {
        style: 'currency',
        currency: 'BRL'
      }
    );

}


/* =========================================================
   🟢 STATUS
========================================================= */

function mostrarStatus(
  mensagem,
  tipo
) {

  if (!numeroStatus) {
    return;
  }

  numeroStatus.style.display =
    'flex';

  numeroStatus.textContent =
    mensagem;

  numeroStatus.classList.remove(
    'disponivel',
    'indisponivel',
    'verificando',
    'erro'
  );

  numeroStatus.classList.add(
    tipo
  );

}


/* =========================================================
   🧹 LIMPAR STATUS
========================================================= */

function limparNumeroStatus() {

  if (numeroStatus) {

    numeroStatus.style.display =
      'none';

    numeroStatus.textContent =
      '';

    numeroStatus.classList.remove(
      'disponivel',
      'indisponivel',
      'verificando',
      'erro'
    );

  }

  if (reservarNumero) {

    reservarNumero.style.display =
      'none';

    reservarNumero.hidden =
      true;

    reservarNumero.disabled =
      false;

    delete reservarNumero.dataset.numero;

  }

}


/* =========================================================
   🔎 VERIFICAR SE NÚMERO ESTÁ OCUPADO
========================================================= */

function numeroEstaOcupado(
  dados
) {

  if (!dados) {
    return false;
  }

  const status =
    String(
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
   🧾 MOSTRAR CONFIRMAÇÃO
========================================================= */

function mostrarConfirmacao(
  numeros,
  dataHora = obterDataHora()
) {

  const lista =
    Array.isArray(numeros)
      ? numeros
      : [numeros];

  const numerosFormatados =
    lista
      .map(formatarNumero)
      .filter(Boolean);

  if (!numerosFormatados.length) {
    return;
  }


  const quantidade =
    numerosFormatados.length;

  const total =
    quantidade *
    VALOR_NUMERO;


  compraAtual = {

    numeros:
      numerosFormatados,

    quantidade,

    total,

    data:
      dataHora.data,

    hora:
      dataHora.hora,

    timestamp:
      dataHora.timestamp

  };


  /* -------------------------------------------------------
     🎟️ NÚMEROS
  ------------------------------------------------------- */

  if (reservaNumeros) {

    reservaNumeros.textContent =
      numerosFormatados.join(', ');

  }


  /* -------------------------------------------------------
     💰 TOTAL
  ------------------------------------------------------- */

  if (reservaTotal) {

    reservaTotal.textContent =
      `🎟️ ${quantidade} número(s) • Total: ${formatarValor(total)}`;

  }


  /* -------------------------------------------------------
     📅 DATA
  ------------------------------------------------------- */

  if (reservaData) {

    reservaData.textContent =
      dataHora.data;

  }


  /* -------------------------------------------------------
     🕐 HORA
  ------------------------------------------------------- */

  if (reservaHora) {

    reservaHora.textContent =
      dataHora.hora;

  }


  /* -------------------------------------------------------
     💾 SALVAR COMPRA
  ------------------------------------------------------- */

  try {

    localStorage.setItem(
      'rifaCompraAtual',
      JSON.stringify(
        compraAtual
      )
    );

  } catch (erro) {

    console.warn(
      '⚠️ Não foi possível salvar a compra.',
      erro
    );

  }


  /* -------------------------------------------------------
     📦 MOSTRAR CARTÃO
  ------------------------------------------------------- */

  const cartao =
    document.querySelector(
      '.reserva-inline'
    );

  if (cartao) {

    cartao.style.display =
      'block';

    setTimeout(
      () => {

        cartao.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });

      },
      150
    );

  }

}


/* =========================================================
   🟢 NÚMERO DISPONÍVEL
========================================================= */

function mostrarDisponivel(
  numero
) {

  mostrarStatus(
    `🟢 NÚMERO ${numero} DISPONÍVEL`,
    'disponivel'
  );


  /*
   * IMPORTANTE:
   *
   * Assim que o número é confirmado como disponível,
   * o cartão CONFIRMAR PARTICIPAÇÃO é preenchido
   * automaticamente.
   */

  mostrarConfirmacao(
    [numero],
    obterDataHora()
  );


  if (reservarNumero) {

    reservarNumero.style.display =
      'flex';

    reservarNumero.hidden =
      false;

    reservarNumero.disabled =
      false;

    reservarNumero.textContent =
      `🛒 COMPRAR ${numero}`;

    reservarNumero.dataset.numero =
      numero;

  }

}


/* =========================================================
   🔴 NÚMERO INDISPONÍVEL
========================================================= */

function mostrarIndisponivel(
  numero
) {

  mostrarStatus(
    `🔴 NÚMERO ${numero} NÃO DISPONÍVEL`,
    'indisponivel'
  );


  if (reservarNumero) {

    reservarNumero.style.display =
      'none';

    reservarNumero.hidden =
      true;

    delete reservarNumero.dataset.numero;

  }

}


/* =========================================================
   ⚠️ ERRO
========================================================= */

function mostrarErro(
  mensagem
) {

  mostrarStatus(
    `⚠️ ${mensagem}`,
    'erro'
  );

}


/* =========================================================
   🔎 VERIFICAR NÚMERO
========================================================= */

async function verificarNumero() {

  if (!numeroDireto) {
    return;
  }


  const valor =
    numeroDireto.value.trim();


  if (valor === '') {

    mostrarErro(
      'Digite um número entre 000 e 999.'
    );

    return;

  }


  const numero =
    formatarNumero(
      valor
    );


  if (!numero) {

    mostrarErro(
      'Digite um número entre 000 e 999.'
    );

    return;

  }


  numeroDireto.value =
    numero;


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
      ref(
        db,
        `rifa/numeros/${numero}`
      );


    const snapshot =
      await get(
        numeroRef
      );


    /* -----------------------------------------------------
       NÚMERO NÃO EXISTE
       → DISPONÍVEL
    ----------------------------------------------------- */

    if (!snapshot.exists()) {

      mostrarDisponivel(
        numero
      );

      return;

    }


    const dados =
      snapshot.val();


    /* -----------------------------------------------------
       OCUPADO
    ----------------------------------------------------- */

    if (
      numeroEstaOcupado(
        dados
      )
    ) {

      mostrarIndisponivel(
        numero
      );

      return;

    }


    /* -----------------------------------------------------
       EXISTE, MAS ESTÁ LIVRE
    ----------------------------------------------------- */

    mostrarDisponivel(
      numero
    );

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
   🔢 DIGITAÇÃO
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

      if (
        evento.key === 'Enter'
      ) {

        evento.preventDefault();

        verificarNumero();

      }

    }
  );

}


/* =========================================================
   🔒 RESERVAR NÚMERO NO FIREBASE
========================================================= */

async function reservarNumeroFirebase(
  numero
) {

  if (!db) {

    throw new Error(
      'Firebase não está conectado.'
    );

  }


  const numeroRef =
    ref(
      db,
      `rifa/numeros/${numero}`
    );


  const dataHora =
    obterDataHora();


  const resultado =
    await runTransaction(
      numeroRef,
      atual => {

        if (atual === null) {

          return {

            numero,

            status:
              'reservado',

            reservado:
              true,

            dataReserva:
              dataHora.timestamp

          };

        }


        if (
          numeroEstaOcupado(
            atual
          )
        ) {

          return;

        }


        return {

          ...atual,

          numero,

          status:
            'reservado',

          reservado:
            true,

          dataReserva:
            dataHora.timestamp

        };

      }
    );


  if (!resultado.committed) {

    throw new Error(
      `O número ${numero} não está mais disponível.`
    );

  }


  return dataHora;

}


/* =========================================================
   🛒 BOTÃO COMPRAR / RESERVAR
========================================================= */

if (reservarNumero) {

  reservarNumero.addEventListener(
    'click',
    async () => {

      const numero =
        reservarNumero.dataset.numero;


      if (!numero) {
        return;
      }


      if (!db) {

        mostrarErro(
          'Firebase não está conectado.'
        );

        return;

      }


      reservarNumero.disabled =
        true;

      reservarNumero.textContent =
        `⏳ RESERVANDO ${numero}...`;


      try {

        const dataHora =
          await reservarNumeroFirebase(
            numero
          );


        mostrarConfirmacao(
          [numero],
          dataHora
        );


        mostrarStatus(
          `✅ NÚMERO ${numero} RESERVADO`,
          'disponivel'
        );


        reservarNumero.style.display =
          'none';

        reservarNumero.hidden =
          true;


      } catch (erro) {

        console.error(
          '❌ Erro ao reservar:',
          erro
        );


        reservarNumero.disabled =
          false;

        reservarNumero.style.display =
          'flex';

        reservarNumero.hidden =
          false;

        reservarNumero.textContent =
          `🛒 COMPRAR ${numero}`;


        mostrarErro(
          erro.message ||
          'Não foi possível reservar o número.'
        );

      }

    }
  );

}


/* =========================================================
   💠 COPIAR PIX
========================================================= */

async function copiarChavePix(
  botao
) {

  const chave =
    CONFIG &&
    CONFIG.pixChave
      ? String(
          CONFIG.pixChave
        ).trim()
      : '';


  if (!chave) {

    if (pixMsgReserva) {

      pixMsgReserva.textContent =
        '⚠️ Chave PIX não configurada.';

    }

    return;

  }


  try {

    await navigator.clipboard.writeText(
      chave
    );


    if (botao) {

      botao.textContent =
        '✅ PIX COPIADO!';

    }


    if (pixMsgReserva) {

      pixMsgReserva.textContent =
        '✅ Chave PIX copiada. Faça o pagamento antes de enviar para o WhatsApp.';

    }


    setTimeout(
      () => {

        if (botao) {

          botao.textContent =
            '📋 COPIAR PIX';

        }

      },
      1800
    );


  } catch {

    try {

      const campo =
        document.createElement(
          'textarea'
        );

      campo.value =
        chave;

      campo.style.position =
        'fixed';

      campo.style.left =
        '-9999px';

      document.body.appendChild(
        campo
      );

      campo.focus();

      campo.select();


      const copiou =
        document.execCommand(
          'copy'
        );


      campo.remove();


      if (copiou) {

        if (botao) {

          botao.textContent =
            '✅ PIX COPIADO!';

        }

      } else {

        throw new Error();

      }

    } catch {

      if (pixMsgReserva) {

        pixMsgReserva.textContent =
          `📋 Copie manualmente: ${chave}`;

      }

    }

  }

}


if (copiarPixReserva) {

  copiarPixReserva.addEventListener(
    'click',
    () => {

      copiarChavePix(
        copiarPixReserva
      );

    }
  );

}


/* =========================================================
   📲 MENSAGEM WHATSAPP
========================================================= */

function montarMensagemWhatsApp() {

  const numeros =
    compraAtual.numeros.join(
      ', '
    );


  const quantidade =
    compraAtual.quantidade;


  const total =
    formatarValor(
      compraAtual.total
    );


  const nome =
    nomeReserva?.value.trim() ||
    'Não informado';


  const telefone =
    telefoneReserva?.value.trim() ||
    'Não informado';


  return (

    `🍀 *RIFA SOLIDÁRIA — GILFEST*\n\n` +

    `🧾 *CONFIRMAÇÃO DE PARTICIPAÇÃO*\n\n` +

    `🎟️ Número(s): *${numeros}*\n` +

    `🔢 Quantidade: *${quantidade}*\n` +

    `💰 Valor total: *${total}*\n` +

    `📅 Data da compra: *${compraAtual.data}*\n` +

    `🕐 Hora da compra: *${compraAtual.hora}*\n\n` +

    `👤 Nome: *${nome}*\n` +

    `📱 WhatsApp: *${telefone}*\n\n` +

    `💚 Pagamento via PIX realizado.\n\n` +

    `📎 *COMPROVANTE DE PAGAMENTO*\n` +

    `Anexe nesta conversa o comprovante do pagamento.\n\n` +

    `⚠️ *Só enviar esta mensagem com o pagamento já realizado.*\n\n` +

    `🍀 Obrigado por participar da Rifa Solidária — GILFEST!`

  );

}


/* =========================================================
   📲 ENVIAR PARA WHATSAPP
========================================================= */

if (reservarReserva) {

  reservarReserva.addEventListener(
    'click',
    () => {

      if (
        !compraAtual.numeros ||
        !compraAtual.numeros.length
      ) {

        if (msgReserva) {

          msgReserva.textContent =
            '⚠️ Primeiro escolha ou compre um número.';

        }

        return;

      }


      const nome =
        nomeReserva?.value.trim();


      const telefone =
        telefoneReserva?.value.trim();


      if (!nome) {

        if (msgReserva) {

          msgReserva.textContent =
            '⚠️ Informe seu nome antes de enviar.';

        }

        nomeReserva?.focus();

        return;

      }


      if (!telefone) {

        if (msgReserva) {

          msgReserva.textContent =
            '⚠️ Informe seu WhatsApp antes de enviar.';

        }

        telefoneReserva?.focus();

        return;

      }


      const mensagem =
        montarMensagemWhatsApp();


      const url =
        `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
          mensagem
        )}`;


      if (msgReserva) {

        msgReserva.textContent =
          '📲 Abrindo seu WhatsApp... Anexe o comprovante na conversa antes de enviar.';

      }


      window.open(
        url,
        '_blank'
      );

    }
  );

}


/* =========================================================
   🔄 RECUPERAR COMPRA SALVA
========================================================= */

function recuperarCompraSalva() {

  try {

    const salva =
      localStorage.getItem(
        'rifaCompraAtual'
      );


    if (!salva) {
      return false;
    }


    const dados =
      JSON.parse(
        salva
      );


    if (
      !dados ||
      !Array.isArray(dados.numeros) ||
      !dados.numeros.length
    ) {

      return false;

    }


    compraAtual =
      dados;


    if (reservaNumeros) {

      reservaNumeros.textContent =
        dados.numeros.join(', ');

    }


    if (reservaTotal) {

      reservaTotal.textContent =
        `🎟️ ${dados.quantidade} número(s) • Total: ${formatarValor(dados.total)}`;

    }


    if (reservaData) {

      reservaData.textContent =
        dados.data || '—';

    }


    if (reservaHora) {

      reservaHora.textContent =
        dados.hora || '—';

    }


    return true;

  } catch (erro) {

    console.warn(
      '⚠️ Erro ao recuperar compra:',
      erro
    );

    return false;

  }

}


/* =========================================================
   🆕 🔗 LER NÚMEROS VINDOS DA CARTELA
========================================================= */

function lerSelecionadosDaCartela() {

  try {

    const salva =
      localStorage.getItem(
        'rifaSelecionados'
      );


    if (!salva) {

      return false;

    }


    const numeros =
      JSON.parse(
        salva
      );


    if (
      !Array.isArray(numeros) ||
      !numeros.length
    ) {

      return false;

    }


    const numerosFormatados =
      numeros
        .map(formatarNumero)
        .filter(Boolean);


    if (!numerosFormatados.length) {

      return false;

    }


    /*
     * A data/hora é criada no momento em que
     * o cliente chega ao cartão de confirmação.
     */

    const dataHora =
      obterDataHora();


    mostrarConfirmacao(
      numerosFormatados,
      dataHora
    );


    /*
     * Depois de transferir os números para
     * o cartão de confirmação, apagamos
     * somente a seleção temporária da cartela.
     *
     * A compra continua salva em
     * rifaCompraAtual.
     */

    localStorage.removeItem(
      'rifaSelecionados'
    );


    /*
     * Mostra uma mensagem visual informando
     * que os números chegaram corretamente.
     */

    if (numeroStatus) {

      mostrarStatus(
        `🟢 ${numerosFormatados.length} número(s) selecionado(s)`,
        'disponivel'
      );

    }


    return true;

  } catch (erro) {

    console.warn(
      '⚠️ Erro ao ler números da cartela:',
      erro
    );

    return false;

  }

}


/* =========================================================
   🔗 NÚMEROS VINDOS PELA URL
========================================================= */

function lerNumerosDaURL() {

  const params =
    new URLSearchParams(
      window.location.search
    );


  const numero =
    params.get(
      'numero'
    );


  const numerosParam =
    params.get(
      'numeros'
    );


  let numeros =
    [];


  if (numerosParam) {

    numeros =
      numerosParam
        .split(',')
        .map(
          n =>
            formatarNumero(
              n
            )
        )
        .filter(Boolean);

  } else if (numero) {

    const formatado =
      formatarNumero(
        numero
      );


    if (formatado) {

      numeros =
        [formatado];

    }

  }


  if (!numeros.length) {

    return false;

  }


  mostrarConfirmacao(
    numeros,
    obterDataHora()
  );


  return true;

}


/* =========================================================
   🚀 INICIALIZAÇÃO
========================================================= */

document.addEventListener(
  'DOMContentLoaded',
  () => {

    /*
     * PRIMEIRA PRIORIDADE:
     *
     * Números selecionados na CARTELA.
     */

    const veioDaCartela =
      lerSelecionadosDaCartela();


    if (veioDaCartela) {

      return;

    }


    /*
     * SEGUNDA PRIORIDADE:
     *
     * Número(s) enviados pela URL.
     */

    const veioDaURL =
      lerNumerosDaURL();


    if (veioDaURL) {

      return;

    }


    /*
     * TERCEIRA PRIORIDADE:
     *
     * Compra já salva anteriormente.
     */

    recuperarCompraSalva();

  }

);


/* =========================================================
   ✨ ANIMAÇÃO DOS CARTÕES
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
   🛡️ RASPADINHA VISÍVEL
========================================================= */

const scratchCard =
  document.querySelector(
    '.scratch'
  );


if (scratchCard) {

  scratchCard.style.display =
    'block';

  scratchCard.style.width =
    '100%';

}


/* =========================================================
   🛡️ CARTÕES VERTICAIS
========================================================= */

const stepsGrid =
  document.querySelector(
    '.steps-grid'
  );


if (stepsGrid) {

  stepsGrid.style.display =
    'flex';

  stepsGrid.style.flexDirection =
    'column';

  stepsGrid.style.width =
    '100%';

}


/* =========================================================
   🛡️ TAMANHO DA RASPADINHA
========================================================= */

const scratchArea =
  document.querySelector(
    '.scratch-area'
  );


if (scratchArea) {

  scratchArea.style.width =
    'min(100%, 700px)';

  scratchArea.style.margin =
    '18px auto';

  scratchArea.style.position =
    'relative';

  scratchArea.style.overflow =
    'hidden';

}

/* =========================================================
🗑️ LIMPAR SELEÇÃO E ESCOLHER NOVOS NÚMEROS
========================================================= */

if (limparSelecao) {

limparSelecao.addEventListener(
'click',
() => {

  if (
    !compraAtual.numeros ||
    !compraAtual.numeros.length
  ) {

    alert(
      '⚠️ Não há números selecionados para limpar.'
    );

    return;

  }

  const confirmar =
    confirm(
      '⚠️ Deseja limpar os números atuais e escolher outros números?'
    );

  if (!confirmar) {
    return;
  }


  /* =====================================================
     🧹 LIMPAR COMPRA ATUAL
  ===================================================== */

  compraAtual = {
    numeros: [],
    quantidade: 0,
    total: 0,
    data: '',
    hora: '',
    timestamp: ''
  };


  /* =====================================================
     🧹 LIMPAR SELEÇÃO SALVA
  ===================================================== */

  localStorage.removeItem(
    'rifaCompraAtual'
  );

  localStorage.removeItem(
    'rifaSelecionados'
  );


  /* =====================================================
     🧹 LIMPAR CAMPOS
  ===================================================== */

  if (reservaNumeros) {

    reservaNumeros.textContent =
      'Nenhum número selecionado';

  }

  if (reservaTotal) {

    reservaTotal.textContent =
      'Total: R$ 0,00';

  }

  if (reservaData) {

    reservaData.textContent =
      '—';

  }

  if (reservaHora) {

    reservaHora.textContent =
      '—';

  }

  if (nomeReserva) {

    nomeReserva.value = '';

  }

  if (telefoneReserva) {

    telefoneReserva.value = '';

  }

  if (numeroDireto) {

    numeroDireto.value = '';

  }


  /* =====================================================
     🧹 LIMPAR STATUS DO NÚMERO
  ===================================================== */

  limparNumeroStatus();


  /* =====================================================
     🔄 VOLTAR PARA A CARTELA
     
     A cartela abrirá novamente sem os números antigos
     selecionados.
  ===================================================== */

  window.location.href =
    'cartela.html';

}

);

}
