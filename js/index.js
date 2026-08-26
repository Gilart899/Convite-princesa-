js/index.js

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

/*

O projeto precisa ter a configuração do Firebase

disponível em CONFIG.firebaseConfig.
*/


if (CONFIG.firebaseConfig) {

const app = initializeApp(  
  CONFIG.firebaseConfig  
);  

db = getDatabase(app);

}

} catch (erro) {

console.error(
'Erro ao iniciar Firebase:',
erro
);

}

/* =========================================================
ESCOLHER NÚMEROS
========================================================= */

const abrirCartelas =
document.getElementById('abrirCartelas');

if (abrirCartelas) {

abrirCartelas.onclick = () => {

location.href =  
  'cartela.html';

};

}

/* =========================================================
SUGERIR NÚMERO
========================================================= */

const sugerir =
document.getElementById('sugerir');

if (sugerir) {

sugerir.onclick = () => {

location.href =  
  'cartela.html?sugerir=1';

};

}

/* =========================================================
🎟️ DIGITAR / VERIFICAR NÚMERO
========================================================= */

const numeroDireto =
document.getElementById('numeroDireto');

/*

Criamos automaticamente a área de status

logo abaixo do campo.
*/


let numeroStatus = null;
let reservarNumero = null;

if (numeroDireto) {

const areaNumero =
numeroDireto.parentElement;

/* -------------------------------------------------------
STATUS
------------------------------------------------------- */

numeroStatus =
document.createElement('div');

numeroStatus.id =
'numeroStatus';

numeroStatus.style.display =
'none';

numeroStatus.style.margin =
'8px 0';

numeroStatus.style.padding =
'10px 12px';

numeroStatus.style.borderRadius =
'10px';

numeroStatus.style.fontWeight =
'900';

numeroStatus.style.textAlign =
'center';

areaNumero.appendChild(
numeroStatus
);

/* -------------------------------------------------------
BOTÃO RESERVAR
------------------------------------------------------- */

reservarNumero =
document.createElement('button');

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

reservarNumero.style.cursor =
'pointer';

areaNumero.appendChild(
reservarNumero
);

/* -------------------------------------------------------
FUNÇÕES VISUAIS
------------------------------------------------------- */

function limparStatus() {

if (numeroStatus) {  

  numeroStatus.style.display =  
    'none';  

  numeroStatus.textContent =  
    '';  

}  

if (reservarNumero) {  

  reservarNumero.style.display =  
    'none';  

  reservarNumero.disabled =  
    false;  

}

}

function mostrarDisponivel(numero) {

if (!numeroStatus) return;  

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


if (reservarNumero) {  

  reservarNumero.style.display =  
    'block';  

  reservarNumero.dataset.numero =  
    numero;  

}

}

function mostrarIndisponivel(numero) {

if (!numeroStatus) return;  

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

if (reservarNumero) {  

  reservarNumero.style.display =  
    'none';  

}

}

function mostrarErro(mensagem) {

if (!numeroStatus) return;  

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

}

/* -------------------------------------------------------
VERIFICAR NO FIREBASE
------------------------------------------------------- */

async function verificarNumero() {

limparStatus();  

const raw =  
  numeroDireto.value.trim();  

if (raw === '') return;  


const n =  
  Number(raw);  


if (  
  !Number.isInteger(n) ||  
  n < 0 ||  
  n > 999  
) {  

  mostrarErro(  
    'Digite um número entre 000 e 999.'  
  );  

  return;  

}  


const numero =  
  String(n).padStart(3, '0');  


/*  
 * Enquanto consulta.  
 */  

if (numeroStatus) {  

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

}  


if (!db) {  

  mostrarErro(  
    'Firebase não está configurado.'  
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


  /*  
   * Número ainda não existe:  
   * consideramos disponível.  
   */  

  if (!snapshot.exists()) {  

    mostrarDisponivel(numero);  

    return;  

  }  


  const dados =  
    snapshot.val();  


  /*  
   * Aceita diferentes formatos  
   * que podem existir na sua estrutura.  
   */  

  const status =  
    String(  
      dados?.status ||  
      dados?.situacao ||  
      ''  
    ).toLowerCase();  


  const reservado =  
    status === 'reservado' ||  
    status === 'vendido' ||  
    status === 'pago' ||  
    status === 'ocupado' ||  
    dados?.reservado === true ||  
    dados?.vendido === true ||  
    dados?.ocupado === true;  


  if (reservado) {  

    mostrarIndisponivel(numero);  

  } else {  

    mostrarDisponivel(numero);  

  }  

} catch (erro) {  

  console.error(  
    'Erro ao consultar número:',  
    erro  
  );  

  mostrarErro(  
    'Não foi possível verificar o número.'  
  );  

}

}

/* -------------------------------------------------------
DIGITAÇÃO
------------------------------------------------------- */

numeroDireto.addEventListener(
'input',
() => {

numeroDireto.value =  
    numeroDireto.value  
      .replace(/\D/g, '')  
      .slice(0, 3);  


  /*  
   * Verifica automaticamente quando  
   * o usuário completar os 3 dígitos.  
   */  

  if (  
    numeroDireto.value.length === 3  
  ) {  

    verificarNumero();  

  } else {  

    limparStatus();  

  }  

}

);

/* -------------------------------------------------------
ENTER
------------------------------------------------------- */

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

/* -------------------------------------------------------
RESERVAR NÚMERO
------------------------------------------------------- */

if (reservarNumero) {

reservarNumero.addEventListener(  
  'click',  
  async () => {  

    const numero =  
      reservarNumero.dataset.numero;  


    if (!numero) return;  


    if (!db) {  

      alert(  
        'Firebase não está configurado.'  
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
       * Transaction evita que duas pessoas  
       * reservem o mesmo número ao mesmo tempo.  
       */  

      const resultado =  
        await runTransaction(  
          numeroRef,  
          atual => {  

            /*  
             * Se alguém já gravou o número,  
             * não permite outra reserva.  
             */  

            if (  
              atual !== null  
            ) {  

              const status =  
                String(  
                  atual?.status ||  
                  atual?.situacao ||  
                  ''  
                ).toLowerCase();  


              const ocupado =  
                status === 'reservado' ||  
                status === 'vendido' ||  
                status === 'pago' ||  
                status === 'ocupado' ||  
                atual?.reservado === true ||  
                atual?.vendido === true ||  
                atual?.ocupado === true;  


              if (ocupado) {  

                return;  

              }  

            }  


            /*  
             * Cria a reserva.  
             */  

            return {  

              numero: numero,  

              status:  
                'reservado',  

              reservado:  
                true,  

              dataReserva:  
                new Date().toISOString()  

            };  

          }  
        );  


      if (  
        !resultado.committed  
      ) {  

        mostrarIndisponivel(  
          numero  
        );  

        alert(  
          '❌ Esse número acabou de ser reservado por outra pessoa.'  
        );  

        return;  

      }  


      /*  
       * Reserva confirmada.  
       */  

      if (numeroStatus) {  

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

      }  


      reservarNumero.style.display =  
        'none';  


      alert(  
        `✅ Número ${numero} reservado!\n\n` +  
        `Agora faça o pagamento pelo PIX ` +  
        `e depois envie o comprovante.`  
      );  


      /*  
       * Mantém o número selecionado  
       * para a cartela.  
       */  

      setTimeout(  
        () => {  

          location.href =  
            `cartela.html?numero=${numero}`;  

        },  
        500  
      );  


    } catch (erro) {  

      console.error(  
        'Erro ao reservar número:',  
        erro  
      );  


      reservarNumero.disabled =  
        false;  

      reservarNumero.textContent =  
        '🎟️ RESERVAR NÚMERO';  


      mostrarErro(  
        'Não foi possível reservar o número.'  
      );  


      alert(  
        '❌ Não foi possível reservar o número. ' +  
        'Verifique sua conexão e tente novamente.'  
      );  

    }  

  }  
);

}

}

/* =========================================================
💠 COPIAR PIX
========================================================= */

const copiarPix =
document.getElementById('copiarPix');

if (copiarPix) {

copiarPix.onclick =
async () => {

const chave =  
    CONFIG.pixChave;  


  if (!chave) {  

    alert(  
      'Chave PIX não configurada.'  
    );  

    return;  

  }  


  try {  

    if (  
      navigator.clipboard  
    ) {  

      await navigator.clipboard.writeText(  
        chave  
      );  

    } else {  

      throw new Error(  
        'Clipboard indisponível'  
      );  

    }  


    alert(  
      '✅ Chave PIX copiada!'  
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

      campo.style.opacity =  
        '0';  


      document.body.appendChild(  
        campo  
      );  


      campo.focus();  

      campo.select();  


      document.execCommand(  
        'copy'  
      );  


      campo.remove();  


      alert(  
        '✅ Chave PIX copiada!'  
      );  


    } catch {  

      alert(  
        'Não foi possível copiar automaticamente. ' +  
        'Toque e segure a chave PIX para copiar.'  
      );  

    }  

  }  

};

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
'2d'
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

function ajustarCanvas() {

const rect =  
  area.getBoundingClientRect();  


const escala =  
  window.devicePixelRatio ||  
  1;  


canvas.width =  
  rect.width * escala;  

canvas.height =  
  rect.height * escala;  


canvas.style.width =  
  rect.width + 'px';  

canvas.style.height =  
  rect.height + 'px';  


ctx.setTransform(  
  escala,  
  0,  
  0,  
  escala,  
  0,  
  0  
);  


ctx.fillStyle =  
  '#b9bec4';  


ctx.fillRect(  
  0,  
  0,  
  rect.width,  
  rect.height  
);  


ctx.fillStyle =  
  'rgba(255,255,255,.35)';  


for (  
  let x = -rect.height;  
  x < rect.width;  
  x += 35  
) {  

  ctx.beginPath();  

  ctx.moveTo(  
    x,  
    0  
  );  

  ctx.lineTo(  
    x + rect.height,  
    rect.height  
  );  


  ctx.strokeStyle =  
    'rgba(255,255,255,.25)';  

  ctx.lineWidth =  
    10;  

  ctx.stroke();  

}  


ctx.fillStyle =  
  '#6d7379';  


ctx.font =  
  '900 18px Arial';  


ctx.textAlign =  
  'center';  

ctx.textBaseline =  
  'middle';  


ctx.fillText(  
  'RASPE AQUI',  
  rect.width / 2,  
  rect.height / 2  
);

}

function obterPosicao(evento) {

const rect =  
  canvas.getBoundingClientRect();  


let x;  

let y;  


if (  
  evento.touches &&  
  evento.touches.length  
) {  

  x =  
    evento.touches[0].clientX -  
    rect.left;  

  y =  
    evento.touches[0].clientY -  
    rect.top;  

} else {  

  x =  
    evento.clientX -  
    rect.left;  

  y =  
    evento.clientY -  
    rect.top;  

}  


return {  
  x,  
  y  
};

}

function raspar(evento) {

if (  
  !raspando ||  
  finalizada  
) return;  


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
  24,  
  0,  
  Math.PI * 2  
);  


ctx.fill();

}

function iniciar(evento) {

raspando =  
  true;  


evento.preventDefault();  


raspar(  
  evento  
);

}

function parar() {

raspando =  
  false;  


verificarProgresso();

}

function verificarProgresso() {

if (  
  finalizada  
) return;  


const rect =  
  canvas.getBoundingClientRect();  


const largura =  
  Math.max(  
    1,  
    Math.floor(  
      rect.width  
    )  
  );  


const altura =  
  Math.max(  
    1,  
    Math.floor(  
      rect.height  
    )  
  );  


const imagem =  
  ctx.getImageData(  
    0,  
    0,  
    Math.min(  
      canvas.width,  
      largura  
    ),  
    Math.min(  
      canvas.height,  
      altura  
    )  
  );  


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


if (  
  porcentagem > 0.45  
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
parar
);

window.addEventListener(
'resize',
ajustarCanvas
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
      erro.name ===  
      'AbortError'  
    ) {  

      if (comprovanteMsg) {  

        comprovanteMsg.textContent =  
          'Compartilhamento cancelado.';  

      }  


      return;  

    }  


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
