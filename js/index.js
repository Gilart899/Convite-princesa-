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
☁️ CLOUDINARY
========================================================= */

const CLOUDINARY_CLOUD_NAME =
  'gkf0vepl';

const CLOUDINARY_UPLOAD_PRESET =
  'rifa_comprovantes';

const CLOUDINARY_UPLOAD_URL =
  `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`;

console.log(
  '☁️ Cloudinary configurado:',
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET
);


/* =========================================================
⚙️ CONFIGURAÇÕES
========================================================= */

const VALOR_NUMERO =
  Number(CONFIG?.valorNumero || 10);

const WHATSAPP =
  '5579999145044';

const TEMPO_RESERVA =
  24 * 60 * 60 * 1000;


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

  timestamp: '',

  reservaExpiraEm: 0

};


/* =========================================================
📎 COMPROVANTE
========================================================= */

let comprovanteSelecionado = null;

let comprovanteCloudinary = {

  url: '',

  publicId: '',

  nome: ''

};


/* =========================================================
🧹 ORGANIZAR DATA + HORA
========================================================= */

function organizarDadosCompra() {

  if (
    !reservaData ||
    !reservaHora ||
    !limparSelecao
  ) {

    return;

  }

  const dataInfo =
    reservaData.closest('.reserva-info');

  const horaInfo =
    reservaHora.closest('.reserva-info');

  const limparArea =
    limparSelecao.closest('.limpar-selecao-area');

  if (
    dataInfo &&
    horaInfo &&
    limparArea
  ) {

    const container =
      dataInfo.parentElement;

    if (container) {

      container.appendChild(dataInfo);

      container.appendChild(horaInfo);

      container.appendChild(limparArea);

    }

  }

}


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

  const texto =
    String(valor ?? '')
      .trim();

  if (!/^\d{1,3}$/.test(texto)) {

    return null;

  }

  const numero =
    Number(texto);

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
    )
      .toLowerCase()
      .trim();

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
    [
      ...new Set(
        lista
          .map(formatarNumero)
          .filter(Boolean)
      )
    ];

  if (!numerosFormatados.length) {

    return;

  }

  const quantidade =
    numerosFormatados.length;

  const total =
    quantidade *
    VALOR_NUMERO;

  compraAtual = {

    ...compraAtual,

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


  /* =======================================================
  🎟️ NÚMEROS
  ======================================================= */

  if (reservaNumeros) {

    reservaNumeros.textContent =
      numerosFormatados.join(', ');

  }


  /* =======================================================
  💰 VALOR
  ======================================================= */

  if (reservaTotal) {

    reservaTotal.textContent =
      `🎟️ ${quantidade} número(s) • Total: ${formatarValor(total)}`;

  }


  /* =======================================================
  📅 DATA
  ======================================================= */

  if (reservaData) {

    reservaData.textContent =
      dataHora.data;

  }


  /* =======================================================
  🕐 HORA
  ======================================================= */

  if (reservaHora) {

    reservaHora.textContent =
      dataHora.hora;

  }


  /* =======================================================
  💾 SALVAR
  ======================================================= */

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


  organizarDadosCompra();


  /* =======================================================
  📦 MOSTRAR CARTÃO
  ======================================================= */

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

  if (!valor) {

    mostrarErro(
      'Digite um número entre 000 e 999.'
    );

    return;

  }

  const numero =
    formatarNumero(valor);

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
      await get(numeroRef);

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

  const expiraEm =
    Date.now() +
    TEMPO_RESERVA;

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
              expiraEm

          };

        }


        if (
          numeroEstaOcupado(
            atual
          )
        ) {

          const expiracao =
            Number(
              atual.reservaExpiraEm || 0
            );

          if (
            atual.status === 'reservado' &&
            expiracao > 0 &&
            expiracao <= Date.now()
          ) {

            return {

              numero,

              status:
                'reservado',

              reservado:
                true,

              dataReserva:
                dataHora.timestamp,

              reservaExpiraEm:
                expiraEm

            };

          }

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
            expiraEm

        };

      }
    );


  if (!resultado.committed) {

    throw new Error(
      `O número ${numero} não está mais disponível.`
    );

  }


  return {

    ...dataHora,

    reservaExpiraEm:
      expiraEm

  };

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

        mostrarErro(
          'Escolha um número primeiro.'
        );

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
    CONFIG?.pixChave
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

      campo.style.opacity =
        '0';

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
☁️ ENVIAR COMPROVANTE PARA CLOUDINARY
========================================================= */

