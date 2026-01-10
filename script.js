console.log("JS carregado");

const socket = io("https://party-game-server-bs3h.onrender.com");

let salaAtual = "";
let souHost = false;


/* ================= CONEXÃO ================= */

socket.on("connect", () => {
  console.log("✅ Conectado:", socket.id);
});

socket.on("connect_error", err => {
  console.error("❌ Erro:", err.message);
});

/* ================= AÇÕES (FUNÇÕES DO HTML) ================= */

function criarSala() {
  socket.emit("criarSala");
}

function entrarSala() {
  const sala = document
    .getElementById("codigoSala")
    .value
    .toUpperCase();

  const nome = document.getElementById("nome").value;

  socket.emit("entrarSala", { sala, nome });
}

function iniciarRodada() {
  if (!salaAtual) {
    alert("Entre em uma sala primeiro");
    return;
  }
  socket.emit("novaPergunta", salaAtual);
}

function enviarResposta() {
  const resposta = document.getElementById("resposta").value;

  socket.emit("responder", {
    sala: salaAtual,
    resposta
  });

  document.getElementById("resposta").value = "";
}

/* ================= EVENTOS DO SERVIDOR ================= */

socket.on("salaCriada", codigo => {
  salaAtual = codigo;
  souHost = true;

  document.getElementById("codigo").innerText =
    "Código da sala: " + codigo;

  document.getElementById("menu").style.display = "none";
  document.getElementById("jogo").style.display = "block";

  const btn = document.getElementById("btnRodada");
const aguarde = document.getElementById("aguarde");

if (btn) btn.style.display = "block";
if (aguarde) aguarde.style.display = "none";

  
});


socket.on("entrouSala", data => {
  salaAtual = data.sala;
  souHost = data.isHost;

  document.getElementById("codigo").innerText =
    "Sala: " + data.sala;

  document.getElementById("menu").style.display = "none";
  document.getElementById("jogo").style.display = "block";

  if (souHost) {
    const btn = document.getElementById("btnRodada");
const aguarde = document.getElementById("aguarde");

if (btn) btn.style.display = "block";
if (aguarde) aguarde.style.display = "none";

  } else {
    const btn = document.getElementById("btnRodada");
const aguarde = document.getElementById("aguarde");

if (btn) btn.style.display = "block";
if (aguarde) aguarde.style.display = "none";

  }
});


socket.on("pergunta", texto => {
  document.getElementById("pergunta").innerText = texto;
});

socket.on("jogadores", lista => {
  const ul = document.getElementById("ranking");
  ul.innerHTML = "";

  lista.forEach(nome => {
    const li = document.createElement("li");
    li.innerText = nome;
    ul.appendChild(li);
  });
});

socket.on("erro", msg => {
  alert(msg);
});
