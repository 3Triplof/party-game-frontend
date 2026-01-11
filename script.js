console.log("JS carregado");

const socket = io("https://party-game-server-bs3h.onrender.com");

let salaAtual = "";
let souHost = false;
let tempoRestante = 20;
let timerInterval;

/* ================= SONS (Base64 Inline) ================= */
const sons = {
  correto: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAo'),
  errado: new Audio('data:audio/wav;base64,UklGRl9vAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAo'),
  tick: new Audio('data:audio/wav;base64,UklGRl9vAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAo')
};

/* ================= CONEXÃO ================= */
socket.on("connect", () => {
  console.log("✅ Conectado:", socket.id);
});

/* ================= TIMER VISUAL ================= */
function iniciarTimer(segundos = 20) {
  tempoRestante = segundos;
  const numeroEl = document.getElementById('timerNumero');
  const circleEl = document.getElementById('timerCircle');
  numeroEl.textContent = tempoRestante;
  
  clearInterval(timerInterval);
  
  timerInterval = setInterval(() => {
    tempoRestante--;
    numeroEl.textContent = tempoRestante;
    
    // Animação do círculo (verde → vermelho)
    const porcentagem = (tempoRestante / 20) * 360;
    circleEl.style.background = 
      `conic-gradient(#10b981 0deg, #10b981 ${porcentagem}deg, #ef4444 ${porcentagem}deg 360deg)`;
    
    // Som tick
    sons.tick.currentTime = 0;
    sons.tick.play().catch(() => {});
    
    if (tempoRestante <= 3) {
      numeroEl.style.color = '#ef4444';
      numeroEl.style.textShadow = '0 0 20px #ef4444';
    }
    
    if (tempoRestante <= 0) {
      clearInterval(timerInterval);
      numeroEl.textContent = 'TEMPO!';
      numeroEl.style.color = '#ef4444';
    }
  }, 1000);
}

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

function responder(opcao) {
  if (!salaAtual) return;

  socket.emit("responder", {
    sala: salaAtual,
    resposta: opcao
  });

  // 🔒 desativa botões após responder
  document.querySelectorAll(".btn-opcao").forEach(btn => btn.disabled = true);
  console.log("Resposta enviada:", opcao);
}

/* ================= EVENTOS DO SERVIDOR ================= */
socket.on("salaCriada", codigo => {
  salaAtual = codigo;
  document.getElementById("menu").style.display = "none";
  document.getElementById("jogo").style.display = "block";
  document.getElementById("codigo").innerText = "Código da sala: " + codigo;
  document.getElementById("btnRodada").style.display = "inline-block";
  document.getElementById("aguarde").style.display = "none";
});

socket.on("entrouSala", sala => {
  salaAtual = sala;
  document.getElementById("menu").style.display = "none";
  document.getElementById("jogo").style.display = "block";
  document.getElementById("codigo").innerText = "Sala: " + sala;
  document.getElementById("btnRodada").style.display = "none";
  document.getElementById("aguarde").style.display = "block";
});

socket.on("pergunta", texto => {
  document.getElementById("pergunta").innerText = texto;
  document.getElementById("pergunta").classList.add("pergunta-ativa");

  document.getElementById("ranking").innerHTML = "";
  document.getElementById("ranking").classList.add("hidden");

  document.querySelectorAll(".btn-opcao").forEach(btn => btn.disabled = false);
  
  // 🚀 TIMER VISUAL + ANIMAÇÃO
  iniciarTimer(20);
});

socket.on("jogadores", jogadores => {
  console.log("👥 Jogadores atualizados:", jogadores);
});

/* ================= FEEDBACK ================= */
socket.on("resultadoResposta", ({ correta, pontos }) => {
  clearInterval(timerInterval);
  
  // Som + Shake
  if (correta) {
    sons.correto.play();
    document.body.classList.add('shake');
  } else {
    sons.errado.play();
    document.body.classList.add('shake');
  }
  
  setTimeout(() => document.body.classList.remove('shake'), 500);
  
  alert(correta ? `✅ Correto! +${pontos} pts` : `❌ Errado!`);
});

socket.on("ranking", ranking => {
  console.log("🏆 Ranking recebido:", ranking);
  clearInterval(timerInterval);

  const div = document.getElementById("ranking");
  div.innerHTML = "";
  div.classList.remove("hidden");
  div.style.display = "block";

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

  if (souHost) {
    document.getElementById("btnRodada").style.display = "inline-block";
  }
});
