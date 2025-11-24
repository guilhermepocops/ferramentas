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

