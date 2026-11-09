// AUTOR: Augusto Brufato
// DESCRIÇÃO: Rotas de detalhes da demanda e comentários

import { Express } from "express";
import { demandas, comentarios } from "../data/dados";

export function rotasDetalhesEComentarios(app: Express) {

   
    app.get("/demandas/:id", (req, res) => {

        const id = Number(req.params.id);

        const demanda = demandas.find(
            d => d.id === id
        );

        if (demanda === undefined) {
            res.status(404).json({
                mensagem: "Demanda não encontrada."
            });
            return;
        }

        res.status(200).json(demanda);
    });

    
    app.get("/demandas/:id/comentarios", (req, res) => {

        const id = Number(req.params.id);

        const demanda = demandas.find(
            d => d.id === id
        );

        if (demanda === undefined) {
            res.status(404).json({
                mensagem: "Demanda não encontrada."
            });
            return;
        }

        const listaComentarios = comentarios.filter(
            comentario => comentario.demandaId === id
        );

        res.status(200).json(listaComentarios);
    });

    
    app.post("/demandas/:id/comentarios", (req, res) => {

        const id = Number(req.params.id);

        const dados = req.body || {};

        const demanda = demandas.find(
            d => d.id === id
        );

        if (demanda === undefined) {
            res.status(404).json({
                mensagem: "Demanda não encontrada."
            });
            return;
        }

        if (
            dados.texto === undefined ||
            String(dados.texto).trim() === ""
        ) {
            res.status(400).json({
                mensagem: "Comentário não pode ser vazio."
            });
            return;
        }

        const novoComentario = {
            id: comentarios.length + 1,
            demandaId: id,
            usuarioId: Number(dados.usuarioId),
            texto: String(dados.texto).trim(),
            dataHora: new Date().toISOString()
        };

        comentarios.push(novoComentario);

        res.status(201).json(novoComentario);
    });

}
