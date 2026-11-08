// AUTOR: Leonardo Furlan Curtulo
// DESCRIÇÃO: Rotas da tela de Cadastro de Demanda (GET /projetos e POST /demandas)


// Importa o tipo Express (o tipo do app, que vem do index.ts)
import { Express } from "express";

// Importa os dados de teste (projetos, usuários, demandas), o tipo Demanda e as listas de validação
import { projetos, usuarios, demandas, Demanda, TIPOS, PRIORIDADES } from "../data/dados";



// Verifica se um valor está vazio (não veio, veio null ou é texto em branco)
function estaVazio(valor: any): boolean {
    return valor === undefined || valor === null || String(valor).trim() === "";
}

// Próximo id de demanda: começa logo depois das demandas que já existem (8 → começa no 9)
let proximoId = demandas.length + 1;

// Registra as rotas da tela de cadastro no app (chamada no index.ts)
export function rotasCadastro(app: Express) {
    // GET /projetos: lista os projetos pré-cadastrados
    app.get("/projetos", (req, res) => {
        res.status(200).json(projetos);
    });

    // GET /usuarios: lista os usuários para o select de responsável.
    // Devolve só id e nome: a senha NUNCA pode ser enviada para a tela.
    app.get("/usuarios", (req, res) => {
        const lista: { id: number; nome: string }[] = [];

        usuarios.forEach((usuario) => {
            lista.push({ id: usuario.id, nome: usuario.nome });
        });

        res.status(200).json(lista);
    });



    // POST /demandas: cadastra uma nova demanda
    app.post("/demandas", (req, res) => {
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
        }else if(projetos.find(p=> p.id === Number(dados.projetoId)) === undefined){
            erros.push("Projeto não encontrado.");
        }

        // Responsável: opcional, mas se vier precisa existir na lista de usuários
        if (!estaVazio(dados.responsavelId) && usuarios.find(u => u.id === Number(dados.responsavelId)) === undefined){
            erros.push("Responsável não encontrado.");
        }

        // Prazo: opcional, mas se vier precisa estar no formato AAAA-MM-DD
        if (!estaVazio(dados.prazo)) {
            const prazo = String(dados.prazo);

            if (prazo.length !== 10 || prazo[4] !== "-" || prazo[7] !== "-") {
                erros.push("Prazo inválido. Use o formato AAAA-MM-DD.");
            }
        }

        // Se tiver algum erro, responde 400 e para aqui
        if (erros.length > 0) {
            res.status(400).json({ "mensagem": "Dados inválidos.", erros });
            return;
        }

        // Data de hoje no formato AAAA-MM-DD
        const hoje = new Date().toISOString().slice(0, 10);

        // Responsável e prazo são opcionais: se não vierem, ficam null
        let responsavelId: number | null = null;
        if (!estaVazio(dados.responsavelId)) {
            responsavelId = Number(dados.responsavelId);
        }

        let prazo: string | null = null;
        if (!estaVazio(dados.prazo)) {
            prazo = String(dados.prazo);
        }

        // Monta a nova demanda
        const novaDemanda: Demanda = {
            id: proximoId,
            titulo: String(dados.titulo).trim(),
            descricao: String(dados.descricao).trim(),
            tipo: dados.tipo,
            prioridade: dados.prioridade,
            status: "Aberta",
            projetoId: Number(dados.projetoId),
            responsavelId: responsavelId,
            dataCriacao: hoje,
            dataAtualizacao: hoje,
            prazo: prazo,
        };

        // Aumenta o contador pra próxima demanda
        proximoId++;

        // Guarda no array e responde 201 (Created) com a demanda criada
        demandas.push(novaDemanda);

        res.status(201).json(novaDemanda);

    });

}


