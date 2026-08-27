import { db, firebaseConfigured } from './firebase.js';

import {
  ref,
  onValue
} from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js';

import { CONFIG } from './config.js';


/* =========================================================
   ELEMENTOS
========================================================= */

const grid =
  document.getElementById('grid');

const titulo =
  document.getElementById('titulo');

const sel =
  document.getElementById('sel');

const total =
  document.getElementById('total');


/* =========================================================
   ESTADO
========================================================= */

let cartela = 0;

let selecionados = [];

let status = {};


/* =========================================================
   FORMATAÇÃO
========================================================= */

const pad = n =>
  String(n).padStart(3, '0');


/* =========================================================
   RENDERIZAR CARTELA
========================================================= */

function render() {

  if (!grid || !titulo) {
    return;
  }

  titulo.textContent =
    `CARTELA ${String(cartela + 1).padStart(2, '0')}`;

  grid.innerHTML = '';

  const inicio =
    cartela * 100;


  for (let i = 0; i < 100; i++) {

    const key =
      pad(inicio + i);

    const b =
      document.createElement('button');

    b.type = 'button';

    b.textContent = key;


    const s =
      status[key];


    /* -----------------------------------------------------
       NÚMERO OCUPADO
    ----------------------------------------------------- */

    if (
      s &&
      s.status !== 'disponivel'
    ) {

      b.disabled = true;

      b.className = 'reserved';

    }


    /* -----------------------------------------------------
       NÚMERO DISPONÍVEL
    ----------------------------------------------------- */

    else {

      if (
        selecionados.includes(key)
      ) {

        b.className =
          'selected';

      }

      b.onclick = () =>
        toggle(key);

    }


    grid.appendChild(b);

  }

}


/* =========================================================
   SELECIONAR / DESMARCAR
========================================================= */

function toggle(key) {

  if (
    selecionados.includes(key)
  ) {

    selecionados =
      selecionados.filter(
        x => x !== key
      );

  }

  else if (
    selecionados.length < 10
  ) {

    selecionados.push(key);

  }

  else {

    alert(
      'Você pode selecionar no máximo 10 números.'
    );

    return;

  }


  update();

}


/* =========================================================
   ATUALIZAR RESUMO
========================================================= */

function update() {

  if (sel) {

    sel.textContent =
      selecionados.join(', ') ||
      'Nenhum';

  }


  if (total) {

    total.textContent =
      `R$ ${(selecionados.length * CONFIG.valorNumero)
        .toFixed(2)
        .replace('.', ',')}`;

  }


  render();

}


/* =========================================================
   IR PARA UM NÚMERO
========================================================= */

function ir(raw, select = false) {

  const n =
    Number(raw);


  if (
    !Number.isInteger(n) ||
    n < 0 ||
    n > 999
  ) {

    alert(
      'Digite um número entre 000 e 999.'
    );

    return;

  }


  cartela =
    Math.floor(n / 100);


  const key =
    pad(n);


  render();


  const disponivel =
    !status[key] ||
    status[key].status === 'disponivel';


  if (
    select &&
    disponivel &&
    !selecionados.includes(key)
  ) {

    if (
      selecionados.length >= 10
    ) {

      alert(
        'Você pode selecionar no máximo 10 números.'
      );

      return;

    }


    selecionados.push(key);

  }


  update();


  setTimeout(() => {

    document
      .querySelectorAll('#grid button')
      .forEach(b => {

        if (
          b.textContent === key
        ) {

          b.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });


          b.animate(
            [
              {
                transform: 'scale(1)'
              },
              {
                transform: 'scale(1.15)'
              },
              {
                transform: 'scale(1)'
              }
            ],
            {
              duration: 700
            }
          );

        }

      });

  }, 50);

}


/* =========================================================
   CARTELA ANTERIOR
========================================================= */

const prev =
  document.getElementById('prev');

if (prev) {

  prev.onclick = () => {

    cartela =
      (cartela + 9) % 10;

    render();

  };

}


/* =========================================================
   PRÓXIMA CARTELA
========================================================= */

const next =
  document.getElementById('next');

