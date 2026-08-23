import {
  db,
  auth,
  firebaseConfigured
} from './firebase.js';

import {
  signInAnonymously
} from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js';

import {
  getFunctions,
  httpsCallable
} from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-functions.js';


/* =========================================================
   ELEMENTOS
========================================================= */

const numeroInput =
  document.getElementById('numeroRifa');

const liberarBtn =
  document.getElementById('liberar');

const mensagem =
  document.getElementById('mensagem');

const areaRaspadinha =
  document.getElementById('areaRaspadinha');

const resultado =
  document.getElementById('resultado');

const canvas =
  document.getElementById('scratchCanvas');


/* =========================================================
   FIREBASE FUNCTIONS
========================================================= */

let functions = null;
let criarJogada = null;

if (firebaseConfigured) {

  functions = getFunctions(
    undefined,
    'southamerica-east1'
  );

  criarJogada =
    httpsCallable(
      functions,
      'criarJogadaRaspadinha'
    );

}


/* =========================================================
   NORMALIZAR NÚMERO
========================================================= */

function normalizarNumero(valor){

  const texto =
    String(valor || '')
      .replace(/\D/g,'')
      .slice(0,3);

  if(!texto){
    return null;
  }

  const numero =
    Number(texto);

  if(
    !Number.isInteger(numero) ||
    numero < 0 ||
    numero > 999
  ){
    return null;
  }

  return String(numero).padStart(3,'0');

}


/* =========================================================
   MENSAGEM
========================================================= */

function mostrarMensagem(texto,tipo='normal'){

  mensagem.textContent = texto;

  mensagem.style.color =
    tipo === 'erro'
      ? '#ff7676'
      : tipo === 'sucesso'
        ? '#61e294'
        : 'rgba(255,255,255,.8)';

}


/* =========================================================
   INPUT
========================================================= */

numeroInput.addEventListener(
  'input',
  () => {

    numeroInput.value =
      numeroInput.value
        .replace(/\D/g,'')
        .slice(0,3);

  }
);


/* =========================================================
   ENTER
========================================================= */

numeroInput.addEventListener(
  'keydown',
  event => {

    if(event.key === 'Enter'){
      liberarBtn.click();
    }

  }
);


/* =========================================================
   LIBERAR JOGADA
========================================================= */

liberarBtn.addEventListener(
  'click',
  liberarJogada
);


async function liberarJogada(){

  const numero =
    normalizarNumero(
      numeroInput.value
    );

  if(!numero){

    mostrarMensagem(
      'Digite um número válido entre 000 e 999.',
      'erro'
    );

    numeroInput.focus();

    return;
  }


  if(!firebaseConfigured){

    mostrarMensagem(
      'O Firebase ainda não está configurado.',
      'erro'
    );

    return;
  }


  if(!auth){

    mostrarMensagem(
      'Não foi possível iniciar a autenticação.',
      'erro'
    );

    return;
  }


  liberarBtn.disabled = true;

  liberarBtn.textContent =
    'VERIFICANDO...';


  try{

    /*
     * A autenticação anônima permite identificar
     * esta sessão sem pedir cadastro ao participante.
     *
     * A Cloud Function é quem decide se o número
     * está realmente pago.
     */

    if(!auth.currentUser){

      await signInAnonymously(auth);

    }


    const resposta =
      await criarJogada({
        numeroRifa: numero
      });


    const dados =
      resposta.data || {};


    mostrarMensagem(
      '✅ Número pago confirmado. Sua jogada foi liberada!',
      'sucesso'
    );


    areaRaspadinha.classList.remove(
      'hidden'
    );


    /*
     * Se futuramente a Cloud Function retornar
     * o resultado do prêmio, usamos aqui.
     *
     * Exemplo:
     * { resultado: "LIQUIDIFICADOR" }
     */

    if(dados.resultado){

      resultado.textContent =
        dados.resultado;

    }else{

      resultado.textContent =
        'BOA SORTE!';

    }


    criarRaspadinha();


    areaRaspadinha.scrollIntoView({
      behavior:'smooth',
      block:'center'
    });


  }catch(error){

    console.error(
      'Erro ao liberar raspadinha:',
      error
    );


    let texto =
      'Não foi possível liberar a jogada.';


    if(
      error?.code ===
      'functions/failed-precondition'
    ){

      texto =
        '⚠️ O pagamento deste número ainda não foi confirmado.';

    }

    else if(
      error?.code ===
      'functions/unauthenticated'
    ){

      texto =
        'É necessário autenticar para liberar a jogada.';

    }

    else if(
      error?.code ===
      'functions/permission-denied'
    ){

      texto =
        '⛔ Este número pertence a outro participante.';

    }

    else if(
      error?.code ===
      'functions/not-found'
    ){

      texto =
        'Número não encontrado na rifa.';

    }

    else if(
      error?.message
    ){

      texto =
        error.message;

    }


    mostrarMensagem(
      texto,
      'erro'
    );


  }finally{

    liberarBtn.disabled = false;

    liberarBtn.textContent =
      'LIBERAR JOGADA';

  }

}


