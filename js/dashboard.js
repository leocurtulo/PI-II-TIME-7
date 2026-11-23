/**
 * AUTOR: vinicius pansieri chiarelli
 * Descrição: Comportamento da tela dashboard-demanda.html.

 */
 async function conferirLogin() {
    const resposta = await fetch(API_BASE_URL + "/sessao");

    if (!resposta.ok) {
        window.location.href = "login.html";
    }
}

conferirLogin();

// 1. Constantes do escopo (valores aceitos pelo sistema)
const TIPOS = ["Tarefa", "Defeito", "Melhoria", "Documentação"];
const PRIORIDADES = ["Crítica", "Alta", "Média", "Baixa"];
const STATUS = ["Aberta", "Em andamento", "Em revisão", "Concluída", "Cancelada"];

// Status em que a demanda ainda está "em aberto" (não finalizada)
const STATUS_EM_ABERTO = ["Aberta", "Em andamento", "Em revisão"];

// Relaciona cada valor ao ID do <p> correspondente no HTML
const ID_STATUS = {
  "Aberta": "qtd-abertas",
  "Em andamento": "qtd-andamento",
  "Em revisão": "qtd-revisao",
  "Concluída": "qtd-concluidas",
  "Cancelada": "qtd-canceladas",
};
const ID_PRIORIDADE = {
  "Crítica": "prio-critica",
  "Alta": "prio-alta",
  "Média": "prio-media",
  "Baixa": "prio-baixa",
};
const ID_TIPO = {
  "Tarefa": "tipo-tarefa",
  "Defeito": "tipo-defeito",
  "Melhoria": "tipo-melhoria",
  "Documentação": "tipo-documentacao",
};

// Quantidade de dias padrão para considerar um prazo "próximo"
const DIAS_PADRAO = 7;
const DIAS_MIN = 1;
const DIAS_MAX = 90;

// 2. Dados simulados (substituir pela API quando o backend estiver pronto)


// 3. Funções de cálculo (não mexem na tela, só calculam)

/** Conta quantas demandas existem para cada valor de um campo. */
function contarPor(demandas, campo, valoresPossiveis) {
  const contagem = {};
  valoresPossiveis.forEach((v) => (contagem[v] = 0)); // garante zero nos vazios
  demandas.forEach((d) => {
    if (contagem[d[campo]] !== undefined) contagem[d[campo]]++;
  });
  return contagem;
}

/** Demandas de prioridade Crítica que ainda não foram concluídas/canceladas. */
function criticasEmAberto(demandas) {
  return demandas.filter(
    (d) => d.prioridade === "Crítica" && STATUS_EM_ABERTO.includes(d.status)
  );
}

/** Converte "YYYY-MM-DD" em Date local (evita erro de fuso horário). */
function paraDataLocal(texto) {
  const [ano, mes, dia] = texto.split("-").map(Number);
  return new Date(ano, mes - 1, dia);
}

/** Converte "YYYY-MM-DD" em "DD/MM/AAAA" para exibir ao usuário. */
function formatarData(texto) {
  const [ano, mes, dia] = texto.split("-");
  return `${dia}/${mes}/${ano}`;
}

/**
 * Demandas em aberto cujo prazo vence em até "dias" dias a partir de hoje.
 * Demandas atrasadas (dias restantes negativos) também entram na lista.
 */
function proximasDoPrazo(demandas, dias) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const MS_DIA = 24 * 60 * 60 * 1000;

  return demandas
    .filter((d) => STATUS_EM_ABERTO.includes(d.status) && d.prazo)
    .map((d) => ({
      ...d,
      diasRestantes: Math.round((paraDataLocal(d.prazo) - hoje) / MS_DIA),
    }))
    .filter((d) => d.diasRestantes <= dias)
    .sort((a, b) => a.diasRestantes - b.diasRestantes);
}
function descreverSituacao(diasRestantes) {
  if (diasRestantes < 0) return `Atrasada há ${Math.abs(diasRestantes)} dia(s)`;
  if (diasRestantes === 0) return "Vence hoje";
  return `Vence em ${diasRestantes} dia(s)`;
}

// 4. Validação do campo "dias"

