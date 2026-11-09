document.addEventListener("DOMContentLoaded", () => {
    carregarDemandas();

    // Vincula a atualização da lista aos inputs e selects do HTML
    document.getElementById('buscaTexto').addEventListener('input', carregarDemandas);
    document.getElementById('filtroStatus').addEventListener('change', carregarDemandas);
    document.getElementById('filtroPrioridade').addEventListener('change', carregarDemandas);
    document.getElementById('filtroTipo').addEventListener('change', carregarDemandas);
    document.getElementById('filtroResponsavel').addEventListener('change', carregarDemandas);
    document.getElementById('filtroProjeto').addEventListener('change', carregarDemandas);
    document.getElementById('ordenacao').addEventListener('change', carregarDemandas);
});

async function carregarDemandas() {
    const busca = document.getElementById('buscaTexto').value;
    const status = document.getElementById('filtroStatus').value;
    const prioridade = document.getElementById('filtroPrioridade').value;
    const tipo = document.getElementById('filtroTipo').value;
    const responsavel = document.getElementById('filtroResponsavel').value;
    const projeto = document.getElementById('filtroProjeto').value;
    const ordenarPor = document.getElementById('ordenacao').value;

    const params = new URLSearchParams();
    if (busca) params.append('busca', busca);
    if (status !== 'todos') params.append('status', status);
    if (prioridade !== 'todos') params.append('prioridade', prioridade);
    if (tipo !== 'todos') params.append('tipo', tipo);
    if (responsavel !== 'todos') params.append('responsavel', responsavel);
    if (projeto !== 'todos') params.append('projeto', projeto);
    if (ordenarPor) params.append('ordenarPor', ordenarPor);

    try {
        const resposta = await fetch(`http://localhost:3000/api/demandas?${params.toString()}`);
        const demandas = await resposta.json();
        renderizarLista(demandas);
    } catch (erro) {
        console.error("Erro ao buscar as demandas da API:", erro);
    }
}

function renderizarLista(demandas) {
    const listaContainer = document.getElementById('lista');
    listaContainer.innerHTML = ''; 

    if (demandas.length === 0) {
        listaContainer.innerHTML = '<p style="padding: 20px;">Nenhuma demanda encontrada com estes filtros.</p>';
        return;
    }

    demandas.forEach(demanda => {
        const div = document.createElement('div');
        div.className = 'exemplo'; 

        div.innerHTML = `
            <h3>${demanda.titulo}</h3>
            <p class="descricao">${demanda.descricao}</p>
            <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 15px 0;">
            <p><strong>Projeto:</strong> ${demanda.projeto} | <strong>Tipo:</strong> ${demanda.tipo}</p>
            <p><strong>Responsável:</strong> ${demanda.responsavel || 'Não atribuído'}</p>
            <p><strong>Prazo:</strong> ${demanda.prazoFinalizacao || 'Sem prazo'}</p>
            <p><strong>Prioridade:</strong> ${demanda.prioridade}</p>
            <p><strong>Status:</strong> ${demanda.status}</p>
            <button onclick="window.location.href='detalhes-demanda.html?id=${demanda.id}'" style="margin-top: 15px;">Ver detalhes</button>
        `;
        
        listaContainer.appendChild(div);
    });
}
