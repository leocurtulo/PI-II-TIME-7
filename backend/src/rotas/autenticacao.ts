// AUTOR: Leonardo Furlan Curtulo
// DESCRIÇÃO: Sessão do usuário logado: GET /sessao (quem está logado),
// POST /logout (encerra a sessão) e o middleware exigirLogin (barra quem não está logado)

import { Express, Request, Response, NextFunction } from "express";


// Dados do usuário que ficam guardados na sessão depois do login
export interface UsuarioSessao {
    id: number;
    nome: string;
    email: string;
    perfil: string;
}



// Ensina ao TypeScript que a sessão pode guardar um "usuario"
declare module "express-session" {
    interface SessionData {
        usuario?: UsuarioSessao;
    }
}


// Middleware: roda antes da rota. Se ninguém estiver logado, responde 401 e a rota não executa
export function exigirLogin(req: Request, res: Response, next: NextFunction) {
    if(!req.session.usuario){
        res.status(401).json({mensagem: "Faça login para continuar."});
        return;
    }


    // Está logado: libera a rota
    next();
}


// Registra as rotas da sessão no app (chamada no index.ts)
export function rotasAutenticacao(app: Express) {

     // GET /sessao: devolve o usuário logado (usado pelas telas para saber quem está logado)
    app.get("/sessao", exigirLogin, (req, res) => {
        res.status(200).json(req.session.usuario);
    });


    // POST /logout: apaga a sessão no servidor e o cookie no navegador
    app.post("/logout", exigirLogin, (req, res) => {
        req.session.destroy((erro) => {
            if (erro){
                res.status(500).json({ mensagem: "Erro ao encerrar a sessão." });
                return;
            }
            res.clearCookie("sistema.sid");

            res.status(200).json({mensagem: "Sessão encerrada."});
        });
    });
}