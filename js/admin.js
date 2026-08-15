import {auth,db,firebaseConfigured} from './firebase.js';
import {signInWithEmailAndPassword,signOut,onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js';
import {getFunctions,httpsCallable} from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-functions.js';
import {app} from './firebase.js';
const functions=firebaseConfigured?getFunctions(app,'southamerica-east1'):null;
import {ref,onValue} from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js';
const loginBox=document.getElementById('loginBox'),painel=document.getElementById('painel');
document.getElementById('entrar').onclick=async()=>{if(!firebaseConfigured)return document.getElementById('loginMsg').textContent='Configure o aplicativo Web do Firebase em js/config.js antes do login.';try{await signInWithEmailAndPassword(auth,document.getElementById('email').value.trim(),document.getElementById('senha').value);document.getElementById('loginMsg').textContent='';}catch(e){document.getElementById('loginMsg').textContent='Não foi possível entrar. Verifique os dados.'}};document.getElementById('sair').onclick=()=>signOut(auth);
if(firebaseConfigured) onAuthStateChanged(auth,user=>{if(user){loginBox.classList.add('hidden');painel.classList.remove('hidden')}else{loginBox.classList.remove('hidden');painel.classList.add('hidden')}});
if(firebaseConfigured) onValue(ref(db,'rifa/numeros'),s=>{const n=s.val()||{};let d=0,r=0,p=0;Object.values(n).forEach(x=>{if(!x||x.status==='disponivel')d++;if(x?.status==='reservado')r++;if(x?.status==='pago')p++});document.getElementById('disponiveis').textContent=d;document.getElementById('reservados').textContent=r;document.getElementById('pagos').textContent=p});

document.getElementById('initDb').onclick=async()=>{if(!firebaseConfigured)return alert('Configure primeiro o Firebase Web.');try{const fn=httpsCallable(functions,'inicializarBanco');const r=await fn();alert(r.data.jaExistia?'O banco já estava inicializado.':'Banco inicializado com 1.000 números.')}catch(e){alert('Não foi possível inicializar: '+e.message)}};
