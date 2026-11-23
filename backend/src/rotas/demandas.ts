
/*
Autor: Caio Ferreira Aragão
DESCRIÇÃO: Registra as rotas GET para listagem, filtros, busca e ordenação das demandas.
*/

import { Express, Request, Response } from "express";
import { listarDemandas } from "../servicos/servicodemanda";

export function rotasListagem(app: Express) {
    const handler = async (req: Request, res: Response) => {
        try {
            const filtros = {
                status: req.query.status as string,
                prioridade: req.query.prioridade as string,
                tipo: req.query.tipo as string,
                responsavel: req.query.responsavel as string,
                projeto: req.query.projeto as string,
                busca: req.query.busca as string,
                ordenarPor: req.query.ordenarPor as string
            };

            const demandas = await listarDemandas(filtros);

            res.status(200).json(demandas);
        } catch (erro) {
            console.error("Erro ao listar demandas:", erro);

            res.status(503).json({
                mensagem: "Não foi possível consultar as demandas."
            });
        }
    };

    app.get("/demandas", handler);
    app.get("/api/demandas", handler);
}
