
// AUTOR: Leonardo Furlan Curtulo
// DESCRIÇÃO: Cria o servidor express, configura a leitura de JSON, registra as rotas e liga o servidor em uma porta

import express from "express";
import cors from "cors";
import session from "express-session";
import "dotenv/config";
import path from "node:path";

import { rotasCadastro } from "./rotas/cadastro";
import { rotasLogin } from "./rotas/login";
import { rotasDetalhesEComentarios } from "./rotas/comentarios";
import { rotasDashboard } from "./rotas/dashboard";
import { rotasEdicao } from "./rotas/edicao";
import { rotasAutenticacao } from "./rotas/autenticacao";
import { abrirConexao } from "./banco/conexao";
import { rotasStatus } from "./rotas/status";

// Listagem de demandas (Caio Ferreira Aragão)
import { rotasListagem } from "./rotas/demandas";

const app = express();

app.use(cors());
app.use(express.json());

const segredo = process.env.SESSION_SECRET;

if (!segredo) {
    throw new Error("Defina SESSION_SECRET no arquivo .env.");
}

app.use(session({
    name: "sistema.sid",
    secret: segredo,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        maxAge: 30 * 60 * 1000
    }
}));

const PORTA = 3000;

// Rotas do sistema
rotasCadastro(app);
rotasAutenticacao(app);
rotasEdicao(app);
rotasStatus(app);
rotasLogin(app);
rotasDetalhesEComentarios(app);
rotasDashboard(app);

// Listagem de demandas, filtros, busca e ordenação
rotasListagem(app);

// Rota inicial
app.get("/", (req, res) => {
    res.send("Servidor do Sistema de Acompanhamento de Demandas funcionando!");
});

// Teste de conexão com o banco
app.get("/teste-banco", async (req, res) => {
    try {
        const conexao = await abrirConexao();
        const resultado = await conexao.execute("SELECT * FROM projeto");
        await conexao.close();
        res.status(200).json(resultado.rows);
    } catch (erro) {
        res.status(500).json({
            mensagem: "Erro ao conectar no banco.",
            erro: String(erro)
        });
    }
});

// Caminho das telas
const pastaTelas = path.resolve(__dirname, "../..");

// Bloqueia o acesso à pasta backend
app.use("/backend", (req, res) => {
    res.status(404).end();
});

// Disponibiliza os arquivos do sistema
app.use(express.static(pastaTelas, { dotfiles: "deny" }));

// Inicia o servidor
app.listen(PORTA, () => {
    console.log(`Servidor ativo na porta ${PORTA}`);
});
