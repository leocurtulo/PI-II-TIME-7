// AUTOR: Leonardo Furlan Curtulo
// DESCRIÇÃO: Cria o servidor express, configura a leitura de JSON, registra as rotas e liga o servidor em uma porta


// Importa a biblioteca
import express from "express";

// Importa o CORS (libera a tela, que roda em outra porta, a chamar a API)
import cors from "cors";

// Importa as rotas de cada tela
import { rotasCadastro } from "./rotas/cadastro";
import { rotasLogin } from "./rotas/login";
import { rotasDetalhesEComentarios } from "./rotas/detalhesEcomentarios";
import { abrirConexao } from "./banco/conexao";

// Cria a aplicação (o servidor) Express
const app = express();

// Permite que as telas do front (ex.: Live Server na porta 5500) chamem a API
app.use(cors());

// Permite que o servidor leia JSON
app.use(express.json());

// Porta em que o servidor vai rodar (http://localhost:3000)
const PORTA = 3000;



// Registra as rotas da tela de cadastro (GET /projetos e POST /demandas)
rotasCadastro(app);
rotasLogin(app);
rotasDetalhesEComentarios(app);





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



// Liga o servidor e fica esperando requisições na porta definida
app.listen(PORTA, () => {
    console.log(`Servidor ativo na porta ${PORTA}`);
});