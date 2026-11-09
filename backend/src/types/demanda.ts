
/*
Autor: Caio Aragão
Define a estrutura de uma demanda.
Os campos serão preenchidos com os dados do banco.
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
