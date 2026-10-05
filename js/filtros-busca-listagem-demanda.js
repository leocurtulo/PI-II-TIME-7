console.log('[script.js] arquivo carregado');

(function () {
    'use strict';

    function iniciar() {
        var inputBusca = document.getElementById('buscaTexto');
        var selectStatus = document.getElementById('filtroStatus');
        var selectPrioridade = document.getElementById('filtroPrioridade');
        var selectTipo = document.getElementById('filtroTipo');
        var selectResponsavel = document.getElementById('filtroResponsavel');
        var selectProjeto = document.getElementById('filtroProjeto');
        var selectOrdenacao = document.getElementById('ordenacao');
        var btnAplicar = document.getElementById('btnAplicarFiltros');
        var lista = document.getElementById('lista');

        if (!lista) {
            console.error('[script.js] Elemento #lista não encontrado. Confira o ID no HTML.');
            return;
        }

        var demandas = Array.prototype.slice.call(document.querySelectorAll('.exemplo'));
        console.log('[script.js] demandas encontradas:', demandas.length);

        var msgVazio = document.createElement('p');
        msgVazio.textContent = 'Nenhuma demanda encontrada com esses filtros.';
        msgVazio.style.display = 'none';
        msgVazio.style.color = '#555555';
        msgVazio.style.textAlign = 'center';
        lista.appendChild(msgVazio);

        function normalizar(texto) {
            return String(texto || '')
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLowerCase()
                .trim();
        }

        function valor(select) {
            return select ? normalizar(select.value) : 'todos';
        }

        function aplicarFiltros() {
            var termo = normalizar(inputBusca ? inputBusca.value : '');
            var fStatus = valor(selectStatus);
            var fPrioridade = valor(selectPrioridade);
            var fTipo = valor(selectTipo);
            var fResponsavel = valor(selectResponsavel);
            var fProjeto = valor(selectProjeto);
            var ordem = selectOrdenacao ? selectOrdenacao.value : 'prazo';

            var filtradas = demandas.filter(function (d) {
                var h3 = d.querySelector('h3');
                var desc = d.querySelector('.descricao');
                var titulo = normalizar(h3 ? h3.textContent : '');
                var descricao = normalizar(desc ? desc.textContent : '');

                var okBusca = termo === '' || titulo.indexOf(termo) !== -1 || descricao.indexOf(termo) !== -1;
                var okStatus = fStatus === 'todos' || normalizar(d.dataset.status) === fStatus;
                var okPrioridade = fPrioridade === 'todos' || normalizar(d.dataset.prioridade) === fPrioridade;
                var okTipo = fTipo === 'todos' || normalizar(d.dataset.tipo) === fTipo;
                var okResp = fResponsavel === 'todos' || normalizar(d.dataset.responsavel) === fResponsavel;
                var okProjeto = fProjeto === 'todos' || normalizar(d.dataset.projeto) === fProjeto;

                return okBusca && okStatus && okPrioridade && okTipo && okResp && okProjeto;
            });


            filtradas.sort(function (a, b) {
                if (ordem === 'prazo') {
                    return new Date(a.dataset.prazo || 0) - new Date(b.dataset.prazo || 0);
                }
                if (ordem === 'criacao') {
                    return new Date(b.dataset.criacao || 0) - new Date(a.dataset.criacao || 0);
                }
                if (ordem === 'prioridade') {
                    return parseInt(a.dataset.nivelPrioridade || 0, 10) - parseInt(b.dataset.nivelPrioridade || 0, 10);
                }
                if (ordem === 'status') {
                    return (a.dataset.status || '').localeCompare(b.dataset.status || '');
                }
                return 0;
            });

            demandas.forEach(function (d) {
                d.style.setProperty('display', 'none', 'important');
            });

            filtradas.forEach(function (d) {
                d.style.setProperty('display', 'block', 'important');
                lista.insertBefore(d, msgVazio);
            });

            msgVazio.style.display = filtradas.length === 0 ? 'block' : 'none';

            console.log('[script.js] filtros aplicados. Resultados:', filtradas.length);
        }

        if (btnAplicar) {
            btnAplicar.addEventListener('click', function (e) {
                e.preventDefault();
                aplicarFiltros();
            });
        }

        // Aplica também ao digitar / trocar um filtro
        if (inputBusca) inputBusca.addEventListener('input', aplicarFiltros);
        [selectStatus, selectPrioridade, selectTipo, selectResponsavel, selectProjeto, selectOrdenacao]
            .forEach(function (s) {
                if (s) s.addEventListener('change', aplicarFiltros);
            });

        aplicarFiltros();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', iniciar);
    } else {
        iniciar();
    }
})();