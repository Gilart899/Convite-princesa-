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

const enviarComprovante =
  document.getElementById('enviarComprovante');

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
   📎 COMPROVANTE SELECIONADO
========================================================= */

let comprovanteSelecionado = null;


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


  if (reservaNumeros) {

    reservaNumeros.textContent =
      numerosFormatados.join(', ');

  }


  if (reservaTotal) {

    reservaTotal.textContent =
      `🎟️ ${quantidade} número(s) • Total: ${formatarValor(total)}`;

  }


  if (reservaData) {

    reservaData.textContent =
      dataHora.data;

  }


  if (reservaHora) {

    reservaHora.textContent =
      dataHora.hora;

  }


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


    if (!snapshot.exists()) {

      mostrarDisponivel(
        numero
      );

      return;

    }


    const dados =
      snapshot.val();


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
              dataHora.timestamp,

            reservaExpiraEm:
              Date.now() +
              (24 * 60 * 60 * 1000)

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
            dataHora.timestamp,

          reservaExpiraEm:
            Date.now() +
            (24 * 60 * 60 * 1000)

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
   🛒 BOTÃO COMPRAR
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
          `✅ NÚMERO ${numero} RESERVADO POR 24 HORAS`,
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
        '✅ Chave PIX copiada. Faça o pagamento antes de enviar o comprovante.';

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

    `O comprovante será enviado nesta conversa.\n\n` +

    `🔒 Os números ficam reservados por *24 horas* após a confirmação.\n\n` +

    `🍀 Obrigado por participar da Rifa Solidária — GILFEST!`

  );

}


/* =========================================================
   📲 CONFIRMAR PARTICIPAÇÃO
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
          '📲 Abrindo seu WhatsApp...';

      }


      window.open(
        url,
        '_blank'
      );

    }
  );

}


/* =========================================================
   📎 ENVIAR COMPROVANTE
========================================================= */

if (enviarComprovante) {

  enviarComprovante.addEventListener(
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
            '⚠️ Informe seu nome antes de enviar o comprovante.';

        }

        nomeReserva?.focus();

        return;

      }


      if (!telefone) {

        if (msgReserva) {

          msgReserva.textContent =
            '⚠️ Informe seu WhatsApp antes de enviar o comprovante.';

        }

        telefoneReserva?.focus();

        return;

      }


      /*
       * Cria o seletor de arquivo somente
       * quando o cliente toca no botão.
       */

      const inputArquivo =
        document.createElement('input');

      inputArquivo.type =
        'file';

      inputArquivo.accept =
        'image/*,.pdf';

      inputArquivo.style.display =
        'none';


      document.body.appendChild(
        inputArquivo
      );


      inputArquivo.addEventListener(
        'change',
        () => {

          const arquivo =
            inputArquivo.files?.[0];


          if (!arquivo) {

            inputArquivo.remove();

            return;

          }


          comprovanteSelecionado =
            arquivo;


          const tamanhoMB =
            arquivo.size /
            (1024 * 1024);


          /*
           * Limite preventivo de 10 MB.
           */

          if (
            tamanhoMB > 10
          ) {

            if (msgReserva) {

              msgReserva.textContent =
                '⚠️ O comprovante deve ter no máximo 10 MB.';

            }

            comprovanteSelecionado =
              null;

            inputArquivo.remove();

            return;

          }


          /*
           * Mostra o arquivo escolhido
           * para o participante conferir.
           */

          if (msgReserva) {

            msgReserva.textContent =
              `📎 Comprovante selecionado: ${arquivo.name}`;

          }


          /*
           * Monta a mensagem do WhatsApp.
           */

          const mensagem =
            montarMensagemWhatsApp();


          const url =
            `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
              mensagem +
              `\n\n📎 Comprovante selecionado: ${arquivo.name}\n` +
              `➡️ Anexe este arquivo nesta conversa antes de enviar.`
            )}`;


          /*
           * Abre o WhatsApp.
           */

          window.open(
            url,
            '_blank'
          );


          /*
           * Explica ao usuário o último passo.
           */

          setTimeout(
            () => {

              if (msgReserva) {

                msgReserva.textContent =
                  '📎 Comprovante selecionado. No WhatsApp, toque no clipe 📎 e escolha este arquivo para enviar.';

              }

            },
            700
          );


          inputArquivo.remove();

        }
      );


      inputArquivo.click();

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


    const dataHora =
      obterDataHora();


    mostrarConfirmacao(
      numerosFormatados,
      dataHora
    );


    localStorage.removeItem(
      'rifaSelecionados'
    );


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

    const veioDaCartela =
      lerSelecionadosDaCartela();


    if (veioDaCartela) {

      return;

    }


    const veioDaURL =
      lerNumerosDaURL();


    if (veioDaURL) {

      return;

    }


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
   🗑️ LIMPAR SELEÇÃO
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


      compraAtual = {

        numeros: [],

        quantidade: 0,

        total: 0,

        data: '',

        hora: '',

        timestamp: ''

      };


      localStorage.removeItem(
        'rifaCompraAtual'
      );

      localStorage.removeItem(
        'rifaSelecionados'
      );


      comprovanteSelecionado =
        null;


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

        nomeReserva.value =
          '';

      }


      if (telefoneReserva) {

        telefoneReserva.value =
          '';

      }


      if (numeroDireto) {

        numeroDireto.value =
          '';

      }


      if (msgReserva) {

        msgReserva.textContent =
          '';

      }


      limparNumeroStatus();


      window.location.href =
        'cartela.html';

    }
  );

}
