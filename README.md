# PI-II-TIME-7

Integrantes
  -Leonardo Furlan Curtulo
  -Caio Ferreira Aragão
  -Vitor Fachini Zanon
  -Augusto Brufato Pereira dos Santos
  -Vinicius Pansieri Chiarelli

Curso
  -Engenharia de Software

Componente Curricular
  -Projeto Integrador II

Semestre/Ano
  -2º semestre do 1º ano

Professora Orientadora
  -Renata Antônia Tadeu Arantes


## API - Cadastro de Demanda (Leonardo Furlan Curtulo)

Servidor em `backend/`. Para rodar: `cd backend` e `npm start` (porta 3000).

### GET /projetos
Lista os projetos pré-cadastrados.
- **200**: array com os projetos (`id` e `nome`)

### POST /demandas
Cadastra uma nova demanda.

**Campos obrigatórios:** `titulo`, `descricao`, `tipo` (Tarefa, Defeito, Melhoria ou Documentação), `prioridade` (Crítica, Alta, Média ou Baixa) e `projetoId` (precisa existir).

**Campos opcionais:** `responsavelId` (se vier, precisa existir) e `prazo` (formato AAAA-MM-DD).

**Gerados automaticamente:** `id`, `status` ("Aberta"), `dataCriacao` e `dataAtualizacao`.

**Respostas:**
- **201**: demanda criada (retorna a demanda completa)
- **400**: `{ "mensagem": "Dados inválidos.", "erros": [...] }`
