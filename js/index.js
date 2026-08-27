import { CONFIG } from './config.js';

import {
initializeApp
} from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js';

import {
getDatabase,
ref,
get,
runTransaction
} from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js';

/* =========================================================
🔥 FIREBASE
========================================================= */

let db = null;

try {

if (
CONFIG &&
CONFIG.firebaseConfig &&
CONFIG.firebaseConfig.apiKey
) {

const app =
  initializeApp(CONFIG.firebaseConfig);

db =
  getDatabase(app);

console.log('✅ Firebase conectado.');

} else {

console.warn(
  '⚠️ Firebase não configurado em config.js.'
);

}

} catch (erro) {

console.error(
'❌ Erro ao iniciar Firebase:',
erro
);

}

/* =========================================================
⚙️ CONFIGURAÇÕES
========================================================= */

const WHATSAPP =
'5579999145044';

const VALOR_NUMERO =
Number(CONFIG?.valorNumero || 10);

/* =========================================================
🧰 ELEMENTOS
========================================================= */

const numeroDireto =
document.getElementById('numeroDireto');

const verificarNumeroBotao =
document.getElementById('verificarNumero');

const numeroStatus =
document.getElementById('numeroStatus');

const comprarNumero =
document.getElementById('reservarNumero');

/* =========================================================
📝 CONFIRMAR PARTICIPAÇÃO
========================================================= */

const reservaCard =
document.querySelector('.reserva-inline');

const reservaNumeros =
document.getElementById('reservaNumeros');

const reservaTotal =
document.getElementById('reservaTotal');

const pixReserva =
document.getElementById('pixReserva');

const copiarPixReserva =
document.getElementById('copiarPixReserva');

const pixMsgReserva =
document.getElementById('pixMsgReserva');

const nomeReserva =
document.getElementById('nomeReserva');

const telefoneReserva =
document.getElementById('telefoneReserva');

const reservarReserva =
document.getElementById('reservarReserva');

const msgReserva =
document.getElementById('msgReserva');

/* =========================================================
🧹 REMOVER / OCULTAR ELEMENTOS ANTIGOS
========================================================= */

/*

* O cartão separado "ENVIE SEU COMPROVANTE"
* não será mais utilizado.
  */

const cartaoComprovante =
document.querySelector('.upload');

if (cartaoComprovante) {
cartaoComprovante.style.display = 'none';
}

/*

* O PIX não fica mais no cartão azul.
  */

const pixAreaAntiga =
document.querySelector('.search .pix-area');

if (pixAreaAntiga) {
pixAreaAntiga.style.display = 'none';
}

/*

* O botão antigo de copiar PIX no cartão azul
* também fica oculto.
  */

const copiarPixAntigo =
document.getElementById('copiarPix');

if (copiarPixAntigo) {
copiarPixAntigo.style.display = 'none';
}

/* =========================================================
🟢 STATUS
========================================================= */

function mostrarStatus(
mensagem,
tipo
) {

if (!numeroStatus) return;

numeroStatus.style.display =
'flex';

numeroStatus.textContent =
mensagem;

numeroStatus.classList.remove(
'disponivel',
'indisponivel',
'verificando',
'erro'
);

numeroStatus.classList.add(
tipo
);

}

/* =========================================================
🧹 LIMPAR STATUS
========================================================= */

function limparNumeroStatus() {

if (numeroStatus) {

numeroStatus.style.display =
  'none';

numeroStatus.textContent =
  '';

numeroStatus.classList.remove(
  'disponivel',
  'indisponivel',
  'verificando',
  'erro'
);

}

if (comprarNumero) {

comprarNumero.style.display =
  'none';

comprarNumero.disabled =
  false;

comprarNumero.textContent =
  '🛒 COMPRAR NÚMERO';

delete comprarNumero.dataset.numero;

}

}

/* =========================================================
🔎 NÚMERO OCUPADO?
========================================================= */

