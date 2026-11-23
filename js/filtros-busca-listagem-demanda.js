<<<<<<< Updated upstream
console.log('[script.js] arquivo carregado');

(function () {
    'use strict';

    function iniciar() {
        var inputBusca = document.getElementById('buscaTexto');
        var selectStatus = document.getElementById('filtroStatus');
        var selectPrioridade = document.getElementById('filtroPrioridade');
        var selectTipo = document.getElementById('filtroTipo');
        var selectResponsavel = document.getElementById('filtroResponsavel');
        var selectProjeto = document.getElementById('filtroProjeto');
        var selectOrdenacao = document.getElementById('ordenacao');
        var btnAplicar = document.getElementById('btnAplicarFiltros');
        var lista = document.getElementById('lista');

        if (!lista) {
            console.error('[script.js] Elemento #lista não encontrado. Confira o ID no HTML.');
            return;
        }

        var demandas = Array.prototype.slice.call(document.querySelectorAll('.exemplo'));
        console.log('[script.js] demandas encontradas:', demandas.length);

        var msgVazio = document.createElement('p');
        msgVazio.textContent = 'Nenhuma demanda encontrada com esses filtros.';
        msgVazio.style.display = 'none';
        msgVazio.style.color = '#555555';
        msgVazio.style.textAlign = 'center';
        lista.appendChild(msgVazio);

        function normalizar(texto) {
            return String(texto || '')
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLowerCase()
                .trim();
        }

        function valor(select) {
            return select ? normalizar(select.value) : 'todos';
        }

        function aplicarFiltros() {
            var termo = normalizar(inputBusca ? inputBusca.value : '');
            var fStatus = valor(selectStatus);
            var fPrioridade = valor(selectPrioridade);
            var fTipo = valor(selectTipo);
            var fResponsavel = valor(selectResponsavel);
            var fProjeto = valor(selectProjeto);
            var ordem = selectOrdenacao ? selectOrdenacao.value : 'prazo';

            var filtradas = demandas.filter(function (d) {
                var h3 = d.querySelector('h3');
                var desc = d.querySelector('.descricao');
                var titulo = normalizar(h3 ? h3.textContent : '');
                var descricao = normalizar(desc ? desc.textContent : '');

                var okBusca = termo === '' || titulo.indexOf(termo) !== -1 || descricao.indexOf(termo) !== -1;
                var okStatus = fStatus === 'todos' || normalizar(d.dataset.status) === fStatus;
                var okPrioridade = fPrioridade === 'todos' || normalizar(d.dataset.prioridade) === fPrioridade;
                var okTipo = fTipo === 'todos' || normalizar(d.dataset.tipo) === fTipo;
                var okResp = fResponsavel === 'todos' || normalizar(d.dataset.responsavel) === fResponsavel;
                var okProjeto = fProjeto === 'todos' || normalizar(d.dataset.projeto) === fProjeto;

                return okBusca && okStatus && okPrioridade && okTipo && okResp && okProjeto;
            });


            filtradas.sort(function (a, b) {
                if (ordem === 'prazo') {
                    return new Date(a.dataset.prazo || 0) - new Date(b.dataset.prazo || 0);
                }
                if (ordem === 'criacao') {
                    return new Date(b.dataset.criacao || 0) - new Date(a.dataset.criacao || 0);
                }
                if (ordem === 'prioridade') {
                    return parseInt(a.dataset.nivelPrioridade || 0, 10) - parseInt(b.dataset.nivelPrioridade || 0, 10);
                }
                if (ordem === 'status') {
                    return (a.dataset.status || '').localeCompare(b.dataset.status || '');
                }
                return 0;
            });

            demandas.forEach(function (d) {
                d.style.setProperty('display', 'none', 'important');
            });

            filtradas.forEach(function (d) {
                d.style.setProperty('display', 'block', 'important');
                lista.insertBefore(d, msgVazio);
            });

            msgVazio.style.display = filtradas.length === 0 ? 'block' : 'none';

            console.log('[script.js] filtros aplicados. Resultados:', filtradas.length);
        }

        if (btnAplicar) {
            btnAplicar.addEventListener('click', function (e) {
                e.preventDefault();
                aplicarFiltros();
            });
        }

        // Aplica também ao digitar / trocar um filtro
        if (inputBusca) inputBusca.addEventListener('input', aplicarFiltros);
        [selectStatus, selectPrioridade, selectTipo, selectResponsavel, selectProjeto, selectOrdenacao]
            .forEach(function (s) {
                if (s) s.addEventListener('change', aplicarFiltros);
            });

        aplicarFiltros();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', iniciar);
    } else {
        iniciar();
    }
})();
=======
/*
AUTOR: Caio Ferreira Aragão
DESCRIÇÃO: Busca, filtros e ordenação da listagem de demandas.
A tela consulta GET /demandas e monta os cards com os dados da API.
*/

const API_BASE_URL = "http://localhost:3000";
const TAMANHO_MAXIMO_BUSCA = 100;

