/*
AUTOR: Caio Ferreira AragÃ£o
DESCRIÃ‡ÃƒO: Busca, filtros e ordenaÃ§Ã£o da listagem de demandas.
A tela consulta GET /demandas e monta os cards com os dados da API.
*/

const API_BASE_URL = "http://localhost:3000";
const TAMANHO_MAXIMO_BUSCA = 100;

const STATUS_VALIDOS = ["Aberta", "Em andamento", "Em revisÃ£o", "ConcluÃ­da", "Cancelada"];
const PRIORIDADES_VALIDAS = ["CrÃ­tica", "Alta", "MÃ©dia", "Baixa"];
const TIPOS_VALIDOS = ["Tarefa", "Defeito", "Melhoria", "DocumentaÃ§Ã£o"];
const ORDENACOES_VALIDAS = ["prazo", "criacao", "prioridade", "status"];

document.addEventListener("DOMContentLoaded", () => {
    conferirLogin();
    configurarSair();
    carregarOpcoesFiltros();
    carregarDemandas();

    document.getElementById("buscaTexto").addEventListener("input", carregarDemandas);
    document.getElementById("filtroStatus").addEventListener("change", carregarDemandas);
    document.getElementById("filtroPrioridade").addEventListener("change", carregarDemandas);
    document.getElementById("filtroTipo").addEventListener("change", carregarDemandas);
    document.getElementById("filtroResponsavel").addEventListener("change", carregarDemandas);
    document.getElementById("filtroProjeto").addEventListener("change", carregarDemandas);
    document.getElementById("ordenacao").addEventListener("change", carregarDemandas);
});

// Quem nÃ£o estÃ¡ logado volta para o login, no mesmo padrÃ£o das outras telas.
async function conferirLogin() {
    try {
        const resposta = await fetch(API_BASE_URL + "/sessao", { credentials: "include" });
        if (resposta.status === 401) {
            window.location.href = "login.html";
        }
    } catch (erro) {
        mostrarErro("NÃ£o foi possÃ­vel verificar o login. Confira se a API estÃ¡ no ar.");
    }
}

function configurarSair() {
    const linkSair = document.getElementById("linkSair");
    if (!linkSair) return;

    linkSair.addEventListener("click", async (event) => {
        event.preventDefault();
        try {
            const resposta = await fetch(API_BASE_URL + "/logout", {
                method: "POST",
                credentials: "include"
            });
            if (resposta.ok || resposta.status === 401) {
                window.location.href = "login.html";
                return;
            }
            mostrarErro(await mensagemDaResposta(resposta, "NÃ£o foi possÃ­vel encerrar a sessÃ£o"));
        } catch (erro) {
            mostrarErro("NÃ£o foi possÃ­vel encerrar a sessÃ£o. Verifique se a API estÃ¡ em execuÃ§Ã£o.");
        }
    });
}

// LÃª a mensagem JSON da API. Se o corpo nÃ£o for JSON, usa o status HTTP.
async function mensagemDaResposta(resposta, reserva) {
    try {
        const corpo = await resposta.json();
        if (corpo && typeof corpo.mensagem === "string" && corpo.mensagem.trim() !== "") {
            return corpo.mensagem;
        }
    } catch (erro) {
        // Corpo vazio ou que nÃ£o Ã© JSON.
    }
    return reserva + " (HTTP " + resposta.status + ").";
}

function mostrarErro(texto) {
    document.getElementById("mensagemErro").textContent = texto;
}

function limparErroGeral() {
    document.getElementById("mensagemErro").textContent = "";
}

// A busca nÃ£o Ã© obrigatÃ³ria. Quando preenchida, precisa ter no mÃ¡ximo 100 caracteres.
function validarBusca() {
    const campo = document.getElementById("buscaTexto");
    const erro = document.getElementById("erroBusca");
    const texto = campo.value.trim();

    if (texto.length > TAMANHO_MAXIMO_BUSCA) {
        erro.textContent = "A busca pode ter no mÃ¡ximo " + TAMANHO_MAXIMO_BUSCA + " caracteres.";
        campo.classList.add("campo-invalido");
        return null;
    }

    erro.textContent = "";
    campo.classList.remove("campo-invalido");
    return texto;
}

