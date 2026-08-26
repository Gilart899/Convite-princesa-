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
      initializeApp(
        CONFIG.firebaseConfig
      );

    db =
      getDatabase(app);

    console.log(
      '✅ Firebase conectado.'
    );

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
   🎟️ ESCOLHER NÚMEROS
========================================================= */

const abrirCartelas =
  document.getElementById(
    'abrirCartelas'
  );

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

const sugerir =
  document.getElementById(
    'sugerir'
  );

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
   🔢 DIGITAR / VERIFICAR / RESERVAR NÚMERO
========================================================= */

const numeroDireto =
  document.getElementById(
    'numeroDireto'
  );


if (numeroDireto) {

  const areaNumero =
    numeroDireto.parentElement;


  /* =======================================================
     STATUS
  ======================================================= */

  const numeroStatus =
    document.createElement(
      'div'
    );

  numeroStatus.id =
    'numeroStatus';

  numeroStatus.style.display =
    'none';

  numeroStatus.style.margin =
    '10px 0';

  numeroStatus.style.padding =
    '12px';

  numeroStatus.style.borderRadius =
    '12px';

  numeroStatus.style.fontWeight =
    '900';

  numeroStatus.style.textAlign =
    'center';

  numeroStatus.style.fontSize =
    '1rem';

  areaNumero.appendChild(
    numeroStatus
  );


  /* =======================================================
     BOTÃO RESERVAR
  ======================================================= */

  const reservarNumero =
    document.createElement(
      'button'
    );

  reservarNumero.id =
    'reservarNumero';

  reservarNumero.type =
    'button';

  reservarNumero.textContent =
    '🎟️ RESERVAR NÚMERO';

  reservarNumero.style.display =
    'none';

  reservarNumero.style.width =
    '100%';

  reservarNumero.style.marginTop =
    '8px';

  reservarNumero.style.padding =
    '14px';

  reservarNumero.style.border =
    '0';

  reservarNumero.style.borderRadius =
    '12px';

  reservarNumero.style.background =
    'linear-gradient(90deg,#0878e8,#f43b9a)';

  reservarNumero.style.color =
    '#fff';

  reservarNumero.style.fontWeight =
    '900';

  reservarNumero.style.fontSize =
    '1rem';

  reservarNumero.style.cursor =
    'pointer';

  reservarNumero.style.boxShadow =
    '0 6px 14px rgba(0,0,0,.15)';

  areaNumero.appendChild(
    reservarNumero
  );


  /* =======================================================
     FUNÇÃO — LIMPAR
  ======================================================= */

  function limparNumeroStatus() {

    numeroStatus.style.display =
      'none';

    numeroStatus.textContent =
      '';

    reservarNumero.style.display =
      'none';

    reservarNumero.disabled =
      false;

    reservarNumero.textContent =
      '🎟️ RESERVAR NÚMERO';

    delete reservarNumero.dataset.numero;

  }


  /* =======================================================
     FUNÇÃO — CARREGANDO
  ======================================================= */

  function mostrarVerificando() {

    numeroStatus.style.display =
      'block';

    numeroStatus.style.background =
      '#eef6ff';

    numeroStatus.style.color =
      '#1766a5';

    numeroStatus.style.border =
      '1px solid #a8cff2';

    numeroStatus.textContent =
      '🔎 Verificando disponibilidade...';

    reservarNumero.style.display =
      'none';

  }


  /* =======================================================
     FUNÇÃO — DISPONÍVEL
  ======================================================= */

  function mostrarDisponivel(
    numero
  ) {

    numeroStatus.style.display =
      'block';

    numeroStatus.style.background =
      '#e8fff0';

    numeroStatus.style.color =
      '#12843b';

    numeroStatus.style.border =
      '1px solid #8de0aa';

    numeroStatus.textContent =
      `🟢 NÚMERO ${numero} DISPONÍVEL`;

    reservarNumero.style.display =
      'block';

    reservarNumero.disabled =
      false;

    reservarNumero.textContent =
      `🎟️ RESERVAR ${numero}`;

    reservarNumero.dataset.numero =
      numero;

  }


  /* =======================================================
     FUNÇÃO — INDISPONÍVEL
  ======================================================= */

  function mostrarIndisponivel(
    numero
  ) {

    numeroStatus.style.display =
      'block';

    numeroStatus.style.background =
      '#fff0f0';

    numeroStatus.style.color =
      '#c62828';

    numeroStatus.style.border =
      '1px solid #f0a0a0';

    numeroStatus.textContent =
      `🔴 NÚMERO ${numero} NÃO DISPONÍVEL`;

    reservarNumero.style.display =
      'none';

    delete reservarNumero.dataset.numero;

  }


  /* =======================================================
     FUNÇÃO — ERRO
  ======================================================= */

  function mostrarErro(
    mensagem
  ) {

    numeroStatus.style.display =
      'block';

    numeroStatus.style.background =
      '#fff7e6';

    numeroStatus.style.color =
      '#9a6500';

    numeroStatus.style.border =
      '1px solid #efd28a';

    numeroStatus.textContent =
      `⚠️ ${mensagem}`;

    reservarNumero.style.display =
      'none';

  }


  /* =======================================================
     VERIFICAR SE NÚMERO ESTÁ OCUPADO
  ======================================================= */

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


  /* =======================================================
     VERIFICAR NÚMERO
  ======================================================= */

  async function verificarNumero() {

    const valor =
      numeroDireto.value
        .trim();


    if (valor === '') {

      limparNumeroStatus();

      return;

    }


    const numeroInteiro =
      Number(valor);


    if (
      !Number.isInteger(
        numeroInteiro
      ) ||
      numeroInteiro < 0 ||
      numeroInteiro > 999
    ) {

      mostrarErro(
        'Digite um número entre 000 e 999.'
      );

      return;

    }


    const numero =
      String(
        numeroInteiro
      ).padStart(
        3,
        '0'
      );


    mostrarVerificando();


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
       * Se o número não existe,
       * consideramos disponível.
       */

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

      } else {

        mostrarDisponivel(
          numero
        );

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


  /* =======================================================
     DIGITAÇÃO
  ======================================================= */

  numeroDireto.addEventListener(
    'input',
    () => {

      numeroDireto.value =
        numeroDireto.value
          .replace(
            /\D/g,
            ''
          )
          .slice(
            0,
            3
          );


      /*
       * Só consulta quando
       * completar os 3 dígitos.
       */

      if (
        numeroDireto.value.length === 3
      ) {

        verificarNumero();

      } else {

        limparNumeroStatus();

      }

    }
  );


  /* =======================================================
     ENTER
  ======================================================= */

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


  /* =======================================================
     RESERVAR NÚMERO
  ======================================================= */

  reservarNumero.addEventListener(
    'click',
    async () => {

      const numero =
        reservarNumero.dataset.numero;


      if (!numero) {

        return;

      }


      if (!db) {

        alert(
          '⚠️ Firebase não está conectado.'
        );

        return;

      }


      reservarNumero.disabled =
        true;

      reservarNumero.textContent =
        '⏳ RESERVANDO...';


      try {

        const numeroRef =
          ref(
            db,
            `rifa/numeros/${numero}`
          );


        /*
         * Transaction é importante:
         * duas pessoas não conseguem
         * reservar o mesmo número
         * simultaneamente.
         */

        const resultado =
          await runTransaction(
            numeroRef,
            atual => {

              /*
               * Número ainda não existe:
               * pode ser criado como reservado.
               */

              if (
                atual === null
              ) {

                return {

                  numero:
                    numero,

                  status:
                    'reservado',

                  reservado:
                    true,

                  dataReserva:
                    new Date()
                      .toISOString()

                };

              }


              /*
               * Se já existe e está ocupado,
               * cancela a transação.
               */

              if (
                numeroEstaOcupado(
                  atual
                )
              ) {

                return;

              }


              /*
               * Existe, mas está livre.
               * Mantemos os dados existentes
               * e marcamos como reservado.
               */

              return {

                ...atual,

                numero:
                  numero,

                status:
                  'reservado',

                reservado:
                  true,

                dataReserva:
                  new Date()
                    .toISOString()

              };

            }
          );


        /*
         * Outra pessoa ganhou a corrida.
         */

        if (
          !resultado.committed
        ) {

          mostrarIndisponivel(
            numero
          );

          alert(
            `❌ O número ${numero} acabou de ser reservado por outra pessoa.`
          );

          return;

        }


        /*
         * Reserva concluída.
         */

        numeroStatus.style.display =
          'block';

        numeroStatus.style.background =
          '#e8fff0';

        numeroStatus.style.color =
          '#12843b';

        numeroStatus.style.border =
          '1px solid #8de0aa';

        numeroStatus.textContent =
          `✅ NÚMERO ${numero} RESERVADO COM SUCESSO`;


        reservarNumero.style.display =
          'none';


        alert(
          `✅ Número ${numero} reservado!\n\n` +
          `Agora faça o pagamento pelo PIX ` +
          `e depois envie o comprovante.`
        );


        /*
         * Vai para a cartela mantendo
         * o número selecionado.
         */

        setTimeout(
          () => {

            window.location.href =
              `cartela.html?numero=${numero}`;

          },
          700
        );


      } catch (erro) {

        console.error(
          '❌ Erro ao reservar número:',
          erro
        );


        reservarNumero.disabled =
          false;

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
  document.getElementById(
    'copiarPix'
  );


if (copiarPix) {

  copiarPix.addEventListener(
    'click',
    async () => {

      const chave =
        CONFIG &&
        CONFIG.pixChave
          ? String(
              CONFIG.pixChave
            ).trim()
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


        setTimeout(
          () => {

            copiarPix.textContent =
              '💠 Copiar chave PIX';

          },
          1800
        );


      } catch (erro) {

        console.warn(
          'Clipboard moderno indisponível:',
          erro
        );


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

          campo.style.top =
            '0';


          document.body.appendChild(
            campo
          );


          campo.focus();

          campo.select();

          campo.setSelectionRange(
            0,
            campo.value.length
          );


          const copiou =
            document.execCommand(
              'copy'
            );


          campo.remove();


          if (copiou) {

            copiarPix.textContent =
              '✅ PIX COPIADO!';


            setTimeout(
              () => {

                copiarPix.textContent =
                  '💠 Copiar chave PIX';

              },
              1800
            );

          } else {

            throw new Error(
              'Não foi possível copiar.'
            );

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
   🍀 RASPADINHA DA SORTE
========================================================= */

const canvas =
  document.getElementById(
    'scratchCanvas'
  );

const area =
  document.querySelector(
    '.scratch-area'
  );

const premio =
  document.getElementById(
    'scratchPremio'
  );


if (
  canvas &&
  area &&
  premio
) {

  const ctx =
    canvas.getContext(
      '2d',
      {
        willReadFrequently:
          true
      }
    );


  let raspando =
    false;

  let finalizada =
    false;


  const premios = [

    '🧉 LIQUIDIFICADOR',

    '🔥 FERRO ELÉTRICO'

  ];


  const premioEscolhido =
    premios[
      Math.floor(
        Math.random() *
        premios.length
      )
    ];


  /* =======================================================
     CONFIGURAR CANVAS
  ======================================================= */

  function ajustarCanvas() {

    const rect =
      area.getBoundingClientRect();


    const largura =
      Math.max(
        1,
        Math.round(
          rect.width
        )
      );


    const altura =
      Math.max(
        1,
        Math.round(
          rect.height
        )
      );


    const escala =
      window.devicePixelRatio ||
      1;


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


    /*
     * Fundo da raspadinha.
     */

    const gradiente =
      ctx.createLinearGradient(
        0,
        0,
        largura,
        altura
      );


    gradiente.addColorStop(
      0,
      '#c7ccd1'
    );

    gradiente.addColorStop(
      .5,
      '#9da4aa'
    );

    gradiente.addColorStop(
      1,
      '#c7ccd1'
    );


    ctx.fillStyle =
      gradiente;


    ctx.fillRect(
      0,
      0,
      largura,
      altura
    );


    /*
     * Faixas diagonais.
     */

    ctx.strokeStyle =
      'rgba(255,255,255,.22)';

    ctx.lineWidth =
      10;


    for (
      let x = -altura;
      x < largura + altura;
      x += 35
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


    /*
     * Texto.
     */

    ctx.fillStyle =
      '#62686d';

    ctx.font =
      '900 18px Arial';

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
     POSIÇÃO DO TOQUE / MOUSE
  ======================================================= */

  function obterPosicao(
    evento
  ) {

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
        clientX -
        rect.left,

      y:
        clientY -
        rect.top

    };

  }


  /* =======================================================
     RASPAR
  ======================================================= */

  function raspar(
    evento
  ) {

    if (
      !raspando ||
      finalizada
    ) {

      return;

    }


    evento.preventDefault();


    const {
      x,
      y
    } =
      obterPosicao(
        evento
      );


    ctx.globalCompositeOperation =
      'destination-out';


    ctx.beginPath();


    ctx.arc(
      x,
      y,
      25,
      0,
      Math.PI * 2
    );


    ctx.fill();

  }


  /* =======================================================
     INICIAR
  ======================================================= */

  function iniciar(
    evento
  ) {

    if (finalizada) {
      return;
    }


    raspando =
      true;


    evento.preventDefault();


    raspar(
      evento
    );

  }


  /* =======================================================
     PARAR
  ======================================================= */

  function parar() {

    if (!raspando) {
      return;
    }


    raspando =
      false;


    verificarProgresso();

  }


  /* =======================================================
     VERIFICAR QUANTO FOI RASPADO
  ======================================================= */

  function verificarProgresso() {

    if (finalizada) {
      return;
    }


    const rect =
      canvas.getBoundingClientRect();


    const escala =
      window.devicePixelRatio ||
      1;


    const largura =
      Math.max(
        1,
        Math.floor(
          rect.width *
          escala
        )
      );


    const altura =
      Math.max(
        1,
        Math.floor(
          rect.height *
          escala
        )
      );


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


    let transparentes =
      0;


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


    const total =
      imagem.data.length /
      4;


    const porcentagem =
      transparentes /
      total;


    /*
     * Ao raspar 45%,
     * revela automaticamente.
     */

    if (
      porcentagem >= 0.45
    ) {

      finalizada =
        true;


      premio.textContent =
        premioEscolhido;


      ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

    }

  }


  /* =======================================================
     EVENTOS — MOUSE
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
     EVENTOS — CELULAR
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


  window.addEventListener(
    'resize',
    () => {

      /*
       * Não redesenha enquanto
       * a raspadinha já foi revelada.
       */

      if (!finalizada) {

        ajustarCanvas();

      }

    }
  );


  ajustarCanvas();

}


/* =========================================================
   📲 COMPROVANTE + WHATSAPP
========================================================= */

const comprovante =
  document.getElementById(
    'comprovante'
  );

const comprovanteNome =
  document.getElementById(
    'comprovanteNome'
  );

const enviarWhatsApp =
  document.getElementById(
    'enviarWhatsApp'
  );

const comprovanteMsg =
  document.getElementById(
    'comprovanteMsg'
  );


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

          comprovanteMsg.textContent =
            '';

        }


        return;

      }


      const tamanhoMaximo =
        10 *
        1024 *
        1024;


      if (
        arquivo.size >
        tamanhoMaximo
      ) {

        comprovante.value =
          '';

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


      try {

        const dados = {

          files: [
            arquivo
          ],

          text:
            mensagem,

          title:
            mensagem

        };


        if (
          navigator.share &&
          navigator.canShare &&
          navigator.canShare(
            dados
          )
        ) {

          await navigator.share(
            dados
          );


          if (comprovanteMsg) {

            comprovanteMsg.textContent =
              '✅ Escolha o WhatsApp e envie o comprovante com a mensagem.';

          }


          return;

        }


        throw new Error(
          'Compartilhamento de arquivo indisponível.'
        );


      } catch (erro) {

        console.log(
          'Compartilhamento:',
          erro
        );


        if (
          erro &&
          erro.name ===
          'AbortError'
        ) {

          if (comprovanteMsg) {

            comprovanteMsg.textContent =
              'Compartilhamento cancelado.';

          }


          return;

        }


        /*
         * Fallback:
         * abre o WhatsApp com a mensagem.
         * O arquivo precisa ser anexado manualmente
         * quando o navegador não suporta compartilhamento
         * de arquivos.
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

    }
  );

}
