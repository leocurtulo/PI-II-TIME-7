// AUTOR: Leonardo Furlan Curtulo
// DESCRIÇÃO: Confere se tem alguém logado (GET /sessao), mostra o nome e o perfil no menu e faz o logout (POST /logout). Usado por todas as telas, menos a de login

// Pergunta ao servidor quem está logado
async function carregarSessao() {
    const resposta = await fetch(API_BASE_URL + "/sessao");

    //volta para a tela de login
    if (!resposta.ok) {
        window.location.href = "login.html";
        return;
    }

    // Logado: mostra o nome e o perfil no menu
    const usuario = await resposta.json();
    document.querySelector("#usuarioLogado").innerText = usuario.nome + " (" + usuario.perfil + ")";
}

// Encerra a sessão no servidor e volta para o login
async function sair() {
    await fetch(API_BASE_URL + "/logout", { method: "POST" });
    window.location.href = "login.html";
}

// Liga o clique do botão "Sair" à função sair
document.querySelector("#botaoSair").addEventListener("click", sair);

// Confere a sessão assim que a página abre
carregarSessao();