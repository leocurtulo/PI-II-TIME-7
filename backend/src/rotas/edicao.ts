// AUTOR: Leonardo Furlan Curtulo
// DESCRIÇÃO: Rotas da edição de demanda: busca uma demanda pelo id (GET /demandas/:id) e a edição (PUT /demandas/:id), usando o banco Oracle


// Importa as listas de validação (tipos e prioridades aceitos)
import { TIPOS, PRIORIDADES } from "../data/dados";

// Importa o tipo Express (o tipo do app, que vem do index.ts)
import { Express } from "express";


// Importa a função que abre a conexão com o banco
import { abrirConexao } from "../banco/conexao";


// Registra as rotas da edição no app (chamada no index.ts)
export function rotasEdicao(app: Express) {


    // GET /demandas/:id: busca UMA demanda pelo id, já com o nome do projeto e do responsável
    app.get("/demandas/:id", async (req, res) => {
        const id = Number(req.params.id);

        // Se não for um número (ex.: "/demandas/abc"), nem consulta o banco
        if (isNaN(id)){
            res.status(400).json({ mensagem: "Id inválido." });
            return;
        }

        const usuario = req.session.usuario;

        if(!usuario){
            res.status(401).json({mensagem: "Faça login para continuar."});
            return;
        }


        try {
            const conexao = await abrirConexao();

            // INNER JOIN com projeto: toda demanda TEM projeto (é obrigatório)
            // LEFT JOIN com usuario: o responsável é opcional; sem LEFT, demandas sem responsável sumiriam
            const resultado = await conexao.execute(
                `SELECT d.id AS "id", d.titulo AS "titulo", d.descricao AS "descricao",
                        d.tipo AS "tipo", d.prioridade AS "prioridade", d.status AS "status",
                        d.projeto_id AS "projetoId", p.nome AS "projeto",
                        d.responsavel_id AS "responsavelId", u.nome AS "responsavel",
                        TO_CHAR(d.data_criacao, 'YYYY-MM-DD') AS "dataCriacao",
                        TO_CHAR(d.data_atualizacao, 'YYYY-MM-DD') AS "dataAtualizacao",
                        TO_CHAR(d.prazo, 'YYYY-MM-DD') AS "prazo"
                 FROM demanda d
                 INNER JOIN projeto p ON d.projeto_id = p.id
                 LEFT JOIN usuario u ON d.responsavel_id = u.id
                 WHERE d.id = :id`,
                [id]
            );

            const linhas: any[] =  resultado.rows || [];


            // Nenhuma linha: não existe demanda com esse id
            if (linhas.length === 0) {
                await conexao.close();
                res.status(404).json({ mensagem: "Demanda não encontrada." });
                return;
            }

            const demanda = linhas[0];

            // Administrador vê todas. Líder e Membro só veem demandas dos projetos em que estão vinculados
            if(usuario.perfil !== "Administrador" && demanda.responsavelId !== usuario.id){
                const vinculo = await conexao.execute(
                    `SELECT 1 FROM projeto_usuario
                    WHERE projeto_id = :projetoId AND usuario_id = :usuarioId`,
                    {projetoId: demanda.projetoId, usuarioId: usuario.id}
                );

                if(!vinculo.rows || vinculo.rows.length === 0){
                    await conexao.close();
                    res.status(403).json({mensagem: "Você não tem acesso a essa demanda."});
                    return;
                }
            }


            await conexao.close();
            // Achou: devolve a demanda 
            res.status(200).json(demanda);
        } catch (erro) {
            res.status(500).json({ mensagem: "Erro ao buscar a demanda." });
        }
    });

    // PUT /demandas/:id: edita os dados de uma demanda
    app.put("/demandas/:id", async (req, res) =>{
        const id = Number(req.params.id);

        const dados = req.body || {};

        const erros: string[] = [];

        


        if (isNaN(id)) {
            res.status(400).json({ mensagem: "Id inválido." });
            return;
        }

        const usuario = req.session.usuario;

        if(!usuario){
            res.status(401).json({mensagem: "Faça login para continuar."});
            return;
        }

        if(usuario.perfil === "Membro da Equipe"){
            res.status(403).json({mensagem: "Membro da Equipe não pode editar demanda."});
            return;
        }


        if (dados.titulo === undefined || String(dados.titulo).trim() === "") {
            erros.push("O título é obrigatório.");
        }
        if (dados.descricao === undefined || String(dados.descricao).trim() === "") {
            erros.push("A descrição é obrigatória.");
        }
        if (!TIPOS.includes(dados.tipo)) {
            erros.push("Tipo inválido. Use: Tarefa, Defeito, Melhoria ou Documentação.");
        }
        if (!PRIORIDADES.includes(dados.prioridade)) {
            erros.push("Prioridade inválida. Use: Crítica, Alta, Média ou Baixa.");
        }

        let prazo: string | null = null;
        if (dados.prazo !== undefined && dados.prazo !== null && String(dados.prazo) !== "") {
            prazo = String(dados.prazo);

            if (prazo.length !== 10 || prazo[4] !== "-" || prazo[7] !== "-") {
                erros.push("Prazo inválido. Use o formato AAAA-MM-DD.");
            }
        }

        let responsavelId: number | null = null;
        if (dados.responsavelId !== undefined && dados.responsavelId !== null && String(dados.responsavelId) !== "") {
            responsavelId = Number(dados.responsavelId);
        }

        if (erros.length > 0) {
            res.status(400).json({ mensagem: "Dados inválidos.", erros });
            return;
        }

        let conexao;
        try {
            conexao = await abrirConexao();

            // Busca a demanda como está hoje no banco: projeto, status e os valores antigos (para o histórico)
            const atual = await conexao.execute(
                `SELECT d.projeto_id AS "projetoId",
                d.status AS "status",
                d.titulo AS "titulo",
                d.descricao AS "descricao",
                d.tipo AS "tipo",
                d.prioridade AS "prioridade",
                u.nome AS "responsavel",
                TO_CHAR(d.prazo, 'YYYY-MM-DD') AS "prazo"
                FROM demanda d
                LEFT JOIN usuario u ON d.responsavel_id = u.id
                WHERE d.id = :id`,
                {id: id}
            );

            const linhasAtual: any[] = atual.rows || [];

            if(linhasAtual.length === 0){
                res.status(404).json({mensagem: "Demanda não encontrada."});
                return;
            }

            const demandaAtual = linhasAtual[0];

            if(demandaAtual.status === "Concluída" || demandaAtual.status === "Cancelada"){
                res.status(400).json({mensagem: "Demanda concluída ou cancelada não pode ser editada."});
                return;
            }
    
            // Líder só edita demandas dos projetos em que está vinculado
            if(usuario.perfil === "Líder de Projeto"){
                const vinculo = await conexao.execute(
                    `SELECT 1 FROM projeto_usuario
                    WHERE projeto_id = :projetoId AND usuario_id = :usuarioId`,
                    {projetoId: demandaAtual.projetoId, usuarioId: usuario.id}
                );

                if(!vinculo.rows || vinculo.rows.length === 0){
                    res.status(403).json({ mensagem: "Você não está vinculado ao projeto desta demanda." });
                    return;
                }
            }

            let responsavelNovo: string | null = null;

            if(responsavelId !== null){
                const resp = await conexao.execute(
                    `SELECT nome AS "nome" FROM usuario WHERE id = :id`,
                    {id: responsavelId}
                );

                const linhasResp: any[] = resp.rows || [];

                if (linhasResp.length === 0){
                    res.status(400).json({mensagem: "Responsável não encontrado."});
                    return;
                }
                responsavelNovo = linhasResp[0].nome;
            }

            const resultado = await conexao.execute(
                `UPDATE demanda
                 SET titulo = :titulo,
                     descricao = :descricao,
                     tipo = :tipo,
                     prioridade = :prioridade,
                     responsavel_id = :responsavelId,
                     prazo = TO_DATE(:prazo, 'YYYY-MM-DD'),
                     data_atualizacao = SYSDATE
                 WHERE id = :id`,
                {
                    titulo: String(dados.titulo).trim(),
                    descricao: String(dados.descricao).trim(),
                    tipo: dados.tipo,
                    prioridade: dados.prioridade,
                    responsavelId: responsavelId,
                    prazo: prazo,
                    id: id
                },
                { autoCommit: true }
            );

            // Nenhuma linha alterada: não existe demanda com esse id
            if (resultado.rowsAffected === 0) {
                res.status(404).json({ mensagem: "Demanda não encontrada." });
                return;
            }

            // Lista com cada campo: o valor que estava no banco e o valor novo que veio da tela
            const alteracoes = [
                {campo: "titulo", anterior: demandaAtual.titulo, novo: String(dados.titulo).trim()},
                {campo: "descricao", anterior: demandaAtual.descricao, novo: String(dados.descricao).trim()},
                {campo: "tipo", anterior: demandaAtual.tipo, novo: dados.tipo},
                {campo: "prioridade", anterior: demandaAtual.prioridade, novo: dados.prioridade},
                {campo: "responsavel", anterior: demandaAtual.responsavel, novo: responsavelNovo},
                {campo: "prazo", anterior: demandaAtual.prazo, novo: prazo}
                
            ];

            // Grava uma linha no histórico para cada campo que mudou
            for(const alteracao of alteracoes){
                // ?? "" transforma null em texto vazio, para null e vazio contarem como iguais
                if ((alteracao.anterior ?? "") !== (alteracao.novo ?? "")){
                    await conexao.execute(
                        `INSERT INTO historico (demanda_id, usuario_id, campo, valor_anterior, valor_novo)
                        VALUES(:demandaId, :usuarioId, :campo, :anterior, :novo)`,
                        {demandaId: id,
                            usuarioId: usuario.id,
                            campo: alteracao.campo,
                            anterior: alteracao.anterior,
                            novo: alteracao.novo
                        },
                        {autoCommit: true}
                    );
                }
            }

            res.status(200).json({ mensagem: "Demanda atualizada com sucesso." });
        }catch (erro) {
            res.status(500).json({ mensagem: "Erro ao atualizar a demanda." });
        } finally {
            // Fecha a conexão sempre, dando certo ou errado
            if (conexao) {
                await conexao.close();
            }
        }
    });
}
