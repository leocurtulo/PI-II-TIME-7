
/*
Autor: Caio Ferreira Aragão
DESCRIÇÃO: Campos de uma demanda usados na listagem.
Os valores vêm do banco, já com o nome do projeto e do responsável.
*/

export interface Demanda {
    id: number;
    titulo: string;
    descricao: string;
    tipo: string;
    prioridade: string;
    status: string;
    projeto: string;
    responsavel: string | null;
    dataCriacao: string;
    prazoFinalizacao: string | null;
}
