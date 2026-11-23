import express from "express";

<<<<<<< Updated upstream
=======
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

import { rotasStatus } from "./rotas/status";
// Listagem de demandas (Caio Ferreira Aragão): GET /demandas
import { rotasListagem } from "./rotas/demandas";

// Cria a aplicação (o servidor) Express
>>>>>>> Stashed changes
const app = express();

app.listen(3000, () => {
    console.log("Servidor ativo na porta 3000");
});

app.get("/", (req, res) => {
    res.send("Servidor do Sistema de Acompanhamento de Demandas funcionando!");
<<<<<<< Updated upstream
});
=======
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

// GET /demandas e GET /api/demandas: filtros, busca e ordenação da listagem
rotasListagem(app);


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
>>>>>>> Stashed changes