function numeroEstaOcupado(dados) {

if (!dados) return false;

const status =
String(
dados.status ||
dados.situacao ||
''
).toLowerCase();

return (

status === 'reservado' ||
status === 'vendido' ||
status === 'pago' ||
status === 'ocupado' ||
status === 'indisponivel' ||

dados.reservado === true ||
dados.vendido === true ||
dados.pago === true ||
dados.ocupado === true

);

}

/* =========================================================
🟢 NÚMERO DISPONÍVEL
========================================================= */

function mostrarDisponivel(numero) {

mostrarStatus(
"🟢 NÚMERO ${numero} DISPONÍVEL",
'disponivel'
);

if (!comprarNumero) return;

comprarNumero.style.display =
'flex';

comprarNumero.hidden =
false;

comprarNumero.disabled =
false;

comprarNumero.textContent =
"🛒 COMPRAR ${numero}";

comprarNumero.dataset.numero =
numero;

}

/* =========================================================
🔴 NÚMERO INDISPONÍVEL
========================================================= */

function mostrarIndisponivel(numero) {

mostrarStatus(
"🔴 NÚMERO ${numero} NÃO DISPONÍVEL",
'indisponivel'
);

if (comprarNumero) {

comprarNumero.style.display =
  'none';

delete comprarNumero.dataset.numero;

}

}

/* =========================================================
⚠️ ERRO
========================================================= */

function mostrarErro(mensagem) {

mostrarStatus(
"⚠️ ${mensagem}",
'erro'
);

if (comprarNumero) {
comprarNumero.style.display =
'none';
}

}

/* =========================================================
🔎 VERIFICAR NÚMERO
========================================================= */

async function verificarNumero() {

if (!numeroDireto) return;

const valor =
numeroDireto.value.trim();

if (valor === '') {

mostrarErro(
  'Digite um número entre 000 e 999.'
);

return;

}

const numeroInteiro =
Number(valor);

if (
!Number.isInteger(numeroInteiro) ||
numeroInteiro < 0 ||
numeroInteiro > 999
) {

mostrarErro(
  'Digite um número entre 000 e 999.'
);

return;

}

const numero =
String(numeroInteiro)
.padStart(3, '0');

numeroDireto.value =
numero;

mostrarStatus(
'🔎 Verificando disponibilidade...',
'verificando'
);

if (!db) {

mostrarErro(
  'Firebase não está conectado. Verifique o config.js.'
);

return;

}

try {

const numeroRef =
  ref(
    db,
    `rifa/numeros/${numero}`
  );

const snapshot =
  await get(numeroRef);

if (!snapshot.exists()) {

  mostrarDisponivel(numero);

  return;

}

const dados =
  snapshot.val();

if (
  numeroEstaOcupado(dados)
) {

  mostrarIndisponivel(numero);

} else {

  mostrarDisponivel(numero);

}

} catch (erro) {

console.error(
  '❌ Erro ao verificar número:',
  erro
);

mostrarErro(
  'Não foi possível verificar o número.'
);

}

}

/* =========================================================
🔎 BOTÃO VERIFICAR
========================================================= */

if (verificarNumeroBotao) {

verificarNumeroBotao.addEventListener(
'click',
verificarNumero
);

}

/* =========================================================
🔢 DIGITAÇÃO
========================================================= */

if (numeroDireto) {

numeroDireto.addEventListener(
'input',
() => {

  numeroDireto.value =
    numeroDireto.value
      .replace(/\D/g, '')
      .slice(0, 3);

  limparNumeroStatus();

}

);

numeroDireto.addEventListener(
'keydown',
evento => {

  if (
    evento.key === 'Enter'
  ) {

    evento.preventDefault();

    verificarNumero();

  }

}

);

}

/* =========================================================
🕐 DATA E HORA
========================================================= */

function obterDataHora() {

const agora =
new Date();

const data =
agora.toLocaleDateString(
'pt-BR'
);

const hora =
agora.toLocaleTimeString(
'pt-BR',
{
hour: '2-digit',
minute: '2-digit',
second: '2-digit'
}
);

return {
data,
hora,
iso:
agora.toISOString()
};

}

