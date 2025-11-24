function calcularProximoFimExpediente() {
  const agora = new Date();
  const diaSemana = agora.getDay(); // 0=Dom, 1=Seg...6=Sab
  const fimHoje = new Date(agora);

  // define horário de fim conforme o dia
  if (diaSemana >= 1 && diaSemana <= 5) {
    // seg a sex: 17:00
    fimHoje.setHours(17, 0, 0, 0);
  } else if (diaSemana === 6) {
    // sábado: 12:00
    fimHoje.setHours(12, 0, 0, 0);
  } else {
    // domingo: próximo dia útil (segunda às 17h)
    const proxSeg = new Date(agora);
    const diasAteSeg = (8 - diaSemana) % 7;
    proxSeg.setDate(agora.getDate() + diasAteSeg);
    proxSeg.setHours(17, 0, 0, 0);
    return proxSeg;
  }

  // se já passou do fim hoje, ir para o próximo dia útil
  if (agora >= fimHoje) {
    const prox = new Date(agora);
    let dia = diaSemana + 1;
    prox.setDate(agora.getDate() + 1);

    // se passou de sábado, pula para segunda
    if (dia === 0 || dia === 7) dia = 1;

    if (dia >= 1 && dia <= 5) {
      prox.setHours(17, 0, 0, 0);
    } else if (dia === 6) {
      prox.setHours(12, 0, 0, 0);
    }
    return prox;
  }

  return fimHoje;
}

function calcularInicioFimHoje() {
  const agora = new Date();
  const diaSemana = agora.getDay(); // 0=Dom, 1=Seg...6=Sab
  const inicio = new Date(agora);
  const fim = new Date(agora);
  

  if (diaSemana >= 1 && diaSemana <= 5) {
    inicio.setHours(8, 0, 0, 0);
    fim.setHours(17, 0, 0, 0);
  } else if (diaSemana === 6) {
    inicio.setHours(8, 0, 0, 0);
    fim.setHours(12, 0, 0, 0);
  } else {
    return null; // domingo: fora de expediente
  }

  return { inicio, fim };
}

function iniciarWorkTimer() {
  const bar = document.getElementById("workBar");
  const label = document.getElementById("workBarLabel");
  if (!bar || !label) return;

  function atualizar() {
    const agora = new Date();
    
    const range = calcularInicioFimHoje();
    

    if (!range) {
      bar.style.width = "0%";
      label.textContent = "Fora do expediente";
      return;
    }

    const { inicio, fim } = range;

    if (agora <= inicio) {
      bar.style.width = "0%";
      label.textContent = "Expediente ainda não começou";
      return;
    }

    if (agora >= fim) {
      bar.style.width = "100%";
      label.textContent = "Expediente encerrado";
      return;
    }

    const total = fim.getTime() - inicio.getTime();
    const passado = agora.getTime() - inicio.getTime();
    const progresso = Math.min(100, Math.max(0, (passado / total) * 100));

    bar.style.width = progresso.toFixed(1) + "%";

    const restanteMs = fim.getTime() - agora.getTime();
    const mins = Math.floor(restanteMs / 60000);
    const horas = Math.floor(mins / 60);
    const minsRest = mins % 60;
    label.textContent = `Faltam ${horas}h ${minsRest}min`;
    const progressoInt = Math.round(progresso);
    label.textContent = `${progressoInt}%  • Faltam ${horas}h ${minsRest}min`;
  }

  atualizar();
  setInterval(atualizar, 60 * 1000);
}

window.addEventListener("load", iniciarWorkTimer);







function abrirAba(id) {
  document.querySelectorAll('.tab-content').forEach(div => {
    div.style.display = (div.id === id) ? 'block' : 'none';
  });

  document.querySelectorAll('.tab-button').forEach(btn => {
    const alvo = btn.getAttribute('onclick').includes(id);
    btn.classList.toggle('active', alvo);
  });
}
let contadorResumos = localStorage.getItem("contadorResumos") ? parseInt(localStorage.getItem("contadorResumos")) : 0;
let ultimoResumo = localStorage.getItem("ultimoResumo") || "";
let ultimaHoraGeracao = localStorage.getItem("ultimaHoraGeracao") || "Nunca";

let choicesTratativa = null;

// Inicializa Choices.js e salva referência da 'tratativa'
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('#conclusao, #constatado, #tratativa, #materiais').forEach(function(select) {
    const instance = new Choices(select, {
      searchEnabled: true,
      shouldSort: false,
      itemSelectText: '',
      position: 'auto'
    });
    if (select.id === "tratativa") choicesTratativa = instance;
  });

  // Listener para copiar MAC da ONU instalada para retirada automaticamente, nos casos obrigatórios
  document.getElementById("onu_instalada").addEventListener('input', function() {
    const constatado = document.getElementById("constatado").value;
    const obrigatorios = ["DEFEITO", "ONU BGN", "ONU AC", "ONU incompatível com plano do cliente"];
    if (obrigatorios.includes(constatado)) {
      document.getElementById("mac_retirada").value = this.value;
    }
  });
});

