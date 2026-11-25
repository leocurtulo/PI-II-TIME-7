// AUTOR: Vinicius Pansieri Chiarelli
// DESCRIÇÃO: Rota do Dashboard (busca as demandas no banco Oracle)

import { Express } from "express";
import { abrirConexao } from "../banco/conexao";
import { exigirLogin } from "./autenticacao";

export function rotasDashboard(app: Express) {

    // GET /dashboard: devolve as demandas para a tela calcular os totais
    app.get("/dashboard",exigirLogin, async (req, res) => {

        const usuario = req.session.usuario;
        if(!usuario){
            res.status(401).json({mensagem: "Faça login para continuar."});
            return;
        }

        try {
            const conexao = await abrirConexao();

            let resultado;

            // Administrador vê todas; os outros só as dos projetos em que estão vinculados
            if(usuario.perfil === "Administrador"){
                resultado = await conexao.execute(
                    `SELECT id AS "id", titulo AS "titulo", tipo AS "tipo",
                    prioridade AS "prioridade", status AS "status",
                    TO_CHAR(prazo, 'YYYY-MM-DD') AS "prazo"
                    FROM demanda ORDER BY id`
                );
            }else{
                resultado = await conexao.execute(
                    `SELECT d.id AS "id", d.titulo AS "titulo", d.tipo AS "tipo",
                    d.prioridade AS "prioridade", d.status AS "status",
                    TO_CHAR(d.prazo, 'YYYY-MM-DD') AS "prazo"
                    FROM demanda d
                    INNER JOIN projeto_usuario pu ON pu.projeto_id = d.projeto_id
                    WHERE pu.usuario_id = :usuarioId
                    ORDER BY d.id`,
                    {usuarioId: usuario.id}
                );
            }

            await conexao.close();
            res.status(200).json(resultado.rows);
        } catch (erro) {
            res.status(500).json({ mensagem: "Erro ao carregar o dashboard." });
        }
    });

}