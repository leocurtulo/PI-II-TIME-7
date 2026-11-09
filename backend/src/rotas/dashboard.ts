// AUTOR: Vinicius Pansieri Chiarelli
// DESCRIÇÃO: Rotas do Dashboard

import { Express } from "express";
import { demandas } from "../data/dados";

export function rotasDashboard(app: Express) {

    app.get("/dashboard", (req, res) => {

        const abertas =
            demandas.filter(d => d.status === "Aberta").length;

        const andamento =
            demandas.filter(d => d.status === "Em andamento").length;

        const revisao =
            demandas.filter(d => d.status === "Em revisão").length;

        const concluidas =
            demandas.filter(d => d.status === "Concluída").length;

        const canceladas =
            demandas.filter(d => d.status === "Cancelada").length;

        const prioridades = {
            critica: demandas.filter(d => d.prioridade === "Crítica").length,
            alta: demandas.filter(d => d.prioridade === "Alta").length,
            media: demandas.filter(d => d.prioridade === "Média").length,
            baixa: demandas.filter(d => d.prioridade === "Baixa").length
        };

        const tipos = {
            tarefa: demandas.filter(d => d.tipo === "Tarefa").length,
            defeito: demandas.filter(d => d.tipo === "Defeito").length,
            melhoria: demandas.filter(d => d.tipo === "Melhoria").length,
            documentacao: demandas.filter(d => d.tipo === "Documentação").length
        };

        const criticasEmAberto =
            demandas.filter(
                d =>
                    d.prioridade === "Crítica" &&
                    d.status !== "Concluída" &&
                    d.status !== "Cancelada"
            );

        const hoje = new Date();

        const proximasDoPrazo =
            demandas.filter(d => {

                if (!d.prazo) {
                    return false;
                }

                if (
                    d.status === "Concluída" ||
                    d.status === "Cancelada"
                ) {
                    return false;
                }

                const prazo = new Date(d.prazo);

                const diferencaDias =
                    (prazo.getTime() - hoje.getTime()) /
                    (1000 * 60 * 60 * 24);

                return diferencaDias <= 7;
            });

        res.status(200).json(demandas);

    });

}