// AUTOR: Augusto Brufato
// DESCRIÇÃO: Rotas de detalhes da demanda e comentários

import { Express } from "express";
import { abrirConexao } from "../banco/conexao";
import { exigirLogin } from "./autenticacao";

export function rotasDetalhesEComentarios(app: Express) {

   
    

    // lista os comentários da demanda, do mais novo para o mais antigo
    app.get("/demandas/:id/comentarios",exigirLogin, async (req, res) => {

        const id = Number(req.params.id);

        try {

    const conexao = await abrirConexao();
    
    // Junta com a tabela usuario para mostrar o nome de quem comentou
    const resultado = await conexao.execute(
        `SELECT
            c.id AS "id",
            c.demanda_id AS "demandaId",
            c.usuario_id AS "usuarioId",
            u.nome AS "nome",
            c.texto AS "texto",
            c.data_hora AS "dataHora"
         FROM comentario c
         INNER JOIN usuario u
            ON u.id = c.usuario_id
         WHERE c.demanda_id = :id
         ORDER BY c.data_hora DESC`,
        [id]
    );

    await conexao.close();

    res.status(200).json(resultado.rows);

} catch (erro) {

    res.status(500).json({
        mensagem: "Erro ao carregar comentários."
    });

}
    });

    //lista as alterações feitas na demanda (gravadas pela edição e pelo status)
    app.get("/demandas/:id/historico",exigirLogin, async (req, res) => {

    const id = Number(req.params.id);

    try {

        const conexao = await abrirConexao();

        const resultado = await conexao.execute(
            `SELECT
                h.id AS "id",
                u.nome AS "usuario",
                h.campo AS "campo",
                h.valor_anterior AS "valorAnterior",
                h.valor_novo AS "valorNovo",
                TO_CHAR(FROM_TZ(h.data_hora, 'UTC') AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI') AS "dataHora"
             FROM historico h
             INNER JOIN usuario u
                ON u.id = h.usuario_id
             WHERE h.demanda_id = :id
             ORDER BY h.data_hora DESC`,
            [id]
        );

        await conexao.close();

        res.status(200).json(resultado.rows);

    } catch (erro) {

        console.error(erro);

        res.status(500).json({
            mensagem: "Erro ao carregar histórico."
        });

    }

});

    
    //salva um comentário feito pelo usuário logado
    app.post("/demandas/:id/comentarios", async (req, res) => {

        const id = Number(req.params.id);

        const dados = req.body || {};

        if (!req.session.usuario) {
        res.status(401).json({
            mensagem: "Usuário não autenticado."
        });
        return;
    }


    // Comentário vazio não é aceito
    if (
        dados.texto === undefined ||
        String(dados.texto).trim() === ""
    ) {
        res.status(400).json({
            mensagem: "Comentário não pode ser vazio."
        });
        return;
    }

    try {

        const conexao = await abrirConexao();

        await conexao.execute(
            `INSERT INTO comentario (
                demanda_id,
                usuario_id,
                texto
            )
            VALUES (
                :demandaId,
                :usuarioId,
                :texto
            )`,
            {
                demandaId: id,
                usuarioId: req.session.usuario.id,
                texto: String(dados.texto).trim()
            },
            {
                autoCommit: true
            }
        );

        await conexao.close();

        res.status(201).json({
            mensagem: "Comentário cadastrado com sucesso."
        });

    } catch (erro) {

        console.error(erro);

        res.status(500).json({
            mensagem: "Erro ao salvar comentário."
        });

    }

});
}
