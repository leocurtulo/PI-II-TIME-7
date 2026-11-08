// AUTOR: Augusto Brufato Pereira dos Santos
// DESCRIÇÃO: Conexão com o banco Oracle

import oracledb from "oracledb";
import dotenv from "dotenv";

// carrega os dados do arquivo .env
dotenv.config();

// faz o resultado das consultas vir como objeto
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

export async function abrirConexao() {
    return await oracledb.getConnection({
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        connectString: process.env.DB_CONNECT_STRING
    });
}