import {db,firebaseConfigured} from './firebase.js';
import {ref,get} from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js';
import {CONFIG} from './config.js';

const selecionados =
  JSON.parse(localStorage.getItem('rifaSelecionados') || '[]');

document.getElementById('numeros').textContent =
  selecionados.length
    ? selecionados.join(' • ')
    : 'Nenhum número selecionado';

document.getElementById('total').textContent =
  `Total: R$ ${(selecionados.length * CONFIG.valorNumero)
    .toFixed(2)
    .replace('.',',')}`;


/* PIX */

const pix=document.getElementById('pix');
const copiarPix=document.getElementById('copiarPix');
const pixMsg=document.getElementById('pixMsg');

pix.value=CONFIG.pixChave || '';

copiarPix.onclick=async()=>{

  const chave=CONFIG.pixChave || '';

  if(!chave){
    pixMsg.textContent='Chave PIX não configurada.';
    return;
  }

  try{

    await navigator.clipboard.writeText(chave);

    pixMsg.textContent='✅ Chave PIX copiada!';

    copiarPix.textContent='✅ COPIADO!';

    setTimeout(()=>{
      copiarPix.textContent='📋 COPIAR';
      pixMsg.textContent='';
    },2000);

  }catch(e){

    pix.select();
    pix.setSelectionRange(0,99999);

    pixMsg.textContent=
      'Selecione e copie a chave PIX manualmente.';

  }

};


/* RESERVA */

document.getElementById('reservar').onclick=async()=>{

  const nome=
    document.getElementById('nome').value.trim();

  const telefone=
    document.getElementById('telefone').value.trim();

  const msg=
    document.getElementById('msg');

  if(!selecionados.length){
    msg.textContent='Selecione pelo menos um número.';
    return;
  }

  if(!nome || !telefone){
    msg.textContent='Preencha nome e WhatsApp.';
    return;
  }

  try{

    if(!firebaseConfigured){

      msg.textContent=
        'O Firebase ainda não foi configurado nesta versão.';

      return;
    }

    const snap=
      await get(ref(db,'rifa/numeros'));

    const atual=
      snap.val() || {};

    const indisponiveis=
      selecionados.filter(
        n=>atual[n] &&
        atual[n].status!=='disponivel'
      );

    if(indisponiveis.length){

      msg.textContent=
        `Estes números já foram ocupados: ${
          indisponiveis.join(', ')
        }`;

      return;
    }

    msg.textContent=
      'A reserva está preparada, mas a gravação definitiva será feita pela Cloud Function na próxima etapa de segurança.';

  }catch(e){

    console.error(e);

    msg.textContent=
      'Não foi possível verificar os números.';

  }

};
