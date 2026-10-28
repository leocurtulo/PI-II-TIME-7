// AUTOR: Leonardo Furlan Curtulo
// DESCRIÇÃO: Rotas da tela de Cadastro de Demanda (GET /projetos e POST /demandas)


// Importa o Router do Express (para criar um grupo de rotas)
import { Router } from "express";

// Importa os projetos dos dados de teste
import { projetos, TIPOS, PRIORIDADES } from "../data/dados";

// Cria o grupo de rotas da tela de cadastro
const router = Router();

// GET /projetos: lista os projetos pré-cadastrados
router.get("/projetos", (req, res) => {
    res.status(200).json(projetos);
});


// Verifica se um valor está vazio (não veio, veio null ou é texto em branco)
function estaVazio(valor: any): boolean {
    return valor === undefined || valor === null || String(valor).trim() === "";
}


// POST /demandas: cadastra uma nova demanda
router.post("/demandas", (req, res) => {
    // Dados enviados no corpo da requisição (ou objeto vazio, se não vier nada)
    const dados = req.body || {};

    // Lista pra guardar as mensagens de erro
    const erros: string[] = [];

    if (estaVazio(dados.titulo)) {
        erros.push("O título é obrigatório.");
    }

    if (estaVazio(dados.descricao)){
        erros.push("A descrição é obrigatória.");
    }

    if (estaVazio(dados.tipo)){
        erros.push("O tipo é obrigatório.");
    }else if(!TIPOS.includes(dados.tipo)){
        erros.push("Tipo inválido. Use: Tarefa, Defeito, Melhoria ou Documentação.");
    }

    if (estaVazio(dados.prioridade)){
        erros.push("A prioridade é obrigatória.");
    }else if(!PRIORIDADES.includes(dados.prioridade)){
        erros.push("Prioridade inválida. Use: Crítica, Alta, Média ou Baixa.");
    }

    if(estaVazio(dados.projetoId)){
        erros.push("O projeto é obrigatório.");
    }

    // Se tiver algum erro, responde 400 e para aqui
    if (erros.length > 0) {
        res.status(400).json({ erros: erros });
        return;
    }

    res.status(201).json(dados);

});

// Exporta o grupo de rotas para ser usado no index.ts
export default router;