
/*
Autor: Caio Aragão
Responsável pelos filtros, busca e ordenação das demandas.
*/

import { Demanda } from "../types/demanda";
import { buscarTodasDemandas } from "../repositories/demandarepository";

export interface FiltrosDemanda {
    status?: string;
    prioridade?: string;
    tipo?: string;
    responsavel?: string;
    projeto?: string;
    busca?: string;
    ordenarPor?: string;
}

export async function listarDemandas(filtros: FiltrosDemanda): Promise<Demanda[]> {
    let demandas = await buscarTodasDemandas();

    if (filtros.status) {
        demandas = demandas.filter(d => d.status === filtros.status);
    }

    if (filtros.prioridade) {
        demandas = demandas.filter(d => d.prioridade === filtros.prioridade);
    }

    if (filtros.tipo) {
        demandas = demandas.filter(d => d.tipo === filtros.tipo);
    }

    if (filtros.responsavel) {
        demandas = demandas.filter(d => d.responsavel === filtros.responsavel);
    }

    if (filtros.projeto) {
        demandas = demandas.filter(d => d.projeto === filtros.projeto);
    }

    if (filtros.busca) {
        const termo = filtros.busca.toLowerCase();

        demandas = demandas.filter(d =>
            d.titulo.toLowerCase().includes(termo) ||
            d.descricao.toLowerCase().includes(termo)
        );
    }

    // Ordenação das demandas.
    if (filtros.ordenarPor === "prazo") {
        demandas.sort((a, b) =>
            (a.prazoFinalizacao || "").localeCompare(b.prazoFinalizacao || "")
        );
    }

    if (filtros.ordenarPor === "criacao") {
        demandas.sort((a, b) =>
            a.dataCriacao.localeCompare(b.dataCriacao)
        );
    }

    if (filtros.ordenarPor === "prioridade") {
        const ordem: Record<string, number> = {
            Alta: 1,
            Média: 2,
            Baixa: 3
        };

        demandas.sort((a, b) =>
            (ordem[a.prioridade] || 99) - (ordem[b.prioridade] || 99)
        );
    }

    if (filtros.ordenarPor === "status") {
        demandas.sort((a, b) => a.status.localeCompare(b.status));
    }

    return demandas;
}