function validarDias(texto) {
  const limpo = String(texto).trim();

  if (limpo === "") {
    return { valido: false, mensagem: "Informe a quantidade de dias." };
  }
  if (!/^\d+$/.test(limpo)) {
    return { valido: false, mensagem: "Digite apenas números inteiros, sem sinais ou vírgulas." };
  }
  const valor = Number(limpo);
  if (valor < DIAS_MIN || valor > DIAS_MAX) {
    return { valido: false, mensagem: `Use um valor entre ${DIAS_MIN} e ${DIAS_MAX} dias.` };
  }
  return { valido: true, mensagem: "", valor };
}

// 5. Renderização (escreve na tela)

/** Escreve um texto em um elemento. textContent evita injeção de HTML. */
function escrever(id, texto) {
  const el = document.getElementById(id);
  if (el) el.textContent = texto;
}

/** Preenche os cards de um agrupamento (status, prioridade ou tipo). */
function preencherCards(contagem, mapaIds) {
  Object.keys(mapaIds).forEach((valor) => escrever(mapaIds[valor], contagem[valor]));
}

/** Cria uma célula <td> com texto e a adiciona à linha. */
function adicionarCelula(linha, texto) {
  const td = document.createElement("td");
  td.textContent = texto;
  linha.appendChild(td);
}

function renderizarResumo(demandas) {
  escrever("total-demandas", demandas.length);
  preencherCards(contarPor(demandas, "status", STATUS), ID_STATUS);
  preencherCards(contarPor(demandas, "prioridade", PRIORIDADES), ID_PRIORIDADE);
  preencherCards(contarPor(demandas, "tipo", TIPOS), ID_TIPO);

  // Lista de críticas em aberto
  const ul = document.getElementById("lista-criticas");
  if (!ul) return;
  ul.innerHTML = "";
  const criticas = criticasEmAberto(demandas);
  if (criticas.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Nenhuma demanda crítica em aberto.";
    ul.appendChild(li);
    return;
  }
  criticas.forEach((d) => {
    const li = document.createElement("li");
    li.textContent = `#${d.id} ${d.titulo} (${d.status})`;
    ul.appendChild(li);
  });
}

function renderizarProximas(demandas, dias) {
  const corpo = document.getElementById("tabela-prazo");
  if (!corpo) return;
  corpo.innerHTML = "";

  const lista = proximasDoPrazo(demandas, dias);
  if (lista.length === 0) {
    const linha = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 5;
    td.textContent = `Nenhuma demanda vence nos próximos ${dias} dias.`;
    linha.appendChild(td);
    corpo.appendChild(linha);
    return;
  }

  lista.forEach((d) => {
    const linha = document.createElement("tr");
    adicionarCelula(linha, d.titulo);
    adicionarCelula(linha, d.prioridade);
    adicionarCelula(linha, d.status);
    adicionarCelula(linha, formatarData(d.prazo));
    adicionarCelula(linha, descreverSituacao(d.diasRestantes));
    corpo.appendChild(linha);
  });
}

// ---------------------------------------------------------------------------
// 6. Inicialização e eventos
// ---------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", async () => {
  let demandas = [];
    try {

    const dados =
        await obterDashboardApi();

    demandas = dados;

} catch (erro) {

    document.body.innerHTML = `
        <div style="
            text-align:center;
            margin-top:50px;
            font-family:Arial;
        ">
            <h2>
                Não foi possível carregar o dashboard.
            </h2>

            <p>
                Verifique se o servidor está ligado.
            </p>
        </div>
    `;

    console.error(
        "Erro ao carregar dashboard",
        erro
    );

    return;
}
  const form = document.getElementById("form-prazo");
  const campo = document.getElementById("dias-prazo");
  const erro = document.getElementById("erro-dias");

  renderizarResumo(demandas);
  renderizarProximas(demandas, DIAS_PADRAO);

  if (!form || !campo) return;
  campo.value = DIAS_PADRAO;

  form.addEventListener("submit", (evento) => {
    evento.preventDefault(); // impede o envio enquanto houver dado inválido
    const resultado = validarDias(campo.value);

    if (!resultado.valido) {
      erro.textContent = resultado.mensagem;
      campo.classList.add("campo-invalido"); // classe já existente no style.css
      return;
    }

    erro.textContent = "";
    campo.classList.remove("campo-invalido");
    renderizarProximas(demandas, resultado.valor);
  });
});