import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js';
import { getDatabase } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js';
import { CONFIG } from './config.js';
const firebaseConfigured=Object.values(CONFIG.firebase).every(v=>v && !String(v).includes('PREENCHER'));
let app=null,db=null,auth=null;
if(firebaseConfigured){app=initializeApp(CONFIG.firebase);db=getDatabase(app);auth=getAuth(app);}else{console.warn('Firebase ainda não configurado. Preencha js/config.js com a configuração do aplicativo Web correto.');}
export {app,db,auth,firebaseConfigured};
