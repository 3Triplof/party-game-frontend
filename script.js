console.log("JS carregado");

const socket = io("https://party-game-server-bs3h.onrender.com");

let salaAtual = "";
let souHost = false;

/* ================= CONEXÃO ================= */

socket.on("connect", () => {
  console.log("✅ Conectado:", socket.id);
});

/* ================= AÇÕES ================= */

function criarSala() {
  const nome = document.getElementById("nome").value;
  if (!nome) return alert("Digite seu nome");

  souHost = true;
  socket.emit("criarSala", nome);
}

function entrarSala() {
  const sala = document.getElementById("codigoSala").value.toUpperCase();
  const nome = document.getElementById("nome").value;

  if (!sala || !nome) {
    alert("Preencha nome e código");
    return;
  }

  souHost = false;
  socket.emit("entrarSala", { sala, nome });
}

function iniciarRodada() {
  if (!souHost) {
    alert("Apenas o host pode iniciar a rodada");
    return;
  }

  socket.emit("novaPergunta", salaAtual);
}

function enviarResposta() {
  const resposta = document.getElementById("resposta").value;

  if (!resposta) return;

  socket.emit("responder", {
    sala: salaAtual,
    resposta
  });

  document.getElementById("resposta").value = "";
  alert("Resposta enviada!");
}

/* ================= EVENTOS DO SERVIDOR ================= */

socket.on("salaCriada", codigo => {
  salaAtual = codigo;

  document.getElementById("menu").style.display = "none";
  document.getElementById("jogo").style.display = "block";
  document.getElementById("codigo").innerText =
    "Código da sala: " + codigo;

  // Host vê botão
  document.getElementById("btnRodada").style.display = "inline-block";
  document.getElementById("aguarde").style.display = "none";
});

socket.on("entrouSala", sala => {
  salaAtual = sala;

  document.getElementById("menu").style.display = "none";
  document.getElementById("jogo").style.display = "block";
  document.getElementById("codigo").innerText =
    "Sala: " + sala;

  // Jogador vê aguarde
  document.getElementById("btnRodada").style.display = "none";
  document.getElementById("aguarde").style.display = "block";
});

socket.on("pergunta", texto => {
  document.getElementById("pergunta").innerText = texto;
  console.log("🎮 novaPergunta recebida de", socket.id, "para sala", sala);

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
