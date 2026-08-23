const canvas = document.getElementById('scratchCanvas');
const resultado = document.getElementById('resultado');
const status = document.getElementById('status');

const ctx = canvas.getContext('2d');

let raspando = false;
let raspado = 0;
let revelado = false;

function ajustarCanvas(){

  const rect = canvas.getBoundingClientRect();

  const dpr = window.devicePixelRatio || 1;

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  ctx.setTransform(dpr,0,0,dpr,0,0);

  criarCobertura();
}


function criarCobertura(){

  const largura = canvas.clientWidth;
  const altura = canvas.clientHeight;

  ctx.clearRect(0,0,largura,altura);

  const gradiente = ctx.createLinearGradient(
    0,
    0,
    largura,
    altura
  );

  gradiente.addColorStop(0,'#b7b7b7');
  gradiente.addColorStop(.5,'#eeeeee');
  gradiente.addColorStop(1,'#9b9b9b');

  ctx.fillStyle = gradiente;

  ctx.fillRect(
    0,
    0,
    largura,
    altura
  );

  ctx.fillStyle='rgba(255,255,255,.55)';

  for(let i=0;i<80;i++){

    const x=Math.random()*largura;
    const y=Math.random()*altura;
    const r=Math.random()*2+1;

    ctx.beginPath();
    ctx.arc(x,y,r,0,Math.PI*2);
    ctx.fill();

  }

  ctx.fillStyle='rgba(70,70,70,.35)';
  ctx.font='900 24px Arial';
  ctx.textAlign='center';
  ctx.textBaseline='middle';

  ctx.fillText(
    'RASPE AQUI',
    largura/2,
    altura/2
  );

}


function posicao(e){

  const rect=canvas.getBoundingClientRect();

  if(e.touches){

    return {
      x:e.touches[0].clientX-rect.left,
      y:e.touches[0].clientY-rect.top
    };

  }

  return {
    x:e.clientX-rect.left,
    y:e.clientY-rect.top
  };

}


function raspar(e){

  if(revelado) return;

  const p=posicao(e);

  ctx.globalCompositeOperation='destination-out';

  ctx.beginPath();

  ctx.arc(
    p.x,
    p.y,
    24,
    0,
    Math.PI*2
  );

  ctx.fill();

  ctx.globalCompositeOperation='source-over';

  verificarPercentual();

}


function verificarPercentual(){

  if(revelado) return;

  const largura=canvas.width;
  const altura=canvas.height;

  const dados=ctx.getImageData(
    0,
    0,
    largura,
    altura
  ).data;

  let transparentes=0;

  for(let i=3;i<dados.length;i+=4){

    if(dados[i]<80){
      transparentes++;
    }

  }

  const percentual=
    transparentes/(dados.length/4);

  raspado=percentual*100;

  if(raspado>=55){

    revelar();

  }

}


function revelar(){

  if(revelado) return;

  revelado=true;

  canvas.style.transition='opacity .7s ease';
  canvas.style.opacity='0';

  setTimeout(()=>{

    canvas.style.display='none';

    resultado.innerHTML=`
      <span class="resultado-icone">🎉</span>
      <strong>PARABÉNS!</strong>
      <small>Você revelou sua sorte!</small>
    `;

    status.textContent=
      'Resultado revelado! 🍀';

  },700);

}


canvas.addEventListener(
  'mousedown',
  e=>{
    raspando=true;
    raspar(e);
  }
);

canvas.addEventListener(
  'mousemove',
  e=>{
    if(raspando) raspar(e);
  }
);

window.addEventListener(
  'mouseup',
  ()=>{
    raspando=false;
  }
);


canvas.addEventListener(
  'touchstart',
  e=>{
    e.preventDefault();
    raspando=true;
    raspar(e);
  },
  {passive:false}
);

canvas.addEventListener(
  'touchmove',
  e=>{
    e.preventDefault();

    if(raspando){
      raspar(e);
    }

  },
  {passive:false}
);

window.addEventListener(
  'touchend',
  ()=>{
    raspando=false;
  }
);


window.addEventListener(
  'resize',
  ajustarCanvas
);


ajustarCanvas();

status.textContent=
  'Raspe a área acima para descobrir o resultado. 🍀';
