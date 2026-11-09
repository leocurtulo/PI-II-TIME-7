// AUTOR: Vitor Fachini Zanon
// DESCRIÇÃO: Rota de login, conferindo e-mail e senha no banco Oracle

import { Express } from "express";
import { abrirConexao } from "../banco/conexao";

export function rotasLogin(app: Express) {

    // POST /login: confere se existe um usuário com esse e-mail e essa senha
    app.post("/login", async (req, res) => {

        const { email, senha } = req.body || {};

        if (!email || !senha) {
            res.status(400).json({
                mensagem: "E-mail e senha são obrigatórios."
            });
            return;
        }

        try {
            const conexao = await abrirConexao();

            // Busca o usuário com esse e-mail e senha (a senha não volta na resposta)
            const resultado = await conexao.execute(
                `SELECT id AS "id", nome AS "nome", email AS "email", perfil AS "perfil"
                 FROM usuario
                 WHERE email = :email AND senha = :senha`,
                { email: email, senha: senha }
            );

            await conexao.close();

            const linhas = resultado.rows || [];

            // Nenhuma linha: e-mail ou senha errados
            if (linhas.length === 0) {
                res.status(401).json({
                    mensagem: "Credenciais inválidas."
                });
                return;
            }

            // Achou: devolve os dados do usuário (sem a senha)
            res.status(200).json(linhas[0]);
        } catch (erro) {
            res.status(500).json({
                mensagem: "Erro ao fazer login."
            });
        }
    });

}