document.getElementById("contadorResumos").textContent = contadorResumos;
document.getElementById("ultimaHora").textContent = ultimaHoraGeracao;

function preencherCamposPadrao() {
  document.getElementById("trocaSwitch").checked = false;
  document.getElementById("trocaSwitch").disabled = false;
  document.getElementById("trocaStatus").textContent = "Não";
  mostrarCamposMAC();

  document.getElementById("constatado").value = "DESCONFIGURADO";
  if (choicesTratativa) choicesTratativa.setChoiceByValue("Configurações de ONU");
  document.getElementById("materiais").value = "Nenhum material foi utilizado";
  document.getElementById("conclusao").value = "Medições nos parâmetros, ONU operando normalmente";
  document.getElementById("conclusaoManual").style.display = "none";
  document.getElementById("meshFields").style.display = "none";
  document.getElementById("rokuFields").style.display = "none";
  document.getElementById("mac_retirada").value = "";
}

function mostrarCamposMAC() {
  const trocaOnu = document.getElementById("trocaSwitch").checked;
  const macFields = document.getElementById("macFields");
  const supervisorField = document.getElementById("supervisorField");
  if (trocaOnu) {
    macFields.style.display = "block";
    supervisorField.style.display = "block";
  } else {
    macFields.style.display = "none";
    supervisorField.style.display = "none";
  }
}

function verificarConstatado() {
  const constatado = document.getElementById("constatado").value;
  const tratativa = document.getElementById("tratativa");
  const trocaSwitch = document.getElementById("trocaSwitch");

  // Lista dos campos obrigatórios para travar o toggle e copiar MAC
  const obrigatorios = ["DEFEITO", "ONU BGN", "ONU AC", "ONU incompatível com plano do cliente"];

  if (obrigatorios.includes(constatado)) {
    trocaSwitch.checked = true;
    trocaSwitch.disabled = true;
    document.getElementById('trocaStatus').textContent = 'Sim';

    // Copia o mac da onu instalada para mac retirada
    const onuInstaladaVal = document.getElementById("onu_instalada").value;
    document.getElementById("mac_retirada").value = onuInstaladaVal;

    document.getElementById("supervisorField").style.display = "block";
    document.getElementById("macFields").style.display = "block";
    document.getElementById("materiais").value = "Nenhum material foi utilizado";

  } else {
    trocaSwitch.disabled = false;
    document.getElementById("supervisorField").style.display = "none";
  }

  // Seleção automática na tratativa
  if (constatado === "OK" && choicesTratativa) {
    choicesTratativa.setChoiceByValue("Feita a validação");
    document.getElementById("conclusaoManual").style.display = "block";
  } else {
    document.getElementById("conclusaoManual").style.display = "none";
  }
  if (constatado === "DESCONFIGURADO" && choicesTratativa) { choicesTratativa.setChoiceByValue("Configurações de ONU"); }
  if (constatado === "DEFEITO" && choicesTratativa) { choicesTratativa.setChoiceByValue("Substituição de equipamento"); }
  if (constatado === "ATENUADO" && choicesTratativa) { choicesTratativa.setChoiceByValue("Feita a validação"); }
  if (constatado === "ONU BGN" && choicesTratativa) { choicesTratativa.setChoiceByValue("Substituição de equipamento"); }
  if (constatado === "ONU incompatível com plano do cliente" && choicesTratativa) { choicesTratativa.setChoiceByValue("Substituição de equipamento"); }
  if (constatado === "Cliente contratou ROKU+MESH" && choicesTratativa) { choicesTratativa.setChoiceByValue("Feita a instalação de ROKU+MESH"); }
  if (constatado === "Cliente contratou MESH" && choicesTratativa) { choicesTratativa.setChoiceByValue("Feita a instalação de rede mesh"); }
  if (constatado === "Cliente contratou ROKU" && choicesTratativa) { choicesTratativa.setChoiceByValue("Feita a instalação de ROKU"); }

  // Mostra/oculta campos mesh e roku
  if (constatado === "Cliente contratou ROKU" || constatado === "Cliente contratou ROKU+MESH") {
    document.getElementById("rokuFields").style.display = "block";
  } else {
    document.getElementById("rokuFields").style.display = "none";
  }
  if (constatado === "Cliente contratou ROKU+MESH" || constatado === "Cliente contratou MESH") {
    document.getElementById("meshFields").style.display = "block";
  } else {
    document.getElementById("meshFields").style.display = "none";
  }

  mostrarCamposMAC();
}

