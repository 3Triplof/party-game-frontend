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
  const nome = document.getElementById("nome").value.trim();
  if (!nome) return alert("Digite seu nome");

  souHost = true;
  socket.emit("criarSala", nome);
}

function entrarSala() {
  const sala = document.getElementById("codigoSala").value.trim().toUpperCase();
  const nome = document.getElementById("nome").value.trim();

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
  const resposta = document.getElementById("resposta").value.trim().toUpperCase();
  if (!resposta) return;

  socket.emit("responder", {
    sala: salaAtual,
    resposta
  });

  document.getElementById("resposta").value = "";
}

/* ================= EVENTOS DO SERVIDOR ================= */

socket.on("salaCriada", codigo => {
  salaAtual = codigo;

  document.getElementById("menu").style.display = "none";
  document.getElementById("jogo").style.display = "block";
  document.getElementById("codigo").innerText =
    "Código da sala: " + codigo;

  document.getElementById("btnRodada").style.display = "inline-block";
  document.getElementById("aguarde").style.display = "none";
});

socket.on("entrouSala", sala => {
  salaAtual = sala;

  document.getElementById("menu").style.display = "none";
  document.getElementById("jogo").style.display = "block";
  document.getElementById("codigo").innerText =
    "Sala: " + sala;

  document.getElementById("btnRodada").style.display = "none";
  document.getElementById("aguarde").style.display = "block";
});

socket.on("pergunta", texto => {
  document.getElementById("pergunta").innerText = texto;
});

socket.on("erro", msg => {
  alert(msg);
});

/* ================= FEEDBACK ================= */

socket.on("resultadoResposta", ({ correta, pontos }) => {
  alert(
    correta
      ? `✅ Correto! +${pontos} pontos`
      : `❌ Errado!`
  );
});

/* ================= RANKING ================= */

socket.on("ranking", ranking => {
  const div = document.getElementById("ranking");
  div.innerHTML = "";
  div.classList.remove("hidden");

  ranking.forEach((player, index) => {
    const item = document.createElement("div");
    item.className = "ranking-item";

    if (index === 0) item.classList.add("vencedor");

    item.innerHTML = `
      <span>#${index + 1} ${player.nome}</span>
      <span>${player.pontos} pts</span>
    `;

    div.appendChild(item);
  });
});
