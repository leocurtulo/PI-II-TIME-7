// Autor: Leonardo Furlan Curtulo
// Descrição: validações do formulário de cadastro de demanda.

const formulario = document.querySelector("#formDemanda");

const campoTitulo = document.querySelector("#titulo");
const campoDescricao = document.querySelector("#descricao");
const campoTipo = document.querySelector("#tipo");
const campoPrioridade = document.querySelector("#prioridade");
const campoProjeto = document.querySelector("#projeto");
const campoResponsavel = document.querySelector("#responsavel");
const campoPrazo = document.querySelector("#prazo");

const erroTitulo = document.querySelector("#erroTitulo");
const erroDescricao = document.querySelector("#erroDesc");
const erroTipo = document.querySelector("#erroTipo");
const erroPrioridade = document.querySelector("#erroPrioridade");
const erroProjeto = document.querySelector("#erroProjeto");
const erroPrazo = document.querySelector("#erroPrazo");
const mensagemSucesso = document.querySelector("#mensagemSucesso");

function mostrarErro(campo, spanErro, mensagem){
    spanErro.innerText = mensagem;
    campo.classList.add("campo-invalido");
}

function limparErro(campo, spanErro) {
    spanErro.innerText = "";
    campo.classList.remove("campo-invalido");
}

formulario.addEventListener("submit", function (event) {
    event.preventDefault();

    const titulo = campoTitulo.value.trim();
    const descricao = campoDescricao.value.trim();
    const tipo = campoTipo.value;
    const prioridade = campoPrioridade.value;
    const projeto = campoProjeto.value;
    const responsavel = campoResponsavel.value;
    const prazo = campoPrazo.value;

    let formularioValido = true;

    limparErro(campoTitulo, erroTitulo);

    if(titulo === ""){
        mostrarErro(campoTitulo, erroTitulo, "O título é obrigatorio!");
        formularioValido = false;
    } else if(titulo.length < 5){
        mostrarErro(campoTitulo, erroTitulo, "O título deve ter pelo menos 5 caracteres!");
        formularioValido = false;
    }else if(titulo.length > 100){
        mostrarErro(campoTitulo, erroTitulo, "O título deve ter no máximo 100 caracteres!");
        formularioValido = false;
    }

    limparErro(campoDescricao, erroDescricao);

    if(descricao === ""){
        mostrarErro(campoDescricao, erroDescricao, "A descrição é obrigatória!");
        formularioValido = false;
    }else if(descricao.length < 10){
        mostrarErro(campoDescricao, erroDescricao, "A descrição deve ter pelo menos 10 caracteres!");
        formularioValido = false;
    }else if(descricao.length > 1000){
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

    limparErro(campoProjeto, erroProjeto);

    if (projeto === "") {
        mostrarErro(campoProjeto, erroProjeto, "Selecione o projeto associado!");
        formularioValido = false;
    }

    if (!formularioValido) {
        mensagemSucesso.innerText = "";
        return;
    }

    const demanda = {
        titulo,
        descricao,
        tipo,
        prioridade,
        projeto,
        responsavel,
        prazo,
        status: "Aberta"
    };

    const json = JSON.stringify(demanda, null, 2);
    console.log(json);

    mensagemSucesso.innerText = "Demanda validada com sucesso!";

});