if (next) {

  next.onclick = () => {

    cartela =
      (cartela + 1) % 10;

    render();

  };

}


/* =========================================================
   IR PARA NÚMERO
========================================================= */

const irBtn =
  document.getElementById('ir');

const numeroInput =
  document.getElementById('numero');

if (
  irBtn &&
  numeroInput
) {

  irBtn.onclick = () => {

    ir(
      numeroInput.value,
      true
    );

  };

}


/* =========================================================
   SUGERIR NÚMERO
========================================================= */

const sugerir =
  document.getElementById('sugerir');

if (sugerir) {

  sugerir.onclick = () => {

    const livres = [];


    for (
      let n = 0;
      n < 1000;
      n++
    ) {

      const k =
        pad(n);


      const disponivel =
        !status[k] ||
        status[k].status === 'disponivel';


      if (
        disponivel &&
        !selecionados.includes(k)
      ) {

        livres.push(n);

      }

    }


    if (!livres.length) {

      alert(
        'Não há números disponíveis.'
      );

      return;

    }


    if (
      selecionados.length >= 10
    ) {

      alert(
        'Você pode selecionar no máximo 10 números.'
      );

      return;

    }


    const n =
      livres[
        Math.floor(
          Math.random() *
          livres.length
        )
      ];


    const key =
      pad(n);


    cartela =
      Math.floor(n / 100);


    if (
      !selecionados.includes(key)
    ) {

      selecionados.push(key);

    }


    update();


    setTimeout(() => {

      document
        .querySelectorAll('#grid button')
        .forEach(b => {

          if (
            b.textContent === key
          ) {

            b.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });


            b.animate(
              [
                {
                  transform: 'scale(1)'
                },
                {
                  transform: 'scale(1.18)'
                },
                {
                  transform: 'scale(1)'
                }
              ],
              {
                duration: 800
              }
            );

          }

        });

    }, 50);

  };

}


/* =========================================================
   CONTINUAR
========================================================= */

const continuar =
  document.getElementById('continuar');

if (continuar) {

  continuar.onclick = () => {

    if (
      !selecionados.length
    ) {

      alert(
        'Escolha pelo menos um número.'
      );

      return;

    }


    localStorage.setItem(
      'rifaSelecionados',
      JSON.stringify(selecionados)
    );


    /*
      VOLTA PARA A PÁGINA PRINCIPAL.
      NÃO USA MAIS reserva.html.
    */

    location.href =
      'index.html#confirmarParticipacao';

  };

}


/* =========================================================
   DESLIZAR ENTRE CARTELAS NO CELULAR
========================================================= */

let sx = 0;


if (grid) {

  grid.addEventListener(
    'touchstart',
    e => {

      sx =
        e.touches[0].clientX;

    },
    {
      passive: true
    }
  );


  grid.addEventListener(
    'touchend',
    e => {

      const dx =
        e.changedTouches[0].clientX -
        sx;


      if (
        Math.abs(dx) > 60
      ) {

        cartela =
          dx < 0
            ? Math.min(
                9,
                cartela + 1
              )
            : Math.max(
                0,
                cartela - 1
              );


        render();

      }

    }
  );

}


/* =========================================================
   PARÂMETROS DA URL
========================================================= */

const params =
  new URLSearchParams(
    location.search
  );


/* =========================================================
   FIREBASE
========================================================= */

if (firebaseConfigured) {

  onValue(
    ref(
      db,
      'rifa/numeros'
    ),

    snapshot => {

      status =
        snapshot.val() || {};


      if (
        params.has('numero')
      ) {

        ir(
          params.get('numero'),
          false
        );

      }

      else if (
        params.get('sugerir') === '1'
      ) {

        if (sugerir) {

          sugerir.click();

        }

      }

      else {

        render();

      }

    }
  );

}

else {

  if (
    params.has('numero')
  ) {

    ir(
      params.get('numero'),
      false
    );

  }

  else if (
    params.get('sugerir') === '1'
  ) {

    if (sugerir) {

      sugerir.click();

    }

  }

  else {

    render();

  }

}
