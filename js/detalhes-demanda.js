/*Autor: Augusto Brufato
Descrição: Javascript dos detalhes das demandas
*/

// Nomes dos campos do histórico do jeito que o usuário deve ler
const NOMES_CAMPOS = {
    titulo: "Título",
    descricao: "Descrição",
    tipo: "Tipo",
    prioridade: "Prioridade",
    status: "Status",
    responsavel: "Responsável",
    prazo: "Prazo"
};

// Deixa o valor legível: vazio vira "vazio" e o prazo vai de AAAA-MM-DD para DD/MM/AAAA
function valorLegivel(campo, valor) {
    if (valor == null || valor === "") {
        return "vazio";
    }
    if (campo === "prazo") {
        return valor.slice(8, 10) + "/" + valor.slice(5, 7) + "/" + valor.slice(0, 4);
    }
    return valor;
}


console.log("JavaScript carregado com sucesso!");
// Pega o id da demanda pela URL 
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
carregarHistorico();

const btnComentario =
    document.getElementById("btnComentario");

const campoComentario =
    document.getElementById("comentario");

const erroComentario =
    document.getElementById("erro-comentario");

const btnEditar =
    document.getElementById("btnEditar");

const btnAlterarstatus =
    document.getElementById("btnAlterarstatus");

const btnCancelar =
    document.getElementById("btnCancelar");

esconderBotoesMembro();

btnEditar.addEventListener("click", () => {

    window.location.href =
        `edicao-demanda.html?id=${idDemanda}`;

});

// Altera para o status escolhido no select e recarrega a demanda e o histórico
btnAlterarstatus.addEventListener(
    "click",
    async () => {

        const novoStatus = document.getElementById("novoStatus").value;

        if(novoStatus === ""){
            alert("Selecione um status.");
            return;
        }

        try {

            await alterarStatusApi(
                idDemanda,
                novoStatus
            );

            alert(
                "Status atualizado com sucesso."
            );

            carregarDemanda();
            carregarHistorico();

        } catch (erro) {

            alert(erro.message);

        }

    }
);

// Cancelar pede confirmação antes, porque demanda cancelada não pode mais ser editada
btnCancelar.addEventListener(
    "click",
    async () => {

        const confirmar = confirm(
            "Deseja realmente cancelar esta demanda?"
        );

        if (!confirmar) {
            return;
        }

        try {

            await alterarStatusApi(
                idDemanda,
                "Cancelada"
            );

            alert(
                "Demanda cancelada com sucesso."
            );

            carregarDemanda();
            carregarHistorico();

        } catch (erro) {

            alert(erro.message);

        }

    }
);

// Valida o comentário (obrigatório e com pelo menos 10 caracteres) antes de enviar
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


// Busca: destaca em verde os comentários e itens do histórico que têm o termo digitado
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


// Busca a demanda na API e preenche cada campo da tela
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
            .textContent = demanda.projeto;

        document.getElementById("responsavelDemanda")
            .textContent =
                demanda.responsavel ?? "Não definido";

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


// Monta a lista de comentários com o nome de quem comentou
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
                                 ${comentario.nome}
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

// Monta a lista do histórico de alterações
async function carregarHistorico() {

    try {

        const historico =
            await listarHistoricoApi(
                idDemanda
            );

        const lista =
            document.getElementById(
                "listaHistorico"
            );

        lista.innerHTML = "";

        historico.forEach(item => {

            const data = item.dataHora;

            lista.innerHTML += `
                <li class="item-pesquisavel">
                    ${item.usuario}
                    alterou ${NOMES_CAMPOS[item.campo]}
                    de "${valorLegivel(item.campo, item.valorAnterior)}"
                    para "${valorLegivel(item.campo, item.valorNovo)}"
                    — ${data}
                </li>
            `;

        });

    } catch (erro) {

        console.error(erro);

    }

}

// Membro da Equipe não edita nem cancela, então esconde esses botões
async function esconderBotoesMembro() {
    const resposta = await fetch(API_BASE_URL + "/sessao");
    const usuario = await resposta.json();

    if (usuario.perfil === "Membro da Equipe") {
        btnEditar.style.display = "none";
        btnCancelar.style.display = "none";
    }
}