/* =========================================================
📝 PREENCHER CONFIRMAÇÃO
========================================================= */

function preencherConfirmacao(
numero,
dataHora
) {

if (reservaNumeros) {

reservaNumeros.innerHTML = `
  🎟️ <strong>Número comprado: ${numero}</strong>
`;

}

if (reservaTotal) {

reservaTotal.textContent =
  `💰 Total: R$ ${VALOR_NUMERO.toFixed(2).replace('.', ',')}`;

}

if (pixReserva) {

pixReserva.value =
  String(
    CONFIG?.pixChave || ''
  ).trim();

}

/*

* Guardamos os dados no cartão
* para os próximos passos.
  */

if (reservaCard) {

reservaCard.dataset.numero =
  numero;

reservaCard.dataset.dataCompra =
  dataHora.data;

reservaCard.dataset.horaCompra =
  dataHora.hora;

reservaCard.dataset.valor =
  VALOR_NUMERO.toFixed(2);

reservaCard.dataset.isoCompra =
  dataHora.iso;

}

/*

* O cartão fica visível e
* recebe destaque.
  */

if (reservaCard) {

reservaCard.style.display =
  'block';

reservaCard.scrollIntoView({
  behavior: 'smooth',
  block: 'center'
});

}

}

/* =========================================================
🛒 COMPRAR NÚMERO
========================================================= */

if (comprarNumero) {

comprarNumero.addEventListener(
'click',
async () => {

  const numero =
    comprarNumero.dataset.numero;

  if (!numero) return;

  if (!db) {

    alert(
      '⚠️ Firebase não está conectado.'
    );

    return;

  }

  comprarNumero.disabled =
    true;

  comprarNumero.textContent =
    `⏳ COMPRANDO ${numero}...`;

  try {

    const numeroRef =
      ref(
        db,
        `rifa/numeros/${numero}`
      );


    const dataHora =
      obterDataHora();


    const resultado =
      await runTransaction(
        numeroRef,
        atual => {

          if (atual === null) {

            return {

              numero,

              status:
                'reservado',

              reservado:
                true,

              dataReserva:
                dataHora.iso,

              dataCompra:
                dataHora.iso

            };

          }


          if (
            numeroEstaOcupado(atual)
          ) {

            return;

          }


          return {

            ...atual,

            numero,

            status:
              'reservado',

            reservado:
              true,

            dataReserva:
              dataHora.iso,

            dataCompra:
              dataHora.iso

          };

        }
      );


    if (
      !resultado.committed
    ) {

      mostrarIndisponivel(
        numero
      );

      alert(
        `❌ O número ${numero} acabou de ser comprado por outra pessoa.`
      );

      return;

    }


    mostrarStatus(
      `✅ NÚMERO ${numero} SELECIONADO`,
      'disponivel'
    );


    comprarNumero.style.display =
      'none';


    /*
     * ⭐ PARTE PRINCIPAL:
     * preencher automaticamente
     * o cartão CONFIRMAR PARTICIPAÇÃO.
     */

    preencherConfirmacao(
      numero,
      dataHora
    );


  } catch (erro) {

    console.error(
      '❌ Erro ao comprar número:',
      erro
    );

    comprarNumero.disabled =
      false;

    comprarNumero.style.display =
      'flex';

    comprarNumero.textContent =
      `🛒 COMPRAR ${numero}`;

    mostrarErro(
      'Não foi possível concluir a compra.'
    );

    alert(
      '❌ Não foi possível concluir a compra. Verifique sua conexão e tente novamente.'
    );

  }

}

);

}

/* =========================================================
📋 COPIAR PIX
========================================================= */

