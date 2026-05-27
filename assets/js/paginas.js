/* ===== paginas.js | pacote organizado CINE3 ===== */


/* ===== assets/player/17-player-whitelist.js ===== */
// Extraído de KSM2-CINE3-main-CORRIGIDO.html — bloco JS 18.
(function(){
    const HOST_BLOQUEADO = [
        'megaembed.link',
        'suaap.com',
        'api.playerp1.sbs',
        'myvidplay.com'
    ];
    const SUPERFLIX_HOSTS = ['superflixapi.best', 'superflixapi.online', 'warezcdn.lat'];

    function normTxt(s){
        return String(s || '')
            .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
            .toLowerCase().replace(/\s+/g,' ').trim();
    }
    function dominioDe(url){
        try { return new URL(url).hostname.replace(/^www\./,'').toLowerCase(); } catch(e) { return ''; }
    }
    function caminhoDe(url){
        try { return new URL(url).pathname || ''; } catch(e) { return ''; }
    }
    function superflixValido(url){
        const host = dominioDe(url);
        if(!SUPERFLIX_HOSTS.includes(host)) return false;
        const path = caminhoDe(url).replace(/\/+$/,'');
        return /^\/filme\/[A-Za-z0-9_.-]+$/i.test(path) || /^\/serie\/[A-Za-z0-9_.-]+\/\d+\/\d+$/i.test(path);
    }
    function superembedsValido(url){
        const host = dominioDe(url);
        if(host !== 'superembeds.com') return false;
        const path = caminhoDe(url).replace(/\/+$/,'');
        return /^\/embed\/[A-Za-z0-9_.:-]+$/i.test(path);
    }
    function ehDominioPuroSuperembeds(url){
        const host = dominioDe(url);
        if(host !== 'superembeds.com') return false;
        const path = caminhoDe(url).replace(/\/+$/,'');
        return !path || path === '/';
    }

    function ehDominioPuroSuperflix(url){
        const host = dominioDe(url);
        if(!SUPERFLIX_HOSTS.includes(host)) return false;
        const path = caminhoDe(url).replace(/\/+$/,'');
        return !path || path === '/' || path === '/inicio';
    }

    window.cronosPlayerBloqueado = function(url){
        const u = String(url || '').toLowerCase();
        if(!u) return true;
        if(u.includes('youtube') || u.includes('youtu.be') || u.includes('youtube-nocookie')) return true;
        if(u.includes('/ads/') || u.includes('22bet') || u.includes('betano') || u.includes('doubleclick')) return true;
        if(u.includes('adserver') || u.includes('facebook.com') || u.includes('googlesyndication')) return true;
        if(u.includes('.mp4?') || /\.mp4(?:$|[?#])/i.test(u)) return true;
        if(/\.(jpg|jpeg|png|webp|gif|svg|css|js)(?:$|[?#])/i.test(u)) return true;
        if(u.includes('image.tmdb.org')) return true;
        if(HOST_BLOQUEADO.some(h => u.includes(h))) return true;
        if(ehDominioPuroSuperembeds(url)) return true;
        if(dominioDe(url) === 'superembeds.com' && !superembedsValido(url)) return true;
        if(ehDominioPuroSuperflix(url)) return true;
        if(SUPERFLIX_HOSTS.includes(dominioDe(url)) && !superflixValido(url)) return true;
        return false;
    };

    window.cronosNormalizarUrlPlayer = function(url, base = ''){
        try {
            let u = String(url || '').trim().replace(/&amp;/g, '&').replace(/&#038;/g, '&').replace(/\\/g, '');
            if(!u) return '';
            u = u.split(/\s+/)[0].replace(/["'<>]/g, '').trim();
            try { u = decodeURIComponent(u); } catch(e) {}
            if(u.startsWith('//')) u = 'https:' + u;
            if(u.startsWith('/')) {
                const b = base || (window.obraSendoVista && window.obraSendoVista.baseUrl) || (typeof CRONOS_BASE_URL !== 'undefined' ? CRONOS_BASE_URL : location.href);
                u = new URL(u, b).href;
            }
            return u;
        } catch(e) { return String(url || '').trim(); }
    };

    function classePlayer(url){
        const u = String(url || '').toLowerCase();
        const host = dominioDe(url);
        if(superembedsValido(url) || (u.includes('superembed') && !u.includes('superembeds.com'))) return 'superembeds';
        if(superflixValido(url)) return 'superflixapi';
        if(u.includes('playerembedapi.link')) return 'playerembedapi';
        if(u.includes('myvidplay.com')) return 'myvidplay';
        if(u.includes('viewplayer.online')) return 'viewplayer';
        if(u.includes('playerthree.online')) return 'playerthree';
        if(u.includes('abyssplayer') || u.includes('lisoflix.net/abyss') || u.includes('trembed=')) return 'liso';
        return 'desconhecido';
    }
    function nomePlayer(classe, url){
        if(classe === 'superembeds') return 'SuperEmbeds';
        if(classe === 'superflixapi') return 'SuperflixAPI';
        if(classe === 'playerembedapi') return 'PlayerEmbedAPI';
        if(classe === 'myvidplay') return 'MyVidPlay';
        if(classe === 'viewplayer') return 'ViewPlayer Original';
        if(classe === 'playerthree') return 'PlayerThree Original';
        if(classe === 'liso') return 'Abyss Player';
        const host = dominioDe(url);
        return host ? host : 'Player desconhecido';
    }
    function audioPlayer(label, url){
        const t = normTxt(label + ' ' + url);
        if(/\bleg\b|legendado|legendada|legenda/.test(t)) return 'Legendado';
        if(/\bdub\b|dublado|dublada|lang=dub|audio=dub/.test(t)) return 'Dublado';
        return '';
    }
    function prioridadePlayer(p){
        const c = p.classe || classePlayer(p.src);
        const map = {
            superembeds: 10,
            superflixapi: 20,
            playerembedapi: 30,
            myvidplay: 40,
            viewplayer: 50,
            playerthree: 60,
            liso: 70
        };
        return map[c] || 90;
    }
    function audioPeso(audio){
        if(audio === 'Dublado') return 1;
        if(audio === 'Legendado') return 2;
        return 3;
    }
    function chavePlayer(src){
        return String(src || '').replace(/#.*$/, '').replace(/\/+$/, '').trim().toLowerCase();
    }

    window.cronosRotuloPlayer = function(player){
        const src = player && player.src || '';
        const classe = player && player.classe || classePlayer(src);
        const nome = player && player.nome || nomePlayer(classe, src);
        // Abyss/IBIS/Liso é player intermediário. Se não existir link direto diferente,
        // não mostra Dublado/Legendado fora: deixa apenas Abyss Player para escolher dentro.
        if(classe === 'liso') return 'Abyss Player';
        const audio = player && player.audio || audioPlayer(player && player.label, src);
        if(audio && !/Original/i.test(nome)) return `${audio} — ${nome}`;
        return nome;
    };

    window.cronosPushPlayer = function(lista, vistos, src, label = '', tipo = 'direto', base = ''){
        src = window.cronosNormalizarUrlPlayer(src, base);
        if(!src || window.cronosPlayerBloqueado(src)) return;
        const cls = classePlayer(src);
        if(cls === 'desconhecido') return;
        const audio = audioPlayer(label, src);
        const nome = nomePlayer(cls, src);
        const key = chavePlayer(src);
        if(!key || vistos.has(key)) return;
        vistos.add(key);
        lista.push({ src, label, tipo, classe: cls, audio, nome, prioridade: prioridadePlayer({src, classe:cls}) });
    };

    function extrairPossiveisUrls(texto){
        const out = [];
        const s = String(texto || '');
        const regs = [
            /(https?:\/\/[^"'<>\s]*(?:superembeds\.com|superembed|superflixapi\.(?:best|online)|warezcdn\.lat|playerembedapi\.link|viewplayer\.online|playerthree\.online|trembed|abyssplayer|lisoflix\.net\/abyss)[^"'<>\s]*)/ig
        ];
        regs.forEach(reg => { let m; while((m = reg.exec(s))) out.push(m[1]); });
        return out;
    }

    window.cronosExtrairPlayersDetalhe = function(doc, html, iframePrincipal = ''){
        const lista = [];
        const vistos = new Set();
        const add = (src, label, tipo, base) => window.cronosPushPlayer(lista, vistos, src, label, tipo, base || location.href);

        try {
            if(doc && doc.querySelectorAll) {
                const labelPorNume = {};
                doc.querySelectorAll('.dooplay_player_option, #playeroptionsul li, [data-nume][data-post]').forEach(opt => {
                    const n = opt.getAttribute('data-nume') || opt.dataset.nume || '';
                    const label = opt.querySelector('.title')?.innerText || opt.innerText || opt.textContent || '';
                    if(n && label) labelPorNume[n] = label.trim();
                    ['title','href','data-src','data-source','data-url'].forEach(a => {
                        const v = opt.getAttribute && opt.getAttribute(a);
                        if(v) add(v, label, 'option-attr');
                    });
                });
                doc.querySelectorAll('[id^="source-player-"]').forEach(box => {
                    const id = box.getAttribute('id') || '';
                    const nume = (id.match(/source-player-([^\s"']+)/i) || [])[1] || '';
                    const label = labelPorNume[nume] || box.querySelector('.title')?.innerText || box.getAttribute('data-title') || box.innerText || '';
                    box.querySelectorAll('iframe[src], source[src]').forEach(el => add(el.getAttribute('src') || '', label, 'source-box'));
                    box.querySelectorAll('[title], [href], [data-source], [data-src], [data-url]').forEach(el => {
                        ['title','href','data-source','data-src','data-url'].forEach(a => {
                            const v = el.getAttribute && el.getAttribute(a);
                            if(v) add(v, label || el.innerText || '', 'source-data');
                        });
                    });
                });
                const seletores = [
                    '#dooplay_player_content iframe[src]', '#playcontainer iframe[src]', '.dooplay_player iframe[src]', '.source-box iframe[src]',
                    '.wp-content iframe[src]', 'iframe[src]', 'source[src]',
                    'button[title]', 'a[title]', 'button[data-source]', 'a[data-source]', '[data-src]', '[data-url]', 'a[href]'
                ];
                seletores.forEach(sel => doc.querySelectorAll(sel).forEach(el => {
                    const label = el.innerText || el.textContent || el.getAttribute('aria-label') || el.getAttribute('data-title') || '';
                    ['src','title','href','data-source','data-src','data-url'].forEach(a => {
                        const v = el.getAttribute && el.getAttribute(a);
                        if(v) add(v, label, sel);
                    });
                }));
            }
        } catch(e) {}

        try {
            const texto = String(html || '');
            let m;
            const regexSourceBox = /<div[^>]+id=["']source-player-[^"']+["'][^>]*>[\s\S]*?<iframe[^>]+src=["']([^"']+)["'][^>]*>/gi;
            while((m = regexSourceBox.exec(texto))) add(m[1], '', 'regex-source');
            const regexIframe = /<iframe[^>]+src=["']([^"']+)["'][^>]*>/gi;
            while((m = regexIframe.exec(texto))) add(m[1], '', 'regex-iframe');
            const regexButtonTitle = /<(?:button|a)[^>]+(?:title|href)=["']([^"']+)["'][^>]*>([\s\S]*?)<\/(?:button|a)>/gi;
            while((m = regexButtonTitle.exec(texto))) add(m[1], m[2].replace(/<[^>]+>/g,' '), 'regex-button');
            extrairPossiveisUrls(texto).forEach(u => add(u, '', 'regex-direto'));
        } catch(e) {}

        if(iframePrincipal) add(iframePrincipal, 'Player Original', 'principal');
        return lista;
    };

    window.cronosExpandirPlayerInterno = async function(player){
        const src = window.cronosNormalizarUrlPlayer(player && player.src || '');
        const lower = src.toLowerCase();
        const podeExpandir = lower.includes('viewplayer.online') || lower.includes('playerthree.online') || lower.includes('trembed=');
        if(!src || !podeExpandir) return [];
        try {
            const htmlPlayer = await fetch(PROXY + encodeURIComponent(src)).then(r => r.ok ? r.text() : Promise.reject());
            const docPlayer = new DOMParser().parseFromString(htmlPlayer, 'text/html');
            const lista = [];
            const vistos = new Set();
            docPlayer.querySelectorAll('[data-show-player][data-source], [data-source], [title], a[href], iframe[src]').forEach(el => {
                const label = el.innerText || el.textContent || el.getAttribute('title') || el.getAttribute('aria-label') || '';
                ['data-source','data-src','data-url','title','href','src'].forEach(a => {
                    const v = el.getAttribute && el.getAttribute(a);
                    if(v) window.cronosPushPlayer(lista, vistos, v, label, 'interno', src);
                });
            });
            return lista;
        } catch(e) { return []; }
    };

    window.renderizarBotoesPlayerUnificadoCronos = async function(titulo, doc, htmlDetalhe, iframeSrc){
        const area = document.getElementById('areaAcaoDetalhe');
        if(!area) return;
        area.innerHTML = '<span style="color:#ffcc00;font-size:13px;">⏳ Buscando players disponíveis...</span>';

        const basePlayers = window.cronosExtrairPlayersDetalhe(doc, htmlDetalhe, iframeSrc);
        const final = [];
        const vistos = new Set();

        for(const p of basePlayers) {
            const clsBase = p && (p.classe || classePlayer(p.src));
            if(clsBase === 'liso') {
                window.cronosPushPlayer(final, vistos, p.src, 'Abyss Player', 'original', p.src);
                continue;
            }
            const internos = await window.cronosExpandirPlayerInterno(p);
            if(internos && internos.length) {
                internos.forEach(ip => window.cronosPushPlayer(final, vistos, ip.src, ip.label || p.label, ip.tipo || 'interno', p.src));
                window.cronosPushPlayer(final, vistos, p.src, p.classe === 'playerthree' ? 'PlayerThree Original' : 'ViewPlayer Original', 'original', p.src);
            } else {
                window.cronosPushPlayer(final, vistos, p.src, p.label, p.tipo, p.src);
            }
        }

        final.forEach(p => {
            p.classe = p.classe || classePlayer(p.src);
            if(p.classe === 'liso') {
                p.audio = '';
                p.nome = 'Abyss Player';
                p.label = 'Abyss Player';
                p.tipo = 'original';
            } else {
                p.audio = p.audio || audioPlayer(p.label, p.src);
                p.nome = p.nome || nomePlayer(p.classe, p.src);
            }
            p.prioridade = prioridadePlayer(p);
        });

        const finalSemAbyssDuplicado = [];
        const vistosAbyss = new Set();
        final.forEach(p => {
            if(p.classe === 'liso') {
                if(vistosAbyss.has('liso')) return;
                vistosAbyss.add('liso');
            }
            finalSemAbyssDuplicado.push(p);
        });
        final.length = 0;
        final.push(...finalSemAbyssDuplicado);

        final.sort((a,b) => (a.prioridade - b.prioridade) || (audioPeso(a.audio) - audioPeso(b.audio)) || String(a.nome).localeCompare(String(b.nome)));

        area.innerHTML = '';
        if(!final.length) {
            area.innerHTML = '<span style="color:#ff0055; font-weight:bold;">Player não encontrado na página base.</span>';
            return;
        }

        final.forEach((p, idx) => {
            const btn = document.createElement('button');
            const isOriginal = p.classe === 'viewplayer' || p.classe === 'playerthree' || p.classe === 'liso' || /original/i.test(p.tipo || p.label || p.nome || '');
            btn.className = 'btn-assistir ' + (isOriginal ? 'btn-cronos-player-original' : 'btn-cronos-player-direto');
            const label = window.cronosRotuloPlayer(p);
            btn.innerHTML = `▶ #${idx + 1} ${label}`;
            btn.title = p.src;
            btn.onclick = () => { try { if(typeof window.cronosDefinirPlayerAtualV27 === 'function') window.cronosDefinirPlayerAtualV27(label, { index: idx, classe: p.classe || p.tipo || '', src: p.src, memorizar: false }); else window.__cronosPlayerNomeAtual = label; } catch(e) {} abrirPlayer(titulo, p.src, { playerNome: label, playerIndex: idx, playerClasse: p.classe || p.tipo || '' }); };
            area.appendChild(btn);
        });
    };
})();



/* ===== assets/provedor/18-org-modal-episodios-reparo.js ===== */
// Extraído de KSM2-CINE3-main-CORRIGIDO.html — bloco JS 19.
(function(){
    if(window.__CRONOS_REPARO_ORG_EP_MODAL_V2__) return;
    window.__CRONOS_REPARO_ORG_EP_MODAL_V2__ = true;

    // Reparo seguro: garante que as fontes/filtros antigos não fiquem presos em localStorage desativando a ORG.
    // Faz isso só uma vez nesta versão do arquivo.
    try {
        const marca = 'cronos_reparo_fontes_8p_v2_ok';
        const chFontes = 'cronos_providers_ativos';
        const chFiltros = 'cronos_filtros_visuais';
        const keys = ['provedor01','provedor02','provedor03','provedor04','provedor05','provedor06','provedor07','provedor08'];
        if(!localStorage.getItem(marca)) {
            const fontes = JSON.parse(localStorage.getItem(chFontes) || '{}') || {};
            const filtros = JSON.parse(localStorage.getItem(chFiltros) || '{}') || {};
            keys.forEach(k => { fontes[k] = true; filtros[k] = true; });
            localStorage.setItem(chFontes, JSON.stringify(fontes));
            localStorage.setItem(chFiltros, JSON.stringify(filtros));
            localStorage.setItem(marca, '1');
        }
    } catch(e) {}

    const css = document.createElement('style');
    css.textContent = `
        #areaAcaoDetalhe .btn-cronos-player-direto,
        .modal-fontes-episodio-lista .btn-cronos-player-direto{
            background:#8a2be2!important;color:#fff!important;border:1px solid #8a2be2!important;
            border-radius:5px!important;font-weight:bold!important;min-height:42px!important;
        }
        #areaAcaoDetalhe .btn-cronos-player-original,
        .modal-fontes-episodio-lista .btn-cronos-player-original{
            background:#061827!important;color:#9ee7ff!important;border:1px solid #00a8ff!important;
            border-radius:5px!important;font-weight:bold!important;min-height:42px!important;
        }
        #areaAcaoDetalhe .btn-cronos-player-original:hover,
        .modal-fontes-episodio-lista .btn-cronos-player-original:hover{background:#00a8ff!important;color:#000!important;box-shadow:0 0 12px rgba(0,168,255,.65)!important;}
        .modal-fontes-episodio-cronos{display:none;position:fixed;inset:0;background:rgba(0,0,0,.86);backdrop-filter:blur(8px);z-index:10050;align-items:center;justify-content:center;padding:18px;}
        .modal-fontes-episodio-box{background:#111;border:1px solid #00ffff;border-radius:10px;box-shadow:0 0 28px rgba(0,255,255,.22);max-width:560px;width:100%;padding:22px;text-align:center;}
        .modal-fontes-episodio-box h3{color:#fff;margin:0 0 8px;font-size:20px;line-height:1.25;}
        .modal-fontes-episodio-box p{color:#aaa;margin:0 0 16px;font-size:13px;line-height:1.4;}
        .modal-fontes-episodio-lista{display:flex;flex-direction:column;gap:10px;width:100%;}
        .modal-fontes-episodio-lista .btn-assistir{width:100%!important;max-width:100%!important;margin:0!important;justify-content:center!important;}
        .modal-fontes-episodio-status{color:#ffcc00;font-weight:bold;font-size:13px;padding:12px;border:1px dashed #333;border-radius:8px;background:#080808;}
        .modal-fontes-episodio-close{margin-top:14px;width:100%;padding:10px;border:1px solid #ff3030;background:#170909;color:#ff4d4d;border-radius:6px;font-weight:bold;cursor:pointer;}
        .modal-fontes-episodio-close:hover{background:#ff3030;color:#000;box-shadow:0 0 12px rgba(255,48,48,.55);}
    `;
    document.head.appendChild(css);

    function normUrl(url){
        let u = String(url || '').trim().replace(/&amp;/g,'&').replace(/&#038;/g,'&');
        if(!u) return '';
        try { u = new URL(u, location.href).href; } catch(e) {}
        return u;
    }
    function ehPrime(url){ return /primeflix\.mom/i.test(String(url || '')); }
    function playerDiretoValido(url){
        const u = String(url || '').toLowerCase();
        if(!u) return false;
        if(typeof window.cronosPlayerBloqueado === 'function' && window.cronosPlayerBloqueado(url)) return false;
        return /(superembeds\.com\/embed\/|superflixapi\.(best|online)\/filme\/|superflixapi\.(best|online)\/serie\/|warezcdn\.lat\/(filme|serie)\/|playerembedapi\.link\/\?v=|viewplayer\.online|playerthree\.online|trembed=|abyss|lisoflix\.net\/abyss)/i.test(u);
    }
    function keyPlayer(src){ return String(src || '').replace(/#.*$/,'').replace(/\/+$/,'').trim().toLowerCase(); }
    function garantirModal(){
        let modal = document.getElementById('modalFontesEpisodioCronos');
        if(modal) return modal;
        modal = document.createElement('div');
        modal.id = 'modalFontesEpisodioCronos';
        modal.className = 'modal-fontes-episodio-cronos';
        modal.innerHTML = `
            <div class="modal-fontes-episodio-box">
                <h3 id="modalFontesEpisodioTituloCronos">Escolha uma fonte</h3>
                <p id="modalFontesEpisodioTextoCronos">Se uma fonte não carregar, volte e teste outra.</p>
                <div class="modal-fontes-episodio-lista" id="modalFontesEpisodioListaCronos"></div>
                <button type="button" class="modal-fontes-episodio-close" id="modalFontesEpisodioFecharCronos">Cancelar</button>
            </div>`;
        document.body.appendChild(modal);
        const fechar = () => { modal.style.display = 'none'; };
        document.getElementById('modalFontesEpisodioFecharCronos').onclick = fechar;
        modal.addEventListener('click', e => { if(e.target === modal) fechar(); });
        return modal;
    }
    function statusModal(titulo, msg){
        const modal = garantirModal();
        const title = document.getElementById('modalFontesEpisodioTituloCronos');
        const lista = document.getElementById('modalFontesEpisodioListaCronos');
        const texto = document.getElementById('modalFontesEpisodioTextoCronos');
        if(title) title.textContent = String(titulo || 'Episódio').replace(/\s+/g,' ').trim();
        if(texto) texto.textContent = 'Buscando fontes disponíveis para este episódio.';
        if(lista) lista.innerHTML = `<div class="modal-fontes-episodio-status">${msg || '⏳ Buscando players...'}</div>`;
        modal.style.display = 'flex';
    }
    function fecharModal(){ const m = document.getElementById('modalFontesEpisodioCronos'); if(m) m.style.display = 'none'; }
    function ordenar(lista){
        return lista.sort((a,b)=>{
            const pa = Number.isFinite(a.prioridade) ? a.prioridade : 999;
            const pb = Number.isFinite(b.prioridade) ? b.prioridade : 999;
            if(pa !== pb) return pa - pb;
            const aa = a.audio === 'Dublado' ? 1 : (a.audio === 'Legendado' ? 2 : 3);
            const ab = b.audio === 'Dublado' ? 1 : (b.audio === 'Legendado' ? 2 : 3);
            if(aa !== ab) return aa - ab;
            return String(a.nome || a.label || a.src).localeCompare(String(b.nome || b.label || b.src));
        });
    }
    function addFonte(final, vistos, p, label){
        if(!p) return;
        let src = p.src || p.url || p.href || '';
        if(typeof window.cronosNormalizarUrlPlayer === 'function') src = window.cronosNormalizarUrlPlayer(src, p.base || location.href);
        else src = normUrl(src);
        if(!src || !playerDiretoValido(src)) return;
        const k = keyPlayer(src);
        if(!k || vistos.has(k)) return;
        vistos.add(k);
        const item = Object.assign({}, p, {src, label: p.label || label || ''});
        if(typeof window.cronosRotuloPlayer === 'function') {
            try { item.nomeRender = window.cronosRotuloPlayer(item); } catch(e) {}
        }
        final.push(item);
    }
    async function coletarFontes(titulo, url){
        url = normUrl(url);
        let html = '', doc = null;
        try {
            const endpoint = (typeof PROXY !== 'undefined' && PROXY) ? PROXY + encodeURIComponent(url) : url;
            const res = await fetch(endpoint);
            if(res && res.ok) html = await res.text();
            if(html) doc = new DOMParser().parseFromString(html, 'text/html');
        } catch(e) {}

        let basePlayers = [];
        try {
            if(typeof window.cronosExtrairPlayersDetalhe === 'function') basePlayers = window.cronosExtrairPlayersDetalhe(doc, html, '');
        } catch(e) { basePlayers = []; }

        // Fallback importante: se o fluxo antigo achava o player, colocar esse player também no modal.
        try {
            if(doc && typeof window.extrairLinkLimpoDoPlayer === 'function') {
                const antigo = window.extrairLinkLimpoDoPlayer(doc, html);
                if(antigo) basePlayers.push({src: antigo, label:'Player Original', tipo:'original'});
            } else if(doc && typeof extrairLinkLimpoDoPlayer === 'function') {
                const antigo = extrairLinkLimpoDoPlayer(doc, html);
                if(antigo) basePlayers.push({src: antigo, label:'Player Original', tipo:'original'});
            }
        } catch(e) {}

        if(!basePlayers.length && playerDiretoValido(url)) basePlayers.push({src:url,label:'Player Original',tipo:'original'});

        const final = [], vistos = new Set();
        for(const p of basePlayers) {
            try {
                const internos = (typeof window.cronosExpandirPlayerInterno === 'function') ? await window.cronosExpandirPlayerInterno(p) : [];
                if(internos && internos.length) {
                    internos.forEach(ip => addFonte(final, vistos, ip, ip.label || p.label));
                    addFonte(final, vistos, Object.assign({}, p, {label: /playerthree/i.test(String(p.src)) ? 'PlayerThree Original' : 'ViewPlayer Original', tipo:'original'}), p.label);
                } else addFonte(final, vistos, p, p.label);
            } catch(e) { addFonte(final, vistos, p, p.label); }
        }
        return ordenar(final);
    }
    window.cronosAbrirModalFontesEpisodioV2 = async function(titulo, url, fallback){
        titulo = String(titulo || 'Episódio').replace(/\s+/g,' ').trim();
        url = normUrl(url);
        if(!url || ehPrime(url)) { if(typeof fallback === 'function') fallback(); return false; }
        statusModal(titulo, '⏳ Buscando fontes...');
        let fontes = [];
        try { fontes = await coletarFontes(titulo, url); } catch(e) { fontes = []; }
        const lista = document.getElementById('modalFontesEpisodioListaCronos');
        const texto = document.getElementById('modalFontesEpisodioTextoCronos');
        if(!lista) return false;
        lista.innerHTML = '';
        if(!fontes.length) {
            fecharModal();
            if(typeof fallback === 'function') fallback();
            return false;
        }
        if(texto) texto.textContent = 'Escolha uma fonte. Se uma não carregar, volte e teste outra.';
        fontes.forEach((p, idx) => {
            const btn = document.createElement('button');
            let rotulo = p.nomeRender || p.nome || p.label || 'Player';
            try { if(typeof window.cronosRotuloPlayer === 'function') rotulo = window.cronosRotuloPlayer(p); } catch(e) {}
            const isOriginal = /original|viewplayer|playerthree/i.test(String(p.tipo || p.label || p.nome || p.src || rotulo));
            btn.type = 'button';
            btn.className = 'btn-assistir ' + (isOriginal ? 'btn-cronos-player-original' : 'btn-cronos-player-direto');
            btn.title = p.src;
            btn.innerHTML = `▶ #${idx + 1} ${rotulo}`;
            btn.onclick = () => { fecharModal(); if(typeof window.abrirPlayer === 'function') window.abrirPlayer(titulo, p.src); else if(typeof abrirPlayer === 'function') abrirPlayer(titulo, p.src); };
            lista.appendChild(btn);
        });
        garantirModal().style.display = 'flex';
        return true;
    };

    // Liga o modal apenas nos fluxos de episódio. Não mexe em Home, Filmes, Séries, Premium ou carregamento dos provedores.
    const prepBase = (typeof window.prepararEpisodioDooplay === 'function') ? window.prepararEpisodioDooplay : (typeof prepararEpisodioDooplay === 'function' ? prepararEpisodioDooplay : null);
    if(prepBase && !prepBase.__cronosModalV2){
        window.prepararEpisodioDooplay = function(tituloEpisodio, urlEpisodio){
            const args = arguments, ctx = this;
            return window.cronosAbrirModalFontesEpisodioV2(tituloEpisodio, urlEpisodio, () => prepBase.apply(ctx, args));
        };
        window.prepararEpisodioDooplay.__cronosModalV2 = true;
        try { prepararEpisodioDooplay = window.prepararEpisodioDooplay; } catch(e) {}
    }
    const buscarBase = (typeof window.buscarEAssistirEpisodio === 'function') ? window.buscarEAssistirEpisodio : (typeof buscarEAssistirEpisodio === 'function' ? buscarEAssistirEpisodio : null);
    if(buscarBase && !buscarBase.__cronosModalV2){
        window.buscarEAssistirEpisodio = function(urlEpisodio, tituloEpisodio){
            const args = arguments, ctx = this;
            return window.cronosAbrirModalFontesEpisodioV2(tituloEpisodio, urlEpisodio, () => buscarBase.apply(ctx, args));
        };
        window.buscarEAssistirEpisodio.__cronosModalV2 = true;
        try { buscarEAssistirEpisodio = window.buscarEAssistirEpisodio; } catch(e) {}
    }
    document.addEventListener('click', function(e){
        const card = e.target && e.target.closest ? e.target.closest('#gridEpisodios .episodio-home-card[data-url], #gridInicioEpisodios .episodio-home-card[data-url]') : null;
        if(!card) return;
        const url = normUrl(card.dataset.url || card.getAttribute('data-url') || '');
        if(!url || ehPrime(url)) return;
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        const titulo = card.querySelector('h3')?.innerText || card.querySelector('.ano-card')?.innerText || 'Episódio';
        window.cronosAbrirModalFontesEpisodioV2(titulo, url, () => {
            if(typeof window.analisarObra === 'function') window.analisarObra(url, '', titulo, card.querySelector('img')?.src || '', false);
            else if(typeof analisarObra === 'function') analisarObra(url, '', titulo, card.querySelector('img')?.src || '', false);
        });
    }, true);
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', garantirModal); else garantirModal();
    setTimeout(()=>{
        try { if(typeof window.atualizarBotoesProvider === 'function') window.atualizarBotoesProvider(); } catch(e) {}
        try { if(typeof window.aplicarFiltroVisualCronos === 'function') window.aplicarFiltroVisualCronos(); } catch(e) {}
    }, 500);
})();



/* ===== assets/provedor/19-org-real-fix.js ===== */
// Extraído de KSM2-CINE3-main-CORRIGIDO.html — bloco JS 20.
/*
  FIX ORG (provedor02) — baseado no HTML real do boraflixtv.com
  =========================================================
  Estrutura confirmada do ORG:
  - Home destaques : #featured-titles article.item  (igual BORA ✓)
  - Home filmes    : #dt-movies article.item.movies  (igual BORA ✓)
  - Home séries    : #dt-tvshows article.item.tvshows (igual BORA ✓)
  - Home episódios : #dt-episodes article.item.se.episodes (igual BORA ✓)
  - Aba filmes     : /filmes/ → #archive-content article.item.movies ✓
  - Aba séries     : /series/ → #archive-content article.item.tvshows ✓
  - Aba episódios  : /episodios/ → #archive-content article.item (ou #dt-episodes .item) ✓
  - Busca          : /?s=termo → #archive-content article.item ✓
  - Paginação      : /filmes/page/2/ ✓

  PROBLEMA REAL: O CRONOS chama adicionarDestaquePremium() e renderizarItemNoGrid()
  via renderizarItemProvider() — que para provedor02 usa o caminho genérico (não-liso,
  não-prime). Porém o __CRONOS_RENDER_PROVIDER_KEY pode não estar setado
  corretamente quando garantirBadgeProvider() roda, deixando data-provider=""
  e o filtro esconde tudo.

  SOLUÇÃO: garantir que todo card/slide do provedor02 tenha data-provider="provedor02" correto,
  e que buscaPath + filmePath + seriePath + episodioPath estejam definidos
  para evitar fallback errado em urlProviderComContexto.
*/
(function(){
    if(window.__CRONOS_FIX_ORG_REAL_V1__) return;
    window.__CRONOS_FIX_ORG_REAL_V1__ = true;

    const KEY = 'provedor02';
    const BASE = 'https://www.boraflixtv.com/';

    /* ── 1. Completar definição do provider provedor02 ── */
    function patchProvider() {
        const P = window.CRONOS_MULTI_PROVIDERS;
        if (!P || !P[KEY]) return;
        // O ORG tem EXATAMENTE os mesmos paths do BORA
        P[KEY].buscaPath    = P[KEY].buscaPath    || '/?s=';
        P[KEY].filmePath    = P[KEY].filmePath    || '/filmes/';
        P[KEY].seriePath    = P[KEY].seriePath    || '/series/';
        P[KEY].episodioPath = P[KEY].episodioPath || '/episodios/';
        // Não tem semLetras, então letras funcionam normalmente
    }

    /* ── 2. Garantir data-provider="provedor02" em todo card/slide sem provider ── */
    function stampProvedor02NodesNovos(grid, antesDo) {
        if (!grid) return;
        Array.from(grid.children).forEach(li => {
            if (!antesDo || !antesDo.has(li)) {
                // Se ainda não tem provider, provavelmente é provedor02 (contexto da chamada)
                if (!li.dataset.provider) li.dataset.provider = KEY;
            }
        });
    }

    /* ── 3. Patch em renderizarItemProvider para provedor02 ── */
    function patchRenderizarItem() {
        const orig = window.renderizarItemProvider;
        if (!orig) return;
        window.renderizarItemProvider = async function(item, gridId, key) {
            const ret = await orig.apply(this, arguments);
            if (key === KEY) {
                // Garantir que os cards recém-adicionados tenham data-provider correto
                const grid = document.getElementById(gridId);
                if (grid) {
                    grid.querySelectorAll('.card-item:not([data-provider])').forEach(li => {
                        li.dataset.provider = KEY;
                    });
                    grid.querySelectorAll('.card-item[data-provider=""]').forEach(li => {
                        li.dataset.provider = KEY;
                    });
                }
                if (typeof aplicarFiltroVisualCronos === 'function') aplicarFiltroVisualCronos();
            }
            return ret;
        };
        try { renderizarItemProvider = window.renderizarItemProvider; } catch(e) {}
    }

    /* ── 4. Patch em adicionarDestaquePremium para garantir providerKey provedor02 ── */
    function patchAdicionarDestaque() {
        const orig = window.adicionarDestaquePremium;
        if (!orig) return;
        window.adicionarDestaquePremium = async function(item, enriquecer) {
            const prevKey = window.__CRONOS_RENDER_PROVIDER_KEY;
            // Se o key atual for provedor02, garantir que após adicionar o dado tenha providerKey
            const antesLen = (window.destaquesPremiumHome || []).length;
            const ret = await orig.apply(this, arguments);
            const depoisLen = (window.destaquesPremiumHome || []).length;
            if (prevKey === KEY || window.__CRONOS_RENDER_PROVIDER_KEY === KEY) {
                for (let i = antesLen; i < depoisLen; i++) {
                    const d = window.destaquesPremiumHome[i];
                    if (d && !d.providerKey) {
                        d.providerKey = KEY;
                        const P = window.CRONOS_MULTI_PROVIDERS && window.CRONOS_MULTI_PROVIDERS[KEY];
                        if (P) {
                            d.providerName  = P.nome;
                            d.providerSigla = P.sigla;
                        }
                    }
                }
            }
            return ret;
        };
        try { adicionarDestaquePremium = window.adicionarDestaquePremium; } catch(e) {}
    }

    /* ── 5. Patch em atualizarDestaquePremium para garantir data-provider nos slides ── */
    function patchAtualizarDestaque() {
        const orig = window.atualizarDestaquePremium;
        if (!orig) return;
        window.atualizarDestaquePremium = function(novoIndex) {
            const ret = orig.apply(this, arguments);
            // Garantir que slides sem data-provider recebam o correto
            const box = document.getElementById('premiumSlides');
            if (box && Array.isArray(window.destaquesPremiumHome)) {
                Array.from(box.children).forEach((slide, idx) => {
                    const obra = window.destaquesPremiumHome[idx] || {};
                    if (!slide.dataset.provider && obra.providerKey) {
                        slide.dataset.provider = obra.providerKey;
                    }
                    if (!slide.dataset.providerLabel && obra.providerSigla) {
                        slide.dataset.providerLabel = obra.providerSigla;
                    }
                    // Se não tem nada, tenta inferir pela URL
                    if (!slide.dataset.provider && obra.url && /boraflixtv\.com/i.test(obra.url)) {
                        slide.dataset.provider = KEY;
                        slide.dataset.providerLabel = 'ORG';
                    }
                });
                if (typeof aplicarFiltroVisualCronos === 'function') aplicarFiltroVisualCronos();
            }
            return ret;
        };
        try { atualizarDestaquePremium = window.atualizarDestaquePremium; } catch(e) {}
    }

    /* ── 6. Patch em garantirBadgeProvider para provedor02 ── */
    function patchGarantirBadge() {
        const orig = window.garantirBadgeProvider;
        if (!orig) return;
        window.garantirBadgeProvider = function(li, key) {
            // Se key chegou vazio mas o card tem href para boraflixtv, corrigir
            if (!key || key === 'provedor01') {
                const href = li && li.querySelector && (li.querySelector('a[href]') || {}).href || '';
                if (/boraflixtv\.com/i.test(href)) key = KEY;
            }
            return orig.call(this, li, key);
        };
        try { garantirBadgeProvider = window.garantirBadgeProvider; } catch(e) {}
    }

    /* ── 7. Verificação periódica: corrigir cards provedor02 sem data-provider ── */
    function corrigirCardsSemProvider() {
        // Qualquer card que tenha href para boraflixtv mas data-provider errado
        document.querySelectorAll('.card-item').forEach(card => {
            if (card.dataset.provider && card.dataset.provider !== '') return; // já tem
            const a = card.querySelector('a[href*="boraflixtv.com"]');
            if (a) {
                card.dataset.provider = KEY;
                if (typeof garantirBadgeProvider === 'function') garantirBadgeProvider(card, KEY);
            }
        });
        // Slides premium sem data-provider
        if (Array.isArray(window.destaquesPremiumHome)) {
            document.querySelectorAll('#premiumSlides .premium-slide').forEach((slide, idx) => {
                if (slide.dataset.provider) return;
                const obra = window.destaquesPremiumHome[idx] || {};
                const key = obra.providerKey || (obra.url && /boraflixtv\.com/i.test(obra.url) ? KEY : '');
                if (key) {
                    slide.dataset.provider = key;
                    slide.dataset.providerLabel = obra.providerSigla || (key === KEY ? 'ORG' : key.toUpperCase());
                }
            });
        }
        if (typeof aplicarFiltroVisualCronos === 'function') aplicarFiltroVisualCronos();
    }

    /* ── Aplicar todos os patches ── */
    function aplicar() {
        patchProvider();
        patchRenderizarItem();
        patchAdicionarDestaque();
        patchAtualizarDestaque();
        patchGarantirBadge();
        // Rodar verificação após carregamentos
        setTimeout(corrigirCardsSemProvider, 2000);
        setTimeout(corrigirCardsSemProvider, 5000);
        setTimeout(corrigirCardsSemProvider, 10000);
        console.log('[CRONOS] Fix ORG real v1 aplicado — estrutura confirmada pelo HTML real.');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(aplicar, 200));
    } else {
        setTimeout(aplicar, 200);
    }
})();

/* =========================================================
   PATCH FINAL — VOLTAR INTELIGENTE DA FICHA TÉCNICA
   Mantém a origem real do clique: Filmes, Séries, Busca,
   Gênero, Ano, Favoritos, Histórico, Lançamentos etc.
========================================================= */
(function(){
    if (window.__CRONOS_PATCH_VOLTAR_ORIGEM_REAL__) return;
    window.__CRONOS_PATCH_VOLTAR_ORIGEM_REAL__ = true;

    window.__CRONOS_ORIGEM_DETALHES__ = window.__CRONOS_ORIGEM_DETALHES__ || {
        tela: 'telaInicio',
        scrollY: 0,
        contextoBuscaAtual: null,
        contextoBuscaMulti: null,
        tituloBusca: ''
    };

    function cronosCloneSeguro(obj) {
        try { return obj ? JSON.parse(JSON.stringify(obj)) : null; }
        catch(e) { return obj ? Object.assign({}, obj) : null; }
    }

    function cronosTelaAtivaAtual() {
        const tela = document.querySelector('.view-container.ativa');
        return tela && tela.id ? tela.id : 'telaInicio';
    }

    function cronosCapturarOrigemDetalhes() {
        const telaAtual = cronosTelaAtivaAtual();

        // Se já está na ficha ou no player, não sobrescreve a origem real.
        // Isso evita perder a volta correta quando abrir player, trocar episódio ou atualizar detalhes.
        if (telaAtual === 'telaDetalhes' || telaAtual === 'telaPlayer') {
            return window.__CRONOS_ORIGEM_DETALHES__;
        }

        const tituloBuscaEl = document.getElementById('tituloBusca');
        window.__CRONOS_ORIGEM_DETALHES__ = {
            tela: telaAtual || 'telaInicio',
            scrollY: window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0,
            contextoBuscaAtual: (typeof contextoBuscaAtual !== 'undefined') ? cronosCloneSeguro(contextoBuscaAtual) : null,
            contextoBuscaMulti: (typeof contextoBuscaMulti !== 'undefined') ? cronosCloneSeguro(contextoBuscaMulti) : null,
            tituloBusca: tituloBuscaEl ? tituloBuscaEl.innerText : '',
            termoBuscaAtual: (typeof termoBuscaAtual !== 'undefined') ? termoBuscaAtual : '',
            filtroTipoGridAtual: (typeof filtroTipoGridAtual !== 'undefined') ? cronosCloneSeguro(filtroTipoGridAtual) : null,
            filtroLetraGridAtual: (typeof filtroLetraGridAtual !== 'undefined') ? cronosCloneSeguro(filtroLetraGridAtual) : null,
            btnVoltarCategoriasDisplay: (function(){
                const btn = document.getElementById('btnVoltarCategorias');
                return btn ? btn.style.display : '';
            })()
        };
        return window.__CRONOS_ORIGEM_DETALHES__;
    }

    function cronosRestaurarContextoBusca(origem) {
        if (!origem || origem.tela !== 'telaBusca') return;
        try {
            if (origem.contextoBuscaAtual && typeof contextoBuscaAtual !== 'undefined') {
                contextoBuscaAtual = cronosCloneSeguro(origem.contextoBuscaAtual);
                window.contextoBuscaAtual = contextoBuscaAtual;
            }
        } catch(e) {}
        try {
            if (origem.contextoBuscaMulti && typeof contextoBuscaMulti !== 'undefined') {
                contextoBuscaMulti = cronosCloneSeguro(origem.contextoBuscaMulti);
                window.contextoBuscaMulti = contextoBuscaMulti;
            }
        } catch(e) {}
        try {
            if (typeof termoBuscaAtual !== 'undefined' && origem.termoBuscaAtual !== undefined) {
                termoBuscaAtual = origem.termoBuscaAtual;
                window.termoBuscaAtual = termoBuscaAtual;
            }
        } catch(e) {}
        try {
            if (origem.filtroTipoGridAtual && typeof filtroTipoGridAtual !== 'undefined') {
                Object.assign(filtroTipoGridAtual, origem.filtroTipoGridAtual);
            }
        } catch(e) {}
        try {
            if (origem.filtroLetraGridAtual && typeof filtroLetraGridAtual !== 'undefined') {
                Object.assign(filtroLetraGridAtual, origem.filtroLetraGridAtual);
            }
        } catch(e) {}

        const tituloBuscaEl = document.getElementById('tituloBusca');
        if (tituloBuscaEl && origem.tituloBusca) tituloBuscaEl.innerText = origem.tituloBusca;

        const btnVoltarCategorias = document.getElementById('btnVoltarCategorias');
        if (btnVoltarCategorias && origem.btnVoltarCategoriasDisplay !== undefined) {
            btnVoltarCategorias.style.display = origem.btnVoltarCategoriasDisplay;
        }
    }

    function cronosRestaurarScroll(origem) {
        const y = origem && Number.isFinite(Number(origem.scrollY)) ? Number(origem.scrollY) : 0;
        setTimeout(() => { try { window.scrollTo(0, y); } catch(e) {} }, 80);
        setTimeout(() => { try { window.scrollTo(0, y); } catch(e) {} }, 260);
    }

    function cronosAtivarDestinoRetorno(origem) {
        origem = origem || window.__CRONOS_ORIGEM_DETALHES__ || {};
        const destino = origem.tela || (typeof telaAnterior !== 'undefined' ? telaAnterior : '') || 'telaInicio';

        cronosRestaurarContextoBusca(origem);

        if (destino === 'telaFavoritos' && typeof carregarFavoritos === 'function') {
            carregarFavoritos(document.querySelector('button[onclick="carregarFavoritos(this)"]'));
            cronosRestaurarScroll(origem);
            return;
        }

        if (destino === 'telaHistorico' && typeof carregarHistorico === 'function') {
            carregarHistorico(document.querySelector('button[onclick="carregarHistorico(this)"]'));
            cronosRestaurarScroll(origem);
            return;
        }

        if (destino === 'telaCategorias' && typeof carregarCategorias === 'function') {
            carregarCategorias(document.querySelector('button[onclick="carregarCategorias(this)"]'));
            cronosRestaurarScroll(origem);
            return;
        }

        if (destino === 'telaConfiguracoes' && typeof carregarConfiguracoes === 'function') {
            carregarConfiguracoes(document.querySelector('button[onclick="carregarConfiguracoes(this)"]'));
            cronosRestaurarScroll(origem);
            return;
        }

        if (destino === 'telaLancamentos') {
            if (typeof ativarTela === 'function') ativarTela('telaLancamentos', document.querySelector('button[onclick="carregarLancamentos(this)"]'));
            cronosRestaurarScroll(origem);
            return;
        }

        if (typeof ativarTela === 'function') {
            const elDestino = document.getElementById(destino) ? destino : 'telaInicio';
            ativarTela(elDestino);
        }

        if (destino === 'telaInicio' && typeof renderizarResumoHomeLocal === 'function') {
            try { renderizarResumoHomeLocal(); } catch(e) {}
        }

        cronosRestaurarScroll(origem);
    }

    function cronosInstalarPatchAnalisarObra() {
        const atual = window.analisarObra || (typeof analisarObra === 'function' ? analisarObra : null);
        if (!atual || atual.__cronosVoltarOrigemReal) return;

        const original = atual;
        const nova = function(url, ano, tituloCard, img, isMovie) {
            cronosCapturarOrigemDetalhes();
            return original.apply(this, arguments);
        };
        nova.__cronosVoltarOrigemReal = true;
        nova.__cronosOriginal = original;

        window.analisarObra = nova;
        try { analisarObra = nova; } catch(e) {}
    }

    window.cronosCapturarOrigemDetalhes = cronosCapturarOrigemDetalhes;
    window.cronosVoltarOrigemDetalhes = cronosAtivarDestinoRetorno;
    window.voltarPaginaAnterior = function() {
        cronosAtivarDestinoRetorno(window.__CRONOS_ORIGEM_DETALHES__);
    };
    try { voltarPaginaAnterior = window.voltarPaginaAnterior; } catch(e) {}

    cronosInstalarPatchAnalisarObra();
    setTimeout(cronosInstalarPatchAnalisarObra, 300);
    setTimeout(cronosInstalarPatchAnalisarObra, 1200);
})();



/* ===== assets/card/20-favoritar-hover-card.js ===== */
// Extraído de KSM2-CINE3-main-CORRIGIDO.html — bloco JS 21.
/* PATCH: Favoritar no hover também para cards LISO/PRIME renderizados por adaptadores próprios */
(function(){
    function cronosTituloCard(li){
        return (li && li.querySelector('h3') && li.querySelector('h3').textContent || '').trim();
    }
    function cronosPosterCard(li){
        return li?.dataset?.poster || li?.querySelector('.card-media img, img')?.src || '';
    }
    function cronosTipoCard(li){
        const txt = (li?.querySelector('.badge-tipo')?.textContent || '').toLowerCase();
        if (txt.includes('série') || txt.includes('serie')) return { tipo: 'Série', isMovie: false, isSerie: true };
        if (txt.includes('filme')) return { tipo: 'Filme', isMovie: true, isSerie: false };
        return { tipo: 'Filme', isMovie: true, isSerie: false };
    }
    function cronosAdicionarFavoritarLisoPrime(root){
        try {
            if (typeof adicionarBotaoFavoritarHoverCronos !== 'function') return;
            const base = root && root.querySelectorAll ? root : document;
            base.querySelectorAll('.card-item.global-card[data-provider="provedor07"], .card-item.global-card[data-provider="provedor08"]').forEach(li => {
                if (!li || li.querySelector('.btn-favoritar-card')) return;
                if (li.closest('#gridFavoritos, #gridHistorico')) return;
                const providerKey = li.dataset.providerKey || li.dataset.provider || '';
                if (providerKey !== 'provedor07' && providerKey !== 'provedor08') return;
                const poster = cronosPosterCard(li);
                if (poster) li.dataset.poster = poster;
                const tipoInfo = cronosTipoCard(li);
                adicionarBotaoFavoritarHoverCronos(li, {
                    url: li.dataset.url || '',
                    titulo: cronosTituloCard(li),
                    ano: li.querySelector('.badge-ano-card')?.textContent || '',
                    img: poster,
                    poster,
                    providerKey,
                    providerName: providerKey === 'provedor07' ? 'Fonte LISO' : 'Fonte PRIME',
                    providerSigla: providerKey === 'provedor07' ? 'LISO' : 'PRIME',
                    baseUrl: providerKey === 'provedor07' ? 'https://lisoflix.net/' : 'https://primeflix.mom/',
                    ...tipoInfo
                });
            });
        } catch(e) {}
    }
    document.addEventListener('DOMContentLoaded', () => cronosAdicionarFavoritarLisoPrime(document));
    const obs = new MutationObserver(muts => {
        for (const m of muts) {
            for (const node of m.addedNodes || []) {
                if (node && node.nodeType === 1) cronosAdicionarFavoritarLisoPrime(node);
            }
        }
    });
    try { obs.observe(document.documentElement, { childList: true, subtree: true }); } catch(e) {}
    window.cronosAdicionarFavoritarLisoPrime = cronosAdicionarFavoritarLisoPrime;
})();

