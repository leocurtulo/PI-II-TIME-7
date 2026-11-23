<<<<<<< Updated upstream
// Autor: Caio Ferreira Aragão
// Define a estrutura de uma demanda.

export interface Demanda {
    id: number;
    titulo: string;
    descricao: string;
    tipo: string;
    prioridade: string;
    status: string;
    projeto: string;
    responsavel: string | null;
    dataCriacao: string;
    prazoFinalizacao: string | null;
}
=======
/*
Autor: Caio Ferreira Aragão
DESCRIÇÃO: Lê as demandas no Oracle para a listagem, já com projeto e responsável.
*/

import { Demanda } from "../types/demanda";
import { abrirConexao } from "../banco/conexao";

export async function buscarTodasDemandas(): Promise<Demanda[]> {
    const conexao = await abrirConexao();

    try {
        const sql = `
            SELECT
                d.id AS "id",
                d.titulo AS "titulo",
                d.descricao AS "descricao",
                d.tipo AS "tipo",
                d.prioridade AS "prioridade",
                d.status AS "status",
                p.nome AS "projeto",
                u.nome AS "responsavel",
                TO_CHAR(d.data_criacao, 'YYYY-MM-DD') AS "dataCriacao",
                TO_CHAR(d.prazo, 'YYYY-MM-DD') AS "prazoFinalizacao"
            FROM demanda d
            INNER JOIN projeto p ON d.projeto_id = p.id
            LEFT JOIN usuario u ON d.responsavel_id = u.id
        `;

        const resultado = await conexao.execute(sql);
        return (resultado.rows ?? []) as Demanda[];
    } catch (erro) {
        console.error("Erro ao buscar demandas no banco:", erro);
        throw erro;
    } finally {
        await conexao.close();
    }
}
>>>>>>> Stashed changes
