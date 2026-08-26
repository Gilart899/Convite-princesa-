import { CONFIG } from './config.js';

import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js';
import { getDatabase, ref, get, runTransaction } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js';

/* =========================================================
   🔥 FIREBASE — aceita a configuração atual do projeto
========================================================= */
let db = null;
try {
  const firebaseConfig = CONFIG?.firebaseConfig || CONFIG?.firebase;
  if (firebaseConfig?.apiKey && !String(firebaseConfig.apiKey).startsWith('PREENCHER')) {
    const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    db = getDatabase(app);
    console.log('✅ Firebase conectado.');
  } else {
    console.warn('⚠️ Firebase ainda não está configurado em js/config.js.');
  }
} catch (erro) {
  console.error('❌ Erro ao iniciar Firebase:', erro);
}

/* =========================================================
   🧰 HELPERS
========================================================= */
const $ = id => document.getElementById(id);
const qs = sel => document.querySelector(sel);

/* =========================================================
   🎟️ BOTÕES PRINCIPAIS
========================================================= */
const abrirCartelas = $('abrirCartelas');
if (abrirCartelas) abrirCartelas.addEventListener('click', () => { location.href = 'cartela.html'; });

const sugerir = $('sugerir');
if (sugerir) sugerir.addEventListener('click', () => { location.href = 'cartela.html?sugerir=1'; });

/* =========================================================
   🔢 VERIFICAR / RESERVAR NÚMERO
========================================================= */
const numeroDireto = $('numeroDireto');
const searchCard = qs('.search');

let verificarNumeroBotao = $('verificarNumero');
if (!verificarNumeroBotao && searchCard) {
  const area = searchCard.querySelector('div');
  verificarNumeroBotao = document.createElement('button');
  verificarNumeroBotao.id = 'verificarNumero';
  verificarNumeroBotao.className = 'primary index-verificar';
  verificarNumeroBotao.type = 'button';
  verificarNumeroBotao.textContent = '🔎 VERIFICAR DISPONIBILIDADE';
  area?.appendChild(verificarNumeroBotao);
}

let numeroStatus = $('numeroStatus');
if (!numeroStatus && searchCard) {
  numeroStatus = document.createElement('div');
  numeroStatus.id = 'numeroStatus';
  numeroStatus.className = 'numero-status';
  numeroStatus.style.display = 'none';
  searchCard.querySelector('div')?.appendChild(numeroStatus);
}

let reservarNumero = $('reservarNumero');
if (!reservarNumero && searchCard) {
  reservarNumero = document.createElement('button');
  reservarNumero.id = 'reservarNumero';
  reservarNumero.className = 'primary index-reservar';
  reservarNumero.type = 'button';
  reservarNumero.style.display = 'none';
  reservarNumero.textContent = '🎟️ RESERVAR NÚMERO';
  searchCard.querySelector('div')?.appendChild(reservarNumero);
}

function mostrarStatus(msg, tipo = 'info') {
  if (!numeroStatus) return;
  numeroStatus.style.display = 'block';
  numeroStatus.textContent = msg;
  numeroStatus.className = `numero-status ${tipo}`;
}

function limparStatus() {
  if (numeroStatus) { numeroStatus.style.display = 'none'; numeroStatus.textContent = ''; }
  if (reservarNumero) { reservarNumero.style.display = 'none'; reservarNumero.disabled = false; delete reservarNumero.dataset.numero; }
}

function ocupado(dados) {
  if (!dados) return false;
  const status = String(dados.status || dados.situacao || '').toLowerCase();
  return ['reservado','vendido','pago','ocupado','indisponivel'].includes(status) ||
    dados.reservado === true || dados.vendido === true || dados.pago === true || dados.ocupado === true;
}

function disponivel(numero) {
  mostrarStatus(`🟢 NÚMERO ${numero} DISPONÍVEL`, 'disponivel');
  if (reservarNumero) {
    reservarNumero.style.display = 'block';
    reservarNumero.disabled = false;
    reservarNumero.dataset.numero = numero;
    reservarNumero.textContent = `🎟️ RESERVAR ${numero}`;
  }
}

