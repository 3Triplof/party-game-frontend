console.log("JS carregado");

const socket = io("https://party-game-server-bs3h.onrender.com");

let salaAtual = "";

/* ================= CONEXÃO ================= */

socket.on("connect", () => {
  console.log("✅ Conectado:", socket.id);
});

socket.on("connect_error", err => {
  console.error("❌ Erro:", err.message);
});

/* ================= AÇÕES ================= */

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

function enviarResposta() {
  const resposta = document.getElementById("resposta").value;
  socket.emit("responder", {
    sala: salaAtual,
    resposta
  });
}

/* ================= EVENTOS ================= */

socket.on("salaCriada", codigo => {
  salaAtual = codigo;
  document.getElementById("codigo").innerText =
    "Código da sala: " + codigo;
});

socket.on("erro", msg => {
  alert(msg);
});