/* =========================================================
   RASPADINHA
========================================================= */

function criarRaspadinha(){

  const card =
    canvas.parentElement;


  const largura =
    card.clientWidth;

  const altura =
    card.clientHeight;


  const dpr =
    window.devicePixelRatio || 1;


  canvas.width =
    Math.floor(
      largura * dpr
    );

  canvas.height =
    Math.floor(
      altura * dpr
    );


  canvas.style.width =
    `${largura}px`;

  canvas.style.height =
    `${altura}px`;


  const ctx =
    canvas.getContext('2d');


  ctx.scale(
    dpr,
    dpr
  );


  /*
   * Camada de raspagem.
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
    '#d9d9d9'
  );

  gradiente.addColorStop(
    .5,
    '#a9a9a9'
  );

  gradiente.addColorStop(
    1,
    '#e7e7e7'
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
   * Texto da cobertura.
   */

  ctx.fillStyle =
    '#555';

  ctx.textAlign =
    'center';

  ctx.textBaseline =
    'middle';

  ctx.font =
    '900 22px Arial';

  ctx.fillText(
    'RASPE AQUI',
    largura / 2,
    altura / 2 - 10
  );


  ctx.font =
    '700 12px Arial';

  ctx.fillText(
    '🍀 DESCUBRA SUA SORTE 🍀',
    largura / 2,
    altura / 2 + 20
  );


  /*
   * Configuração para apagar
   * a camada com o dedo/mouse.
   */

  ctx.globalCompositeOperation =
    'destination-out';


  let raspando = false;


  function ponto(event){

    const rect =
      canvas.getBoundingClientRect();


    let clientX;
    let clientY;


    if(
      event.touches &&
      event.touches.length
    ){

      clientX =
        event.touches[0].clientX;

      clientY =
        event.touches[0].clientY;

    }else{

      clientX =
        event.clientX;

      clientY =
        event.clientY;

    }


    return {
      x:
        clientX - rect.left,

      y:
        clientY - rect.top
    };

  }


  function raspar(event){

    if(!raspando){
      return;
    }


    event.preventDefault();


    const p =
      ponto(event);


    ctx.beginPath();

    ctx.arc(
      p.x,
      p.y,
      24,
      0,
      Math.PI * 2
    );

    ctx.fill();


    verificarRevelacao();

  }


  function iniciar(event){

    raspando = true;

    raspar(event);

  }


  function parar(){

    raspando = false;

  }


  canvas.onmousedown =
    iniciar;

  canvas.onmousemove =
    raspar;

  canvas.onmouseup =
    parar;

  canvas.onmouseleave =
    parar;


  canvas.ontouchstart =
    iniciar;

  canvas.ontouchmove =
    raspar;

  canvas.ontouchend =
    parar;


  /*
   * Depois de raspar uma boa parte,
   * retiramos a cobertura restante.
   */

  function verificarRevelacao(){

    /*
     * Fazemos a verificação de tempos
     * em tempos para não pesar no celular.
     */

    if(
      Math.random() > .15
    ){

      return;
    }


    const pixels =
      ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      ).data;


    let transparentes = 0;

    let total =
      pixels.length / 4;


    /*
     * Conta uma amostra dos pixels.
     */

    const passo = 16;


    for(
      let i = 3;
      i < pixels.length;
      i += 4 * passo
    ){

      if(
        pixels[i] < 30
      ){

        transparentes++;

      }

    }


    const amostra =
      Math.ceil(
        total / passo
      );


    const percentual =
      transparentes / amostra;


    if(
      percentual > .65
    ){

      canvas.style.pointerEvents =
        'none';

      mostrarMensagem(
        '🎉 Raspadinha revelada!',
        'sucesso'
      );

    }

  }

}


/* =========================================================
   REDIMENSIONAMENTO
========================================================= */

window.addEventListener(
  'resize',
  () => {

    /*
     * Não recria automaticamente
     * enquanto o usuário estiver raspando.
     *
     * A página pode ser recarregada se
     * houver uma grande mudança de tela.
     */

  }
);


/* =========================================================
   AVISO INICIAL
========================================================= */

if(!firebaseConfigured){

  mostrarMensagem(
    'Firebase ainda não configurado.',
    'erro'
  );

}