function valorFiltro(id, permitidos) {
    const valor = document.getElementById(id).value;
    if (valor === "todos") {
        return "";
    }
    if (permitidos.indexOf(valor) === -1) {
        return null;
    }
    return valor;
}

async function carregarDemandas() {
    const busca = validarBusca();
    if (busca === null) {
        mostrarErro("Corrija a busca para consultar as demandas.");
        return;
    }

    const status = valorFiltro("filtroStatus", STATUS_VALIDOS);
    const prioridade = valorFiltro("filtroPrioridade", PRIORIDADES_VALIDAS);
    const tipo = valorFiltro("filtroTipo", TIPOS_VALIDOS);
    const ordenarPor = document.getElementById("ordenacao").value;

    if (status === null || prioridade === null || tipo === null || ORDENACOES_VALIDAS.indexOf(ordenarPor) === -1) {
        mostrarErro("HÃ¡ um filtro ou uma ordenaÃ§Ã£o com valor que o sistema nÃ£o aceita.");
        return;
    }

    const params = new URLSearchParams();
    if (busca) params.append("busca", busca);
    if (status) params.append("status", status);
    if (prioridade) params.append("prioridade", prioridade);
    if (tipo) params.append("tipo", tipo);

    const responsavel = document.getElementById("filtroResponsavel").value;
    const projeto = document.getElementById("filtroProjeto").value;
    if (responsavel !== "todos") params.append("responsavel", responsavel);
    if (projeto !== "todos") params.append("projeto", projeto);
    params.append("ordenarPor", ordenarPor);

    try {
        const resposta = await fetch(API_BASE_URL + "/demandas?" + params.toString(), { credentials: "include" });

        if (!resposta.ok) {
            const mensagem = await mensagemDaResposta(resposta, "NÃ£o foi possÃ­vel listar as demandas");
            mostrarErro(mensagem);
            renderizarLista([], "A lista nÃ£o foi atualizada por causa do erro acima.");
            return;
        }

        const demandas = await resposta.json();
        if (!Array.isArray(demandas)) {
            mostrarErro("A API nÃ£o retornou a lista de demandas.");
            renderizarLista([], "A lista nÃ£o foi atualizada por causa do erro acima.");
            return;
        }

        limparErroGeral();
        renderizarLista(demandas);
    } catch (erro) {
        mostrarErro("NÃ£o foi possÃ­vel consultar as demandas. Verifique se a API estÃ¡ em execuÃ§Ã£o.");
        renderizarLista([], "A lista nÃ£o foi atualizada por causa do erro acima.");
    }
}

function textoOu(valor, reserva) {
    if (valor === null || valor === undefined || String(valor).trim() === "") {
        return reserva;
    }
    return String(valor);
}

// Converte AAAA-MM-DD para o formato usado na tela.
function formatarData(valor, reserva) {
    if (valor === null || valor === undefined || String(valor).trim() === "") {
        return reserva;
    }
    const partes = String(valor).slice(0, 10).split("-");
    if (partes.length !== 3) {
        return String(valor);
    }
    return partes[2] + "/" + partes[1] + "/" + partes[0];
}

function criarLinha(rotulo, valor) {
    const paragrafo = document.createElement("p");
    const forte = document.createElement("strong");
    forte.textContent = rotulo;
    paragrafo.appendChild(forte);
    paragrafo.appendChild(document.createTextNode(" " + valor));
    return paragrafo;
}

