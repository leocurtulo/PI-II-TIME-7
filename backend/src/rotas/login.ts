import { Express } from "express";
import { usuarios } from "../data/dados";

export function rotasLogin(app: Express) {

    app.get("/usuarios", (req, res) => {

        const lista = usuarios.map(usuario => ({
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            perfil: usuario.perfil
        }));

        res.status(200).json(lista);
    });

    app.post("/login", (req, res) => {

        const { email, senha } = req.body || {};

        if (!email || !senha) {
            res.status(400).json({
                mensagem: "E-mail e senha são obrigatórios."
            });
            return;
        }

        const usuario = usuarios.find(
            usuario =>
                usuario.email === email &&
                usuario.senha === senha
        );

        if (!usuario) {
            res.status(401).json({
                mensagem: "Credenciais inválidas."
            });
            return;
        }

        res.status(200).json({
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            perfil: usuario.perfil
        });
    });

}