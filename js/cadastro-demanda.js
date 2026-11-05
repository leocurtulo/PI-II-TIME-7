// Autor: Leonardo Furlan Curtulo
// Descrição: validações do formulário de cadastro de demanda, carregamento dos projetos pela API e envio da demanda (POST /demandas).
// Verificação de feriado nacional. (BrasilAPI)

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
const mensagemErro = document.querySelector("#mensagemErro");

function mostrarErro(campo, spanErro, mensagem){
    spanErro.innerText = mensagem;
    campo.classList.add("campo-invalido");
}

function limparErro(campo, spanErro) {
    spanErro.innerText = "";
    campo.classList.remove("campo-invalido");
}

formulario.addEventListener("submit", async function (event) {
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

    limparErro(campoPrazo, erroPrazo);

    if(prazo !== ""){
        try{
            const ano = prazo.slice(0, 4);
            const feriados = await buscarFeriadosApi(ano);

            const feriado = feriados.find(f => f.date === prazo);

            if(feriado !== undefined){
                mostrarErro(campoPrazo, erroPrazo, "O prazo não pode ser em feriado nacional (" + feriado.name + ").");
                formularioValido = false;
            }
        }catch(erro){
            mostrarErro(campoPrazo, erroPrazo, "Não foi possível verificar os feriados. Tente novamente.");
            formularioValido = false;
            
        }
    }

    if (!formularioValido) {
        mensagemSucesso.innerText = "";
        return;
    }

    // Limpa as mensagens da tentativa anterior
    mensagemSucesso.innerText = "";
    mensagemErro.innerText = "";

    // Monta a demanda com os nomes de campos que a API espera
    const demanda = {
        titulo: titulo,
        descricao: descricao,
        tipo: tipo,
        prioridade: prioridade,
        projetoId: Number(projeto),
        responsavelId: responsavel,
        prazo: prazo
    };

    try {
        // Envia para a API (POST /demandas) e espera a resposta
        const demandaCriada = await cadastrarDemandaApi(demanda);

        mensagemSucesso.innerText = "Demanda nº " + demandaCriada.id + " cadastrada com sucesso!";
        formulario.reset();
    } catch (erro) {
        // Mostra na tela o erro que veio da API (ex: 400) ou de conexão
        mensagemErro.innerText = erro.message;
    }


});

// Busca os projetos na API e preenche o select de projetos
async function carregarProjetos() {
    try {
        const projetos = await listarProjetosApi();

        // Cria uma opção no select para cada projeto (value = id, texto = nome)
        projetos.forEach((projeto) => {
            campoProjeto.innerHTML += "<option value='" + projeto.id + "'>" + projeto.nome + "</option>";
        });
    } catch (erro) {
        // Se a API estiver fora do ar ou der erro, avisa na tela
        mostrarErro(campoProjeto, erroProjeto, "Não foi possível carregar os projetos. Verifique se o servidor está ligado.");
    }
}

// Carrega os projetos assim que a página abre
carregarProjetos();


// Busca os usuários na API e preenche o select de responsável
async function carregarUsuarios() {
    try {
        const usuarios = await listarUsuariosApi();

        // Cria uma opção no select para cada usuário (value = id, texto = nome)
        usuarios.forEach((usuario) => {
            campoResponsavel.innerHTML += "<option value='" + usuario.id + "'>" + usuario.nome + "</option>";
        });
    } catch (erro) {
        // O responsável é opcional, então só avisa no topo sem travar o formulário
        mensagemErro.innerText = "Não foi possível carregar os responsáveis. Verifique se o servidor está ligado.";
    }
}

// Carrega os usuários assim que a página abre
carregarUsuarios();