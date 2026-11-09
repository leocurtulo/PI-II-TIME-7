
/*
Autor: Caio Aragão
Cria a rota GET /demandas para listar as demandas.
*/

import { Router, Request, Response } from "express";
import { listarDemandas } from "../servicos/servicodemanda";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
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
        res.status(503).json({
            mensagem: "Não foi possível consultar as demandas."
        });
    }
});

export default router;