async function copiarTexto(texto) {

if (!texto) {
return false;
}

try {

await navigator.clipboard.writeText(
  texto
);

return true;

} catch {

try {

  const campo =
    document.createElement(
      'textarea'
    );

  campo.value =
    texto;

  campo.style.position =
    'fixed';

  campo.style.left =
    '-9999px';

  document.body.appendChild(
    campo
  );

  campo.focus();
  campo.select();

  const sucesso =
    document.execCommand(
      'copy'
    );

  campo.remove();

  return sucesso;

} catch {

  return false;

}

}

}

if (copiarPixReserva) {

copiarPixReserva.addEventListener(
'click',
async () => {

  const chave =
    String(
      CONFIG?.pixChave || ''
    ).trim();

  if (!chave) {

    if (pixMsgReserva) {

      pixMsgReserva.textContent =
        '⚠️ Chave PIX não configurada.';

    }

    return;

  }

  const sucesso =
    await copiarTexto(chave);

  if (sucesso) {

    copiarPixReserva.textContent =
      '✅ COPIADO!';

    if (pixMsgReserva) {

      pixMsgReserva.textContent =
        '💚 Chave PIX copiada com sucesso.';

    }

    setTimeout(
      () => {

        copiarPixReserva.textContent =
          '📋 COPIAR PIX';

      },
      1800
    );

  } else {

    alert(
      `Copie manualmente a chave PIX:\n\n${chave}`
    );

  }

}

);

}

/* =========================================================
📎 COMPROVANTE DENTRO DO CARTÃO DE CONFIRMAÇÃO
========================================================= */

/*

* Como o cartão separado de comprovante saiu,
* criamos a área do comprovante automaticamente
* dentro do cartão CONFIRMAR PARTICIPAÇÃO.
  */

let comprovanteInput = null;
let comprovanteNome = null;
let comprovanteMsg = null;

function criarAreaComprovante() {

if (!reservaCard) return;

if (
document.getElementById(
'comprovanteReserva'
)
) {

comprovanteInput =
  document.getElementById(
    'comprovanteReserva'
  );

comprovanteNome =
  document.getElementById(
    'comprovanteReservaNome'
  );

comprovanteMsg =
  document.getElementById(
    'comprovanteReservaMsg'
  );

return;

}

const area =
document.createElement('div');

area.className =
'comprovante-reserva-area';

area.innerHTML = `

<h3>
  📎 Comprovante de pagamento
</h3>

<p>
  Selecione o comprovante <strong>PAGO</strong>
  antes de enviar para o WhatsApp.
</p>

<input
  id="comprovanteReserva"
  type="file"
  accept="image/*,application/pdf"
>

<p
  id="comprovanteReservaNome"
  class="comprovante-reserva-nome"
>
  Nenhum comprovante selecionado.
</p>

<p
  id="comprovanteReservaMsg"
  class="comprovante-reserva-msg"
  aria-live="polite"
></p>

`;

if (reservarReserva) {

reservarReserva.before(
  area
);

} else {

reservaCard.appendChild(
  area
);

}

comprovanteInput =
document.getElementById(
'comprovanteReserva'
);

comprovanteNome =
document.getElementById(
'comprovanteReservaNome'
);

comprovanteMsg =
document.getElementById(
'comprovanteReservaMsg'
);

if (comprovanteInput) {

comprovanteInput.addEventListener(
  'change',
  () => {

    const arquivo =
      comprovanteInput.files?.[0];

    if (!arquivo) {

      comprovanteNome.textContent =
        'Nenhum comprovante selecionado.';

      return;

    }


    const limite =
      10 * 1024 * 1024;


    if (
      arquivo.size > limite
    ) {

      comprovanteInput.value =
        '';

      comprovanteNome.textContent =
        'Nenhum comprovante selecionado.';

      if (comprovanteMsg) {

        comprovanteMsg.textContent =
          '⚠️ O comprovante deve ter no máximo 10 MB.';

      }

      return;

    }


    comprovanteNome.textContent =
      `✅ ${arquivo.name}`;

    if (comprovanteMsg) {

      comprovanteMsg.textContent =
        '💚 Comprovante pronto para envio.';

    }

  }
);

}

}

