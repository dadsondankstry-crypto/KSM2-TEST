/* ===== storage.js | pacote organizado CINE3 ===== */


/* ===== assets/detalhes/01-poster-manual.js ===== */
// Extraído de KSM2-CINE3-main-CORRIGIDO.html — bloco JS 2.
/* ===== POSTER MANUAL — escolher imagem do backdrop/galeria e salvar recorte no IndexedDB ===== */
(function(){
    const MODAL_ID = 'posterManualModalCronos';

    function cronosObraAtualManual() {
        try {
            if (window.obraSendoVista && window.obraSendoVista.url) return window.obraSendoVista;
            if (typeof obraSendoVista !== 'undefined' && obraSendoVista && obraSendoVista.url) return obraSendoVista;
        } catch(e) {}
        return {};
    }

    function cronosSetObraAtualManual(obra) {
        try { window.obraSendoVista = obra; } catch(e) {}
        try { if (typeof obraSendoVista !== 'undefined') obraSendoVista = obra; } catch(e) {}
    }

    function cronosPosterManualPlaceholder() {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="750" viewBox="0 0 500 750">
            <rect width="500" height="750" fill="#050505"/>
            <rect x="16" y="16" width="468" height="718" rx="14" fill="#080808" stroke="#00ffff" stroke-width="2" stroke-opacity="0.45"/>
            <text x="250" y="380" text-anchor="middle" fill="#00ffff" font-family="Arial, sans-serif" font-size="44" font-weight="700">POSTER</text>
        </svg>`;
        return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
    }

    // Permite salvar poster manual em data:image/jpeg/png/webp, mas continua bloqueando o SVG de placeholder.
    if (typeof window.imagemEhPlaceholderCronos === 'function') {
        const originalImagemEhPlaceholderCronos = window.imagemEhPlaceholderCronos;
        window.imagemEhPlaceholderCronos = function(url) {
            const u = String(url || '').toLowerCase();
            if (/^data:image\/(jpeg|jpg|png|webp)/i.test(u)) return false;
            return originalImagemEhPlaceholderCronos(url);
        };
    }

    function garantirModalPosterManual() {
        let modal = document.getElementById(MODAL_ID);
        if (modal) return modal;
        modal = document.createElement('div');
        modal.id = MODAL_ID;
        modal.className = 'poster-manual-modal';
        modal.innerHTML = `
            <div class="poster-manual-box">
                <div class="poster-manual-head">
                    <h3>Escolher poster manual</h3>
                    <button class="poster-manual-close" type="button" onclick="cronosFecharPosterManual()">Fechar</button>
                </div>
                <div id="posterManualConteudoCronos"></div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => { if (e.target === modal) cronosFecharPosterManual(); });
        return modal;
    }

    window.cronosFecharPosterManual = function() {
        const modal = document.getElementById(MODAL_ID);
        if (modal) modal.style.display = 'none';
    };

    function absUrlCronos(url, base) {
        if (!url) return '';
        let u = String(url).trim().replace(/&amp;/g, '&').replace(/^url\(["']?|["']?\)$/g, '').trim();
        if (!u || u.startsWith('data:') || u.startsWith('blob:')) return '';
        try { return new URL(u, base || location.href).href; } catch { return u; }
    }

    function limparUrlImagemManual(url) {
        let u = String(url || '').trim();
        if (!u) return '';
        if (/image\.tmdb\.org\/t\/p\//i.test(u)) {
            u = u.replace(/\/t\/p\/(w\d+|original)\//i, '/t/p/original/');
        }
        return u;
    }

    function imagemCandidataBoaManual(url) {
        const u = String(url || '').toLowerCase();
        if (!u) return false;
        if (u.includes('logo') || u.includes('favicon') || u.includes('avatar') || u.includes('blank') || u.includes('placeholder')) return false;
        return /(image\.tmdb\.org|wp-content\/uploads|\.jpg|\.jpeg|\.png|\.webp)/i.test(u);
    }

    function coletarImagensPosterManual(doc, html, baseUrl) {
        const lista = [];
        const add = (url, origem) => {
            let u = limparUrlImagemManual(absUrlCronos(url, baseUrl));
            if (!imagemCandidataBoaManual(u)) return;
            if (lista.some(x => x.url === u)) return;
            lista.push({ url: u, origem });
        };

        // Prioridade: galeria real/backdrops da ficha.
        doc.querySelectorAll('#dt_galery a[href], .dt_galery a[href], .g-item a[href], .galeria a[href], .gallery a[href]').forEach(a => add(a.getAttribute('href'), 'Galeria'));
        doc.querySelectorAll('#dt_galery img, .dt_galery img, .g-item img, .galeria img, .gallery img').forEach(img => {
            ['data-src','data-lazy-src','data-original','src'].forEach(attr => add(img.getAttribute(attr), 'Galeria img'));
            const srcset = img.getAttribute('srcset') || img.getAttribute('data-srcset') || '';
            srcset.split(',').forEach(p => add((p.trim().split(/\s+/)[0] || ''), 'Galeria srcset'));
        });

        // Depois: og:image, incluindo a lista grande do site.
        doc.querySelectorAll('meta[property="og:image"], meta[name="og:image"], meta[property="twitter:image"], meta[name="twitter:image"]').forEach(m => add(m.getAttribute('content'), 'Meta image'));

        // JSON-LD / HTML bruto / background-image.
        const texto = String(html || '');
        let m;
        const regexUrl = /(https?:\/\/[^"'<>\s]+\.(?:jpg|jpeg|png|webp)(?:\?[^"'<>\s]*)?)/gi;
        while ((m = regexUrl.exec(texto))) add(m[1], 'HTML');
        const regexBg = /background(?:-image)?\s*:\s*url\(["']?([^"')]+)["']?\)/gi;
        while ((m = regexBg.exec(texto))) add(m[1], 'Background');

        // Mantém a ordem encontrada: primeira da galeria/meta vem primeiro. Limita para não pesar.
        return lista.slice(0, 40);
    }

    async function buscarImagensDaObraManual() {
        const obra = cronosObraAtualManual();
        const url = obra.url || obra.link || obra.href || '';
        if (!url) throw new Error('URL da obra não encontrada.');
        const res = await fetch(PROXY + encodeURIComponent(url));
        if (!res.ok) throw new Error('Falha ao abrir a página da obra.');
        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return coletarImagensPosterManual(doc, html, url);
    }

    window.cronosAbrirModalPosterManual = async function() {
        const modal = garantirModalPosterManual();
        const area = document.getElementById('posterManualConteudoCronos');
        modal.style.display = 'flex';
        area.innerHTML = '<div class="poster-manual-status">Carregando imagens da página...</div>';
        try {
            const imagens = await buscarImagensDaObraManual();
            if (!imagens.length) {
                area.innerHTML = '<div class="poster-manual-status">Nenhuma imagem de galeria/backdrop encontrada nessa página.</div>';
                return;
            }
            area.innerHTML = `
                <div class="poster-manual-status">Escolha uma imagem para transformar em poster vertical.</div>
                <div class="poster-manual-grid">
                    ${imagens.map((img, i) => `
                        <div class="poster-manual-thumb" onclick="cronosSelecionarImagemPosterManual(${i})">
                            <img src="${img.url}" loading="lazy" alt="Imagem ${i+1}">
                            <span>${i+1}. ${img.origem}</span>
                        </div>
                    `).join('')}
                </div>
            `;
            window.__cronosPosterManualImagens = imagens;
        } catch (e) {
            console.warn('Poster manual falhou:', e);
            area.innerHTML = `<div class="poster-manual-status">Falha ao carregar imagens: ${e.message || e}</div>`;
        }
    };

    window.cronosSelecionarImagemPosterManual = function(index) {
        const item = (window.__cronosPosterManualImagens || [])[index];
        if (!item) return;
        const area = document.getElementById('posterManualConteudoCronos');
        area.innerHTML = `
            <div class="poster-manual-status">Ajuste o recorte vertical que será salvo como poster.</div>
            <div class="poster-crop-wrap">
                <div class="poster-crop-area" id="posterCropAreaCronos">
                    <img id="posterCropImgCronos" src="${item.url}" crossorigin="anonymous" alt="Imagem para recorte">
                    <div class="poster-crop-overlay" id="posterCropOverlayCronos"></div>
                </div>
                <div class="poster-crop-side">
                    <strong style="color:#ffcc00;">Recorte 2:3</strong>
                    <label>Posição horizontal</label>
                    <input id="posterCropXChronos" type="range" min="0" max="100" value="50" oninput="cronosAtualizarPreviewCropPoster()">
                    <label>Posição vertical</label>
                    <input id="posterCropYChronos" type="range" min="0" max="100" value="50" oninput="cronosAtualizarPreviewCropPoster()">
                    <div class="poster-crop-preview" id="posterCropPreviewCronos"></div>
                    <button class="poster-manual-btn" type="button" onclick="cronosSalvarPosterManual('${encodeURIComponent(item.url)}')">Salvar como poster</button>
                    <button class="poster-manual-btn" type="button" style="margin-top:8px;border-color:#8a2be2;color:#fff;" onclick="cronosAbrirModalPosterManual()">Voltar para galeria</button>
                    <p style="color:#aaa;font-size:12px;line-height:1.4;margin-top:10px;">Esse poster fica salvo no IndexedDB desta obra. Se limpar o banco, ele some.</p>
                </div>
            </div>
        `;
        const imgEl = document.getElementById('posterCropImgCronos');
        imgEl.onload = () => cronosAtualizarPreviewCropPoster();
        setTimeout(cronosAtualizarPreviewCropPoster, 80);
    };

    function calcularCropPosterManual(img, posX, posY) {
        const nw = img.naturalWidth || 1;
        const nh = img.naturalHeight || 1;
        const alvo = 2 / 3;
        let sw = nw, sh = nh, sx = 0, sy = 0;
        if (nw / nh > alvo) {
            sh = nh;
            sw = Math.round(nh * alvo);
            sx = Math.round((nw - sw) * (posX / 100));
            sy = 0;
        } else {
            sw = nw;
            sh = Math.round(nw / alvo);
            sx = 0;
            sy = Math.round(Math.max(0, nh - sh) * (posY / 100));
        }
        return { sx, sy, sw, sh, nw, nh };
    }

    window.cronosAtualizarPreviewCropPoster = function() {
        const img = document.getElementById('posterCropImgCronos');
        const overlay = document.getElementById('posterCropOverlayCronos');
        const preview = document.getElementById('posterCropPreviewCronos');
        const posX = Number(document.getElementById('posterCropXChronos')?.value || 50);
        const posY = Number(document.getElementById('posterCropYChronos')?.value || 50);
        if (!img || !overlay || !preview) return;
        const crop = calcularCropPosterManual(img, posX, posY);
        const rect = img.getBoundingClientRect();
        const areaRect = document.getElementById('posterCropAreaCronos').getBoundingClientRect();
        const scaleX = rect.width / crop.nw;
        const scaleY = rect.height / crop.nh;
        overlay.style.left = (rect.left - areaRect.left + crop.sx * scaleX) + 'px';
        overlay.style.top = (rect.top - areaRect.top + crop.sy * scaleY) + 'px';
        overlay.style.width = (crop.sw * scaleX) + 'px';
        overlay.style.height = (crop.sh * scaleY) + 'px';
        overlay.style.bottom = 'auto';
        preview.style.backgroundImage = `url("${img.src}")`;
        preview.style.backgroundSize = `${(crop.nw / crop.sw) * 100}% ${(crop.nh / crop.sh) * 100}%`;
        preview.style.backgroundPosition = `${crop.sw === crop.nw ? 50 : (crop.sx / Math.max(1, crop.nw - crop.sw)) * 100}% ${crop.sh === crop.nh ? 50 : (crop.sy / Math.max(1, crop.nh - crop.sh)) * 100}%`;
    };

    window.cronosSalvarPosterManual = async function(encodedUrl) {
        const urlOriginal = decodeURIComponent(encodedUrl || '');
        const img = document.getElementById('posterCropImgCronos');
        const posX = Number(document.getElementById('posterCropXChronos')?.value || 50);
        const posY = Number(document.getElementById('posterCropYChronos')?.value || 50);
        if (!img || !urlOriginal) return;
        const area = document.getElementById('posterManualConteudoCronos');
        try {
            const crop = calcularCropPosterManual(img, posX, posY);
            const canvas = document.createElement('canvas');
            canvas.width = 500;
            canvas.height = 750;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, 500, 750);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
            const obra = cronosObraAtualManual();
            const atualizada = {
                ...obra,
                poster: dataUrl,
                img: dataUrl,
                posterManual: true,
                posterManualFonte: urlOriginal,
                posterManualCrop: { x: posX, y: posY, width: 500, height: 750 },
                updatedAt: new Date().toISOString()
            };
            cronosSetObraAtualManual(atualizada);
            const imgDetalhe = document.getElementById('detalheImg');
            if (imgDetalhe) {
                imgDetalhe.src = dataUrl;
                imgDetalhe.classList.remove('poster-sem-imagem-manual');
                imgDetalhe.title = '';
            }
            if (typeof salvarObraCronos === 'function') await salvarObraCronos(atualizada);
            if (typeof salvarHistoricoHome === 'function') await salvarHistoricoHome(atualizada);
            cronosFecharPosterManual();
            if (typeof checarBotaoFavorito === 'function' && atualizada.url) checarBotaoFavorito(atualizada.url);
        } catch (e) {
            console.warn('Falha ao gerar poster com canvas. Salvando imagem original como fallback:', e);
            try {
                const obra = cronosObraAtualManual();
                const atualizada = {
                    ...obra,
                    poster: urlOriginal,
                    img: urlOriginal,
                    posterManual: true,
                    posterManualFonte: urlOriginal,
                    posterManualCropFalhou: true,
                    updatedAt: new Date().toISOString()
                };
                cronosSetObraAtualManual(atualizada);
                const imgDetalhe = document.getElementById('detalheImg');
                if (imgDetalhe) imgDetalhe.src = urlOriginal;
                if (typeof salvarObraCronos === 'function') await salvarObraCronos(atualizada);
                cronosFecharPosterManual();
            } catch (e2) {
                area.innerHTML = `<div class="poster-manual-status">Não consegui salvar o poster: ${e2.message || e2}</div>`;
            }
        }
    };

    function detalhePosterSemImagem() {
        const img = document.getElementById('detalheImg');
        if (!img) return false;
        const src = String(img.getAttribute('src') || '').trim().toLowerCase();
        if (!src || src.startsWith('data:image/svg')) return true;
        if (src.includes('placeholder') || src.includes('no_poster') || src.includes('carregando')) return true;
        if (img.complete && img.naturalWidth === 0) return true;
        return false;
    }

    function ativarPosterClicavelSeSemImagem() {
        const img = document.getElementById('detalheImg');
        if (!img) return;
        if (!img.__posterManualBind) {
            img.__posterManualBind = true;
            img.addEventListener('click', function() {
                if (detalhePosterSemImagem()) cronosAbrirModalPosterManual();
            });
            img.addEventListener('error', ativarPosterClicavelSeSemImagem);
            img.addEventListener('load', () => setTimeout(ativarPosterClicavelSeSemImagem, 80));
        }
        if (detalhePosterSemImagem()) {
            img.classList.add('poster-sem-imagem-manual');
            img.title = 'Sem poster. Clique para escolher uma imagem da galeria.';
            img.alt = 'Poster';
            const placeholder = cronosPosterManualPlaceholder();
            if (!String(img.getAttribute('src') || '').startsWith('data:image/svg+xml')) {
                img.src = placeholder;
            }
        } else {
            img.classList.remove('poster-sem-imagem-manual');
            img.title = '';
            img.alt = 'Poster';
        }
    }

    const obs = new MutationObserver(() => setTimeout(ativarPosterClicavelSeSemImagem, 120));
    document.addEventListener('DOMContentLoaded', () => {
        const img = document.getElementById('detalheImg');
        if (img) obs.observe(img, { attributes: true, attributeFilter: ['src'] });
        ativarPosterClicavelSeSemImagem();
        [250, 900, 1800, 3500].forEach(t => setTimeout(ativarPosterClicavelSeSemImagem, t));
        if (!window.__cronosPosterManualBodyObserver) {
            window.__cronosPosterManualBodyObserver = new MutationObserver(() => setTimeout(ativarPosterClicavelSeSemImagem, 120));
            window.__cronosPosterManualBodyObserver.observe(document.body, { childList: true, subtree: true });
        }
    });
})();



/* ===== assets/detalhes/02-poster-manual-limpeza.js ===== */
// Extraído de KSM2-CINE3-main-CORRIGIDO.html — bloco JS 3.
/* ===== OVERRIDE — Limpa imagens inválidas e salva a escolhida direto como poster ===== */
(function(){
    function cronosUrlRuimPosterManual(url) {
        const u = String(url || '').toLowerCase();
        if (!u) return true;
        if (u.startsWith('data:') || u.startsWith('blob:')) return true;
        if (u.includes('pinterest.') || u.includes('/pin/create/') || u.includes('pin/create/button')) return true;
        if (u.includes('favicon') || u.includes('fivico') || u.includes('apple-touch-icon')) return true;
        if (u.includes('logo') || u.includes('avatar') || u.includes('placeholder') || u.includes('blank')) return true;
        if (!/(image\.tmdb\.org|wp-content\/uploads|\.jpg|\.jpeg|\.png|\.webp)/i.test(u)) return true;
        return false;
    }

    function cronosLimparGaleriaPosterManual() {
        const thumbs = document.querySelectorAll('.poster-manual-thumb');
        thumbs.forEach((thumb) => {
            const img = thumb.querySelector('img');
            if (!img) return;
            const src = img.getAttribute('src') || '';
            if (cronosUrlRuimPosterManual(src)) {
                thumb.classList.add('removido-cronos');
                return;
            }
            img.onerror = function(){ thumb.classList.add('removido-cronos'); };
            img.onload = function(){
                // Remove ícones e imagens muito pequenas que não servem para poster/backdrop.
                if ((img.naturalWidth && img.naturalWidth < 120) || (img.naturalHeight && img.naturalHeight < 120)) {
                    thumb.classList.add('removido-cronos');
                }
            };
            if (img.complete) {
                if (!img.naturalWidth || !img.naturalHeight || img.naturalWidth < 120 || img.naturalHeight < 120) {
                    thumb.classList.add('removido-cronos');
                }
            }
        });
    }

    const abrirOriginal = window.cronosAbrirModalPosterManual;
    if (typeof abrirOriginal === 'function') {
        window.cronosAbrirModalPosterManual = async function(){
            await abrirOriginal.apply(this, arguments);
            setTimeout(cronosLimparGaleriaPosterManual, 80);
            setTimeout(cronosLimparGaleriaPosterManual, 600);
            setTimeout(cronosLimparGaleriaPosterManual, 1500);
        };
    }

    function cronosObraAtualPosterManualFix() {
        try { if (window.obraSendoVista && window.obraSendoVista.url) return window.obraSendoVista; } catch(e) {}
        try { if (typeof obraSendoVista !== 'undefined' && obraSendoVista && obraSendoVista.url) return obraSendoVista; } catch(e) {}
        return {};
    }

    function cronosSetObraAtualPosterManualFix(obra) {
        try { window.obraSendoVista = obra; } catch(e) {}
        try { if (typeof obraSendoVista !== 'undefined') obraSendoVista = obra; } catch(e) {}
    }

    window.cronosSelecionarImagemPosterManual = async function(index) {
        const item = (window.__cronosPosterManualImagens || [])[index];
        if (!item || !item.url) return;
        if (cronosUrlRuimPosterManual(item.url)) return;

        const area = document.getElementById('posterManualConteudoCronos');
        if (area) area.innerHTML = '<div class="poster-manual-status">Salvando imagem escolhida como poster manual...</div>';

        try {
            const obra = cronosObraAtualPosterManualFix();
            const atualizada = {
                ...obra,
                poster: item.url,
                img: item.url,
                posterManual: true,
                posterManualFonte: item.url,
                posterManualModo: 'imagem_direta_sem_recorte',
                updatedAt: new Date().toISOString()
            };
            cronosSetObraAtualPosterManualFix(atualizada);

            const imgDetalhe = document.getElementById('detalheImg');
            if (imgDetalhe) {
                imgDetalhe.src = item.url;
                imgDetalhe.classList.remove('poster-sem-imagem-manual');
                imgDetalhe.title = '';
                imgDetalhe.alt = 'Poster';
                imgDetalhe.style.objectFit = 'cover';
                imgDetalhe.style.objectPosition = 'center center';
            }

            if (typeof salvarObraCronos === 'function') await salvarObraCronos(atualizada);
            if (typeof salvarHistoricoHome === 'function') await salvarHistoricoHome(atualizada);
            if (typeof cronosFecharPosterManual === 'function') cronosFecharPosterManual();
            if (typeof checarBotaoFavorito === 'function' && atualizada.url) checarBotaoFavorito(atualizada.url);
        } catch(e) {
            console.warn('Falha ao salvar poster manual direto:', e);
            if (area) area.innerHTML = `<div class="poster-manual-status">Não consegui salvar o poster: ${e.message || e}</div>`;
        }
    };
})();



/* ===== assets/detalhes/03-poster-manual-upload.js ===== */
// Extraído de KSM2-CINE3-main-CORRIGIDO.html — bloco JS 4.
/* ===== PATCH FINAL — poster manual persistente, clicável e com upload ===== */
(function(){
    const originalNormalizarObraParaBanco = window.normalizarObraParaBanco;
    if (typeof originalNormalizarObraParaBanco === 'function') {
        window.normalizarObraParaBanco = function(obra = {}) {
            const registro = originalNormalizarObraParaBanco(obra);
            registro.posterManual = !!(obra.posterManual || registro.posterManual);
            registro.posterManualFonte = obra.posterManualFonte || registro.posterManualFonte || '';
            registro.posterManualModo = obra.posterManualModo || registro.posterManualModo || '';
            registro.posterManualUpload = !!(obra.posterManualUpload || registro.posterManualUpload);
            registro.posterManualEditable = obra.posterManualEditable !== false && !!(
                obra.posterManual || obra.posterManualUpload || obra.posterManualFonte || obra.posterManualModo ||
                registro.posterManual || registro.posterManualUpload || registro.posterManualFonte || registro.posterManualModo
            );
            return registro;
        };
    }

    function cronosGetObraAtualPatch() {
        // Preferir a variável real da tela atual. window.obraSendoVista pode ficar com obra antiga
        // depois de salvar poster manual e causar o poster manual aparecer em outras fichas.
        try { if (typeof obraSendoVista !== 'undefined' && obraSendoVista && obraSendoVista.url) return obraSendoVista; } catch(e) {}
        try { if (window.obraSendoVista && window.obraSendoVista.url) return window.obraSendoVista; } catch(e) {}
        return {};
    }

    function cronosSetObraAtualPatch(obra) {
        try { window.obraSendoVista = obra; } catch(e) {}
        try { if (typeof obraSendoVista !== 'undefined') obraSendoVista = obra; } catch(e) {}
    }

    function cronosUrlAtualPatch() {
        const obra = cronosGetObraAtualPatch();
        return obra?.url || '';
    }

    function cronosPosterManualEhEditavel(obra) {
        return !!(obra && (obra.posterManual || obra.posterManualUpload || obra.posterManualEditable));
    }

    function cronosAtualizarCardsDOMPorUrl(url, poster) {
        if (!url || !poster) return;
        document.querySelectorAll('[data-url]').forEach(el => {
            if ((el.dataset.url || '') !== url) return;
            const img = el.querySelector('img');
            if (img) img.src = poster;
            el.dataset.poster = poster;
        });
    }

    async function cronosPropagarPosterManualGlobal(obraAtualizada) {
        if (!obraAtualizada || !obraAtualizada.url) return;
        await migrarLocalStorageParaIndexedDB();
        const id = gerarIdCronos(obraAtualizada.url);

        if (typeof salvarObraCronos === 'function') {
            await salvarObraCronos({ ...obraAtualizada, posterManualEditable: true });
        } else {
            await dbPut('obras', normalizarObraParaBanco({ ...obraAtualizada, posterManualEditable: true }));
        }

        const fav = await dbGet('favoritos', id);
        if (fav) {
            await dbPut('favoritos', normalizarObraParaBanco({ ...fav, ...obraAtualizada, posterManualEditable: true }));
        }

        const hist = await dbGet('historico', id);
        if (hist) {
            await dbPut('historico', normalizarObraParaBanco({
                ...hist,
                ...obraAtualizada,
                ultimoAcesso: hist.ultimoAcesso || new Date().toISOString(),
                posterManualEditable: true
            }));
        }

        cronosAtualizarCardsDOMPorUrl(obraAtualizada.url, obraAtualizada.poster || obraAtualizada.img || '');

        if (typeof renderizarResumoHomeLocal === 'function') {
            try { await renderizarResumoHomeLocal(); } catch(e) { console.warn(e); }
        }

        const telaFav = document.getElementById('telaFavoritos');
        if (telaFav && getComputedStyle(telaFav).display !== 'none' && typeof carregarFavoritos === 'function') {
            try { await carregarFavoritos(); } catch(e) { console.warn(e); }
        }

        const telaHist = document.getElementById('telaHistorico');
        if (telaHist && getComputedStyle(telaHist).display !== 'none' && typeof carregarHistorico === 'function') {
            try { await carregarHistorico(); } catch(e) { console.warn(e); }
        }
    }

    async function cronosAplicarPosterManualNaTelaAtual() {
        const url = cronosUrlAtualPatch();
        if (!url) return;
        await migrarLocalStorageParaIndexedDB();
        const salvo = await dbGet('obras', gerarIdCronos(url));
        if (!salvo) return;

        const imgDetalhe = document.getElementById('detalheImg');
        if (!imgDetalhe) return;

        const posterSalvo = escolherPosterSeguroCronos(salvo.poster, salvo.img);
        if (posterSalvo && cronosPosterManualEhEditavel(salvo)) {
            if ((imgDetalhe.getAttribute('src') || '') !== posterSalvo) {
                imgDetalhe.src = posterSalvo;
            }
            imgDetalhe.classList.remove('poster-sem-imagem-manual');
            imgDetalhe.classList.add('poster-manual-editavel');
            imgDetalhe.dataset.posterManual = '1';
            imgDetalhe.title = 'Poster manual. Clique para trocar.';
            imgDetalhe.alt = 'Poster';
            cronosSetObraAtualPatch({ ...cronosGetObraAtualPatch(), ...salvo, poster: posterSalvo, img: posterSalvo, posterManualEditable: true });
        }
    }

    function cronosHabilitarCliquePosterManual() {
        const img = document.getElementById('detalheImg');
        if (!img || img.__posterManualPatchBind) return;
        img.__posterManualPatchBind = true;
        img.addEventListener('click', function() {
            const obra = cronosGetObraAtualPatch();
            const clicavel = img.classList.contains('poster-sem-imagem-manual') || img.dataset.posterManual === '1' || cronosPosterManualEhEditavel(obra);
            if (clicavel && typeof cronosAbrirModalPosterManual === 'function') {
                cronosAbrirModalPosterManual();
            }
        });
    }

    async function cronosSalvarPosterManualDataUrl(dataUrl, meta = {}) {
        if (!dataUrl) return;
        const obra = cronosGetObraAtualPatch();
        if (!obra || !obra.url) return;
        const atualizada = {
            ...obra,
            poster: dataUrl,
            img: dataUrl,
            posterManual: true,
            posterManualUpload: !!meta.upload,
            posterManualFonte: meta.fonte || 'manual',
            posterManualModo: meta.modo || (meta.upload ? 'upload_manual' : 'imagem_direta_sem_recorte'),
            posterManualEditable: true,
            updatedAt: new Date().toISOString()
        };
        cronosSetObraAtualPatch(atualizada);
        const imgDetalhe = document.getElementById('detalheImg');
        if (imgDetalhe) {
            imgDetalhe.src = dataUrl;
            imgDetalhe.classList.remove('poster-sem-imagem-manual');
            imgDetalhe.classList.add('poster-manual-editavel');
            imgDetalhe.dataset.posterManual = '1';
            imgDetalhe.title = 'Poster manual. Clique para trocar.';
        }
        await cronosPropagarPosterManualGlobal(atualizada);
        if (typeof checarBotaoFavorito === 'function') checarBotaoFavorito(atualizada.url);
        if (typeof cronosFecharPosterManual === 'function') cronosFecharPosterManual();
    }

    // Salva a imagem escolhida da galeria como poster manual persistente.
    window.cronosSelecionarImagemPosterManual = async function(index) {
        const item = (window.__cronosPosterManualImagens || [])[index];
        if (!item || !item.url) return;
        const area = document.getElementById('posterManualConteudoCronos');
        if (area) area.innerHTML = '<div class="poster-manual-status">Salvando imagem escolhida como poster manual...</div>';
        try {
            await cronosSalvarPosterManualDataUrl(item.url, { fonte: item.url, modo: 'imagem_direta_sem_recorte', upload: false });
        } catch (e) {
            console.warn('Falha ao salvar poster manual:', e);
            if (area) area.innerHTML = `<div class="poster-manual-status">Não consegui salvar o poster: ${e.message || e}</div>`;
        }
    };

    function cronosGarantirUploadNoModal() {
        const area = document.getElementById('posterManualConteudoCronos');
        if (!area) return;
        if (document.getElementById('posterManualUploadWrapCronos')) return;
        const wrap = document.createElement('div');
        wrap.id = 'posterManualUploadWrapCronos';
        wrap.className = 'poster-manual-upload-wrap';
        wrap.innerHTML = `
            <button class="poster-manual-btn" type="button" id="btnUploadPosterManualCronos">Upload de capa</button>
            <input type="file" id="inputUploadPosterManualCronos" accept="image/png,image/jpeg,image/webp" style="display:none;">
            <span class="poster-manual-upload-note">Se você já editou uma capa, pode enviar aqui e salvar direto no banco.</span>
        `;
        area.parentNode.insertBefore(wrap, area);
        const btn = document.getElementById('btnUploadPosterManualCronos');
        const input = document.getElementById('inputUploadPosterManualCronos');
        btn.onclick = () => input.click();
        input.onchange = function() {
            const file = input.files && input.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = async function() {
                try {
                    await cronosSalvarPosterManualDataUrl(reader.result, { upload: true, fonte: file.name || 'upload', modo: 'upload_manual' });
                } catch (e) {
                    console.warn('Falha no upload do poster manual:', e);
                    alert('Não consegui salvar a capa enviada.');
                } finally {
                    input.value = '';
                }
            };
            reader.readAsDataURL(file);
        };
    }

    const originalAbrirModalPosterManualPatch = window.cronosAbrirModalPosterManual;
    if (typeof originalAbrirModalPosterManualPatch === 'function') {
        window.cronosAbrirModalPosterManual = async function() {
            await originalAbrirModalPosterManualPatch.apply(this, arguments);
            setTimeout(cronosGarantirUploadNoModal, 40);
            setTimeout(cronosGarantirUploadNoModal, 300);
        };
    }

    const originalAnalisarObraPatch = window.analisarObra;
    if (typeof originalAnalisarObraPatch === 'function') {
        window.analisarObra = function() {
            const retorno = originalAnalisarObraPatch.apply(this, arguments);
            setTimeout(cronosAplicarPosterManualNaTelaAtual, 200);
            setTimeout(cronosAplicarPosterManualNaTelaAtual, 900);
            setTimeout(cronosAplicarPosterManualNaTelaAtual, 1800);
            setTimeout(cronosAplicarPosterManualNaTelaAtual, 3000);
            return retorno;
        };
    }

    // Garante que, ao entrar direto em uma obra já salva, o poster manual volte automaticamente.
    document.addEventListener('DOMContentLoaded', function() {
        cronosHabilitarCliquePosterManual();
        setTimeout(cronosAplicarPosterManualNaTelaAtual, 600);
        setInterval(() => {
            cronosHabilitarCliquePosterManual();
            cronosAplicarPosterManualNaTelaAtual().catch?.(()=>{});
        }, 1800);
    });
})();



/* ===== assets/storage/04-poster-manual-oficial-db.js ===== */
// Extraído de KSM2-CINE3-main-CORRIGIDO.html — bloco JS 5.
/* ===== PATCH — poster manual vira capa oficial do Cronos no IndexedDB ===== */
(function(){
    function getObraAtualManualOficial() {
        // Preferir a obra aberta agora. O espelho em window pode estar antigo.
        try { if (typeof obraSendoVista !== 'undefined' && obraSendoVista && obraSendoVista.url) return obraSendoVista; } catch(e) {}
        try { if (window.obraSendoVista && window.obraSendoVista.url) return window.obraSendoVista; } catch(e) {}
        return {};
    }
    function setObraAtualManualOficial(obra) {
        try { window.obraSendoVista = obra; } catch(e) {}
        try { if (typeof obraSendoVista !== 'undefined') obraSendoVista = obra; } catch(e) {}
    }
    function isManual(obra) {
        return !!(obra && (obra.posterManual || obra.posterManualEditable || obra.posterManualUpload));
    }
    function gerarPosterVerticalDeImagem(url) {
        return new Promise((resolve) => {
            const finalizarFallback = () => resolve(url);
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = function(){
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = 500;
                    canvas.height = 750;
                    const ctx = canvas.getContext('2d');
                    const iw = img.naturalWidth || img.width;
                    const ih = img.naturalHeight || img.height;
                    if (!iw || !ih) return finalizarFallback();
const targetRatio = 500 / 750;
                    const sourceRatio = iw / ih;
                    let sx = 0, sy = 0, sw = iw, sh = ih;
                    if (sourceRatio > targetRatio) {
                        sw = ih * targetRatio;
                        sx = (iw - sw) / 2;
                    } else {
                        sh = iw / targetRatio;
                        sy = (ih - sh) / 2;
                    }
                    ctx.fillStyle = '#000';
                    ctx.fillRect(0,0,500,750);
                    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, 500, 750);
                    resolve(canvas.toDataURL('image/jpeg', 0.9));
                } catch(e) { finalizarFallback(); }
            };
            img.onerror = finalizarFallback;
            if (/^data:image\//i.test(url)) img.src = url;
            else img.src = PROXY + encodeURIComponent(url);
        });
    }
    async function salvarPosterManualOficial(posterFinal, fonte, modo, upload) {
        const obra = getObraAtualManualOficial();
        if (!obra || !obra.url || !posterFinal) return;
        await migrarLocalStorageParaIndexedDB();
        const id = gerarIdCronos(obra.url);
        const base = (await dbGet('obras', id)) || obra;
        const atualizada = {
            ...base,
            ...obra,
            poster: posterFinal,
            img: posterFinal,
            posterManual: true,
            posterManualEditable: true,
            posterManualUpload: !!upload,
            posterManualFonte: fonte || posterFinal,
            posterManualModo: modo || 'manual',
            updatedAt: new Date().toISOString()
        };
        setObraAtualManualOficial(atualizada);
        await salvarObraCronos(atualizada);
        const fav = await dbGet('favoritos', id);
        if (fav) await dbPut('favoritos', normalizarObraParaBanco({ ...fav, ...atualizada }));
        const hist = await dbGet('historico', id);
        if (hist) await dbPut('historico', normalizarObraParaBanco({ ...hist, ...atualizada, ultimoAcesso: hist.ultimoAcesso || new Date().toISOString() }));
        await salvarHistoricoHome(atualizada);
        aplicarPosterManualNaTela(atualizada);
        if (typeof renderizarResumoHomeLocal === 'function') renderizarResumoHomeLocal();
        if (typeof checarBotaoFavorito === 'function') checarBotaoFavorito(atualizada.url);
    }
    function aplicarPosterManualNaTela(obra) {
        const poster = escolherPosterSeguroCronos(obra?.poster, obra?.img);
        if (!poster) return;
        const imgDetalhe = document.getElementById('detalheImg');
        if (imgDetalhe && (!obra?.url || getObraAtualManualOficial().url === obra.url)) {
            imgDetalhe.src = poster;
            imgDetalhe.classList.remove('poster-sem-imagem-manual');
            imgDetalhe.classList.add('poster-manual-editavel');
            imgDetalhe.dataset.posterManual = '1';
            imgDetalhe.title = 'Poster manual. Clique para trocar.';
            imgDetalhe.alt = 'Poster';
        }
        if (obra?.url) {
            document.querySelectorAll(`[data-url="${CSS.escape(obra.url)}"] img`).forEach(img => {
                img.src = poster;
                img.classList.add('poster-manual-card');
            });
        }
    }
    async function reaplicarPosterManualSalvo() {
        const obra = getObraAtualManualOficial();
        if (!obra || !obra.url) return;
        await migrarLocalStorageParaIndexedDB();
        const salvo = await dbGet('obras', gerarIdCronos(obra.url));
        if (!salvo || !isManual(salvo)) return;
        const poster = escolherPosterSeguroCronos(salvo.poster, salvo.img);
        if (!poster) return;
        const mesclada = { ...obra, ...salvo, poster, img: poster, posterManual: true, posterManualEditable: true };
        setObraAtualManualOficial(mesclada);
        aplicarPosterManualNaTela(mesclada);
    }
    window.cronosSelecionarImagemPosterManual = async function(index) {
        const item = (window.__cronosPosterManualImagens || [])[index];
        if (!item || !item.url) return;
        const area = document.getElementById('posterManualConteudoCronos');
        if (area) area.innerHTML = '<div class="poster-manual-status">Gerando capa vertical e salvando no IndexedDB...</div>';
        try {
            const posterVertical = await gerarPosterVerticalDeImagem(item.url);
            await salvarPosterManualOficial(posterVertical, item.url, 'galeria_convertida_2x3', false);
            if (typeof cronosFecharPosterManual === 'function') cronosFecharPosterManual();
        } catch(e) {
            console.warn('Falha ao salvar poster manual oficial:', e);
            if (area) area.innerHTML = `<div class="poster-manual-status">Não consegui salvar o poster: ${e.message || e}</div>`;
        }
    };
    function inserirUploadPosterManual() {
        const area = document.getElementById('posterManualConteudoCronos');
        if (!area || document.getElementById('posterManualUploadWrapCronos')) return;
        const wrap = document.createElement('div');
        wrap.id = 'posterManualUploadWrapCronos';
        wrap.className = 'poster-manual-upload-wrap';
        wrap.innerHTML = `
            <button class="poster-manual-btn" type="button" id="btnUploadPosterManualCronos">Upload de capa</button>
            <input type="file" id="inputUploadPosterManualCronos" accept="image/png,image/jpeg,image/webp" style="display:none;">
            <span class="poster-manual-upload-note">Escolha uma capa pronta do PC para salvar no IndexedDB.</span>
        `;
        area.parentNode.insertBefore(wrap, area);
        const input = document.getElementById('inputUploadPosterManualCronos');
        document.getElementById('btnUploadPosterManualCronos').onclick = () => input.click();
        input.onchange = () => {
            const file = input.files && input.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = async () => {
                const area2 = document.getElementById('posterManualConteudoCronos');
                if (area2) area2.innerHTML = '<div class="poster-manual-status">Salvando upload como poster manual...</div>';
                await salvarPosterManualOficial(reader.result, file.name || 'upload', 'upload_manual', true);
                if (typeof cronosFecharPosterManual === 'function') cronosFecharPosterManual();
            };
            reader.readAsDataURL(file);
        };
    }
    const abrirModalAntigo = window.cronosAbrirModalPosterManual;
    if (typeof abrirModalAntigo === 'function') {
        window.cronosAbrirModalPosterManual = async function(){
            await abrirModalAntigo.apply(this, arguments);
            setTimeout(inserirUploadPosterManual, 30);
            setTimeout(inserirUploadPosterManual, 400);
        };
    }
    function habilitarCliqueManualPersistente() {
        const img = document.getElementById('detalheImg');
        if (!img || img.__posterManualOficialBind) return;
        img.__posterManualOficialBind = true;
        img.addEventListener('click', () => {
            const obra = getObraAtualManualOficial();
            if (img.classList.contains('poster-sem-imagem-manual') || img.dataset.posterManual === '1' || isManual(obra)) {
                if (typeof cronosAbrirModalPosterManual === 'function') cronosAbrirModalPosterManual();
            }
        });
    }
    document.addEventListener('DOMContentLoaded', () => {
        habilitarCliqueManualPersistente();
        [250, 900, 1800, 3500].forEach(t => setTimeout(() => { habilitarCliqueManualPersistente(); reaplicarPosterManualSalvo(); }, t));
        if (!window.__cronosPosterManualOficialObserver) {
            window.__cronosPosterManualOficialObserver = new MutationObserver(() => { habilitarCliqueManualPersistente(); reaplicarPosterManualSalvo(); });
            window.__cronosPosterManualOficialObserver.observe(document.body, { childList: true, subtree: true });
        }
    });
    const oldAnalisar = window.analisarObra;
    if (typeof oldAnalisar === 'function') {
        window.analisarObra = function(){
            const ret = oldAnalisar.apply(this, arguments);
            setTimeout(reaplicarPosterManualSalvo, 250);
            setTimeout(reaplicarPosterManualSalvo, 900);
            setTimeout(reaplicarPosterManualSalvo, 1800);
            return ret;
        };
    }
})();

