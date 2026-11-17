// Autor: Leonardo Furlan Curtulo
// Descrição: tela de edição de demanda. Carrega a demanda pelo id da URL (GET /demandas/:id),
// preenche o formulário e envia as alterações (PUT /demandas/:id).

const formulario = document.querySelector("#formEdicao");

const campoId = document.querySelector("#id");
const campoProjeto = document.querySelector("#projeto");
const campoStatus = document.querySelector("#status");
const campoTitulo = document.querySelector("#titulo");
const campoDescricao = document.querySelector("#descricao");
const campoTipo = document.querySelector("#tipo");
const campoPrioridade = document.querySelector("#prioridade");
const campoResponsavel = document.querySelector("#responsavel");
const campoPrazo = document.querySelector("#prazo");
const campoDataCriacao = document.querySelector("#data-criacao");
const campoDataAtualizacao = document.querySelector("#data-atualizacao");

const botaoSalvar = document.querySelector("#formEdicao button");
const linkVoltar = document.querySelector("#linkVoltar");
const mensagemSucesso = document.querySelector("#mensagemSucesso");
const mensagemErro = document.querySelector("#mensagemErro");

const erroTitulo = document.querySelector("#erroTitulo");
const erroDescricao = document.querySelector("#erroDesc");
const erroTipo = document.querySelector("#erroTipo");
const erroPrioridade = document.querySelector("#erroPrioridade");
const erroPrazo = document.querySelector("#erroPrazo");

// Lê o id da URL 
const parametros = new URLSearchParams(window.location.search);
const idDemanda = parametros.get("id");


// Preenche o select de responsável com os usuários da API
async function carregarUsuarios() {
    const usuarios = await listarUsuariosApi();

    usuarios.forEach((usuario) => {
        campoResponsavel.innerHTML += "<option value='" + usuario.id + "'>" + usuario.nome + "</option>";
    });
}

// Coloca os dados da demanda nos campos do formulário
function preencherFormulario(demanda) {
    campoId.value = demanda.id;
    campoProjeto.value = demanda.projeto;
    campoStatus.value = demanda.status;
    campoTitulo.value = demanda.titulo;
    campoDescricao.value = demanda.descricao;
    campoTipo.value = demanda.tipo;
    campoPrioridade.value = demanda.prioridade;
    campoDataCriacao.value = demanda.dataCriacao;
    campoDataAtualizacao.value = demanda.dataAtualizacao;

    // Responsável e prazo podem vir null
    if (demanda.responsavelId === null) {
        campoResponsavel.value = "";
    } else {
        campoResponsavel.value = demanda.responsavelId;
    }

    if (demanda.prazo === null) {
        campoPrazo.value = "";
    } else {
        campoPrazo.value = demanda.prazo;
    }
}

// Carrega a tela quando a página abre
async function iniciarTela() {
    if (!idDemanda) {
        mensagemErro.innerText = "Nenhuma demanda foi informada. Abra esta tela pelos detalhes da demanda.";
        botaoSalvar.disabled = true;
        return;
    }

    linkVoltar.href = "detalhes-demanda.html?id=" + idDemanda;

    try {
        // Os usuários vêm antes: o select precisa ter as opções para marcar o responsável
        await carregarUsuarios();

        const demanda = await buscarDemandaPorIdApi(idDemanda);
        preencherFormulario(demanda);

        // Demanda finalizada não pode ser editada
        if (demanda.status === "Concluída" || demanda.status === "Cancelada") {
            mensagemErro.innerText = "Esta demanda está " + demanda.status + " e não pode ser editada.";
            botaoSalvar.disabled = true;
        }
    } catch (erro) {
        mensagemErro.innerText = erro.message;
        botaoSalvar.disabled = true;
    }
}

iniciarTela();


// Mostra e limpa o erro de um campo (iguais ao cadastro)
function mostrarErro(campo, spanErro, mensagem) {
    spanErro.innerText = mensagem;
    campo.classList.add("campo-invalido");
}

function limparErro(campo, spanErro) {
    spanErro.innerText = "";
    campo.classList.remove("campo-invalido");
}

// Ao clicar em Salvar: valida, confere o feriado e envia o PUT
formulario.addEventListener("submit", async function (event) {
    event.preventDefault();

    const titulo = campoTitulo.value.trim();
    const descricao = campoDescricao.value.trim();
    const tipo = campoTipo.value;
    const prioridade = campoPrioridade.value;
    const responsavel = campoResponsavel.value;
    const prazo = campoPrazo.value;

    let formularioValido = true;

    limparErro(campoTitulo, erroTitulo);
    if (titulo === "") {
        mostrarErro(campoTitulo, erroTitulo, "O título é obrigatório!");
        formularioValido = false;
    } else if (titulo.length < 5) {
        mostrarErro(campoTitulo, erroTitulo, "O título deve ter pelo menos 5 caracteres!");
        formularioValido = false;
    } else if (titulo.length > 100) {
        mostrarErro(campoTitulo, erroTitulo, "O título deve ter no máximo 100 caracteres!");
        formularioValido = false;
    }

    limparErro(campoDescricao, erroDescricao);
    if (descricao === "") {
        mostrarErro(campoDescricao, erroDescricao, "A descrição é obrigatória!");
        formularioValido = false;
    } else if (descricao.length < 10) {
        mostrarErro(campoDescricao, erroDescricao, "A descrição deve ter pelo menos 10 caracteres!");
        formularioValido = false;
    } else if (descricao.length > 1000) {
        mostrarErro(campoDescricao, erroDescricao, "A descrição deve ter no máximo 1000 caracteres!");
        formularioValido = false;
    }

    limparErro(campoTipo, erroTipo);
    if (tipo === "") {
        mostrarErro(campoTipo, erroTipo, "Selecione o tipo da demanda!");
        formularioValido = false;
    }

    limparErro(campoPrioridade, erroPrioridade);
    if (prioridade === "") {
        mostrarErro(campoPrioridade, erroPrioridade, "Selecione a prioridade!");
        formularioValido = false;
    }

    //bloqueio de feriado também na atualização do prazo
    limparErro(campoPrazo, erroPrazo);
    if (prazo !== "") {
        try {
            const feriados = await buscarFeriadosApi(prazo.slice(0, 4));
            const feriado = feriados.find(f => f.date === prazo);

            if (feriado !== undefined) {
                mostrarErro(campoPrazo, erroPrazo, "O prazo não pode ser em feriado nacional (" + feriado.name + ").");
                formularioValido = false;
            }
        } catch (erro) {
            mostrarErro(campoPrazo, erroPrazo, "Não foi possível verificar os feriados. Tente novamente.");
            formularioValido = false;
        }
    }

    mensagemSucesso.innerText = "";
    mensagemErro.innerText = "";

    if (!formularioValido) {
        return;
    }

    const demanda = {
        titulo: titulo,
        descricao: descricao,
        tipo: tipo,
        prioridade: prioridade,
        responsavelId: responsavel,
        prazo: prazo
    };

    try {
        await editarDemandaApi(idDemanda, demanda);

        // Busca de novo para mostrar a data de atualização nova 
        const demandaAtualizada = await buscarDemandaPorIdApi(idDemanda);
        preencherFormulario(demandaAtualizada);

        mensagemSucesso.innerText = "Demanda atualizada com sucesso!";
    } catch (erro) {
        mensagemErro.innerText = erro.message;
    }

});