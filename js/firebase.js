import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js';

import {
  getDatabase
} from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js';

import {
  getAuth
} from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js';

import { CONFIG } from './config.js';


/* =========================================================
   🔥 CONFIGURAÇÃO DO FIREBASE
========================================================= */

const firebaseConfigured =
  CONFIG &&
  CONFIG.firebaseConfig &&
  Object.values(CONFIG.firebaseConfig).every(
    valor =>
      valor &&
      !String(valor).includes('PREENCHER')
  );


let app = null;
let db = null;
let auth = null;


/* =========================================================
   🔥 INICIAR FIREBASE
========================================================= */

if (firebaseConfigured) {

  try {

    app = initializeApp(
      CONFIG.firebaseConfig
    );

    db = getDatabase(app);

    auth = getAuth(app);

    console.log(
      '✅ Firebase conectado com sucesso.'
    );

  } catch (erro) {

    console.error(
      '❌ Erro ao conectar ao Firebase:',
      erro
    );

  }

} else {

  console.warn(
    '⚠️ Firebase ainda não configurado. Verifique js/config.js.'
  );

}


/* =========================================================
   📤 EXPORTAR
========================================================= */

export {
  app,
  db,
  auth,
  firebaseConfigured
};
