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
        return resultado.rows as Demanda[];
    } catch (erro) {
        console.error("Erro ao buscar demandas no banco:", erro);
        throw erro;
    } finally {
        await conexao.close();
    }
}