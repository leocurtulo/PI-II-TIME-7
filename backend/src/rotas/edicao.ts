// AUTOR: Leonardo Furlan Curtulo
// DESCRIÇÃO: Rotas da edição de demanda: busca uma demanda pelo id (GET /demandas/:id)
// e, nas próximas etapas, a edição (PUT /demandas/:id), usando o banco Oracle


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
}