import { CONFIG } from './config.js';

document.getElementById('abrirCartelas').onclick=()=>location.href='cartela.html';
document.getElementById('sugerir').onclick=()=>location.href='cartela.html?sugerir=1';
document.getElementById('numeroDireto').addEventListener('keydown',e=>{if(e.key==='Enter')irParaNumero()});
document.getElementById('numeroDireto').addEventListener('input',e=>e.target.value=e.target.value.replace(/\D/g,'').slice(0,3));
function irParaNumero(){const raw=document.getElementById('numeroDireto').value;if(raw==='')return;const n=Number(raw);if(n<0||n>999)return alert('Digite um número entre 000 e 999.');location.href=`cartela.html?numero=${String(n).padStart(3,'0')}`}
document.getElementById('copiarPix').onclick=async()=>{try{await navigator.clipboard.writeText(CONFIG.pixChave);alert('Chave PIX copiada.');}catch{alert('Não foi possível copiar automaticamente.')}};