async function enviarComprovanteCloudinary(
  arquivo
) {

  if (!arquivo) {

    throw new Error(
      'Nenhum comprovante foi selecionado.'
    );

  }


  console.log(
    '☁️ Enviando comprovante para Cloudinary...'
  );


  const formulario =
    new FormData();


  formulario.append(
    'file',
    arquivo
  );


  formulario.append(
    'upload_preset',
    CLOUDINARY_UPLOAD_PRESET
  );


  /*
   * Informações adicionais para facilitar
   * a identificação do comprovante no painel.
   */

  const numeroTexto =
    compraAtual.numeros.length
      ? compraAtual.numeros.join('-')
      : 'sem-numero';

  const nomeTexto =
    nomeReserva?.value.trim()
      ? nomeReserva.value.trim()
      : 'participante';


  const nomeSeguro =
    nomeTexto
      .normalize('NFD')
      .replace(
        /[\u0300-\u036f]/g,
        ''
      )
      .replace(
        /[^a-zA-Z0-9_-]/g,
        '_'
      )
      .slice(0, 40);


  const publicId =
    `comprovante_${numeroTexto}_${nomeSeguro}_${Date.now()}`;


  formulario.append(
    'public_id',
    publicId
  );


  try {

    const resposta =
      await fetch(
        CLOUDINARY_UPLOAD_URL,
        {
          method: 'POST',
          body: formulario
        }
      );


    const dados =
      await resposta.json();


    if (!resposta.ok) {

      console.error(
        '❌ Cloudinary retornou erro:',
        dados
      );

      throw new Error(
        dados?.error?.message ||
        'Cloudinary não aceitou o comprovante.'
      );

    }


    if (!dados.secure_url) {

      throw new Error(
        'Cloudinary não retornou o endereço do comprovante.'
      );

    }


    comprovanteCloudinary = {

      url:
        dados.secure_url,

      publicId:
        dados.public_id ||
        publicId,

      nome:
        arquivo.name

    };


    console.log(
      '✅ Comprovante enviado para Cloudinary.',
      comprovanteCloudinary
    );


    return comprovanteCloudinary;


  } catch (erro) {

    console.error(
      '❌ Erro ao enviar comprovante:',
      erro
    );

    throw erro;

  }

}


/* =========================================================
📲 MONTAR MENSAGEM WHATSAPP
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


  let mensagem =

    `🍀 *RIFA SOLIDÁRIA — GILFEST*\n\n` +

    `🧾 *CONFIRMAÇÃO DE PARTICIPAÇÃO*\n\n` +

    `🎟️ Número(s): *${numeros}*\n` +

    `🔢 Quantidade: *${quantidade}*\n` +

    `💰 Valor total: *${total}*\n` +

    `📅 Data da compra: *${compraAtual.data}*\n` +

    `🕐 Hora da compra: *${compraAtual.hora}*\n\n` +

    `👤 Nome: *${nome}*\n` +

    `📱 WhatsApp: *${telefone}*\n\n` +

    `💚 Pagamento via PIX realizado.\n\n`;


  if (
    comprovanteCloudinary.url
  ) {

    mensagem +=

      `📎 *COMPROVANTE DE PAGAMENTO*\n` +

      `Arquivo: *${comprovanteCloudinary.nome}*\n` +

      `${comprovanteCloudinary.url}\n\n`;

  } else {

    mensagem +=

      `📎 *COMPROVANTE DE PAGAMENTO*\n` +

      `O comprovante será enviado separadamente.\n\n`;

  }


  mensagem +=

    `🔒 Os números ficam reservados por *24 horas* após a compra.\n\n` +

    `🍀 Obrigado por participar da Rifa Solidária — GILFEST!`;


  return mensagem;

}


/* =========================================================
📲 ABRIR WHATSAPP
========================================================= */

function abrirWhatsApp(
  mensagem
) {

  const url =
    `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
      mensagem
    )}`;


  window.open(
    url,
    '_blank'
  );

}