/* =========================================================
👤 VALIDAR DADOS
========================================================= */

function validarDadosCliente() {

const nome =
nomeReserva?.value.trim() || '';

const telefone =
telefoneReserva?.value.trim() || '';

if (!nome) {

if (msgReserva) {

  msgReserva.textContent =
    '⚠️ Digite seu nome.';

}

nomeReserva?.focus();

return false;

}

if (!telefone) {

if (msgReserva) {

  msgReserva.textContent =
    '⚠️ Digite seu número de WhatsApp.';

}

telefoneReserva?.focus();

return false;

}

return true;

}

/* =========================================================
📲 MONTAR MENSAGEM
========================================================= */

function montarMensagemWhatsApp() {

const numero =
reservaCard?.dataset.numero || '';

const data =
reservaCard?.dataset.dataCompra || '';

const hora =
reservaCard?.dataset.horaCompra || '';

const valor =
reservaCard?.dataset.valor || '10.00';

const nome =
nomeReserva?.value.trim() || '';

const telefone =
telefoneReserva?.value.trim() || '';

return (
`🍀 RIFA SOLIDÁRIA — GILFEST

📝 CONFIRMAÇÃO DE PARTICIPAÇÃO

🎟️ Número: ${numero}

📅 Data da compra: ${data}
🕐 Horário da compra: ${hora}

💰 Valor: R$ ${String(valor).replace('.', ',')}

👤 Nome: ${nome}
📱 WhatsApp do participante: ${telefone}

💚 Pagamento via PIX: REALIZADO

📎 Estou enviando o comprovante de pagamento junto com esta mensagem.

Por favor, confirme minha participação na Rifa Solidária — GILFEST.`
);

}

/* =========================================================
📲 ENVIAR PARA WHATSAPP
========================================================= */

if (reservarReserva) {

reservarReserva.addEventListener(
'click',
async () => {

  if (!reservaCard) {

    return;

  }


  const numero =
    reservaCard.dataset.numero;


  if (!numero) {

    if (msgReserva) {

      msgReserva.textContent =
        '⚠️ Primeiro compre/selecione um número.';

    }

    return;

  }


  if (!validarDadosCliente()) {
    return;
  }


  criarAreaComprovante();


  const arquivo =
    comprovanteInput?.files?.[0];


  /*
   * O envio só pode acontecer
   * com comprovante selecionado.
   */

  if (!arquivo) {

    if (comprovanteMsg) {

      comprovanteMsg.textContent =
        '⚠️ Selecione o comprovante PAGO antes de enviar.';

    }

    if (msgReserva) {

      msgReserva.textContent =
        '⚠️ Falta selecionar o comprovante de pagamento.';

    }

    return;

  }


  reservarReserva.disabled =
    true;

  reservarReserva.textContent =
    '⏳ PREPARANDO ENVIO...';


  const mensagem =
    montarMensagemWhatsApp();


  /*
   * Primeiro tentamos o compartilhamento
   * nativo com o arquivo.
   *
   * Em celulares compatíveis,
   * o usuário poderá escolher WhatsApp.
   */

  try {

    const dados = {

      files: [
        arquivo
      ],

      text:
        mensagem,

      title:
        '🍀 Rifa Solidária — GILFEST'

    };


    if (
      navigator.share &&
      navigator.canShare &&
      navigator.canShare(dados)
    ) {

      await navigator.share(
        dados
      );


      if (msgReserva) {

        msgReserva.textContent =
          '✅ Dados e comprovante preparados para envio.';

      }


      reservarReserva.disabled =
        false;

      reservarReserva.textContent =
        '📲 ENVIAR PARA WHATSAPP';


      return;

    }

  } catch (erro) {

    if (
      erro &&
      erro.name === 'AbortError'
    ) {

      if (msgReserva) {

        msgReserva.textContent =
          'Compartilhamento cancelado.';

      }

      reservarReserva.disabled =
        false;

      reservarReserva.textContent =
        '📲 ENVIAR PARA WHATSAPP';

      return;

    }

    console.log(
      'Compartilhamento:',
      erro
    );

  }


  /*
   * FALLBACK:
   * abre a conversa do WhatsApp
   * já com todos os dados.
   *
   * O arquivo precisará ser anexado
   * manualmente porque o wa.me não permite
   * anexar arquivos automaticamente.
   */

  const url =
    `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
      mensagem
    )}`;


  window.open(
    url,
    '_blank'
  );


  if (msgReserva) {

    msgReserva.textContent =
      '📲 WhatsApp aberto com os dados. Anexe o comprovante selecionado e envie.';

  }


  reservarReserva.disabled =
    false;

  reservarReserva.textContent =
    '📲 ENVIAR PARA WHATSAPP';

}

);

}

