<<<<<<< Updated upstream

/*
Autor: Caio Aragão
Responsável por buscar as demandas no banco de dados.
A consulta será implementada quando o banco estiver pronto.
*/

=======
>>>>>>> Stashed changes
import { Demanda } from "../types/demanda";

export async function buscarTodasDemandas(): Promise<Demanda[]> {
<<<<<<< Updated upstream
    // A consulta ao banco será adicionada posteriormente.
    throw new Error("Consulta ao banco de dados ainda não configurada.");
}
=======
    const conexao = await abrirConexao();
    try {
        const sql = `
            SELECT 
                d.id, 
                d.titulo, 
                d.descricao, 
                d.tipo, 
                d.prioridade, 
                d.status, 
                p.nome AS "projeto", 
                u.nome AS "responsavel", 
                TO_CHAR(d.data_criacao, 'YYYY-MM-DD') AS "dataCriacao", 
                TO_CHAR(d.prazo, 'YYYY-MM-DD') AS "prazoFinalizacao"
            FROM demanda d
            INNER JOIN projeto p ON d.projeto_id = p.id
            LEFT JOIN usuario u ON d.responsavel_id = u.id
        `;
        const resultado = await conexao.execute(sql);
        return resultado.rows as Demanda[];
    } catch (erro) {
        console.error("Erro ao buscar demandas no banco:", erro);
        throw erro;
    } finally {
        await conexao.close();
    }
}
>>>>>>> Stashed changes
