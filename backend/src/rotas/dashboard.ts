// AUTOR: Vinicius Pansieri Chiarelli
// DESCRIÇÃO: Rota do Dashboard (busca as demandas no banco Oracle)

import { Express } from "express";
import { abrirConexao } from "../banco/conexao";

export function rotasDashboard(app: Express) {

    // GET /dashboard: devolve as demandas para a tela calcular os totais
    app.get("/dashboard", async (req, res) => {
        try {
            const conexao = await abrirConexao();

            const resultado = await conexao.execute(
                `SELECT id AS "id", titulo AS "titulo", tipo AS "tipo",
                        prioridade AS "prioridade", status AS "status",
                        TO_CHAR(prazo, 'YYYY-MM-DD') AS "prazo"
                 FROM demanda
                 ORDER BY id`
            );

            await conexao.close();
            res.status(200).json(resultado.rows);
        } catch (erro) {
            res.status(500).json({ mensagem: "Erro ao carregar o dashboard." });
        }
    });

}