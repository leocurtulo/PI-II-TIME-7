
/*
Autor: Caio Ferreira Aragão
DESCRIÇÃO: Lê as demandas no Oracle para a listagem, já com projeto e responsável.
*/

import { Demanda } from "../types/demanda";
import { abrirConexao } from "../banco/conexao";

export interface UsuarioLogado {
    id: number;
    perfil: string;
}

export async function buscarTodasDemandas(usuario?: UsuarioLogado): Promise<Demanda[]> {
    const conexao = await abrirConexao();

    try {
        const restringirPorProjeto = !!usuario && usuario.perfil !== "Administrador";

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
            ${restringirPorProjeto ? "INNER JOIN projeto_usuario pu ON pu.projeto_id = d.projeto_id AND pu.usuario_id = :usuarioId" : ""}
        `;

        const binds = restringirPorProjeto ? { usuarioId: usuario!.id } : {};
        const resultado = await conexao.execute(sql, binds);
        return (resultado.rows ?? []) as Demanda[];
    } catch (erro) {
        console.error("Erro ao buscar demandas no banco:", erro);
        throw erro;
    } finally {
        await conexao.close();
    }
}