async function verificarNumero() {
  if (!numeroDireto) return;
  const raw = numeroDireto.value.trim();
  if (!raw || !/^\d{1,3}$/.test(raw)) { mostrarStatus('⚠️ Digite um número entre 000 e 999.', 'erro'); return; }
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 0 || n > 999) { mostrarStatus('⚠️ Digite um número entre 000 e 999.', 'erro'); return; }
  const numero = String(n).padStart(3, '0');
  numeroDireto.value = numero;
  if (!db) { mostrarStatus('⚠️ Firebase não está conectado. Verifique o js/config.js.', 'erro'); return; }
  mostrarStatus('🔎 Verificando disponibilidade...', 'verificando');
  try {
    const snap = await get(ref(db, `rifa/numeros/${numero}`));
    if (!snap.exists() || !ocupado(snap.val())) disponivel(numero);
    else { mostrarStatus(`🔴 NÚMERO ${numero} NÃO DISPONÍVEL`, 'indisponivel'); if (reservarNumero) reservarNumero.style.display = 'none'; }
  } catch (erro) {
    console.error(erro);
    mostrarStatus('⚠️ Não foi possível verificar o número.', 'erro');
  }
}

if (verificarNumeroBotao) verificarNumeroBotao.addEventListener('click', verificarNumero);
if (numeroDireto) {
  numeroDireto.addEventListener('input', e => { e.target.value = e.target.value.replace(/\D/g, '').slice(0,3); limparStatus(); });
  numeroDireto.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); verificarNumero(); } });
}

if (reservarNumero) reservarNumero.addEventListener('click', async () => {
  const numero = reservarNumero.dataset.numero;
  if (!numero) return;
  if (!db) { alert('⚠️ Firebase não está conectado.'); return; }
  reservarNumero.disabled = true;
  reservarNumero.textContent = '⏳ RESERVANDO...';
  try {
    const numeroRef = ref(db, `rifa/numeros/${numero}`);
    const resultado = await runTransaction(numeroRef, atual => {
      if (atual === null) return { numero, status:'reservado', reservado:true, dataReserva:new Date().toISOString() };
      if (ocupado(atual)) return;
      return { ...atual, numero, status:'reservado', reservado:true, dataReserva:new Date().toISOString() };
    });
    if (!resultado.committed) {
      mostrarStatus(`🔴 NÚMERO ${numero} NÃO DISPONÍVEL`, 'indisponivel');
      reservarNumero.style.display = 'none';
      alert(`❌ O número ${numero} acabou de ser reservado por outra pessoa.`);
      return;
    }
    mostrarStatus(`✅ NÚMERO ${numero} RESERVADO COM SUCESSO`, 'disponivel');
    reservarNumero.style.display = 'none';
    alert(`✅ Número ${numero} reservado!\n\nAgora faça o pagamento pelo PIX e envie o comprovante.`);
    setTimeout(() => { location.href = `cartela.html?numero=${numero}`; }, 500);
  } catch (erro) {
    console.error(erro);
    reservarNumero.disabled = false;
    reservarNumero.textContent = `🎟️ RESERVAR ${numero}`;
    mostrarStatus('⚠️ Não foi possível reservar o número.', 'erro');
  }
});

/* =========================================================
   💠 COPIAR PIX
========================================================= */
const copiarPix = $('copiarPix');
if (copiarPix) copiarPix.addEventListener('click', async () => {
  const chave = String(CONFIG?.pixChave || '').trim();
  if (!chave || chave === 'COLOQUE_AQUI_A_CHAVE_PIX') { alert('⚠️ Chave PIX não configurada.'); return; }
  try {
    await navigator.clipboard.writeText(chave);
    copiarPix.textContent = '✅ PIX COPIADO!';
    setTimeout(() => copiarPix.textContent = '💠 Copiar chave PIX', 1800);
  } catch {
    const campo = document.createElement('textarea');
    campo.value = chave; campo.style.position='fixed'; campo.style.left='-9999px';
    document.body.appendChild(campo); campo.focus(); campo.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch {}
    campo.remove();
    if (ok) { copiarPix.textContent='✅ PIX COPIADO!'; setTimeout(() => copiarPix.textContent='💠 Copiar chave PIX',1800); }
    else alert(`Copie manualmente a chave PIX:\n\n${chave}`);
  }
});

