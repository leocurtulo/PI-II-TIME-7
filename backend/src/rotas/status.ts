// AUTOR: Vitor Fachini Zanon
// DESCRIÇÃO: Alteração de status e cancelamento de demandas.

import { Express } from "express";
import { abrirConexao } from "../banco/conexao";

export function rotasStatus(app: Express) {

    // PUT /demandas/:id/status: altera o status da demanda seguindo
    // as regras do ciclo de vida e as permissões dos perfis.
    app.put("/demandas/:id/status", async (req, res) => {

        const id = Number(req.params.id);
        const novoStatus = String(req.body.status || "");

        // Valida se o id informado é numérico.
        if (isNaN(id)) {
            res.status(400).json({
                mensagem: "Id inválido."
            });
            return;
        }

        // Impede alterações sem usuário autenticado.
        if (!req.session.usuario) {
            res.status(401).json({
                mensagem: "Faça login para continuar."
            });
            return;
        }

        // Status aceitos pelo sistema.
        const statusPermitidos = [
            "Aberta",
            "Em andamento",
            "Em revisão",
            "Concluída",
            "Cancelada"
        ];

        // Verifica se o novo status é válido.
        if (!statusPermitidos.includes(novoStatus)) {
            res.status(400).json({
                mensagem: "Status inválido."
            });
            return;
        }

        let conexao;

        try {

            conexao = await abrirConexao();

            // Busca a demanda atual para descobrir status,
            // responsável e projeto vinculado.
            const resultado = await conexao.execute(
                `SELECT id,
                        status,
                        responsavel_id,
                        projeto_id
                 FROM demanda
                 WHERE id = :id`,
                { id }
            );

            const linhas = resultado.rows || [];

            // Se a demanda não existir retorna 404.
            if (linhas.length === 0) {
                res.status(404).json({
                    mensagem: "Demanda não encontrada."
                });
                return;
            }

            const demanda: any = linhas[0];

            const statusAtual =
                demanda.STATUS || demanda.status;

            const responsavelId =
                demanda.RESPONSAVEL_ID || demanda.responsavel_id;

            const projetoId =
                demanda.PROJETO_ID || demanda.projeto_id;

            const perfil = req.session.usuario.perfil;
            const usuarioId = req.session.usuario.id;

            // Regra do Líder de Projeto: só pode alterar demandas
            // dos projetos em que está vinculado.
            if (perfil === "Líder de Projeto") {

                const liderProjeto = await conexao.execute(
                    `SELECT 1
                     FROM projeto_usuario
                     WHERE projeto_id = :projetoId
                       AND usuario_id = :usuarioId`,
                    {
                        projetoId: projetoId,
                        usuarioId: usuarioId
                    }
                );

                const linhasProjeto = liderProjeto.rows || [];

                if (linhasProjeto.length === 0) {
                    res.status(403).json({
                        mensagem: "Sem permissão para alterar demandas deste projeto."
                    });
                    return;
                }
            }

            // Define as transições válidas do ciclo de vida da demanda.
            const transicoesValidas: Record<string, string[]> = {
                "Aberta": ["Em andamento", "Cancelada"],
                "Em andamento": ["Em revisão", "Cancelada"],
                "Em revisão": ["Em andamento", "Concluída", "Cancelada"],
                "Concluída": [],
                "Cancelada": []
            };

            // Impede transições fora das regras do sistema.
            if (
                !transicoesValidas[statusAtual] ||
                !transicoesValidas[statusAtual].includes(novoStatus)
            ) {
                res.status(400).json({
                    mensagem: "Transição de status inválida."
                });
                return;
            }

            // Regras específicas para o perfil Membro da Equipe.
            if (perfil === "Membro da Equipe") {

                // O membro só pode alterar demandas sob sua responsabilidade.
                if (responsavelId !== usuarioId) {
                    res.status(403).json({
                        mensagem: "Sem permissão para alterar esta demanda."
                    });
                    return;
                }

                const permitido =
                    (statusAtual === "Aberta" &&
                        novoStatus === "Em andamento")
                    ||
                    (statusAtual === "Em andamento" &&
                        novoStatus === "Em revisão");

                // Impede mudanças de status não permitidas para membros.
                if (!permitido) {
                    res.status(403).json({
                        mensagem: "Sem permissão para realizar esta transição."
                    });
                    return;
                }
            }

            // Atualiza o status da demanda e registra a data da alteração.
            await conexao.execute(
                `UPDATE demanda
                 SET status = :status,
                     data_atualizacao = SYSDATE
                 WHERE id = :id`,
                {
                    status: novoStatus,
                    id: id
                },
                {
                    autoCommit: true
                }
            );

            // Registra a alteração realizada na tabela de histórico.
            await conexao.execute(
                `INSERT INTO historico
                 (
                    demanda_id,
                    usuario_id,
                    campo,
                    valor_anterior,
                    valor_novo
                 )
                 VALUES
                 (
                    :demandaId,
                    :usuarioId,
                    'status',
                    :valorAnterior,
                    :valorNovo
                 )`,
                {
                    demandaId: id,
                    usuarioId: usuarioId,
                    valorAnterior: statusAtual,
                    valorNovo: novoStatus
                },
                {
                    autoCommit: true
                }
            );

            res.status(200).json({
                mensagem: "Status atualizado com sucesso."
            });

        } catch (erro) {

            res.status(500).json({
                mensagem: "Erro ao atualizar o status."
            });

        } finally {

            // Fecha a conexão independentemente do resultado.
            if (conexao) {
                await conexao.close();
            }

        }

    });

}