const STATUS_VALIDOS = ["Aberta", "Em andamento", "Em revisão", "Concluída", "Cancelada"];
const PRIORIDADES_VALIDAS = ["Crítica", "Alta", "Média", "Baixa"];
const TIPOS_VALIDOS = ["Tarefa", "Defeito", "Melhoria", "Documentação"];
const ORDENACOES_VALIDAS = ["prazo", "criacao", "prioridade", "status"];

document.addEventListener("DOMContentLoaded", () => {
    conferirLogin();
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

// Quem não está logado volta para o login, no mesmo padrão das outras telas.
async function conferirLogin() {
    try {
        const resposta = await fetch(API_BASE_URL + "/sessao");
        if (resposta.status === 401) {
            window.location.href = "login.html";
        }
    } catch (erro) {
        mostrarErro("Não foi possível verificar o login. Confira se a API está no ar.");
    }
}

// Lê a mensagem JSON da API. Se o corpo não for JSON, usa o status HTTP.
async function mensagemDaResposta(resposta, reserva) {
    try {
        const corpo = await resposta.json();
        if (corpo && typeof corpo.mensagem === "string" && corpo.mensagem.trim() !== "") {
            return corpo.mensagem;
        }
    } catch (erro) {
        // Corpo vazio ou que não é JSON.
    }
    return reserva + " (HTTP " + resposta.status + ").";
}

function mostrarErro(texto) {
    document.getElementById("mensagemErro").textContent = texto;
}

function limparErroGeral() {
    document.getElementById("mensagemErro").textContent = "";
}

// A busca não é obrigatória. Quando preenchida, precisa ter no máximo 100 caracteres.
function validarBusca() {
    const campo = document.getElementById("buscaTexto");
    const erro = document.getElementById("erroBusca");
    const texto = campo.value.trim();

    if (texto.length > TAMANHO_MAXIMO_BUSCA) {
        erro.textContent = "A busca pode ter no máximo " + TAMANHO_MAXIMO_BUSCA + " caracteres.";
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
        mostrarErro("Há um filtro ou uma ordenação com valor que o sistema não aceita.");
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
        const resposta = await fetch(API_BASE_URL + "/demandas?" + params.toString());

        if (!resposta.ok) {
            const mensagem = await mensagemDaResposta(resposta, "Não foi possível listar as demandas");
            mostrarErro(mensagem);
            renderizarLista([], "A lista não foi atualizada por causa do erro acima.");
            return;
        }

        const demandas = await resposta.json();
        if (!Array.isArray(demandas)) {
            mostrarErro("A API não retornou a lista de demandas.");
            renderizarLista([], "A lista não foi atualizada por causa do erro acima.");
            return;
        }

        limparErroGeral();
        renderizarLista(demandas);
    } catch (erro) {
        mostrarErro("Não foi possível consultar as demandas. Verifique se a API está em execução.");
        renderizarLista([], "A lista não foi atualizada por causa do erro acima.");
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
        titulo.textContent = textoOu(demanda.titulo, "Sem título");

        const descricao = document.createElement("p");
        descricao.className = "descricao";
        descricao.textContent = textoOu(demanda.descricao, "Sem descrição");

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
        projetoTipo.appendChild(document.createTextNode(" " + textoOu(demanda.projeto, "Não informado") + " | "));
        projetoTipo.appendChild(forteTipo);
        projetoTipo.appendChild(document.createTextNode(" " + textoOu(demanda.tipo, "Não informado")));

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
        cartao.appendChild(criarLinha("Responsável:", textoOu(demanda.responsavel, "Não atribuído")));
        cartao.appendChild(criarLinha("Data de criação:", formatarData(demanda.dataCriacao, "Não informada")));
        cartao.appendChild(criarLinha("Prazo:", formatarData(demanda.prazoFinalizacao, "Sem prazo")));
        cartao.appendChild(criarLinha("Prioridade:", textoOu(demanda.prioridade, "Não informada")));
        cartao.appendChild(criarLinha("Status:", textoOu(demanda.status, "Não informado")));
        cartao.appendChild(botao);

        listaContainer.appendChild(cartao);
    });
}

// Preenche responsável e projeto com o que já está cadastrado no banco.
async function carregarOpcoesFiltros() {
    try {
        const respostaProjetos = await fetch(API_BASE_URL + "/projetos");
        const respostaUsuarios = await fetch(API_BASE_URL + "/usuarios");

        if (!respostaProjetos.ok || !respostaUsuarios.ok) {
            const falha = !respostaProjetos.ok ? respostaProjetos : respostaUsuarios;
            const mensagem = await mensagemDaResposta(falha, "Não foi possível carregar os filtros");
            mostrarErro(mensagem);
            return;
        }

        const projetos = await respostaProjetos.json();
        const usuarios = await respostaUsuarios.json();

        if (!Array.isArray(projetos) || !Array.isArray(usuarios)) {
            mostrarErro("A API não retornou projetos e responsáveis para os filtros.");
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
        mostrarErro("Não foi possível carregar projetos e responsáveis. Verifique se a API está em execução.");
    }
}
>>>>>>> Stashed changes