/* =========================================================
🛡️ PREPARAR ÁREA DO COMPROVANTE
========================================================= */

criarAreaComprovante();

/* =========================================================
🎟️ ESCOLHER NÚMEROS
========================================================= */

const abrirCartelas =
document.getElementById(
'abrirCartelas'
);

if (abrirCartelas) {

abrirCartelas.addEventListener(
'click',
() => {

  window.location.href =
    'cartela.html';

}

);

}

/* =========================================================
🍀 SUGERIR UM NÚMERO
========================================================= */

const sugerir =
document.getElementById(
'sugerir'
);

if (sugerir) {

sugerir.addEventListener(
'click',
() => {

  window.location.href =
    'cartela.html?sugerir=1';

}

);

}

/* =========================================================
✨ ANIMAÇÃO DOS CARTÕES
========================================================= */

document.addEventListener(
'DOMContentLoaded',
() => {

const cards =
  document.querySelectorAll(
    '.card'
  );

cards.forEach(
  (card, indice) => {

    card.style.animation =
      `cardEntrada .6s ease ${indice * 0.06}s both`;

  }
);

}
);

/* =========================================================
🍀 RASPADINHA
========================================================= */

const canvas =
document.getElementById(
'scratchCanvas'
);

const scratchArea =
document.querySelector(
'.scratch-area'
);

const scratchPremio =
document.getElementById(
'scratchPremio'
);