/* =========================================================
   🍀 RASPADINHA DA AMIZADE — criada dentro do cartão existente
   Não depende de outro HTML e usa as imagens reais da pasta img.
========================================================= */
const scratchCard = qs('.scratch');
if (scratchCard) {
  scratchCard.innerHTML = `
    <span class="tag blue">🍀 RASPADINHA DA AMIZADE</span>
    <h2>RASPE E <strong>DESCUBRA SEU PRÊMIO!</strong></h2>
    <p class="scratch-instrucao">Raspe a área cinza até revelar o prêmio.</p>
    <div class="scratch-box" id="scratchBox">
      <div class="scratch-premio" id="scratchPremio">
        <div class="scratch-loading-imgs">
          <img src="img/liquidificador.png" alt="Liquidificador">
          <img src="img/ferro.png" alt="Ferro elétrico">
        </div>
        <strong id="scratchPremioNome">PRÊMIO</strong>
        <small>Continue raspando...</small>
      </div>
      <canvas id="scratchCanvas"></canvas>
    </div>
    <div class="scratch-status" id="scratchStatus">🎁 Sua raspadinha está pronta!</div>
  `;

  const canvas = $('scratchCanvas');
  const box = $('scratchBox');
  const premioEl = $('scratchPremio');
  const nomeEl = $('scratchPremioNome');
  const statusEl = $('scratchStatus');
  const premios = [
    { nome:'LIQUIDIFICADOR', imagem:'img/liquidificador.png' },
    { nome:'FERRO ELÉTRICO', imagem:'img/ferro.png' }
  ];
  const escolhido = premios[Math.floor(Math.random() * premios.length)];
  const ctx = canvas.getContext('2d', {willReadFrequently:true});
  let raspando=false, finalizada=false, ultimoX=0, ultimoY=0;

  function ajustar() {
    const rect = box.getBoundingClientRect();
    const w = Math.max(280, Math.round(rect.width));
    const h = 220;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.width=w*dpr; canvas.height=h*dpr;
    canvas.style.width=w+'px'; canvas.style.height=h+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.globalCompositeOperation='source-over';
    const g=ctx.createLinearGradient(0,0,w,h);
    g.addColorStop(0,'#d6dadd'); g.addColorStop(.5,'#8e969c'); g.addColorStop(1,'#cdd2d6');
    ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
    ctx.strokeStyle='rgba(255,255,255,.22)'; ctx.lineWidth=9;
    for(let x=-h;x<w+h;x+=34){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+h,h);ctx.stroke();}
    ctx.fillStyle='#4e565c'; ctx.font='900 25px Arial'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('RASPE AQUI',w/2,h/2);
    ctx.font='700 13px Arial'; ctx.fillText('✨ DESCUBRA O PRÊMIO ✨',w/2,h/2+34);
  }
  function pos(e){
    const r=canvas.getBoundingClientRect(); const t=e.touches?.[0];
    return {x:(t?t.clientX:e.clientX)-r.left,y:(t?t.clientY:e.clientY)-r.top};
  }
  function apagar(e){
    if(!raspando||finalizada)return; e.preventDefault();
    const p=pos(e); ctx.globalCompositeOperation='destination-out'; ctx.lineCap='round'; ctx.lineJoin='round'; ctx.lineWidth=52;
    ctx.beginPath(); ctx.moveTo(ultimoX,ultimoY); ctx.lineTo(p.x,p.y); ctx.stroke();
    ctx.beginPath(); ctx.arc(p.x,p.y,26,0,Math.PI*2); ctx.fill(); ultimoX=p.x; ultimoY=p.y;
  }
  function iniciar(e){if(finalizada)return;e.preventDefault();raspando=true;const p=pos(e);ultimoX=p.x;ultimoY=p.y;apagar(e);}
  function parar(){if(!raspando)return;raspando=false;verificar();}
  function verificar(){
    if(finalizada)return;
    const dpr=Math.max(1,window.devicePixelRatio||1), w=canvas.width, h=canvas.height;
    try {
      const data=ctx.getImageData(0,0,w,h).data; let transparentes=0;
      for(let i=3;i<data.length;i+=4) if(data[i]<30) transparentes++;
      const pct=transparentes/(data.length/4);
      if(pct>=0.38) revelar();
    } catch(err){console.warn(err);}
  }
  function revelar(){
    if(finalizada)return; finalizada=true;
    premioEl.innerHTML=`<img class="scratch-premio-imagem" src="${escolhido.imagem}" alt="${escolhido.nome}"><strong>${escolhido.nome}</strong><small>🎉 PARABÉNS! VOCÊ GANHOU!</small>`;
    premioEl.classList.add('revelado');
    canvas.style.display='none';
    statusEl.textContent='🎉 Prêmio revelado!';
  }
  canvas.addEventListener('mousedown',iniciar); canvas.addEventListener('mousemove',apagar); window.addEventListener('mouseup',parar);
  canvas.addEventListener('touchstart',iniciar,{passive:false}); canvas.addEventListener('touchmove',apagar,{passive:false}); canvas.addEventListener('touchend',parar,{passive:true}); canvas.addEventListener('touchcancel',parar,{passive:true});
  window.addEventListener('resize',()=>{if(!finalizada)ajustar();});
  ajustar();
}

