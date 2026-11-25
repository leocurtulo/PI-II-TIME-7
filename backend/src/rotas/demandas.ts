
/*
Autor: Caio Ferreira Aragão
DESCRIÇÃO: Registra as rotas GET para listagem, filtros, busca e ordenação das demandas.
*/

import { Express, Request, Response } from "express";
import { exigirLogin } from "./autenticacao";
import { listarDemandas } from "../servicos/servicodemanda";

export function rotasListagem(app: Express) {

    // Mesma função atende as duas rotas lá embaixo
    const handler = async (req: Request, res: Response) => {
        try {

            // Lê os filtros que vieram na URL (ex.: /demandas?status=Aberta&prioridade=Alta)
            const filtros = {
                status: req.query.status as string,
                prioridade: req.query.prioridade as string,
                tipo: req.query.tipo as string,
                responsavel: req.query.responsavel as string,
                projeto: req.query.projeto as string,
                busca: req.query.busca as string,
                ordenarPor: req.query.ordenarPor as string
            };

            // O perfil do usuário logado decide quais demandas ele pode ver
            const usuario = req.session.usuario!;
            const demandas = await listarDemandas(filtros, usuario);

            res.status(200).json(demandas);
        } catch (erro) {
            console.error("Erro ao listar demandas:", erro);

            res.status(503).json({
                mensagem: "Não foi possível consultar as demandas."
            });
        }
    };

    app.get("/demandas", exigirLogin, handler);
    app.get("/api/demandas", exigirLogin, handler);
}
