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

/*
 * Tempo da reserva:
 * 40 minutos
 */

const TEMPO_RESERVA =
  40 * 60 * 1000;


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

  status: 'selecionado',

  expiraEm: null

};


/* =========================================================
   🎟️ CARTELAS
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
   🍀 SUGERIR
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
   💰 VALOR
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

    reservarNumero.textContent =
      '🔴 CONFIRMAR PARTICIPAÇÃO';

    reservarNumero.classList.remove(
      'confirmar-participacao',
      'reservado'
    );

    delete reservarNumero.dataset.numero;

  }

}


/* =========================================================
   ⏱️ VERIFICAR SE A RESERVA EXPIROU
========================================================= */

function reservaExpirou(dados) {

  if (!dados) {
    return false;
  }

  const expiraEm =
    Number(
      dados.expiraEm || 0
    );

  if (!expiraEm) {
    return false;
  }

  return Date.now() >= expiraEm;

}


/* =========================================================
   🔎 VERIFICAR SE ESTÁ OCUPADO
========================================================= */

function numeroEstaOcupado(
  dados
) {

  if (!dados) {
    return false;
  }

  /*
   * Se estava reservado mas os 40 minutos
   * já acabaram, consideramos o número livre.
   */

  if (
    String(
      dados.status || ''
    ).toLowerCase() === 'reservado' &&
    reservaExpirou(dados)
  ) {

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
      dataHora.timestamp,

    status:
      'selecionado',

    expiraEm:
      null

  };


  /* =======================================================
     🎟️ NÚMERO
  ======================================================= */

  if (reservaNumeros) {

    reservaNumeros.textContent =
      numerosFormatados.join(', ');

  }


  /* =======================================================
     🔢 QUANTIDADE + TOTAL
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
     💾 SALVAR LOCALMENTE
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


  /* =======================================================
     🧾 MOSTRAR CARTÃO
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

  /*
   * PRIMEIRO:
   * preenche automaticamente
   * o cartão Confirmar Participação.
   */

  mostrarConfirmacao(
    [numero],
    obterDataHora()
  );


  mostrarStatus(
    `🟢 NÚMERO ${numero} DISPONÍVEL`,
    'disponivel'
  );


  /*
   * AGORA MOSTRA O BOTÃO VERMELHO.
   */

  if (reservarNumero) {

    reservarNumero.style.display =
      'flex';

    reservarNumero.hidden =
      false;

    reservarNumero.disabled =
      false;

    reservarNumero.textContent =
      '🔴 CONFIRMAR PARTICIPAÇÃO';

    reservarNumero.dataset.numero =
      numero;

    /*
     * Classe para o CSS deixar
     * o botão vermelho e diferenciado.
     */

    reservarNumero.classList.add(
      'confirmar-participacao'
    );

    reservarNumero.classList.remove(
      'reservado'
    );

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

    reservarNumero.classList.remove(
      'confirmar-participacao',
      'reservado'
    );

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


    /*
     * NÃO EXISTE:
     * está disponível.
     */

    if (!snapshot.exists()) {

      mostrarDisponivel(
        numero
      );

      return;

    }


    const dados =
      snapshot.val();


    /*
     * RESERVA EXPIRADA:
     * também está disponível.
     */

    if (
      dados.status === 'reservado' &&
      reservaExpirou(dados)
    ) {

      mostrarDisponivel(
        numero
      );

      return;

    }


    /*
     * ESTÁ OCUPADO.
     */

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


    /*
     * EXISTE MAS ESTÁ LIVRE.
     */

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
   🔒 RESERVAR NÚMERO POR 40 MINUTOS
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

        /*
         * NÚMERO AINDA NÃO EXISTE.
         */

        if (atual === null) {

          return {

            numero,

            status:
              'reservado',

            reservado:
              true,

            dataReserva:
              dataHora.timestamp,

            expiraEm:
              expiraEm

          };

        }


        /*
         * SE ESTAVA RESERVADO,
         * MAS PASSOU DOS 40 MINUTOS,
         * PODE SER RESERVADO NOVAMENTE.
         */

        if (
          atual.status === 'reservado' &&
          reservaExpirou(atual)
        ) {

          return {

            numero,

            status:
              'reservado',

            reservado:
              true,

            dataReserva:
              dataHora.timestamp,

            expiraEm:
              expiraEm

          };

        }


        /*
         * SE JÁ ESTÁ OCUPADO,
         * NÃO PODE RESERVAR.
         */

        if (
          numeroEstaOcupado(
            atual
          )
        ) {

          return;

        }


        /*
         * NÚMERO LIVRE.
         */

        return {

          ...atual,

          numero,

          status:
            'reservado',

          reservado:
            true,

          dataReserva:
            dataHora.timestamp,

          expiraEm:
            expiraEm

        };

      }
    );


  if (!resultado.committed) {

    throw new Error(
      `O número ${numero} acabou de ser reservado por outra pessoa.`
    );

  }


  return {

    ...dataHora,

    expiraEm

  };

}