// Atualiza o texto "Sim"/"Não" ao lado do switch + mostra os campos MAC:
document.getElementById('trocaSwitch').addEventListener('change', function() {
  document.getElementById('trocaStatus').textContent = this.checked ? 'Sim' : 'Não';
  mostrarCamposMAC();
});

//... rest of your code (gerarResumo, limparCampos, etc.) permanece igual

preencherCamposPadrao();


function mostrarCamposMesh() {
  const quantidadeMesh = document.getElementById("quantosMesh").value;
  const meshMACFields = document.getElementById("meshMACFields");
  meshMACFields.innerHTML = "";
  if (quantidadeMesh > 0) {
    for (let i = 1; i <= quantidadeMesh; i++) {
      const input = document.createElement("input");
      input.type = "text";
      input.id = "mesh" + i;
      input.placeholder = "MESH " + i + " que está ficando no cliente";
      meshMACFields.appendChild(input);
    }
  }
}

// Atualiza o texto "Sim"/"Não" ao lado do switch + mostra os campos MAC:
document.getElementById('trocaSwitch').addEventListener('change', function() {
  document.getElementById('trocaStatus').textContent = this.checked ? 'Sim' : 'Não';
  mostrarCamposMAC();
});

function gerarResumo() {
  const contrato = document.getElementById("contrato").value;
  const acompanhou = document.getElementById("acompanhou").value;
  const onu_instalada = document.getElementById("onu_instalada").value;
  const constatado = document.getElementById("constatado").value;
  const tratativa = document.getElementById("tratativa").value;
  const materiais = document.getElementById("materiais").value;
  const troca_onu = document.getElementById("trocaSwitch").checked ? "Sim" : "Não";
  const supervisor = document.getElementById("supervisor") ? document.getElementById("supervisor").value : "";
  const mac_retirada = document.getElementById("mac_retirada").value;
  const mac_nova = document.getElementById("mac_nova").value;
  const conclusao = document.getElementById("conclusao").value;
  const rokuSN = document.getElementById("rokuSN").value;
  const conclusaoManualInput = document.getElementById("conclusaoManualInput") ? document.getElementById("conclusaoManualInput").value : "";

  let resumo = "*RESUMO DE VISITA DE QUALIDADE*\n\n" +
    "*CTT:* " + contrato + "\n\n" +
    "*Quem acompanhou visita?* " + acompanhou + "\n\n" +
    "*ONU instalada:* " + onu_instalada + "\n\n" +
    "*Ao chegar no local foi constatado:* " + constatado + "\n\n" +
    "*Tratativa:* " + tratativa + "\n\n" +
    "*Materiais utilizados:* " + materiais + "\n\n" +
    "*Houve troca de ONU?* " + (troca_onu === "Sim" ? "✅ Sim" : "❌ Não");

  if (troca_onu === "Sim") {
    resumo += "\n*Autorizado pelo supervisor:* " + supervisor;
    resumo += "\n*ONU retirada:* " + mac_retirada;
    resumo += "\n*ONU que está ficando no cliente:* " + mac_nova;
  }

  if (constatado === "Cliente contratou ROKU" || constatado === "Cliente contratou ROKU+MESH") {
    resumo += "\nROKU que está ficando no cliente: " + rokuSN;
  }

  for (let i = 1; i <= 4; i++) {
    const mesh = document.getElementById("mesh" + i);
    if (mesh) {
      resumo += "\nMESH" + i + " que está ficando no cliente: " + mesh.value;
    }
  }

  if (constatado === "OK" && conclusaoManualInput) {
    resumo += "\n\n*Detalhes do que foi feito:*\n" + conclusaoManualInput;
  }

  resumo += "\n\n*Conclusão:* " + conclusao + "\n";
  document.getElementById("resumo").value = resumo;

  contadorResumos++;
  ultimaHoraGeracao = new Date().toLocaleString();
  document.getElementById("contadorResumos").textContent = contadorResumos;
  document.getElementById("ultimaHora").textContent = ultimaHoraGeracao;
  ultimoResumo = resumo;

  localStorage.setItem("contadorResumos", contadorResumos);
  localStorage.setItem("ultimoResumo", ultimoResumo);
  localStorage.setItem("ultimaHoraGeracao", ultimaHoraGeracao);
  salvarResumoFirestore(resumo);
}

function limparCampos() {
  document.getElementById("resumo").value = "";
  preencherCamposPadrao();
}

function copiarResumo() {
  const resumo = document.getElementById("resumo");
  resumo.select();
  document.execCommand("copy");
}

