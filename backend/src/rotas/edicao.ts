// AUTOR: Leonardo Furlan Curtulo
// DESCRIÇÃO: Rotas da edição de demanda: busca uma demanda pelo id (GET /demandas/:id) e, nas próximas etapas, a edição (PUT /demandas/:id), usando o banco Oracle


// Importa as listas de validação (tipos e prioridades aceitos)
import { TIPOS, PRIORIDADES } from "../data/dados";

// Importa o tipo Express (o tipo do app, que vem do index.ts)
import { Express } from "express";


// Importa a função que abre a conexão com o banco
import { abrirConexao } from "../banco/conexao";


// Registra as rotas da edição no app (chamada no index.ts)
export function rotasEdicao(app: Express) {


    // GET /demandas/:id: busca UMA demanda pelo id, já com o nome do projeto e do responsável
    app.get("/demandas/:id", async (req, res) => {
        const id = Number(req.params.id);

        // Se não for um número (ex.: "/demandas/abc"), nem consulta o banco
        if (isNaN(id)){
            res.status(400).json({ mensagem: "Id inválido." });
            return;
        }

        try {
            const conexao = await abrirConexao();

            // INNER JOIN com projeto: toda demanda TEM projeto (é obrigatório)
            // LEFT JOIN com usuario: o responsável é opcional; sem LEFT, demandas sem responsável sumiriam
            const resultado = await conexao.execute(
                `SELECT d.id AS "id", d.titulo AS "titulo", d.descricao AS "descricao",
                        d.tipo AS "tipo", d.prioridade AS "prioridade", d.status AS "status",
                        d.projeto_id AS "projetoId", p.nome AS "projeto",
                        d.responsavel_id AS "responsavelId", u.nome AS "responsavel",
                        TO_CHAR(d.data_criacao, 'YYYY-MM-DD') AS "dataCriacao",
                        TO_CHAR(d.data_atualizacao, 'YYYY-MM-DD') AS "dataAtualizacao",
                        TO_CHAR(d.prazo, 'YYYY-MM-DD') AS "prazo"
                 FROM demanda d
                 INNER JOIN projeto p ON d.projeto_id = p.id
                 LEFT JOIN usuario u ON d.responsavel_id = u.id
                 WHERE d.id = :id`,
                [id]
            );


            await conexao.close();

            const linhas = resultado.rows || [];

            // Nenhuma linha: não existe demanda com esse id
            if (linhas.length === 0) {
                res.status(404).json({ mensagem: "Demanda não encontrada." });
                return;
            }

            // Achou: devolve a demanda (é sempre uma só, por isso linhas[0])
            res.status(200).json(linhas[0]);
        } catch (erro) {
            res.status(500).json({ mensagem: "Erro ao buscar a demanda." });
        }
    });

    // PUT /demandas/:id: edita os dados de uma demanda
    app.put("/demandas/:id", async (req, res) =>{
        const id = Number(req.params.id);

        const dados = req.body || {};

        const erros: string[] = [];


        if (isNaN(id)) {
            res.status(400).json({ mensagem: "Id inválido." });
            return;
        }

        if (dados.titulo === undefined || String(dados.titulo).trim() === "") {
            erros.push("O título é obrigatório.");
        }
        if (dados.descricao === undefined || String(dados.descricao).trim() === "") {
            erros.push("A descrição é obrigatória.");
        }
        if (!TIPOS.includes(dados.tipo)) {
            erros.push("Tipo inválido. Use: Tarefa, Defeito, Melhoria ou Documentação.");
        }
        if (!PRIORIDADES.includes(dados.prioridade)) {
            erros.push("Prioridade inválida. Use: Crítica, Alta, Média ou Baixa.");
        }

        let prazo: string | null = null;
        if (dados.prazo !== undefined && dados.prazo !== null && String(dados.prazo) !== "") {
            prazo = String(dados.prazo);

            if (prazo.length !== 10 || prazo[4] !== "-" || prazo[7] !== "-") {
                erros.push("Prazo inválido. Use o formato AAAA-MM-DD.");
            }
        }

        let responsavelId: number | null = null;
        if (dados.responsavelId !== undefined && dados.responsavelId !== null && String(dados.responsavelId) !== "") {
            responsavelId = Number(dados.responsavelId);
        }

        if (erros.length > 0) {
            res.status(400).json({ mensagem: "Dados inválidos.", erros });
            return;
        }

        let conexao;
        try {
            conexao = await abrirConexao();

            const resultado = await conexao.execute(
                `UPDATE demanda
                 SET titulo = :titulo,
                     descricao = :descricao,
                     tipo = :tipo,
                     prioridade = :prioridade,
                     responsavel_id = :responsavelId,
                     prazo = TO_DATE(:prazo, 'YYYY-MM-DD'),
                     data_atualizacao = SYSDATE
                 WHERE id = :id`,
                {
                    titulo: String(dados.titulo).trim(),
                    descricao: String(dados.descricao).trim(),
                    tipo: dados.tipo,
                    prioridade: dados.prioridade,
                    responsavelId: responsavelId,
                    prazo: prazo,
                    id: id
                },
                { autoCommit: true }
            );

            // Nenhuma linha alterada: não existe demanda com esse id
            if (resultado.rowsAffected === 0) {
                res.status(404).json({ mensagem: "Demanda não encontrada." });
                return;
            }

            res.status(200).json({ mensagem: "Demanda atualizada com sucesso." });
        }catch (erro) {
            res.status(500).json({ mensagem: "Erro ao atualizar a demanda." });
        } finally {
            // Fecha a conexão sempre, dando certo ou errado
            if (conexao) {
                await conexao.close();
            }
        }
    });
    
    app.put("/demandas/:id/status", async (req, res) => {

    const id = Number(req.params.id);
    const novoStatus = String(req.body.status || "");

    if (isNaN(id)) {
        res.status(400).json({
            mensagem: "Id inválido."
        });
        return;
    }

    if (!req.session.usuario) {
        res.status(401).json({
            mensagem: "Faça login para continuar."
        });
        return;
    }

    const statusPermitidos = [
        "Aberta",
        "Em andamento",
        "Em revisão",
        "Concluída",
        "Cancelada"
    ];

    if (!statusPermitidos.includes(novoStatus)) {
        res.status(400).json({
            mensagem: "Status inválido."
        });
        return;
    }

    res.status(200).json({
        mensagem: "Validação do status realizada com sucesso.",
        statusSolicitado: novoStatus
    });

});
}