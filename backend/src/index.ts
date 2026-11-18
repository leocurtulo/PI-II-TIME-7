// AUTOR: Leonardo Furlan Curtulo
// DESCRIÇÃO: Cria o servidor express, configura a leitura de JSON, registra as rotas e liga o servidor em uma porta

// Importa a biblioteca
import express from "express";

// Importa o CORS (libera a tela, que roda em outra porta, a chamar a API)
import cors from "cors";

// Importa o express-session (guarda no servidor quem está logado)
import session from "express-session";

// Carrega as variáveis do .env (inclusive o SESSION_SECRET)
import "dotenv/config";

// Importa o path (monta o caminho da pasta das telas)
import path from "node:path";

// Importa as rotas de cada tela
import { rotasCadastro } from "./rotas/cadastro";
import { rotasLogin } from "./rotas/login";
import { rotasDetalhesEComentarios } from "./rotas/comentarios";

import { rotasDashboard } from "./rotas/dashboard";

import { rotasEdicao } from "./rotas/edicao";

import { rotasAutenticacao } from "./rotas/autenticacao";

import { abrirConexao } from "./banco/conexao";
// Import do serviço de demandas
import { listarDemandas } from "./servicos/servicodemanda";

// Cria a aplicação (o servidor) Express
const app = express();

// Permite que as telas do front (ex.: Live Server na porta 5500) chamem a API
app.use(cors());

// Permite que o servidor leia JSON
app.use(express.json());


// Segredo que assina o cookie da sessão (fica no .env, nunca no código)
const segredo = process.env.SESSION_SECRET;
if (!segredo) {
    throw new Error("Defina SESSION_SECRET no arquivo .env.");
}

// Configura a sessão 
app.use(session({
    name: "sistema.sid",
    secret: segredo,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: false, // Ambiente local (HTTP). Em produção, com HTTPS, seria true
        maxAge: 30 * 60 * 1000 // 30 minutos
    }
}));

// Porta em que o servidor vai rodar (http://localhost:3000)
const PORTA = 3000;

// Registra as rotas da tela de cadastro (GET /projetos e POST /demandas)
rotasCadastro(app);

// Registra as rotas da sessão (GET /sessao e POST /logout)
rotasAutenticacao(app);


// Registra as rotas da edição (GET /demandas/:id)
rotasEdicao(app);



rotasLogin(app);
rotasDetalhesEComentarios(app);




rotasDashboard(app);

// Rota de teste: confirma que o servidor está funcionando
app.get("/", (req, res) => {
    res.send("Servidor do Sistema de Acompanhamento de Demandas funcionando!");
});

// rota para testar a conexão com o banco
app.get("/teste-banco", async (req, res) => {
    try {
        const conexao = await abrirConexao();
        const resultado = await conexao.execute("SELECT * FROM projeto");
        await conexao.close();
        res.status(200).json(resultado.rows);
    } catch (erro) {
        res.status(500).json({ mensagem: "Erro ao conectar no banco.", erro: String(erro) });
    }
});

// Rota da API para listagem de demandas
app.get("/api/demandas", async (req, res) => {
    try {
        const demandas = await listarDemandas(req.query);
        res.status(200).json(demandas);
    } catch (erro) {
        res.status(500).json({ mensagem: "Erro ao listar demandas", erro: String(erro) });
    }
});


// Pasta raiz do projeto, onde ficam os HTML, o style.css e a pasta js
// (__dirname é a pasta backend/lib, onde o index.js compilado roda; "../.." sobe até a raiz)
const pastaTelas = path.resolve(__dirname, "../..");

// Bloqueia o acesso à pasta backend pelo navegador (código e configurações do servidor)
app.use("/backend", (req, res) => {
    res.status(404).end();
});


// Serve as telas pelo próprio Express (ex.: http://localhost:3000/login.html)
// dotfiles: "deny" bloqueia arquivos que começam com ponto, como o .env e a pasta .git
app.use(express.static(pastaTelas, { dotfiles: "deny" }));


// Liga o servidor e fica esperando requisições na porta definida
app.listen(PORTA, () => {
    console.log(`Servidor ativo na porta ${PORTA}`);
});
