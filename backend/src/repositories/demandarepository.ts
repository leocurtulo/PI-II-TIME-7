/*
Autor: Caio Aragão
Responsável por buscar as demandas no banco de dados.
*/

import { Demanda } from "../types/demanda";
import { abrirConexao } from "../banco/conexao";

export async function buscarTodasDemandas(): Promise<Demanda[]> {
    const conexao = await abrirConexao();
    try {
        const resultado = await conexao.execute("SELECT * FROM demandas");
        return resultado.rows as Demanda[];
    } catch (erro) {
        console.error("Erro ao buscar demandas no banco:", erro);
        throw erro;
    } finally {
        await conexao.close();
    }
}