/* =========================================================
🍀 CONFIRMAR PARTICIPAÇÃO
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
            '⚠️ Informe seu nome antes de confirmar.';

        }

        nomeReserva?.focus();

        return;

      }


      if (!telefone) {

        if (msgReserva) {

          msgReserva.textContent =
            '⚠️ Informe seu WhatsApp antes de confirmar.';

        }

        telefoneReserva?.focus();

        return;

      }


      try {

        localStorage.setItem(
          'rifaNome',
          nome
        );

        localStorage.setItem(
          'rifaTelefone',
          telefone
        );

      } catch {

        // Ignora.

      }


      if (msgReserva) {

        msgReserva.textContent =
          '📲 Abrindo seu WhatsApp...';

      }


      const mensagem =
        montarMensagemWhatsApp();


      abrirWhatsApp(
        mensagem
      );

    }
  );

}


/* =========================================================
📎 ÁREA DO COMPROVANTE
========================================================= */

function criarAreaComprovante() {

  let area =
    document.getElementById(
      'areaComprovante'
    );


  if (area) {

    return area;

  }


  area =
    document.createElement(
      'div'
    );


  area.id =
    'areaComprovante';

  area.style.width =
    '100%';

  area.style.margin =
    '12px 0';

  area.style.padding =
    '12px';

  area.style.borderRadius =
    '12px';

  area.style.boxSizing =
    'border-box';

  area.style.background =
    'rgba(0,0,0,.04)';

  area.style.display =
    'none';


  const titulo =
    document.createElement(
      'strong'
    );

  titulo.textContent =
    '📎 Comprovante selecionado';

  titulo.style.display =
    'block';

  titulo.style.marginBottom =
    '6px';


  const nomeArquivo =
    document.createElement(
      'span'
    );

  nomeArquivo.id =
    'nomeComprovante';

  nomeArquivo.style.display =
    'block';

  nomeArquivo.style.wordBreak =
    'break-word';


  const aviso =
    document.createElement(
      'small'
    );

  aviso.id =
    'avisoComprovante';

  aviso.style.display =
    'block';

  aviso.style.marginTop =
    '8px';


  aviso.textContent =
    '☁️ O comprovante será armazenado com segurança no painel do administrador.';


  area.appendChild(
    titulo
  );

  area.appendChild(
    nomeArquivo
  );

  area.appendChild(
    aviso
  );


  if (msgReserva?.parentElement) {

    msgReserva.parentElement.insertBefore(
      area,
      msgReserva
    );

  } else if (enviarComprovante?.parentElement) {

    enviarComprovante.parentElement.appendChild(
      area
    );

  } else {

    document.body.appendChild(
      area
    );

  }


  return area;

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


      const inputArquivo =
        document.createElement(
          'input'
        );


      inputArquivo.type =
        'file';


      inputArquivo.accept =
        'image/*,.pdf,application/pdf';


      inputArquivo.style.display =
        'none';


      document.body.appendChild(
        inputArquivo
      );


      inputArquivo.addEventListener(
        'change',
        async () => {

          const arquivo =
            inputArquivo.files?.[0];


          if (!arquivo) {

            inputArquivo.remove();

            return;

          }


          /* =================================================
          📦 LIMITE
          ================================================= */

          if (
            arquivo.size >
            10 * 1024 * 1024
          ) {

            if (msgReserva) {

              msgReserva.textContent =
                '⚠️ O comprovante deve ter no máximo 10 MB.';

            }

            inputArquivo.remove();

            return;

          }


          comprovanteSelecionado =
            arquivo;


          const area =
            criarAreaComprovante();


          area.style.display =
            'block';


          const nomeArquivo =
            document.getElementById(
              'nomeComprovante'
            );


          if (nomeArquivo) {

            nomeArquivo.textContent =
              arquivo.name;

          }


          if (msgReserva) {

            msgReserva.textContent =
              '☁️ Enviando comprovante...';

          }


          /*
           * Desabilita temporariamente o botão
           * para impedir dois uploads.
           */

          enviarComprovante.disabled =
            true;


          try {

            /* ===============================================
            ☁️ ENVIA PARA CLOUDINARY
            =============================================== */

            await enviarComprovanteCloudinary(
              arquivo
            );


            /* ===============================================
            💾 SALVA LOCALMENTE O LINK
            =============================================== */

            try {

              localStorage.setItem(
                'rifaComprovanteCloudinary',
                JSON.stringify(
                  comprovanteCloudinary
                )
              );

            } catch {

              // Ignora.

            }


            if (msgReserva) {

              msgReserva.textContent =
                '✅ Comprovante armazenado. Abrindo o WhatsApp...';

            }


            /* ===============================================
            📲 MONTA MENSAGEM
            =============================================== */

            const mensagem =
              montarMensagemWhatsApp();


            /* ===============================================
            📲 ABRE WHATSAPP
            =============================================== */

            abrirWhatsApp(
              mensagem
            );


            setTimeout(
              () => {

                if (msgReserva) {

                  msgReserva.textContent =
                    '✅ Comprovante armazenado no painel. WhatsApp aberto para finalizar o envio.';

                }

              },
              1200
            );


          } catch (erro) {

            console.error(
              '❌ Falha no envio do comprovante:',
              erro
            );


            if (msgReserva) {

              msgReserva.textContent =
                `⚠️ Não foi possível armazenar o comprovante: ${
                  erro.message ||
                  'erro desconhecido'
                }`;

            }


            /*
             * IMPORTANTE:
             * Se o upload falhar, não abrimos o WhatsApp
             * dizendo que o comprovante foi armazenado.
             */

          } finally {

            enviarComprovante.disabled =
              false;

            inputArquivo.remove();

          }

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


    compraAtual = {

      ...compraAtual,

      ...dados

    };


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


    try {

      const nomeSalvo =
        localStorage.getItem(
          'rifaNome'
        );

      const telefoneSalvo =
        localStorage.getItem(
          'rifaTelefone'
        );


      if (
        nomeReserva &&
        nomeSalvo
      ) {

        nomeReserva.value =
          nomeSalvo;

      }


      if (
        telefoneReserva &&
        telefoneSalvo
      ) {

        telefoneReserva.value =
          telefoneSalvo;

      }


      const comprovanteSalvo =
        localStorage.getItem(
          'rifaComprovanteCloudinary'
        );


      if (comprovanteSalvo) {

        comprovanteCloudinary =
          JSON.parse(
            comprovanteSalvo
          );

      }

    } catch {

      // Ignora.

    }


    organizarDadosCompra();


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
🆕 🔗 LER NÚMEROS DA CARTELA
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
      [
        ...new Set(
          numeros
            .map(formatarNumero)
            .filter(Boolean)
        )
      ];


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
🔗 LER NÚMEROS DA URL
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
        .map(formatarNumero)
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


  numeros =
    [
      ...new Set(
        numeros
      )
    ];


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

        timestamp: '',

        reservaExpiraEm: 0

      };


      comprovanteSelecionado =
        null;


      comprovanteCloudinary = {

        url: '',

        publicId: '',

        nome: ''

      };


      localStorage.removeItem(
        'rifaCompraAtual'
      );

      localStorage.removeItem(
        'rifaSelecionados'
      );

      localStorage.removeItem(
        'rifaNome'
      );

      localStorage.removeItem(
        'rifaTelefone'
      );

      localStorage.removeItem(
        'rifaComprovanteCloudinary'
      );


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


      const area =
        document.getElementById(
          'areaComprovante'
        );


      if (area) {

        area.remove();

      }


      limparNumeroStatus();


      window.location.href =
        'cartela.html';

    }
  );

}


/* =========================================================
🚀 INICIALIZAÇÃO
========================================================= */

document.addEventListener(
  'DOMContentLoaded',
  () => {

    organizarDadosCompra();


    try {

      const nomeSalvo =
        localStorage.getItem(
          'rifaNome'
        );

      const telefoneSalvo =
        localStorage.getItem(
          'rifaTelefone'
        );


      if (
        nomeReserva &&
        nomeSalvo
      ) {

        nomeReserva.value =
          nomeSalvo;

      }


      if (
        telefoneReserva &&
        telefoneSalvo
      ) {

        telefoneReserva.value =
          telefoneSalvo;

      }

    } catch {

      // Ignora.

    }


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
🧾 FINAL
========================================================= */

console.log(
  '🍀 RIFA SOLIDÁRIA — GILFEST carregada.'
);

console.log(
  '☁️ Upload de comprovantes: Cloudinary / rifa_comprovantes'
);
