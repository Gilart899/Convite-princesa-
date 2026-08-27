import {db,firebaseConfigured} from './firebase.js';
import {ref,onValue} from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js';
import {CONFIG} from './config.js';

const grid=document.getElementById('grid');
const titulo=document.getElementById('titulo');
const sel=document.getElementById('sel');
const total=document.getElementById('total');

let cartela=0;
let selecionados=[];
let status={};

const pad=n=>String(n).padStart(3,'0');

function render(){
  titulo.textContent=`CARTELA ${String(cartela+1).padStart(2,'0')}`;
  grid.innerHTML='';

  const inicio=cartela*100;

  for(let i=0;i<100;i++){
    const key=pad(inicio+i);
    const b=document.createElement('button');

    b.textContent=key;

    const s=status[key];

    if(s && s.status!=='disponivel'){
      b.disabled=true;
      b.className='reserved';
    }else{
      if(selecionados.includes(key)){
        b.className='selected';
      }

      b.onclick=()=>toggle(key);
    }

    grid.appendChild(b);
  }
}

function toggle(key){
  if(selecionados.includes(key)){
    selecionados=selecionados.filter(x=>x!==key);
  }else if(selecionados.length<10){
    selecionados.push(key);
  }else{
    return alert('Você pode selecionar no máximo 10 números.');
  }

  update();
}

function update(){
  sel.textContent=selecionados.join(', ')||'Nenhum';

  total.textContent=`R$ ${(selecionados.length*CONFIG.valorNumero)
    .toFixed(2)
    .replace('.',',')}`;

  render();
}

function ir(raw,select=false){
  const n=Number(raw);

  if(!Number.isInteger(n)||n<0||n>999){
    return alert('Digite um número entre 000 e 999.');
  }

  cartela=Math.floor(n/100);

  const key=pad(n);

  render();

  const disponivel=
    !status[key] ||
    status[key].status==='disponivel';

  if(
    select &&
    disponivel &&
    !selecionados.includes(key)
  ){
    if(selecionados.length>=10){
      return alert('Você pode selecionar no máximo 10 números.');
    }

    selecionados.push(key);
  }

  update();

  setTimeout(()=>{
    document.querySelectorAll('#grid button').forEach(b=>{
      if(b.textContent===key){
        b.scrollIntoView({
          behavior:'smooth',
          block:'center'
        });

        b.animate(
          [
            {transform:'scale(1)'},
            {transform:'scale(1.15)'},
            {transform:'scale(1)'}
          ],
          {
            duration:700
          }
        );
      }
    });
  },50);
}

document.getElementById('prev').onclick=()=>{
  cartela=(cartela+9)%10;
  render();
};

document.getElementById('next').onclick=()=>{
  cartela=(cartela+1)%10;
  render();
};

document.getElementById('ir').onclick=()=>{
  ir(
    document.getElementById('numero').value,
    true
  );
};

document.getElementById('sugerir').onclick=()=>{
  const livres=[];

  for(let n=0;n<1000;n++){
    const k=pad(n);

    const disponivel=
      !status[k] ||
      status[k].status==='disponivel';

    if(
      disponivel &&
      !selecionados.includes(k)
    ){
      livres.push(n);
    }
  }

  if(!livres.length){
    return alert('Não há números disponíveis.');
  }

  if(selecionados.length>=10){
    return alert('Você pode selecionar no máximo 10 números.');
  }

  const n=
    livres[Math.floor(Math.random()*livres.length)];

  const key=pad(n);

  cartela=Math.floor(n/100);

  if(!selecionados.includes(key)){
    selecionados.push(key);
  }

  update();

  setTimeout(()=>{
    document.querySelectorAll('#grid button').forEach(b=>{
      if(b.textContent===key){
        b.scrollIntoView({
          behavior:'smooth',
          block:'center'
        });

        b.animate(
          [
            {transform:'scale(1)'},
            {transform:'scale(1.18)'},
            {transform:'scale(1)'}
          ],
          {
            duration:800
          }
        );
      }
    });
  },50);
};

document.getElementById('continuar').onclick=()=>{
  if(!selecionados.length){
    return alert('Escolha pelo menos um número.');
  }

  localStorage.setItem(
    'rifaSelecionados',
    JSON.stringify(selecionados)
  );

 location.href='index.html';
};

let sx=0;

grid.addEventListener(
  'touchstart',
  e=>sx=e.touches[0].clientX,
  {passive:true}
);

grid.addEventListener(
  'touchend',
  e=>{
    const dx=e.changedTouches[0].clientX-sx;

    if(Math.abs(dx)>60){
      cartela=
        dx<0
          ?Math.min(9,cartela+1)
          :Math.max(0,cartela-1);

      render();
    }
  }
);

const params=new URLSearchParams(location.search);

if(firebaseConfigured){

  onValue(
    ref(db,'rifa/numeros'),
    s=>{
      status=s.val()||{};

      if(params.has('numero')){
        ir(params.get('numero'),false);
      }else if(params.get('sugerir')==='1'){
        document.getElementById('sugerir').click();
      }else{
        render();
      }
    }
  );

}else{

  if(params.has('numero')){
    ir(params.get('numero'),false);
  }else if(params.get('sugerir')==='1'){
    document.getElementById('sugerir').click();
  }else{
    render();
  }

}
