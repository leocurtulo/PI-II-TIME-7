
console.log("JavaScript carregado com sucesso!");
const btnComentario =
    document.getElementById("btnComentario");

const campoComentario =
    document.getElementById("comentario");

const erroComentario =
    document.getElementById("erro-comentario");

btnComentario.addEventListener("click", () => {

    erroComentario.textContent = "";

    const texto =
        campoComentario.value.trim();

    if (texto === "") {

        erroComentario.textContent =
            "O comentário é obrigatório.";

        return;
    }

    if (texto.length < 10) {

        erroComentario.textContent =
            "O comentário deve possuir pelo menos 10 caracteres.";

        return;
    }

    alert("Comentário enviado com sucesso!");

    campoComentario.value = "";

});




const btnBusca =
    document.getElementById("btnBusca");

const campoBusca =
    document.getElementById("campoBusca");

const erroBusca =
    document.getElementById("erroBusca");

btnBusca.addEventListener("click", () => {

    erroBusca.textContent = "";

    const termo =
        campoBusca.value.trim().toLowerCase();

    if (termo === "") {

        erroBusca.textContent =
            "Digite um termo para pesquisa.";

        return;
    }

    const itens =
        document.querySelectorAll(".item-pesquisavel");

    let encontrou = false;

    itens.forEach(item => {

        item.style.border = "none";

        const conteudo =
            item.textContent.toLowerCase();

        if (conteudo.includes(termo)) {

            item.style.border =
                "2px solid green";

            encontrou = true;
        }

    });

    if (!encontrou) {

        erroBusca.textContent =
            "Nenhum resultado encontrado.";

    }

});