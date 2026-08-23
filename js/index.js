import { CONFIG } from './config.js';


/* =========================
   ESCOLHER NÚMEROS
========================= */

document.getElementById('abrirCartelas').onclick = () => {
  location.href = 'cartela.html';
};


/* =========================
   SUGERIR NÚMERO
========================= */

document.getElementById('sugerir').onclick = () => {
  location.href = 'cartela.html?sugerir=1';
};


/* =========================
   DIGITAR NÚMERO
========================= */

document.getElementById('numeroDireto').addEventListener(
  'keydown',
  e => {
    if (e.key === 'Enter') {
      irParaNumero();
    }
  }
);

document.getElementById('numeroDireto').addEventListener(
  'input',
  e => {
    e.target.value = e.target.value
      .replace(/\D/g, '')
      .slice(0, 3);
  }
);


function irParaNumero() {

  const raw =
    document.getElementById('numeroDireto').value;

  if (raw === '') return;

  const n = Number(raw);

  if (n < 0 || n > 999) {
    return alert(
      'Digite um número entre 000 e 999.'
    );
  }

  location.href =
    `cartela.html?numero=${String(n).padStart(3, '0')}`;
}


/* =========================
   COPIAR PIX
========================= */

document.getElementById('copiarPix').onclick = async () => {

  const chave = CONFIG.pixChave;

  if (!chave) {
    alert('Chave PIX não configurada.');
    return;
  }

  try {

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(chave);
    } else {
      throw new Error('Clipboard indisponível');
    }

    alert('✅ Chave PIX copiada!');

  } catch {

    try {

      const campo =
        document.createElement('textarea');

      campo.value = chave;
      campo.style.position = 'fixed';
      campo.style.opacity = '0';

      document.body.appendChild(campo);

      campo.focus();
      campo.select();

      document.execCommand('copy');

      campo.remove();

      alert('✅ Chave PIX copiada!');

    } catch {

      alert(
        'Não foi possível copiar automaticamente. ' +
        'Toque e segure a chave PIX para copiar.'
      );

    }

  }

};


/* =========================
   🍀 RASPADINHA DA SORTE
========================= */

const canvas =
  document.getElementById('scratchCanvas');

const area =
  document.querySelector('.scratch-area');

const premio =
  document.getElementById('scratchPremio');


if (canvas && area && premio) {

  const ctx =
    canvas.getContext('2d');

  let raspando = false;
  let finalizada = false;

  const premios = [
    '🧉 LIQUIDIFICADOR',
    '🔥 FERRO ELÉTRICO'
  ];

  const premioEscolhido =
    premios[Math.floor(Math.random() * premios.length)];


  function ajustarCanvas() {

    const rect =
      area.getBoundingClientRect();

    const escala =
      window.devicePixelRatio || 1;

    canvas.width =
      rect.width * escala;

    canvas.height =
      rect.height * escala;

    canvas.style.width =
      rect.width + 'px';

    canvas.style.height =
      rect.height + 'px';

    ctx.setTransform(
      escala,
      0,
      0,
      escala,
      0,
      0
    );

    ctx.fillStyle = '#b9bec4';

    ctx.fillRect(
      0,
      0,
      rect.width,
      rect.height
    );

    ctx.fillStyle = 'rgba(255,255,255,.35)';

    for (let x = -rect.height; x < rect.width; x += 35) {

      ctx.beginPath();

      ctx.moveTo(x, 0);
      ctx.lineTo(x + rect.height, rect.height);

      ctx.strokeStyle =
        'rgba(255,255,255,.25)';

      ctx.lineWidth = 10;

      ctx.stroke();

    }

    ctx.fillStyle = '#6d7379';

    ctx.font = '900 18px Arial';

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillText(
      'RASPE AQUI',
      rect.width / 2,
      rect.height / 2
    );

  }


  function obterPosicao(evento) {

    const rect =
      canvas.getBoundingClientRect();

    let x;
    let y;

    if (evento.touches && evento.touches.length) {

      x =
        evento.touches[0].clientX - rect.left;

      y =
        evento.touches[0].clientY - rect.top;

    } else {

      x =
        evento.clientX - rect.left;

      y =
        evento.clientY - rect.top;

    }

    return { x, y };

  }


  function raspar(evento) {

    if (!raspando || finalizada) return;

    evento.preventDefault();

    const { x, y } =
      obterPosicao(evento);

    ctx.globalCompositeOperation =
      'destination-out';

    ctx.beginPath();

    ctx.arc(
      x,
      y,
      24,
      0,
      Math.PI * 2
    );

    ctx.fill();

  }


  function iniciar(evento) {

    raspando = true;

    evento.preventDefault();

    raspar(evento);

  }


  function parar() {

    raspando = false;

    verificarProgresso();

  }


  function verificarProgresso() {

    if (finalizada) return;

    const rect =
      canvas.getBoundingClientRect();

    const largura =
      Math.max(1, Math.floor(rect.width));

    const altura =
      Math.max(1, Math.floor(rect.height));

    const imagem =
      ctx.getImageData(
        0,
        0,
        Math.min(canvas.width, largura),
        Math.min(canvas.height, altura)
      );

    let transparentes = 0;

    for (
      let i = 3;
      i < imagem.data.length;
      i += 4
    ) {

      if (imagem.data[i] === 0) {
        transparentes++;
      }

    }

    const total =
      imagem.data.length / 4;

    const porcentagem =
      transparentes / total;

    if (porcentagem > 0.45) {

      finalizada = true;

      premio.textContent =
        premioEscolhido;

      ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

    }

  }


  canvas.addEventListener(
    'mousedown',
    iniciar
  );

  canvas.addEventListener(
    'mousemove',
    raspar
  );

  window.addEventListener(
    'mouseup',
    parar
  );


  canvas.addEventListener(
    'touchstart',
    iniciar,
    { passive: false }
  );

  canvas.addEventListener(
    'touchmove',
    raspar,
    { passive: false }
  );

  canvas.addEventListener(
    'touchend',
    parar
  );


  window.addEventListener(
    'resize',
    ajustarCanvas
  );


  ajustarCanvas();

}
/* =========================================================
   📲 COMPROVANTE + MENSAGEM → WHATSAPP
========================================================= */

