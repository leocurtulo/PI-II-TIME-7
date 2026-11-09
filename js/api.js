// AUTOR: Leonardo Furlan Curtulo
// DESCRIÇÃO: Funções que conversam com a API (backend) usando fetch.
// As telas chamam estas funções em vez de usar o fetch direto.


// Endereço base da API (o servidor Express)
const API_BASE_URL = "http://localhost:3000";

// GET /projetos: busca a lista de projetos cadastrados
async function listarProjetosApi() {
    const resposta = await fetch(API_BASE_URL + "/projetos");
    const dados = await resposta.json();

    // Se a API respondeu com erro (status fora de 200-299), avisa quem chamou
    if (!resposta.ok) {
        throw new Error(dados.mensagem || "Erro ao carregar os projetos.");
    }

    return dados;
}

// POST /demandas: envia uma nova demanda para a API cadastrar
async function cadastrarDemandaApi(demanda) {
    const resposta = await fetch(API_BASE_URL + "/demandas", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(demanda)
    });
    const dados = await resposta.json();

    // Se deu erro (ex.: 400), junta a mensagem principal com a lista de erros da API
    if (!resposta.ok) {
        let texto = dados.mensagem || "Erro ao cadastrar a demanda.";

        if (dados.erros) {
            dados.erros.forEach((erro) => {
                texto += " " + erro;
            });
        }

        throw new Error(texto);
    }

    return dados;
}

// GET /usuarios: busca a lista de usuários (id e nome) para o select de responsável
async function listarUsuariosApi() {
    const resposta = await fetch(API_BASE_URL + "/usuarios");
    const dados = await resposta.json();

    if (!resposta.ok) {
        throw new Error(dados.mensagem || "Erro ao carregar os usuários.");
    }

    return dados;
}


// API externa (BrasilAPI): busca os feriados nacionais de um ano
// Exemplo de resposta: [ { date: "2026-12-25", name: "Natal", type: "national" }, ... ]
async function buscarFeriadosApi(ano) {
    const resposta = await fetch("https://brasilapi.com.br/api/feriados/v1/" + ano);
    const dados = await resposta.json();

    if (!resposta.ok) {
        throw new Error("Não foi possível consultar os feriados.");
    }

    return dados;
}
// Procura demanda por ID
async function buscarDemandaPorIdApi(id) {

    const resposta =
        await fetch(API_BASE_URL + "/demandas/" + id);

    const dados = await resposta.json();

    if (!resposta.ok) {
        throw new Error(
            dados.mensagem ||
            "Erro ao carregar demanda."
        );
    }

    return dados;
}

// Lista Comentários
async function listarComentariosApi(id) {

    const resposta =
        await fetch(
            API_BASE_URL +
            "/demandas/" +
            id +
            "/comentarios"
        );

    const dados = await resposta.json();

    if (!resposta.ok) {
        throw new Error(
            dados.mensagem ||
            "Erro ao carregar comentários."
        );
    }

    return dados;
}

// Função de cadastrar Comentários.
async function cadastrarComentarioApi(
    id,
    comentario
) {

    const resposta =
        await fetch(
            API_BASE_URL +
            "/demandas/" +
            id +
            "/comentarios",
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body: JSON.stringify(comentario)
            }
        );

    const dados = await resposta.json();

    if (!resposta.ok) {
        throw new Error(
            dados.mensagem ||
            "Erro ao cadastrar comentário."
        );
    }

    return dados;
}