/* =========================================================
   🔴 CONFIRMAR PARTICIPAÇÃO
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

        const resultado =
          await reservarNumeroFirebase(
            numero
          );


        /*
         * ATUALIZA A COMPRA.
         */

        compraAtual.status =
          'reservado';

        compraAtual.expiraEm =
          resultado.expiraEm;

        compraAtual.timestamp =
          resultado.timestamp;


        /*
         * SALVA NOVAMENTE.
         */

        try {

          localStorage.setItem(
            'rifaCompraAtual',
            JSON.stringify(
              compraAtual
            )
          );

        } catch (erro) {

          console.warn(
            '⚠️ Não foi possível atualizar a compra local.',
            erro
          );

        }


        /*
         * STATUS VISUAL.
         */

        mostrarStatus(
          `🔒 NÚMERO ${numero} RESERVADO POR 40 MINUTOS`,
          'disponivel'
        );


        /*
         * BOTÃO MUDA DE ESTADO.
         */

        reservarNumero.textContent =
          '✅ PARTICIPAÇÃO CONFIRMADA';

        reservarNumero.classList.remove(
          'confirmar-participacao'
        );

        reservarNumero.classList.add(
          'reservado'
        );


        /*
         * NÃO DEIXA CLICAR NOVAMENTE.
         */

        reservarNumero.disabled =
          true;

        reservarNumero.style.display =
          'flex';


        /*
         * AVISO PARA O CLIENTE.
         */

        if (msgReserva) {

          msgReserva.textContent =
            '🔒 Seu número está reservado por 40 minutos. Faça o pagamento via PIX e envie o comprovante pelo WhatsApp.';

        }


        /*
         * LEVA O CLIENTE PARA
         * A PARTE DO PAGAMENTO.
         */

        const cartao =
          document.querySelector(
            '.reserva-inline'
          );


        if (cartao) {

          setTimeout(
            () => {

              cartao.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
              });

            },
            200
          );

        }


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
          '🔴 CONFIRMAR PARTICIPAÇÃO';


        reservarNumero.classList.add(
          'confirmar-participacao'
        );


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

        if (pixMsgReserva) {

          pixMsgReserva.textContent =
            '✅ Chave PIX copiada.';

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

    `🔒 *Número reservado por 40 minutos.*\n\n` +

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
            '⚠️ Primeiro escolha um número e confirme sua participação.';

        }

        return;

      }


      /*
       * O cliente precisa ter confirmado
       * a participação antes de enviar.
       */

      if (
        compraAtual.status !==
        'reservado'
      ) {

        if (msgReserva) {

          msgReserva.textContent =
            '⚠️ Clique primeiro em CONFIRMAR PARTICIPAÇÃO para reservar seu número por 40 minutos.';

        }

        return;

      }


      /*
       * Verifica se os 40 minutos acabaram.
       */

      if (
        compraAtual.expiraEm &&
        Date.now() >=
        Number(
          compraAtual.expiraEm
        )
      ) {

        if (msgReserva) {

          msgReserva.textContent =
            '⏰ O prazo de 40 minutos da sua reserva terminou. Verifique novamente a disponibilidade do número.';

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
          '📲 Abrindo seu WhatsApp... Anexe o comprovante de pagamento na conversa antes de enviar.';

      }


      window.open(
        url,
        '_blank'
      );

    }
  );

}


/* =========================================================
   🔄 RECUPERAR COMPRA
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


    const cartao =
      document.querySelector(
        '.reserva-inline'
      );


    if (cartao) {

      cartao.style.display =
        'block';

    }


    /*
     * Se ainda está reservado,
     * mostra o estado correto.
     */

    if (
      dados.status ===
      'reservado'
    ) {

      if (
        dados.expiraEm &&
        Date.now() >=
        Number(
          dados.expiraEm
        )
      ) {

        compraAtual.status =
          'expirado';

        if (msgReserva) {

          msgReserva.textContent =
            '⏰ A reserva anterior expirou. Verifique novamente o número.';

        }

      }

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
   🔗 NÚMEROS VINDOS DA CARTELA
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


  /*
   * Vindo da cartela:
   *
   * ainda NÃO reserva.
   *
   * Apenas preenche o cartão.
   */

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
      lerNumerosDaURL();


    if (!veioDaCartela) {

      recuperarCompraSalva();

    }

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
   🛡️ TAMANHO RASPADINHA
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
