// Autor: Caio Ferreira Aragão
// Define a estrutura de uma demanda.

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