function mostrarUltimoResumo() {
  if (ultimoResumo !== "") {
    document.getElementById("resumo").value = ultimoResumo;
  } else {
    alert("Nenhum resumo foi gerado ainda!");
  }
}

function alterarContador(valor) {
  contadorResumos += valor;
  document.getElementById("contadorResumos").textContent = contadorResumos;
  localStorage.setItem("contadorResumos", contadorResumos);
}

function reiniciarContador() {
  contadorResumos = 0;
  document.getElementById("contadorResumos").textContent = contadorResumos;
  localStorage.setItem("contadorResumos", contadorResumos);
}

preencherCamposPadrao();

async function salvarResumoFirestore(textoResumo) {
  const db = window._db;
  const { collection, addDoc } = window._firestoreLib;

  try {
    await addDoc(collection(db, "resumos"), {
      texto: textoResumo,

      criadoEm: new Date().toISOString(),
    });
    console.log("Resumo salvo no Firestore");
  } catch (e) {
    console.error("Erro ao salvar no Firestore:", e);
  }
}

// ---- HISTÓRICO DE RESUMOS ----
let _historicoCache = []; // guarda todos os resumos carregados

async function carregarHistoricoResumos() {

  const db = window._db;
  const { collection, getDocs, query, orderBy } = window._firestoreLib;

  const q = query(collection(db, "resumos"), orderBy("criadoEm", "desc"));
  const snap = await getDocs(q);

  _historicoCache = [];
  snap.forEach(doc => {
    _historicoCache.push({ id: doc.id, ...doc.data() });
  });

  renderizarListaHistorico(_historicoCache);
  atualizarContadorHistorico(_historicoCache.length);
}

function renderizarListaHistorico(lista) {
  const listaElement = document.getElementById("listaHistorico");
  if (!listaElement) return;

  listaElement.innerHTML = "";

  let ultimaDataTitulo = null;

  lista.forEach(dados => {
    const li = document.createElement("li");

    const dataObj = new Date(dados.criadoEm);
    const dataTitulo = dataObj.toLocaleDateString("pt-BR");
    const horaStr = dataObj.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });

    const contrato = dados.contrato || "sem CTT";

    let textoLimpo = (dados.texto || "").replace("*RESUMO DE VISITA DE QUALIDADE*", "");
    textoLimpo = textoLimpo.trim();
    const preview = textoLimpo.slice(0, 80).replace(/\n/g, " ");

    // se mudou o dia, adiciona um cabeçalho de data
    if (dataTitulo !== ultimaDataTitulo) {
      ultimaDataTitulo = dataTitulo;
      const header = document.createElement("li");
      header.classList.add("hist-date-header");
      header.textContent = dataTitulo;
      listaElement.appendChild(header);
    }

    li.innerHTML = `
      <div class="hist-card">
        <div class="hist-row">
          <span class="hist-date">${horaStr}</span>
          <span class="hist-ctt">CTT: ${contrato}</span>
        </div>
        <div class="hist-row">
          <span class="hist-preview">${preview}</span>
          <button class="hist-copy-btn" type="button">📋 Copiar</button>
        </div>
      </div>
    `;

    li.classList.add("hist-item");

    const card = li.querySelector(".hist-card");
    const btnCopiar = li.querySelector(".hist-copy-btn");

    card.onclick = () => {
      const campoResumo = document.getElementById("resumo");
      if (campoResumo) campoResumo.value = dados.texto || "";
      abrirAba('abaResumo');
    };

    btnCopiar.onclick = (e) => {
      e.stopPropagation();
      navigator.clipboard.writeText(dados.texto || "");
      mostrarToastCopiado();
    };

    listaElement.appendChild(li);
  });
}




function aplicarFiltroHistorico() {
  const input = document.getElementById("filtroHistorico");
  if (!input) return;

  const termo = input.value.toLowerCase();

  if (!termo) {
    renderizarListaHistorico(_historicoCache);
    atualizarContadorHistorico(_historicoCache.length);
    return;
  }

  const filtrados = _historicoCache.filter(dados => {
    const contrato = (dados.contrato || "").toLowerCase();
    const texto = (dados.texto || "").toLowerCase();
    return contrato.includes(termo) || texto.includes(termo);
  });

  renderizarListaHistorico(filtrados);
  atualizarContadorHistorico(filtrados.length);
}

function mostrarToastCopiado() {
  const toast = document.getElementById("toastCopiado");
  if (!toast) return;
  toast.classList.add("mostrar");
  setTimeout(() => toast.classList.remove("mostrar"), 1500);
}


function atualizarContadorHistorico(qtd) {
  const spanNumero = document.getElementById("contadorHistoricoNumero");
  if (!spanNumero) return;
  spanNumero.textContent = qtd;
}

