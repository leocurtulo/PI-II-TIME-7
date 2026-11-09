
console.log("JavaScript carregado com sucesso!");
const parametros =
    new URLSearchParams(window.location.search);

const idDemanda =
    parametros.get("id");
    if (!idDemanda) {

    alert("Nenhuma demanda foi informada.");

    throw new Error(
        "ID da demanda não informado."
    );

}

console.log("ID da demanda:", idDemanda);

carregarDemanda();
carregarComentarios();

const btnComentario =
    document.getElementById("btnComentario");

const campoComentario =
    document.getElementById("comentario");

const erroComentario =
    document.getElementById("erro-comentario");

btnComentario.addEventListener("click",async () => {

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

    try {

    await cadastrarComentarioApi(
        idDemanda,
        {
            usuarioId: 3,
            texto: texto
        }
    );

    campoComentario.value = "";

    carregarComentarios();

    alert("Comentário enviado com sucesso!");

} catch (erro) {

    erroComentario.textContent =
        erro.message;

}

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

async function carregarDemanda() {

    try {

        const demanda =
            await buscarDemandaPorIdApi(idDemanda);

        document.getElementById("demandaId")
            .textContent = demanda.id;

        document.getElementById("tituloDemanda")
            .textContent = demanda.titulo;

        document.getElementById("tipoDemanda")
            .textContent = demanda.tipo;

        document.getElementById("prioridadeDemanda")
            .textContent = demanda.prioridade;

        document.getElementById("statusDemanda")
            .textContent = demanda.status;

        document.getElementById("projetoDemanda")
            .textContent = demanda.projetoId;

        document.getElementById("responsavelDemanda")
            .textContent =
                demanda.responsavelId ?? "Não definido";

        document.getElementById("dataCriacaoDemanda")
            .textContent = demanda.dataCriacao;

        document.getElementById("dataAtualizacaoDemanda")
            .textContent = demanda.dataAtualizacao;

        document.getElementById("prazoDemanda")
            .textContent =
                demanda.prazo ?? "Sem prazo";

        document.getElementById("descricaoDemanda")
            .textContent = demanda.descricao;

    } catch (erro) {

        console.error(erro);

        alert(
            "Erro ao carregar os dados da demanda."
        );

    }

}

async function carregarComentarios() {

    try {

        const comentarios =
            await listarComentariosApi(
                idDemanda
            );

        const lista =
            document.getElementById(
                "listaComentarios"
            );

        lista.innerHTML = "";

        comentarios.forEach(
            comentario => {

                lista.innerHTML += `
                    <article class="campo item-pesquisavel">

                        <p>
                            <strong>
                                Usuário ${comentario.usuarioId}
                            </strong>
                        </p>

                        <p>
                            ${comentario.texto}
                        </p>

                    </article>
                `;

            }
        );

    } catch (erro) {

        console.error(erro);

    }

}