if (
canvas &&
scratchArea &&
scratchPremio
) {

const ctx =
canvas.getContext(
'2d',
{
willReadFrequently:
true
}
);

let raspando =
false;

let finalizada =
false;

const premios = [

{
  nome:
    'LIQUIDIFICADOR',

  imagem:
    'img/liquidificador.png'

},

{
  nome:
    'FERRO ELÉTRICO',

  imagem:
    'img/ferro.png'

}

];

const premioEscolhido =
premios[
Math.floor(
Math.random() *
premios.length
)
];

function ajustarCanvas() {

const rect =
  scratchArea.getBoundingClientRect();

const largura =
  Math.max(
    1,
    Math.round(
      rect.width
    )
  );

const altura =
  Math.max(
    1,
    Math.round(
      rect.height
    )
  );

const escala =
  window.devicePixelRatio ||
  1;


canvas.width =
  largura * escala;

canvas.height =
  altura * escala;

canvas.style.width =
  `${largura}px`;

canvas.style.height =
  `${altura}px`;


ctx.setTransform(
  escala,
  0,
  0,
  escala,
  0,
  0
);


ctx.globalCompositeOperation =
  'source-over';


const gradiente =
  ctx.createLinearGradient(
    0,
    0,
    largura,
    altura
  );


gradiente.addColorStop(
  0,
  '#d5d9dd'
);

gradiente.addColorStop(
  .25,
  '#9aa1a7'
);

gradiente.addColorStop(
  .5,
  '#cdd2d6'
);

gradiente.addColorStop(
  .75,
  '#8f969c'
);

gradiente.addColorStop(
  1,
  '#d6dade'
);


ctx.fillStyle =
  gradiente;

ctx.fillRect(
  0,
  0,
  largura,
  altura
);


ctx.strokeStyle =
  'rgba(255,255,255,.25)';

ctx.lineWidth =
  8;


for (
  let x = -altura;
  x < largura + altura;
  x += 32
) {

  ctx.beginPath();

  ctx.moveTo(
    x,
    0
  );

  ctx.lineTo(
    x + altura,
    altura
  );

  ctx.stroke();

}


ctx.strokeStyle =
  'rgba(70,80,90,.25)';

ctx.lineWidth =
  2;

ctx.strokeRect(
  1,
  1,
  largura - 2,
  altura - 2
);


ctx.fillStyle =
  '#555d63';

ctx.font =
  '900 20px Arial';

ctx.textAlign =
  'center';

ctx.textBaseline =
  'middle';

ctx.fillText(
  'RASPE AQUI',
  largura / 2,
  altura / 2
);

}

function obterPosicao(evento) {

const rect =
  canvas.getBoundingClientRect();

let clientX;
let clientY;


if (
  evento.touches &&
  evento.touches.length
) {

  clientX =
    evento.touches[0].clientX;

  clientY =
    evento.touches[0].clientY;

} else {

  clientX =
    evento.clientX;

  clientY =
    evento.clientY;

}


return {

  x:
    clientX -
    rect.left,

  y:
    clientY -
    rect.top

};

}

function verificarProgresso() {

if (finalizada) return;


let imagem;


try {

  imagem =
    ctx.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    );

} catch {

  return;

}


let transparentes =
  0;


const total =
  imagem.data.length /
  4;


for (
  let i = 3;
  i < imagem.data.length;
  i += 4
) {

  if (
    imagem.data[i] === 0
  ) {

    transparentes++;

  }

}


if (
  transparentes / total >= .40
) {

  mostrarPremio();

}

}

function raspar(evento) {

if (
  !raspando ||
  finalizada
) {

  return;

}


evento.preventDefault();


const pos =
  obterPosicao(
    evento
  );


ctx.globalCompositeOperation =
  'destination-out';


ctx.beginPath();


ctx.arc(
  pos.x,
  pos.y,
  28,
  0,
  Math.PI * 2
);


ctx.fill();


verificarProgresso();

}

function iniciar(evento) {

if (finalizada) return;

raspando =
  true;

evento.preventDefault();

raspar(evento);

}

function parar() {

raspando =
  false;

verificarProgresso();

}

function mostrarPremio() {

finalizada =
  true;


scratchPremio.innerHTML = `

  <img
    class="scratch-premio-imagem"
    src="${premioEscolhido.imagem}"
    alt="${premioEscolhido.nome}"
  >

  <strong>
    🎉 ${premioEscolhido.nome}
  </strong>

  <small>
    PARABÉNS! VOCÊ GANHOU!
  </small>

`;


scratchPremio.classList.add(
  'revelado'
);


ctx.clearRect(
  0,
  0,
  canvas.width,
  canvas.height
);

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
{
passive: false
}
);

canvas.addEventListener(
'touchmove',
raspar,
{
passive: false
}
);

canvas.addEventListener(
'touchend',
parar
);

canvas.addEventListener(
'touchcancel',
parar
);

window.addEventListener(
'resize',
() => {

  if (!finalizada) {
    ajustarCanvas();
  }

}

);

ajustarCanvas();

}

/* =========================================================
🛡️ GARANTIAS VISUAIS
========================================================= */

const scratchCard =
document.querySelector(
'.scratch'
);

if (scratchCard) {

scratchCard.style.display =
'block';

scratchCard.style.width =
'100%';

}

const stepsGrid =
document.querySelector(
'.steps-grid'
);

if (stepsGrid) {

stepsGrid.style.display =
'flex';

stepsGrid.style.flexDirection =
'column';

stepsGrid.style.width =
'100%';

}
