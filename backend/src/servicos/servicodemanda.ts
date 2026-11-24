/*
Autor: Caio Ferreira Aragão
DESCRIÇÃO: Filtros, busca por título ou descrição e ordenação da listagem de demandas.
*/

import { Demanda } from "../types/demanda";
import { buscarTodasDemandas } from "../repositories/demandarepository";

export class ErroFiltroDemanda extends Error {
    constructor(mensagem: string) {
        super(mensagem);
        this.name = "ErroFiltroDemanda";
    }
}

export interface FiltrosDemanda {
    status?: string;
    prioridade?: string;
    tipo?: string;
    responsavel?: string;
    projeto?: string;
    busca?: string;
    ordenarPor?: string;
}

export interface UsuarioLogado {
    id: number;
    perfil: string;
}

function texto(valor: string | null | undefined): string {
    return (valor ?? "").toLocaleLowerCase("pt-BR");
}

// Prazo vazio vai para o fim, para o mais próximo aparecer primeiro.
function chavePrazo(valor: string | null | undefined): string {
    if (!valor || valor.trim() === "") {
        return "9999-99-99";
    }
    return valor;
}

export async function listarDemandas(filtros: FiltrosDemanda, usuario?: UsuarioLogado): Promise<Demanda[]> {
    let demandas = await buscarTodasDemandas(usuario);

    if (filtros.status) {
        demandas = demandas.filter((demanda) => demanda.status === filtros.status);
    }

    if (filtros.prioridade) {
        demandas = demandas.filter((demanda) => demanda.prioridade === filtros.prioridade);
    }

    if (filtros.tipo) {
        demandas = demandas.filter((demanda) => demanda.tipo === filtros.tipo);
    }

    if (filtros.responsavel) {
        demandas = demandas.filter((demanda) => demanda.responsavel === filtros.responsavel);
    }

    if (filtros.projeto) {
        demandas = demandas.filter((demanda) => demanda.projeto === filtros.projeto);
    }

    if (filtros.busca) {
        const termo = filtros.busca.toLocaleLowerCase("pt-BR");
        demandas = demandas.filter((demanda) =>
            texto(demanda.titulo).includes(termo) || texto(demanda.descricao).includes(termo)
        );
    }

    // Crítica é a mais urgente. Antes ela caía no final porque não tinha peso.
    if (filtros.ordenarPor === "prioridade") {
        const ordem: Record<string, number> = {
            "Crítica": 1,
            "Alta": 2,
            "Média": 3,
            "Baixa": 4
        };

        demandas.sort((a, b) => (ordem[a.prioridade] || 99) - (ordem[b.prioridade] || 99));
    } else if (filtros.ordenarPor === "criacao") {
        demandas.sort((a, b) => (a.dataCriacao || "").localeCompare(b.dataCriacao || ""));
    } else if (filtros.ordenarPor === "status") {
        demandas.sort((a, b) => (a.status || "").localeCompare(b.status || "", "pt-BR"));
    } else if (filtros.ordenarPor === "prazo") {
        demandas.sort((a, b) => chavePrazo(a.prazoFinalizacao).localeCompare(chavePrazo(b.prazoFinalizacao)));
    }

    return demandas;
}
