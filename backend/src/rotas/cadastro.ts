// AUTOR: Leonardo Furlan Curtulo
// DESCRIÇÃO: Rotas da tela de Cadastro de Demanda (GET /projetos, GET /usuarios e POST /demandas), usando o banco Oracle


// Importa o tipo Express (o tipo do app, que vem do index.ts)
import { Express } from "express";

// Importa o oracledb (usado para pegar o id gerado pelo banco no INSERT)
import oracledb from "oracledb";

// Importa a função que abre a conexão com o banco
import { abrirConexao } from "../banco/conexao";

// Importa as listas de validação (tipos e prioridades aceitos)
import { TIPOS, PRIORIDADES } from "../data/dados";



// Verifica se um valor está vazio (não veio, veio null ou é texto em branco)
function estaVazio(valor: any): boolean {
    return valor === undefined || valor === null || String(valor).trim() === "";
}

// Registra as rotas da tela de cadastro no app (chamada no index.ts)
export function rotasCadastro(app: Express) {
    // GET /projetos: lista os projetos cadastrados no banco
    app.get("/projetos", async (req, res) => {
        try {
            const conexao = await abrirConexao();

            // AS "id" e AS "nome" deixam os nomes em minúsculo (o Oracle devolve em MAIÚSCULO)
            const resultado = await conexao.execute(
                `SELECT id AS "id", nome AS "nome" FROM projeto ORDER BY id`
            );

            await conexao.close();
            res.status(200).json(resultado.rows);
        } catch (erro) {
            res.status(500).json({ mensagem: "Erro ao buscar os projetos." });
        }
    });

    // GET /usuarios: lista os usuários para o select de responsável.
    // Devolve só id e nome: a senha não pode ser enviada para a tela.
    app.get("/usuarios", async (req, res) => {
        try {
            const conexao = await abrirConexao();

            const resultado = await conexao.execute(
                `SELECT id AS "id", nome AS "nome" FROM usuario ORDER BY nome`
            );

            await conexao.close();
            res.status(200).json(resultado.rows);
        } catch (erro) {
            res.status(500).json({ mensagem: "Erro ao buscar os usuários." });
        }
    });



    // POST /demandas: cadastra uma nova demanda no banco
    app.post("/demandas", async (req, res) => {
        // Dados enviados no corpo da requisição (ou objeto vazio, se não vier nada)
        const dados = req.body || {};

        // Lista pra guardar as mensagens de erro
        const erros: string[] = [];

        if (estaVazio(dados.titulo)) {
            erros.push("O título é obrigatório.");
        }

        if (estaVazio(dados.descricao)){
            erros.push("A descrição é obrigatória.");
        }

        if (estaVazio(dados.tipo)){
            erros.push("O tipo é obrigatório.");
        }else if(!TIPOS.includes(dados.tipo)){
            erros.push("Tipo inválido. Use: Tarefa, Defeito, Melhoria ou Documentação.");
        }

        if (estaVazio(dados.prioridade)){
            erros.push("A prioridade é obrigatória.");
        }else if(!PRIORIDADES.includes(dados.prioridade)){
            erros.push("Prioridade inválida. Use: Crítica, Alta, Média ou Baixa.");
        }

        // Prazo: opcional, mas se vier precisa estar no formato AAAA-MM-DD
        if (!estaVazio(dados.prazo)) {
            const prazo = String(dados.prazo);

            if (prazo.length !== 10 || prazo[4] !== "-" || prazo[7] !== "-") {
                erros.push("Prazo inválido. Use o formato AAAA-MM-DD.");
            }
        }

        try {
            const conexao = await abrirConexao();

            // Projeto: obrigatório e precisa existir no banco
            if (estaVazio(dados.projetoId)) {
                erros.push("O projeto é obrigatório.");
            } else {
                const projeto = await conexao.execute(
                    `SELECT id FROM projeto WHERE id = :id`,
                    [Number(dados.projetoId)]
                );

                // rows pode vir vazio (nenhuma linha) ou undefined, por isso testa os dois
                if (!projeto.rows || projeto.rows.length === 0) {
                    erros.push("Projeto não encontrado.");
                }
            }

            // Responsável: opcional, mas se vier precisa existir no banco
            if (!estaVazio(dados.responsavelId)) {
                const responsavel = await conexao.execute(
                    `SELECT id FROM usuario WHERE id = :id`,
                    [Number(dados.responsavelId)]
                );

                if (!responsavel.rows || responsavel.rows.length === 0) {
                    erros.push("Responsável não encontrado.");
                }
            }

            // Se tiver algum erro, fecha a conexão, responde 400 e para aqui
            if (erros.length > 0) {
                await conexao.close();
                res.status(400).json({ "mensagem": "Dados inválidos.", erros });
                return;
            }

            // Responsável e prazo são opcionais: se não vierem, ficam null
            let responsavelId: number | null = null;
            if (!estaVazio(dados.responsavelId)) {
                responsavelId = Number(dados.responsavelId);
            }

            let prazo: string | null = null;
            if (!estaVazio(dados.prazo)) {
                prazo = String(dados.prazo);
            }

            // Grava a demanda. O banco preenche sozinho: status "Aberta" e as datas (DEFAULT na tabela).
            // RETURNING id INTO :id devolve o id que o banco gerou.
            const insercao = await conexao.execute<any>(
                `INSERT INTO demanda (titulo, descricao, tipo, prioridade, projeto_id, responsavel_id, prazo)
                 VALUES (:titulo, :descricao, :tipo, :prioridade, :projetoId, :responsavelId, TO_DATE(:prazo, 'YYYY-MM-DD'))
                 RETURNING id INTO :id`,
                {
                    titulo: String(dados.titulo).trim(),
                    descricao: String(dados.descricao).trim(),
                    tipo: dados.tipo,
                    prioridade: dados.prioridade,
                    projetoId: Number(dados.projetoId),
                    responsavelId: responsavelId,
                    prazo: prazo,
                    id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
                },
                { autoCommit: true }
            );

            const novoId = insercao.outBinds.id[0];

            // Busca a demanda que acabou de ser criada, já com as datas no formato AAAA-MM-DD
            const resultado = await conexao.execute(
                `SELECT id AS "id", titulo AS "titulo", descricao AS "descricao", tipo AS "tipo",
                        prioridade AS "prioridade", status AS "status",
                        projeto_id AS "projetoId", responsavel_id AS "responsavelId",
                        TO_CHAR(data_criacao, 'YYYY-MM-DD') AS "dataCriacao",
                        TO_CHAR(data_atualizacao, 'YYYY-MM-DD') AS "dataAtualizacao",
                        TO_CHAR(prazo, 'YYYY-MM-DD') AS "prazo"
                 FROM demanda WHERE id = :id`,
                [novoId]
            );

            await conexao.close();

            // Responde 201 (Created) com a demanda criada
            const linhas = resultado.rows || [];
            res.status(201).json(linhas[0]);
        } catch (erro) {
            res.status(500).json({ mensagem: "Erro ao cadastrar a demanda." });
        }
    });

}
