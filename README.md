# Sistema de Acompanhamento de Demandas

**Projeto Integrador II** – Engenharia de Software – PUC-Campinas

**Time:** PI-II-TIME-7 – 2º semestre do 1º ano

**Professora orientadora:** Renata Antônia Tadeu Arantes

## Sobre o sistema

Sistema web para cadastrar, acompanhar e atualizar demandas de projetos. Cada usuário entra com login e vê só o que o seu perfil permite:

- **Administrador:** vê e altera as demandas de todos os projetos.
- **Líder de Projeto:** cadastra e edita demandas dos projetos em que está vinculado.
- **Membro da Equipe:** consulta as demandas dos seus projetos, comenta e acompanha o andamento.

Funcionalidades: login com sessão, dashboard, listagem com filtros e busca, cadastro de demanda (com bloqueio de prazo em feriado nacional via BrasilAPI), edição, alteração de status, cancelamento, comentários e histórico de alterações.

## Equipe

| Integrante | Parte principal |
|---|---|
| Leonardo Furlan Curtulo | Cadastro, edição, login com sessão e permissões por perfil |
| Augusto Brufato Pereira dos Santos | Banco de dados Oracle, detalhes da demanda e comentários |
| Vitor Fachini Zanon | Login e alteração de status |
| Caio Ferreira Aragão | Listagem, filtros e busca |
| Vinicius Pansieri Chiarelli | Dashboard |

## Tecnologias

- **Frontend:** HTML, CSS e JavaScript (fetch)
- **Backend:** Node.js, TypeScript e Express (express-session)
- **Banco de dados:** Oracle da PUC-Campinas

## Como rodar

1. Conecte na **VPN da PUC-Campinas** (o banco Oracle só é acessível por ela).
2. Na pasta `backend`, crie o arquivo `.env` seguindo o `.env.example` (`DB_USER`, `DB_PASSWORD`, `DB_CONNECT_STRING` e `SESSION_SECRET`). O `.env` **não** vai para o GitHub.
3. Instale as dependências:
   ```bash
   cd backend
   npm install
   ```
4. No banco, rode os scripts da pasta `backend/sql/` nesta ordem:
   1. `criar-tabelas.sql`
   2. `criar-tabelas-historico.sql`
5. Inicie o servidor:
   ```bash
   npm start
   ```
6. Acesse **http://localhost:3000/login.html**

## Usuários para teste

| Nome | Perfil | E-mail | Senha |
|---|---|---|---|
| Ana Souza | Administrador | ana@email.com | Senha@123 |
| Leonardo Curtulo | Líder de Projeto | leocurtulo@gmail.com | leoCurtulo.23 |
| Augusto Brufato | Membro da Equipe | augustobru@gmail.com | Augusto.00 |
| Caio Aragão | Membro da Equipe | caioarg@gmail.com | @Aragao1 |

