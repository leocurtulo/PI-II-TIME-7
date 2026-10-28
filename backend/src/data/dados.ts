// AUTOR: Leonardo Furlan Curtulo
// DESCRIÇÃO: Dados de teste em memória usados pela API (projetos, usuários, demandas e comentários)



// Formato de um projeto 
export interface Projeto {
    id: number;
    nome: string;
}

// Projetos pré-cadastrados 
export const projetos: Projeto[] = [
    { id: 1, nome: "Sistema de Acompanhamento de Demandas" },
    { id: 2, nome: "App Mobile" },
    { id: 3, nome: "Sistema RH" },
];



// Formato de um usuário
export interface Usuario {
    id: number;
    nome: string;
    email: string;
    senha: string;
    perfil: "Administrador" | "Líder de Projeto" | "Membro da Equipe";
}

// Usuários pré-cadastrados
export const usuarios: Usuario[] = [
    { id: 1, nome: "Ana Souza", email: "ana@email.com", senha: "Senha@123", perfil: "Administrador" },
    { id: 2, nome: "Leonardo Curtulo", email: "leocurtulo@gmail.com", senha: "leoCurtulo.23", perfil: "Líder de Projeto" },
    { id: 3, nome: "Augusto Brufato", email: "augustobru@gmail.com", senha: "Augusto.00", perfil: "Membro da Equipe" },
    { id: 4, nome: "Caio Aragão", email: "caioarg@gmail.com", senha: "@Aragao1", perfil: "Membro da Equipe" },
];




// Formato de uma demanda
export interface Demanda {
    id: number;                 
    titulo: string;
    descricao: string;
    tipo: "Tarefa" | "Defeito" | "Melhoria" | "Documentação";
    prioridade: "Crítica" | "Alta" | "Média" | "Baixa";
    status: "Aberta" | "Em andamento" | "Em revisão" | "Concluída" | "Cancelada";
    projetoId: number;          
    responsavelId: number | null; 
    dataCriacao: string;       
    dataAtualizacao: string;    
    prazo: string | null;       
}

// Demandas pré-cadastradas
export const demandas: Demanda[] = [
    {
        id: 1,
        titulo: "Erro ao salvar demanda",
        descricao: "O sistema exibe erro ao clicar em salvar no cadastro.",
        tipo: "Defeito",
        prioridade: "Crítica",
        status: "Aberta",
        projetoId: 1,
        responsavelId: 3,
        dataCriacao: "2026-10-20",
        dataAtualizacao: "2026-10-20",
        prazo: "2026-10-30",
    },
    {
        id: 2,
        titulo: "Manual do usuário",
        descricao: "Escrever o manual de uso das telas do sistema.",
        tipo: "Documentação",
        prioridade: "Baixa",
        status: "Aberta",
        projetoId: 1,
        responsavelId: null,   
        dataCriacao: "2026-10-15",
        dataAtualizacao: "2026-10-15",
        prazo: null,          
    },
    {
        id: 3,
        titulo: "Tela de login",
        descricao: "Criar a tela de login com validação de usuário e senha.",
        tipo: "Tarefa",
        prioridade: "Alta",
        status: "Concluída",
        projetoId: 1,
        responsavelId: 4,
        dataCriacao: "2026-09-10",
        dataAtualizacao: "2026-10-05",
        prazo: "2026-10-10",
    },
    {
        id: 4,
        titulo: "Filtro por prioridade na listagem",
        descricao: "Permitir filtrar as demandas por prioridade na tela de listagem.",
        tipo: "Melhoria",
        prioridade: "Média",
        status: "Em andamento",
        projetoId: 1,
        responsavelId: 3,
        dataCriacao: "2026-10-05",
        dataAtualizacao: "2026-10-22",
        prazo: "2026-11-04",
    },
    {
        id: 5,
        titulo: "Falha no login pelo celular",
        descricao: "Usuários não conseguem entrar no app quando usam o celular.",
        tipo: "Defeito",
        prioridade: "Crítica",
        status: "Em revisão",
        projetoId: 2,
        responsavelId: 4,
        dataCriacao: "2026-10-18",
        dataAtualizacao: "2026-10-27",
        prazo: "2026-10-29",
    },
    {
        id: 6,
        titulo: "Layout responsivo do app",
        descricao: "Ajustar as telas do aplicativo para diferentes tamanhos de celular.",
        tipo: "Melhoria",
        prioridade: "Alta",
        status: "Em andamento",
        projetoId: 2,
        responsavelId: 2,
        dataCriacao: "2026-10-01",
        dataAtualizacao: "2026-10-20",
        prazo: "2026-10-25",
    },
    {
        id: 7,
        titulo: "Relatório de férias",
        descricao: "Gerar relatório com os períodos de férias dos funcionários.",
        tipo: "Tarefa",
        prioridade: "Média",
        status: "Cancelada",
        projetoId: 3,
        responsavelId: null,
        dataCriacao: "2026-09-20",
        dataAtualizacao: "2026-10-02",
        prazo: "2026-11-15",
    },
    {
        id: 8,
        titulo: "Cadastro de funcionários",
        descricao: "Criar o formulário de cadastro de novos funcionários.",
        tipo: "Tarefa",
        prioridade: "Alta",
        status: "Aberta",
        projetoId: 3,
        responsavelId: 3,
        dataCriacao: "2026-10-25",
        dataAtualizacao: "2026-10-25",
        prazo: "2026-11-20",
    },
];




// Formato de um comentário
export interface Comentario {
    id: number;
    demandaId: number;   
    usuarioId: number;   
    texto: string;
    dataHora: string;    
}

// Comentários pré-cadastrados
export const comentarios : Comentario[] = [
    { id: 1, demandaId: 1, usuarioId: 2, texto: "Consegui reproduzir o erro, vou analisar.", dataHora: "2026-10-21T09:15:00" },
    { id: 2, demandaId: 1, usuarioId: 3, texto: "O erro acontece quando o campo descrição fica vazio.", dataHora: "2026-10-22T14:40:00" },
    { id: 3, demandaId: 5, usuarioId: 1, texto: "Correção enviada para revisão. Favor testar no celular.", dataHora: "2026-10-27T10:05:00" },
];