function renderizarLista(demandas, avisoVazio) {
    const listaContainer = document.getElementById("lista");
    listaContainer.innerHTML = "";

    if (demandas.length === 0) {
        const aviso = document.createElement("p");
        aviso.className = "aviso-lista";
        aviso.textContent = avisoVazio || "Nenhuma demanda encontrada com estes filtros.";
        listaContainer.appendChild(aviso);
        return;
    }

    demandas.forEach((demanda) => {
        const cartao = document.createElement("div");
        cartao.className = "exemplo";

        const titulo = document.createElement("h3");
        titulo.textContent = textoOu(demanda.titulo, "Sem tÃ­tulo");

        const descricao = document.createElement("p");
        descricao.className = "descricao";
        descricao.textContent = textoOu(demanda.descricao, "Sem descriÃ§Ã£o");

        const separador = document.createElement("hr");
        separador.style.border = "0";
        separador.style.borderTop = "1px solid #e5e7eb";
        separador.style.margin = "15px 0";

        const projetoTipo = document.createElement("p");
        const forteProjeto = document.createElement("strong");
        forteProjeto.textContent = "Projeto:";
        const forteTipo = document.createElement("strong");
        forteTipo.textContent = "Tipo:";
        projetoTipo.appendChild(forteProjeto);
        projetoTipo.appendChild(document.createTextNode(" " + textoOu(demanda.projeto, "NÃ£o informado") + " | "));
        projetoTipo.appendChild(forteTipo);
        projetoTipo.appendChild(document.createTextNode(" " + textoOu(demanda.tipo, "NÃ£o informado")));

        const botao = document.createElement("button");
        botao.type = "button";
        botao.style.marginTop = "15px";
        botao.textContent = "Ver detalhes";
        botao.addEventListener("click", () => {
            window.location.href = "detalhes-demanda.html?id=" + encodeURIComponent(demanda.id);
        });

        cartao.appendChild(titulo);
        cartao.appendChild(descricao);
        cartao.appendChild(separador);
        cartao.appendChild(projetoTipo);
        cartao.appendChild(criarLinha("ResponsÃ¡vel:", textoOu(demanda.responsavel, "NÃ£o atribuÃ­do")));
        cartao.appendChild(criarLinha("Data de criaÃ§Ã£o:", formatarData(demanda.dataCriacao, "NÃ£o informada")));
        cartao.appendChild(criarLinha("Prazo:", formatarData(demanda.prazoFinalizacao, "Sem prazo")));
        cartao.appendChild(criarLinha("Prioridade:", textoOu(demanda.prioridade, "NÃ£o informada")));
        cartao.appendChild(criarLinha("Status:", textoOu(demanda.status, "NÃ£o informado")));
        cartao.appendChild(botao);

        listaContainer.appendChild(cartao);
    });
}

// Preenche responsÃ¡vel e projeto com o que jÃ¡ estÃ¡ cadastrado no banco.
async function carregarOpcoesFiltros() {
    try {
        const respostaProjetos = await fetch(API_BASE_URL + "/projetos", { credentials: "include" });
        const respostaUsuarios = await fetch(API_BASE_URL + "/usuarios", { credentials: "include" });

        if (!respostaProjetos.ok || !respostaUsuarios.ok) {
            const falha = !respostaProjetos.ok ? respostaProjetos : respostaUsuarios;
            const mensagem = await mensagemDaResposta(falha, "NÃ£o foi possÃ­vel carregar os filtros");
            mostrarErro(mensagem);
            return;
        }

        const projetos = await respostaProjetos.json();
        const usuarios = await respostaUsuarios.json();

        if (!Array.isArray(projetos) || !Array.isArray(usuarios)) {
            mostrarErro("A API nÃ£o retornou projetos e responsÃ¡veis para os filtros.");
            return;
        }

        const selectProjeto = document.getElementById("filtroProjeto");
        projetos.forEach((projeto) => {
            const opcao = document.createElement("option");
            opcao.value = projeto.nome;
            opcao.textContent = projeto.nome;
            selectProjeto.appendChild(opcao);
        });

        const selectResponsavel = document.getElementById("filtroResponsavel");
        usuarios.forEach((usuario) => {
            const opcao = document.createElement("option");
            opcao.value = usuario.nome;
            opcao.textContent = usuario.nome;
            selectResponsavel.appendChild(opcao);
        });
    } catch (erro) {
        mostrarErro("NÃ£o foi possÃ­vel carregar projetos e responsÃ¡veis. Verifique se a API estÃ¡ em execuÃ§Ã£o.");
    }
}