const comprovante =
  document.getElementById('comprovante');

const comprovanteNome =
  document.getElementById('comprovanteNome');

const enviarWhatsApp =
  document.getElementById('enviarWhatsApp');

const comprovanteMsg =
  document.getElementById('comprovanteMsg');


if (
  comprovante &&
  comprovanteNome &&
  enviarWhatsApp
) {

  comprovante.addEventListener('change', () => {

    const arquivo =
      comprovante.files[0];

    if (!arquivo) {

      comprovanteNome.textContent =
        'Nenhum arquivo selecionado.';

      enviarWhatsApp.disabled = true;

      if (comprovanteMsg) {
        comprovanteMsg.textContent = '';
      }

      return;
    }


    const tamanhoMaximo =
      10 * 1024 * 1024;


    if (arquivo.size > tamanhoMaximo) {

      comprovante.value = '';

      comprovanteNome.textContent =
        'Nenhum arquivo selecionado.';

      enviarWhatsApp.disabled = true;

      if (comprovanteMsg) {
        comprovanteMsg.textContent =
          '⚠️ O arquivo deve ter no máximo 10 MB.';
      }

      return;
    }


    comprovanteNome.textContent =
      `✅ ${arquivo.name}`;

    enviarWhatsApp.disabled = false;

    if (comprovanteMsg) {
      comprovanteMsg.textContent =
        'Comprovante pronto para envio.';
    }

  });


  enviarWhatsApp.addEventListener('click', async () => {

    const arquivo =
      comprovante.files[0];

    if (!arquivo) {

      if (comprovanteMsg) {
        comprovanteMsg.textContent =
          '⚠️ Selecione o comprovante primeiro.';
      }

      return;
    }


    const mensagem =
      'Olá! Estou enviando o comprovante de pagamento da Rifa Solidária — GILFEST.';


    try {

      const dados = {
        files: [arquivo],
        text: mensagem,
        title: mensagem
      };


      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare(dados)
      ) {

        await navigator.share(dados);

        if (comprovanteMsg) {
          comprovanteMsg.textContent =
            '✅ Escolha o WhatsApp e envie o comprovante com a mensagem.';
        }

        return;
      }


      throw new Error(
        'Compartilhamento de arquivo indisponível.'
      );


    } catch (erro) {

      console.log(
        'Compartilhamento:',
        erro
      );


      if (erro.name === 'AbortError') {

        if (comprovanteMsg) {
          comprovanteMsg.textContent =
            'Compartilhamento cancelado.';
        }

        return;
      }


      /*
       * Fallback para WhatsApp.
       * Aqui a mensagem vai garantidamente,
       * mas o arquivo precisará ser anexado manualmente.
       */

      const numeroWhatsApp =
        '5579999145044';


      const url =
        `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;


      window.open(
        url,
        '_blank'
      );


      if (comprovanteMsg) {
        comprovanteMsg.textContent =
          '📲 WhatsApp aberto. Anexe o comprovante na conversa.';
      }

    }

  });

}
