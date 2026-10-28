// AUTOR: Leonardo Furlan Curtulo
// DESCRIÇÃO: Cria o servidor express, configura a leitura de JSON, registra as rotas e liga o servidor em uma porta


// Importa a biblioteca
import express from "express";

// Cria a aplicação (o servidor) Express
const app = express();

// Permite que o servidor leia JSON
app.use(express.json());

// Porta em que o servidor vai rodar (http://localhost:3000)
const PORTA = 3000;



// Rota de teste: confirma que o servidor está funcionando
app.get("/", (req, res) => {
    res.send("Servidor do Sistema de Acompanhamento de Demandas funcionando!");
});



// Liga o servidor e fica esperando requisições na porta definida
app.listen(PORTA, () => {
    console.log(`Servidor ativo na porta ${PORTA}`);
});