/* =========================================================
   📲 COMPROVANTE + WHATSAPP
========================================================= */
const comprovante = $('comprovante');
const uploadCard = qs('.upload');
if (comprovante && uploadCard) {
  let comprovanteNome = $('comprovanteNome');
  if (!comprovanteNome) { comprovanteNome=document.createElement('div'); comprovanteNome.id='comprovanteNome'; comprovanteNome.className='comprovante-nome'; comprovante.after(comprovanteNome); }
  let enviarWhatsApp = $('enviarWhatsApp');
  if (!enviarWhatsApp) { enviarWhatsApp=document.createElement('button'); enviarWhatsApp.id='enviarWhatsApp'; enviarWhatsApp.className='primary whatsapp-btn'; enviarWhatsApp.type='button'; enviarWhatsApp.disabled=true; enviarWhatsApp.textContent='📲 ENVIAR PELO WHATSAPP'; uploadCard.querySelector('.upload-box')?.appendChild(enviarWhatsApp); }
  let msg = $('comprovanteMsg');
  if (!msg) { msg=document.createElement('div'); msg.id='comprovanteMsg'; msg.className='comprovante-msg'; enviarWhatsApp.after(msg); }
  comprovante.addEventListener('change',()=>{
    const arquivo=comprovante.files?.[0];
    if(!arquivo){comprovanteNome.textContent='Nenhum arquivo selecionado.';enviarWhatsApp.disabled=true;return;}
    if(arquivo.size>10*1024*1024){comprovante.value='';comprovanteNome.textContent='Nenhum arquivo selecionado.';enviarWhatsApp.disabled=true;msg.textContent='⚠️ O arquivo deve ter no máximo 10 MB.';return;}
    comprovanteNome.textContent=`✅ ${arquivo.name}`; enviarWhatsApp.disabled=false; msg.textContent='Comprovante pronto para envio.';
  });
  enviarWhatsApp.addEventListener('click',async()=>{
    const arquivo=comprovante.files?.[0]; if(!arquivo)return;
    const mensagem='Olá! Estou enviando o comprovante de pagamento da Rifa Solidária — GILFEST.';
    try {
      if(navigator.share && navigator.canShare){
        const dados={files:[arquivo],text:mensagem,title:mensagem};
        if(navigator.canShare(dados)){await navigator.share(dados);msg.textContent='✅ Escolha o WhatsApp e envie o comprovante.';return;}
      }
    } catch(err) { if(err?.name==='AbortError'){msg.textContent='Compartilhamento cancelado.';return;} }
    const numeroWhatsApp=String(CONFIG?.whatsapp||'5579999145044').replace(/\D/g,'') || '5579999145044';
    window.open(`https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`,'_blank');
    msg.textContent='📲 WhatsApp aberto. Anexe o comprovante na conversa.';
  });
}
