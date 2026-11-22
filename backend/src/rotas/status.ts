// AUTOR: Vitor Fachini Zanon
// DESCRIÇÃO: Alteração de status e cancelamento de demandas.

import { Express } from "express";
import { abrirConexao } from "../banco/conexao";

export function rotasStatus(app: Express) {

    app.put("/demandas/:id/status", async (req, res) => {

        const id = Number(req.params.id);
        const novoStatus = String(req.body.status || "");

        if (isNaN(id)) {
            res.status(400).json({
                mensagem: "Id inválido."
            });
            return;
        }

        if (!req.session.usuario) {
            res.status(401).json({
                mensagem: "Faça login para continuar."
            });
            return;
        }

        const statusPermitidos = [
            "Aberta",
            "Em andamento",
            "Em revisão",
            "Concluída",
            "Cancelada"
        ];

        if (!statusPermitidos.includes(novoStatus)) {
            res.status(400).json({
                mensagem: "Status inválido."
            });
            return;
        }

        let conexao;

        try {

            conexao = await abrirConexao();

            const resultado = await conexao.execute(
                `SELECT id,
                        status,
                        responsavel_id
                 FROM demanda
                 WHERE id = :id`,
                { id }
            );

            const linhas = resultado.rows || [];

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

            const perfil = req.session.usuario.perfil;
            const usuarioId = req.session.usuario.id;

            const transicoesValidas: Record<string, string[]> = {
                "Aberta": ["Em andamento", "Cancelada"],
                "Em andamento": ["Em revisão", "Cancelada"],
                "Em revisão": ["Em andamento", "Concluída", "Cancelada"],
                "Concluída": [],
                "Cancelada": []
            };

            if (
                !transicoesValidas[statusAtual] ||
                !transicoesValidas[statusAtual].includes(novoStatus)
            ) {
                res.status(400).json({
                    mensagem: "Transição de status inválida."
                });
                return;
            }

            if (perfil === "Membro da Equipe") {

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

                if (!permitido) {
                    res.status(403).json({
                        mensagem: "Sem permissão para realizar esta transição."
                    });
                    return;
                }
            }

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

            if (conexao) {
                await conexao.close();
            }

        }

    });

}