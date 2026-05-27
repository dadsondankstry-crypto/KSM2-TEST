/* ===== card.js | pacote organizado CINE3 ===== */


/* ===== assets/player/11-player-label.js ===== */
// Extraído de KSM2-CINE3-main-CORRIGIDO.html — bloco JS 12.
(function(){
    function normalizarUrlV24(u){ return String(u || '').toLowerCase(); }

    function detectarNomePlayerCronosV24(url){
        const u = normalizarUrlV24(url || document.getElementById('iframePlayer')?.src || '');
        if (/superflixapi/i.test(u)) return 'Superflix API';
        if (/superembeds/i.test(u)) return 'Superembeds';
        if (/superembed/i.test(u)) return 'Superembed';
        if (/viewplayer/i.test(u)) return 'ViewPlayer';
        if (/playerthree/i.test(u)) return 'PlayerThree';
        if (/trembed/i.test(u)) return 'Trembed';
        return 'Player';
    }

    function garantirEstruturaPlayerLabelV24(){
        const tela = document.getElementById('telaPlayer');
        if (!tela) return;
        const wrapper = tela.querySelector('.player-wrapper');
        const header = tela.querySelector('.header-player');
        const fechar = tela.querySelector('.btn-fechar-player');
        const nav = document.getElementById('playerNavegacao');
        if (!wrapper || !header || !fechar) return;

        let controles = header.querySelector('.player-top-controls-v19');
        if (!controles) {
            controles = document.createElement('div');
            controles.className = 'player-top-controls-v19';
            header.appendChild(controles);
        }

        let labelMobile = document.getElementById('cronosPlayerTipoLabelMobileV24');
        if (!labelMobile) {
            labelMobile = document.createElement('div');
            labelMobile.id = 'cronosPlayerTipoLabelMobileV24';
            labelMobile.className = 'cronos-player-tipo-label-v24';
            labelMobile.textContent = 'Player';
        }
        if (labelMobile.parentElement !== controles) controles.insertBefore(labelMobile, fechar);
        if (fechar.parentElement !== controles) controles.appendChild(fechar);

        let row = document.getElementById('cronosPlayerBottomRowV24');
        if (!row) {
            row = document.createElement('div');
            row.id = 'cronosPlayerBottomRowV24';
        }
        if (row.previousElementSibling !== wrapper) wrapper.insertAdjacentElement('afterend', row);

        let labelDesktop = document.getElementById('cronosPlayerTipoLabelDesktopV24');
        if (!labelDesktop) {
            labelDesktop = document.createElement('div');
            labelDesktop.id = 'cronosPlayerTipoLabelDesktopV24';
            labelDesktop.className = 'cronos-player-tipo-label-v24';
            labelDesktop.textContent = 'Player';
        }
        if (labelDesktop.parentElement !== row) row.insertBefore(labelDesktop, row.firstChild);
        if (nav && nav.parentElement !== row) row.appendChild(nav);
    }

    function atualizarNomePlayerCronosV24(url){
        garantirEstruturaPlayerLabelV24();
        const nome = detectarNomePlayerCronosV24(url);
        const desktop = document.getElementById('cronosPlayerTipoLabelDesktopV24');
        const mobile = document.getElementById('cronosPlayerTipoLabelMobileV24');
        if (desktop) desktop.textContent = nome;
        if (mobile) mobile.textContent = nome;
    }

    const abrirBase = window.abrirPlayer;
    if (typeof abrirBase === 'function' && !abrirBase.__cronosV24PlayerLabel) {
        window.abrirPlayer = function(titulo, urlVideo){
            const r = abrirBase.apply(this, arguments);
            requestAnimationFrame(() => {
                garantirEstruturaPlayerLabelV24();
                atualizarNomePlayerCronosV24(urlVideo || document.getElementById('iframePlayer')?.src || '');
            });
            setTimeout(() => {
                garantirEstruturaPlayerLabelV24();
                atualizarNomePlayerCronosV24(urlVideo || document.getElementById('iframePlayer')?.src || '');
            }, 80);
            return r;
        };
        window.abrirPlayer.__cronosV24PlayerLabel = true;
    }

    const fecharBase = window.fecharPlayer;
    if (typeof fecharBase === 'function' && !fecharBase.__cronosV24PlayerLabel) {
        window.fecharPlayer = function(){
            const r = fecharBase.apply(this, arguments);
            setTimeout(() => atualizarNomePlayerCronosV24(''), 20);
            return r;
        };
        window.fecharPlayer.__cronosV24PlayerLabel = true;
    }

    function iniciar(){
        garantirEstruturaPlayerLabelV24();
        atualizarNomePlayerCronosV24(document.getElementById('iframePlayer')?.src || '');
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
    else iniciar();
    window.addEventListener('resize', () => {
        clearTimeout(window.__cronosV24Resize);
        window.__cronosV24Resize = setTimeout(garantirEstruturaPlayerLabelV24, 120);
    }, { passive: true });
})();



/* ===== assets/player/12-player-label-lock.js ===== */
// Extraído de KSM2-CINE3-main-CORRIGIDO.html — bloco JS 13.
(function(){
    let travando = false;
    function travarLinhaPlayerV26(){
        if(travando) return;
        travando = true;
        try {
            const tela = document.getElementById('telaPlayer');
            const wrap = tela && tela.querySelector('.player-wrapper');
            const nav = document.getElementById('playerNavegacao');
            if(!tela || !wrap) return;

            let row = document.getElementById('cronosPlayerBottomRowV24');
            if(!row){
                row = document.createElement('div');
                row.id = 'cronosPlayerBottomRowV24';
                wrap.insertAdjacentElement('afterend', row);
            } else if(row.previousElementSibling !== wrap){
                wrap.insertAdjacentElement('afterend', row);
            }

            let label = document.getElementById('cronosPlayerTipoLabelDesktopV24');
            if(!label){
                label = document.createElement('div');
                label.id = 'cronosPlayerTipoLabelDesktopV24';
                label.className = 'cronos-player-tipo-label-v24';
                label.textContent = document.getElementById('cronosPlayerTipoLabelMobileV24')?.textContent || 'Player';
            }
            if(label.parentElement !== row) row.insertBefore(label, row.firstChild);
            if(nav && nav.parentElement !== row) row.appendChild(nav);
        } finally {
            travando = false;
        }
    }

    const abrirBase = window.abrirPlayer;
    if(typeof abrirBase === 'function' && !abrirBase.__cronosV26LabelLock){
        window.abrirPlayer = function(){
            const r = abrirBase.apply(this, arguments);
            travarLinhaPlayerV26();
            setTimeout(travarLinhaPlayerV26, 30);
            setTimeout(travarLinhaPlayerV26, 120);
            return r;
        };
        window.abrirPlayer.__cronosV26LabelLock = true;
    }

    const mo = new MutationObserver(() => {
        const tela = document.getElementById('telaPlayer');
        if(tela && tela.classList.contains('ativa')) requestAnimationFrame(travarLinhaPlayerV26);
    });
    function iniciar(){
        travarLinhaPlayerV26();
        const tela = document.getElementById('telaPlayer');
        if(tela) mo.observe(tela, {childList:true, subtree:true});
    }
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
    else iniciar();
})();



/* ===== assets/limpeza/13-banco-local-controles.js ===== */
// Extraído de KSM2-CINE3-main-CORRIGIDO.html — bloco JS 14.
/* =========================================================
   V27 — CONTROLES DO BANCO LOCAL / INDEXEDDB
   - Prioridade do banco dentro de Configurações
   - Exportar banco completo
   - Importar banco completo
   - Banco ON: cards enriquecem pelo IndexedDB primeiro
   - Banco OFF: Home/Filmes/Séries/Episódios usam site primeiro
   - Exceção: filtros por ano continuam usando IndexedDB
========================================================= */
(function(){
    const PRIORIDADE_KEY = 'cronos_idb_prioridade_ativa_v27';
    const IMPORT_INPUT_ID = 'cronosImportarBancoInputV27';

    function bancoPrimeiroAtivo(){
        try { return localStorage.getItem(PRIORIDADE_KEY) !== '0'; }
        catch(e) { return true; }
    }

    function setBancoPrimeiroAtivo(ativo){
        try { localStorage.setItem(PRIORIDADE_KEY, ativo ? '1' : '0'); } catch(e) {}
        atualizarPainelBancoV27();
        const msg = ativo
            ? 'Banco local ativado: Home, Filmes, Séries e Episódios tentam IndexedDB primeiro.'
            : 'Banco local desativado como prioridade: Home, Filmes, Séries e Episódios carregam primeiro pelo site.';
        const status = document.getElementById('cronosBancoStatusV27');
        if(status) status.textContent = msg;
    }

    window.cronosBancoPrimeiroAtivo = bancoPrimeiroAtivo;
    window.cronosSetBancoPrimeiroAtivo = setBancoPrimeiroAtivo;
    window.cronosToggleBancoPrioridade = function(){ setBancoPrimeiroAtivo(!bancoPrimeiroAtivo()); };

    function atualizarPainelBancoV27(){
        const ativo = bancoPrimeiroAtivo();
        const btn = document.getElementById('btnBancoPrioridadeV27');
        const chip = document.getElementById('chipBancoPrioridadeV27');
        const desc = document.getElementById('descBancoPrioridadeV27');
        if(btn){
            btn.classList.toggle('ativo', ativo);
            btn.textContent = ativo ? 'Banco: ATIVADO' : 'Banco: DESATIVADO';
            btn.title = ativo ? 'Clique para fazer as abas principais carregarem primeiro pelo site.' : 'Clique para fazer as abas principais usarem IndexedDB primeiro.';
        }
        if(chip){
            chip.textContent = ativo ? 'IndexedDB primeiro' : 'Site primeiro';
            chip.classList.toggle('desativado', !ativo);
        }
        if(desc){
            desc.textContent = ativo
                ? 'Ativado: Home, Filmes, Séries e Episódios consultam o IndexedDB antes do site. Se faltar dado, o site completa.'
                : 'Desativado: Home, Filmes, Séries e Episódios carregam direto do site. Ano, Lançamentos, Favoritos, Histórico e posters manuais continuam usando o banco quando necessário.';
        }
    }

    function garantirPainelBancoV27(){
        const tela = document.getElementById('telaConfiguracoes');
        if(!tela || document.getElementById('cronosBancoPanelV27')) {
            atualizarPainelBancoV27();
            return;
        }

        const painel = document.createElement('div');
        painel.id = 'cronosBancoPanelV27';
        painel.className = 'cronos-banco-panel-v27';
        painel.innerHTML = `
            <h2 class="sessao-titulo cronos-banco-titulo-v27">Banco Local / IndexedDB</h2>
            <div class="cronos-banco-card-v27">
                <div class="cronos-banco-top-v27">
                    <div>
                        <div class="cronos-banco-label-v27">Prioridade do catálogo</div>
                        <div id="descBancoPrioridadeV27" class="cronos-banco-desc-v27"></div>
                    </div>
                    <span id="chipBancoPrioridadeV27" class="cronos-banco-chip-v27">IndexedDB primeiro</span>
                </div>
                <div class="cronos-banco-actions-v27">
                    <button id="btnBancoPrioridadeV27" type="button" class="sync-toggle-cronos cronos-banco-btn-v27 ativo" onclick="cronosToggleBancoPrioridade()">Banco: ATIVADO</button>
                    <button type="button" class="btn-sync-cronos cronos-banco-btn-v27" onclick="cronosExportarBancoIndexedDB()">Exportar Banco</button>
                    <button type="button" class="btn-sync-cronos cronos-banco-btn-v27" onclick="cronosSelecionarImportarBancoIndexedDB()">Importar Banco</button>
                    <input id="${IMPORT_INPUT_ID}" type="file" accept="application/json,.json" style="display:none">
                </div>
                <div id="cronosBancoStatusV27" class="sync-status-cronos cronos-banco-status-v27">Pronto para usar. Exportar/Importar transfere o IndexedDB entre PC e celular.</div>
            </div>
        `;

        const syncTitulo = Array.from(tela.querySelectorAll('.sessao-titulo')).find(h => /sincroniza/i.test(h.textContent || ''));
        if(syncTitulo) tela.insertBefore(painel, syncTitulo);
        else {
            const atalhos = tela.querySelector('.categoria-atalhos');
            if(atalhos && atalhos.nextSibling) tela.insertBefore(painel, atalhos.nextSibling);
            else tela.insertBefore(painel, tela.firstChild);
        }
        const input = painel.querySelector('#' + IMPORT_INPUT_ID);
        if(input){
            input.addEventListener('change', e => {
                const file = e.target.files && e.target.files[0];
                if(file) cronosImportarBancoIndexedDB(file).finally(() => { input.value = ''; });
            });
        }
        atualizarPainelBancoV27();
    }

    window.cronosSelecionarImportarBancoIndexedDB = function(){
        garantirPainelBancoV27();
        const input = document.getElementById(IMPORT_INPUT_ID);
        if(input) input.click();
    };

    async function getStoresBackupV27(){
        const stores = (typeof CRONOS_STORES !== 'undefined' && Array.isArray(CRONOS_STORES))
            ? CRONOS_STORES.slice()
            : ['configuracoes','favoritos','historico','obras','episodios','temporadas','generos','anos','syncLogs'];
        return stores;
    }

    window.cronosExportarBancoIndexedDB = async function(){
        const status = document.getElementById('cronosBancoStatusV27');
        try{
            if(status) status.textContent = 'Exportando banco IndexedDB...';
            if(typeof migrarLocalStorageParaIndexedDB === 'function') await migrarLocalStorageParaIndexedDB();
            const stores = await getStoresBackupV27();
            const data = {};
            for(const store of stores){
                try { data[store] = await dbGetAll(store); }
                catch(e){ data[store] = []; }
            }
            const payload = {
                app: 'Cronos',
                providerKey: (typeof CRONOS_PROVIDER_KEY !== 'undefined' ? CRONOS_PROVIDER_KEY : 'provedor01'),
                dbName: (typeof CRONOS_DB_NAME !== 'undefined' ? CRONOS_DB_NAME : 'CronosDB_BoraFlix'),
                dbVersion: (typeof CRONOS_DB_VERSION !== 'undefined' ? CRONOS_DB_VERSION : 1),
                exportedAt: new Date().toISOString(),
                stores,
                data,
                localSettings: {
                    prioridadeBancoAtiva: bancoPrimeiroAtivo(),
                    lancamentosCache: localStorage.getItem(typeof CRONOS_LANCAMENTOS_CACHE_KEY !== 'undefined' ? CRONOS_LANCAMENTOS_CACHE_KEY : 'cronos_lancamentos_episodios_obras_unicas_v4') || ''
                }
            };
            const blob = new Blob([JSON.stringify(payload, null, 2)], {type:'application/json'});
            const a = document.createElement('a');
            const dataHoje = new Date().toISOString().slice(0,19).replace(/[:T]/g,'-');
            a.href = URL.createObjectURL(blob);
            a.download = `Cronos_IndexedDB_Backup_${dataHoje}.json`;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
            if(status) status.textContent = 'Banco exportado com sucesso.';
        }catch(e){
            console.error('Falha ao exportar banco:', e);
            if(status) status.textContent = 'Erro ao exportar banco. Veja o console.';
            alert('Erro ao exportar banco. Veja o console.');
        }
    };

    window.cronosImportarBancoIndexedDB = async function(file){
        const status = document.getElementById('cronosBancoStatusV27');
        try{
            if(!file) return;
            const texto = await file.text();
            const payload = JSON.parse(texto);
            if(!payload || !payload.data || typeof payload.data !== 'object') throw new Error('Arquivo inválido.');
            const stores = Array.isArray(payload.stores) ? payload.stores : Object.keys(payload.data);
            const totalItens = stores.reduce((s, st) => s + (Array.isArray(payload.data[st]) ? payload.data[st].length : 0), 0);
            const ok = confirm(`Importar banco do Cronos?\n\nItens no arquivo: ${totalItens}\n\nIsso vai substituir os dados atuais do IndexedDB deste Cronos.`);
            if(!ok) return;
            if(status) status.textContent = 'Importando banco IndexedDB...';
            if(typeof abrirCronosDB === 'function') await abrirCronosDB();
            for(const store of stores){
                if(!payload.data[store] || !Array.isArray(payload.data[store])) continue;
                try { await dbClear(store); } catch(e) { console.warn('Não limpou store', store, e); }
                for(const item of payload.data[store]){
                    if(!item || !item.id) continue;
                    try { await dbPut(store, item); } catch(e) { console.warn('Falha item importado', store, item, e); }
                }
            }
            if(payload.localSettings){
                if(Object.prototype.hasOwnProperty.call(payload.localSettings, 'prioridadeBancoAtiva')){
                    setBancoPrimeiroAtivo(!!payload.localSettings.prioridadeBancoAtiva);
                }
                if(payload.localSettings.lancamentosCache && typeof CRONOS_LANCAMENTOS_CACHE_KEY !== 'undefined'){
                    localStorage.setItem(CRONOS_LANCAMENTOS_CACHE_KEY, payload.localSettings.lancamentosCache);
                }
            }
            if(typeof atualizarResumoSincronizacaoCronos === 'function') await atualizarResumoSincronizacaoCronos();
            if(typeof atualizarInfoProgressoSyncCronos === 'function') await atualizarInfoProgressoSyncCronos();
            if(status) status.textContent = 'Banco importado com sucesso. Reabra a aba desejada para recarregar os dados.';
            alert('Banco importado com sucesso.');
        }catch(e){
            console.error('Falha ao importar banco:', e);
            if(status) status.textContent = 'Erro ao importar banco. Verifique se o arquivo é um backup válido.';
            alert('Erro ao importar banco. Verifique se o arquivo é um backup válido.');
        }
    };

    function gridUsaSitePrimeiroV27(gridId){
        if(bancoPrimeiroAtivo()) return false;
        return ['gridInicioFilmes','gridInicioSeries','gridInicioEpisodios','gridFilmes','gridSeries','gridEpisodios'].includes(gridId);
    }

    // Site primeiro: não consulta dbGet antes de montar o card. Ainda salva no banco depois, se conseguir enriquecer.
    const prepararDBFirstOriginalV27 = window.prepararCardObraDBFirst;
    window.prepararCardObraDBFirst = async function(li, dadosBasicos, itemOriginal, gridId){
        if(!gridUsaSitePrimeiroV27(gridId)){
            return prepararDBFirstOriginalV27.apply(this, arguments);
        }
        try{
            colocarSkeletonCard(li);
            const base = dadosBasicosParaObra(dadosBasicos);
            const imgListagem = normalizarImagemCard(dadosBasicos.img || dadosBasicos.poster || '');
            const podeUsarListagem = itemOriginal && itemJaTemPosterBom(itemOriginal) && posterBomCronos(imgListagem);
            if(podeUsarListagem){
                const dados = { ...base, poster: imgListagem, img: imgListagem };
                preencherCardObraCronos(li, dados, gridId);
                salvarObraCronos(dados).catch(()=>{});
                return;
            }
            // Não achou poster bom na listagem: consulta a ficha do site, não o banco.
            const detalhes = await extrairDetalhesDestaquePremium(dadosBasicos.url).catch(() => ({})) || {};
            const posterDetalhe = escolherPosterSeguroCronos(detalhes.poster, detalhes.img, dadosBasicos.poster, dadosBasicos.img);
            const dados = {
                ...base,
                ...detalhes,
                url: base.url || detalhes.url || dadosBasicos.url || '',
                titulo: limparTextoCard(detalhes.titulo || '') || limparTextoCard(base.titulo || '') || 'Sem título',
                ano: extrairAnoCard(detalhes.ano || '') || extrairAnoCard(base.ano || '') || '',
                tipo: base.tipo || detalhes.tipo || (base.isMovie ? 'Filme' : 'Série'),
                isMovie: !!(base.isMovie || detalhes.isMovie),
                isSerie: !(base.isMovie || detalhes.isMovie),
                poster: posterDetalhe || placeholderCronosPoster(),
                img: posterDetalhe || placeholderCronosPoster()
            };
            preencherCardObraCronos(li, dados, gridId);
            salvarObraCronos(dados).catch(()=>{});
        }catch(e){
            console.warn('Falha no modo site primeiro:', e);
            try { preencherCardObraCronos(li, { ...dadosBasicosParaObra(dadosBasicos), poster: placeholderCronosPoster(), img: placeholderCronosPoster() }, gridId); } catch(_) {}
        }
    };

    // Categoria/Ano: sempre consulta somente o IndexedDB. Não faz fallback para o site.
    const abrirFiltroCategoriaOriginalV27 = window.abrirFiltroCategoria;
    window.abrirFiltroCategoria = async function(tipo, titulo, urlBase){
        return abrirFiltroCategoriaOriginalV27.apply(this, arguments);
    };

    // Garante que o painel apareça sempre dentro de Configurações, mesmo depois de remonte.
    const montarCategoriasOriginalV27 = window.montarCategorias;
    if(typeof montarCategoriasOriginalV27 === 'function'){
        window.montarCategorias = async function(){
            const r = await montarCategoriasOriginalV27.apply(this, arguments);
            garantirPainelBancoV27();
            return r;
        };
    }
    const carregarConfiguracoesOriginalV27 = window.carregarConfiguracoes;
    if(typeof carregarConfiguracoesOriginalV27 === 'function'){
        window.carregarConfiguracoes = function(){
            const r = carregarConfiguracoesOriginalV27.apply(this, arguments);
            setTimeout(garantirPainelBancoV27, 0);
            setTimeout(garantirPainelBancoV27, 200);
            return r;
        };
    }

    const css = document.createElement('style');
    css.textContent = `
        .cronos-banco-panel-v27{margin:14px 0 22px;}
        .cronos-banco-titulo-v27{margin-top:12px!important;}
        .cronos-banco-card-v27{background:#090909;border:1px solid #232323;border-radius:12px;padding:14px;box-shadow:inset 0 0 0 1px rgba(0,255,255,.04);}
        .cronos-banco-top-v27{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:12px;}
        .cronos-banco-label-v27{color:#ffcc00;font-weight:bold;text-transform:uppercase;font-size:13px;margin-bottom:5px;}
        .cronos-banco-desc-v27{color:#ccc;font-size:13px;line-height:1.4;}
        .cronos-banco-chip-v27{white-space:nowrap;color:#000;background:#00ffff;border:1px solid #00ffff;border-radius:999px;padding:6px 10px;font-weight:bold;font-size:12px;}
        .cronos-banco-chip-v27.desativado{background:#ffcc00;border-color:#ffcc00;color:#000;}
        .cronos-banco-actions-v27{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:10px 0;}
        .cronos-banco-btn-v27{min-height:36px;}
        .cronos-banco-status-v27{margin-top:10px;}
        @media(max-width:700px){.cronos-banco-top-v27{flex-direction:column}.cronos-banco-actions-v27 button{flex:1 1 100%;}.cronos-banco-chip-v27{align-self:flex-start;}}
    `;
    document.head.appendChild(css);

    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', garantirPainelBancoV27);
    else setTimeout(garantirPainelBancoV27, 0);
})();



/* ===== assets/storage/14-favoritos-historico-unico.js ===== */
// Extraído de KSM2-CINE3-main-CORRIGIDO.html — bloco JS 15.
/*
   CORREÇÃO V41 — Favoritos e Histórico sem duplicar
   - Canoniza URL antes de salvar.
   - Favoritos: se já existir a mesma obra com URL parecida, remove/atualiza sem duplicar.
   - Histórico: play do filme e abertura da ficha viram o mesmo registro, só atualiza o último acesso.
   - Limpeza: remove duplicados antigos já existentes no IndexedDB.
*/
(function(){
    const FLAG = '__cronosFixUnicoFavHistV41';
    if (window[FLAG]) return;
    window[FLAG] = true;

    function providerKeyCronosV41(){
        try { if (typeof CRONOS_PROVIDER_KEY !== 'undefined' && CRONOS_PROVIDER_KEY) return String(CRONOS_PROVIDER_KEY); } catch(e) {}
        try { if (typeof SITE_CODE !== 'undefined' && SITE_CODE) return String(SITE_CODE); } catch(e) {}
        return 'CRONOS';
    }

    function baseUrlCronosV41(){
        try { if (typeof CRONOS_BASE_URL !== 'undefined' && CRONOS_BASE_URL) return String(CRONOS_BASE_URL); } catch(e) {}
        return location.href;
    }

    function urlCanonicaCronosV41(url){
        let u = String(url || '').trim().replace(/&amp;/g, '&');
        if (!u) return '';
        try { u = new URL(u, baseUrlCronosV41()).href; } catch(e) {}
        return String(u)
            .replace(/[?#].*$/, '')
            .replace(/\/+$/, '')
            .trim();
    }

    function textoChaveCronosV41(v){
        return String(v || '')
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/\b(assistir|online|dublado|legendado|gratis|grátis|hd|full hd|filme|serie|série)\b/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function anoChaveCronosV41(v){
        return String(v || '').match(/\b(19|20)\d{2}\b/)?.[0] || '';
    }

    function idCanonicoCronosV41(url){
        return `${providerKeyCronosV41()}::${urlCanonicaCronosV41(url)}`;
    }

    function chaveItemCronosV41(item){
        const url = urlCanonicaCronosV41(item && item.url);
        if (url) return 'url::' + url;
        const titulo = textoChaveCronosV41(item && item.titulo);
        const ano = anoChaveCronosV41(item && item.ano);
        return titulo ? `titulo::${titulo}::${ano}` : '';
    }

    async function garantirDBV41(){
        if (typeof window.migrarLocalStorageParaIndexedDB === 'function') {
            await window.migrarLocalStorageParaIndexedDB().catch(() => {});
        } else if (typeof migrarLocalStorageParaIndexedDB === 'function') {
            await migrarLocalStorageParaIndexedDB().catch(() => {});
        } else if (typeof abrirCronosDB === 'function') {
            await abrirCronosDB().catch(() => {});
        }
    }

    async function getAllStoreV41(store){
        if (typeof dbGetAll !== 'function') return [];
        await garantirDBV41();
        return await dbGetAll(store).catch(() => []);
    }

    async function deleteStoreV41(store, id){
        if (typeof dbDelete !== 'function' || !id) return;
        await dbDelete(store, id).catch(() => {});
    }

    async function putStoreV41(store, item){
        if (typeof dbPut !== 'function' || !item) return;
        await dbPut(store, item).catch(() => {});
    }

    async function apagarDuplicadosStoreV41(store, itemAtual){
        const todos = await getAllStoreV41(store);
        const chaveAtual = chaveItemCronosV41(itemAtual);
        const idAtual = itemAtual && itemAtual.id ? String(itemAtual.id) : idCanonicoCronosV41(itemAtual && itemAtual.url);
        const removidos = [];

        for (const item of todos) {
            if (!item || !item.id) continue;
            const mesmaId = String(item.id) === idAtual;
            const mesmaChave = chaveAtual && chaveItemCronosV41(item) === chaveAtual;
            const mesmaUrlCanonica = urlCanonicaCronosV41(item.url) && urlCanonicaCronosV41(item.url) === urlCanonicaCronosV41(itemAtual && itemAtual.url);
            if ((mesmaChave || mesmaUrlCanonica) && !mesmaId) {
                removidos.push(item.id);
            }
        }

        for (const id of removidos) await deleteStoreV41(store, id);
        return removidos.length;
    }

    async function listaUnicaStoreV41(store){
        const todos = await getAllStoreV41(store);
        const vistos = new Set();
        const saida = [];

        for (const item of todos) {
            if (!item) continue;
            const chave = chaveItemCronosV41(item);
            if (!chave || vistos.has(chave)) {
                if (item.id) deleteStoreV41(store, item.id);
                continue;
            }

            vistos.add(chave);
            const urlCanonica = urlCanonicaCronosV41(item.url);
            const idCanonico = idCanonicoCronosV41(urlCanonica);
            const precisaCorrigir = urlCanonica && (item.url !== urlCanonica || item.id !== idCanonico);

            const corrigido = {
                ...item,
                url: urlCanonica || item.url,
                id: urlCanonica ? idCanonico : item.id,
                providerKey: providerKeyCronosV41(),
                providerName: item.providerName || (typeof CRONOS_PROVIDER_NAME !== 'undefined' ? CRONOS_PROVIDER_NAME : 'Cronos'),
                baseUrl: item.baseUrl || baseUrlCronosV41()
            };

            if (precisaCorrigir) {
                if (item.id && item.id !== corrigido.id) await deleteStoreV41(store, item.id);
                await putStoreV41(store, corrigido);
            }

            saida.push(corrigido);
        }

        return saida;
    }

    const normalizarOriginalV41 = window.normalizarObraParaBanco || (typeof normalizarObraParaBanco === 'function' ? normalizarObraParaBanco : null);
    if (typeof normalizarOriginalV41 === 'function' && !normalizarOriginalV41.__cronosUnicoV41) {
        const normalizarCorrigida = function(obra = {}) {
            const urlOriginal = obra && obra.url ? obra.url : '';
            const urlCanonica = urlCanonicaCronosV41(urlOriginal);
            const registro = normalizarOriginalV41({ ...obra, url: urlCanonica || urlOriginal });
            if (urlCanonica) {
                registro.url = urlCanonica;
                registro.id = idCanonicoCronosV41(urlCanonica);
            }
            registro.providerKey = providerKeyCronosV41();
            if (!registro.providerName) {
                try { registro.providerName = CRONOS_PROVIDER_NAME; } catch(e) { registro.providerName = 'Cronos'; }
            }
            return registro;
        };
        normalizarCorrigida.__cronosUnicoV41 = true;
        window.normalizarObraParaBanco = normalizarCorrigida;
        try { normalizarObraParaBanco = normalizarCorrigida; } catch(e) {}
    }

    window.getFavoritos = async function(){
        const favs = await listaUnicaStoreV41('favoritos');
        return favs.sort((a, b) => String(b.updatedAt || b.createdAt || b.salvoEm || '').localeCompare(String(a.updatedAt || a.createdAt || a.salvoEm || '')));
    };
    try { getFavoritos = window.getFavoritos; } catch(e) {}

    window.isFavoritoCronos = async function(url){
        const u = urlCanonicaCronosV41(url);
        if (!u) return false;
        const favs = await listaUnicaStoreV41('favoritos');
        return favs.some(f => urlCanonicaCronosV41(f.url) === u);
    };
    try { isFavoritoCronos = window.isFavoritoCronos; } catch(e) {}

    window.toggleFavorito = async function(){
        const obra = (window.obraSendoVista && window.obraSendoVista.url) ? window.obraSendoVista : (typeof obraSendoVista !== 'undefined' ? obraSendoVista : null);
        if (!obra || !obra.url) return;

        await garantirDBV41();
        const urlCanonica = urlCanonicaCronosV41(obra.url);
        const todos = await listaUnicaStoreV41('favoritos');
        const existentes = todos.filter(f => urlCanonicaCronosV41(f.url) === urlCanonica);
        const btn = document.getElementById('btnFavoritar');

        if (existentes.length) {
            for (const fav of existentes) await deleteStoreV41('favoritos', fav.id);
            if (btn) { btn.innerText = '⭐ Favoritar'; btn.classList.remove('ativo'); }
        } else {
            const registro = (typeof normalizarObraParaBanco === 'function')
                ? normalizarObraParaBanco({ ...obra, url: urlCanonica, salvoEm: new Date().toISOString() })
                : { ...obra, url: urlCanonica, id: idCanonicoCronosV41(urlCanonica), salvoEm: new Date().toISOString() };
            await apagarDuplicadosStoreV41('favoritos', registro);
            await putStoreV41('favoritos', registro);
            if (btn) { btn.innerText = '🌟 Remover Favorito'; btn.classList.add('ativo'); }
        }

        if (typeof renderizarResumoHomeLocal === 'function') renderizarResumoHomeLocal();
        if (document.getElementById('telaFavoritos')?.classList.contains('ativa') && typeof carregarFavoritos === 'function') carregarFavoritos();
    };
    try { toggleFavorito = window.toggleFavorito; } catch(e) {}

    window.checarBotaoFavorito = async function(urlVerificacao){
        const btn = document.getElementById('btnFavoritar');
        if (!btn) return;
        const isFav = await window.isFavoritoCronos(urlVerificacao);
        if (isFav) { btn.innerText = '🌟 Remover Favorito'; btn.classList.add('ativo'); }
        else { btn.innerText = '⭐ Favoritar'; btn.classList.remove('ativo'); }
    };
    try { checarBotaoFavorito = window.checarBotaoFavorito; } catch(e) {}

    window.adicionarBotaoFavoritarHoverCronos = function(li, dados){
        if (!li || !dados || !dados.url) return;
        if (li.querySelector('.btn-favoritar-card')) return;

        const btn = document.createElement('button');
        btn.className = 'btn-favoritar-card';
        btn.innerText = 'FAVORITAR';

        btn.onclick = async (event) => {
            event.preventDefault();
            event.stopPropagation();

            const urlCanonica = urlCanonicaCronosV41(dados.url);
            const todos = await listaUnicaStoreV41('favoritos');
            const existentes = todos.filter(f => urlCanonicaCronosV41(f.url) === urlCanonica);

            if (existentes.length) {
                for (const fav of existentes) await deleteStoreV41('favoritos', fav.id);
                btn.innerText = 'FAVORITAR';
                btn.classList.remove('ativo');
            } else {
                const posterAtual = li.dataset.poster || li.querySelector('.card-media img')?.src || dados.poster || dados.img || '';
                const registro = (typeof normalizarObraParaBanco === 'function')
                    ? normalizarObraParaBanco({ ...dados, url: urlCanonica, img: posterAtual, poster: posterAtual, salvoEm: new Date().toISOString() })
                    : { ...dados, url: urlCanonica, id: idCanonicoCronosV41(urlCanonica), img: posterAtual, poster: posterAtual, salvoEm: new Date().toISOString() };
                await apagarDuplicadosStoreV41('favoritos', registro);
                await putStoreV41('favoritos', registro);
                btn.innerText = 'SALVO';
                btn.classList.add('ativo');
            }

            if (typeof renderizarResumoHomeLocal === 'function') renderizarResumoHomeLocal();
        };

        li.appendChild(btn);

        window.isFavoritoCronos(dados.url).then(isFav => {
            if (isFav) {
                btn.innerText = 'SALVO';
                btn.classList.add('ativo');
            }
        }).catch(() => {});
    };
    try { adicionarBotaoFavoritarHoverCronos = window.adicionarBotaoFavoritarHoverCronos; } catch(e) {}

    const carregarFavOriginalV41 = window.carregarFavoritos || (typeof carregarFavoritos === 'function' ? carregarFavoritos : null);
    if (typeof carregarFavOriginalV41 === 'function') {
        window.carregarFavoritos = async function(btnElement){
            await listaUnicaStoreV41('favoritos');
            return carregarFavOriginalV41.apply(this, arguments);
        };
        try { carregarFavoritos = window.carregarFavoritos; } catch(e) {}
    }

    async function salvarHistoricoUnicoV41(item){
        if (!item || !item.url || !item.titulo || item.titulo === 'undefined') return;
        await garantirDBV41();

        const obraAtual = (window.obraSendoVista && window.obraSendoVista.url) ? window.obraSendoVista : null;
        const veioDeEpisodio = String(item.url || '').includes('/episodios/') || String(item.tipo || '').toLowerCase().includes('epis');
        const base = (obraAtual && obraAtual.url) ? obraAtual : item;
        const urlCanonica = urlCanonicaCronosV41(base.url || item.url);
        if (!urlCanonica) return;

        const idCanonico = idCanonicoCronosV41(urlCanonica);
        const obraSalva = (typeof dbGet === 'function') ? await dbGet('obras', idCanonico).catch(() => null) : null;

        const posterObra = (typeof escolherPosterSeguroCronos === 'function')
            ? escolherPosterSeguroCronos(base.poster, base.img, obraSalva && obraSalva.poster, obraSalva && obraSalva.img, item.poster, item.img)
            : (base.poster || base.img || item.poster || item.img || '');

        const backdropObra = (typeof escolherBackdropSeguroCronos === 'function')
            ? escolherBackdropSeguroCronos(base.backdrop, obraSalva && obraSalva.backdrop, item.backdrop)
            : (base.backdrop || item.backdrop || '');

        const registroBase = {
            ...(obraSalva || {}),
            ...base,
            url: urlCanonica,
            titulo: base.titulo || item.titulo,
            poster: posterObra,
            img: posterObra,
            backdrop: backdropObra,
            playerUrl: item.playerUrl || '',
            ultimoAcesso: new Date().toISOString()
        };

        if (veioDeEpisodio && !(registroBase.isMovie || registroBase.tipo === 'Filme')) {
            registroBase.tipo = 'Série';
            registroBase.isSerie = true;
            registroBase.episodio = '';
        }

        const registro = (typeof normalizarObraParaBanco === 'function')
            ? normalizarObraParaBanco(registroBase)
            : { ...registroBase, id: idCanonico };

        registro.id = idCanonico;
        registro.url = urlCanonica;
        registro.poster = posterObra;
        registro.img = posterObra;
        registro.ultimoAcesso = registroBase.ultimoAcesso;

        await apagarDuplicadosStoreV41('historico', registro);
        await putStoreV41('historico', registro);
        if (typeof renderizarResumoHomeLocal === 'function') renderizarResumoHomeLocal();
    }

    window.salvarHistoricoHome = salvarHistoricoUnicoV41;
    try { salvarHistoricoHome = salvarHistoricoUnicoV41; } catch(e) {}

    window.getHistoricoHome = async function(){
        const hist = await listaUnicaStoreV41('historico');
        return hist.sort((a, b) => String(b.ultimoAcesso || b.updatedAt || '').localeCompare(String(a.ultimoAcesso || a.updatedAt || '')));
    };
    try { getHistoricoHome = window.getHistoricoHome; } catch(e) {}

    const carregarHistOriginalV41 = window.carregarHistorico || (typeof carregarHistorico === 'function' ? carregarHistorico : null);
    if (typeof carregarHistOriginalV41 === 'function') {
        window.carregarHistorico = async function(btnElement){
            await listaUnicaStoreV41('historico');
            return carregarHistOriginalV41.apply(this, arguments);
        };
        try { carregarHistorico = window.carregarHistorico; } catch(e) {}
    }

    window.cronosCorrigirDuplicadosFavoritosHistorico = async function(){
        await listaUnicaStoreV41('favoritos');
        await listaUnicaStoreV41('historico');
        if (typeof renderizarResumoHomeLocal === 'function') renderizarResumoHomeLocal();
    };

    // Executa uma limpeza leve ao abrir o arquivo, sem apagar dados únicos.
    setTimeout(() => {
        window.cronosCorrigirDuplicadosFavoritosHistorico().catch(e => console.warn('Falha ao corrigir duplicados:', e));
    }, 800);
})();



/* ===== assets/config/15-config-lancamentos.js ===== */
// Extraído de KSM2-CINE3-main-CORRIGIDO.html — bloco JS 16.
(function(){
    function normCronosAjuste(t){return String(t||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();}
    function acharBotaoPorTexto(container, texto){
        const alvo = normCronosAjuste(texto);
        return [...container.querySelectorAll('button,a')].find(b => normCronosAjuste(b.textContent).includes(alvo));
    }
    function criarBotaoAtalho(texto, acao){
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'categoria-atalho-btn';
        b.textContent = texto;
        b.onclick = acao;
        return b;
    }
    function aplicarAjusteConfigLancamentos(){
        const cat = document.getElementById('telaCategorias');
        if(cat){
            [...cat.querySelectorAll('.categoria-atalhos button,.categoria-atalhos a,.cronos-categoria-atalhos-letras button,.cronos-categoria-atalhos-letras a')].forEach(b => {
                const t = normCronosAjuste(b.textContent);
                if(t.includes('episod') || t.includes('lancamento') || t.includes('anime')) b.remove();
            });
            [...cat.querySelectorAll('.categoria-atalhos,.cronos-categoria-atalhos-letras')].forEach(box => {
                if(!box.querySelector('button,a')) box.remove();
            });
        }

        const cfg = document.getElementById('telaConfiguracoes');
        if(!cfg) return;
        let box = cfg.querySelector('.cronos-categoria-atalhos-letras') || cfg.querySelector('.categoria-atalhos');
        if(!box){
            box = document.createElement('div');
            box.className = 'cronos-categoria-atalhos-letras';
            const titulo = [...cfg.querySelectorAll('h1,h2,h3')].find(h => /configura/i.test(h.textContent||''));
            if(titulo && titulo.nextSibling) cfg.insertBefore(box, titulo.nextSibling);
            else cfg.insertBefore(box, cfg.firstChild);
        }
        box.classList.add('cronos-categoria-atalhos-letras');

        let btnTemp = acharBotaoPorTexto(cfg, 'Temporadas') || criarBotaoAtalho('Temporadas', function(e){
            e.preventDefault();
            if(typeof window.iniciarNavegacao === 'function') window.iniciarNavegacao('telaTemporadas', 'https://www.boraflix.click/temporadas/', document.querySelector('button[onclick*=\'carregarConfiguracoes\']') || this);
        });
        let btnEp = acharBotaoPorTexto(cfg, 'Episódios') || criarBotaoAtalho('Episódios', function(e){
            e.preventDefault();
            if(typeof window.iniciarNavegacao === 'function') window.iniciarNavegacao('telaEpisodios', 'https://www.boraflix.click/episodios/', document.querySelector('button[onclick*=\'carregarConfiguracoes\']') || this);
        });
        let btnLetras = cfg.querySelector('.btn-letras-categoria-cronos');
        let btnLanc = acharBotaoPorTexto(cfg, 'Lançamentos') || criarBotaoAtalho('Lançamentos', function(e){
            e.preventDefault();
            if(typeof window.carregarLancamentos === 'function') window.carregarLancamentos(document.querySelector('button[onclick*=\'carregarConfiguracoes\']') || this);
            else if(typeof window.ativarTela === 'function') window.ativarTela('telaLancamentos', this);
        });
        let btnAnime = acharBotaoPorTexto(cfg, 'Animes') || acharBotaoPorTexto(cfg, 'Anime') || criarBotaoAtalho('Animes', function(e){
            e.preventDefault();
            if(typeof window.iniciarNavegacao === 'function') window.iniciarNavegacao('telaAnimes', 'https://primeflix.mom/animes', document.querySelector('button[onclick*=\'carregarConfiguracoes\']') || this);
        });

        btnTemp.textContent = 'Temporadas';
        btnEp.textContent = 'Episódios';
        btnLanc.textContent = 'Lançamentos';
        btnAnime.textContent = 'Animes';
        if(btnLetras) btnLetras.textContent = 'Letras';

        [btnTemp, btnEp, btnLetras, btnLanc, btnAnime].filter(Boolean).forEach(b => box.appendChild(b));
    }
    function agendar(){aplicarAjusteConfigLancamentos(); setTimeout(aplicarAjusteConfigLancamentos, 250); setTimeout(aplicarAjusteConfigLancamentos, 1000); setTimeout(aplicarAjusteConfigLancamentos, 2000);}
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', agendar); else agendar();
})();

