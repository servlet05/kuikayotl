// ============================================================
// main.js - Punto de entrada principal de Kuikayotl
// Con sistema de países latinoamericanos
// ============================================================

(function() {
    'use strict';

    // ===== PAÍSES LATINOAMERICANOS =====
    const LATAM_COUNTRIES = [
        { name: 'México', flag: '🇲🇽', query: 'album mexico' },
        { name: 'Argentina', flag: '🇦🇷', query: 'album argentina' },
        { name: 'Colombia', flag: '🇨🇴', query: 'album colombia' },
        { name: 'Chile', flag: '🇨🇱', query: 'album chile' },
        { name: 'Perú', flag: '🇵🇪', query: 'album peru' },
        { name: 'Venezuela', flag: '🇻🇪', query: 'album venezuela' },
        { name: 'Brasil', flag: '🇧🇷', query: 'album brasil' },
        { name: 'Ecuador', flag: '🇪🇨', query: 'album ecuador' },
        { name: 'Guatemala', flag: '🇬🇹', query: 'album guatemala' },
        { name: 'Cuba', flag: '🇨🇺', query: 'album cuba' },
        { name: 'Bolivia', flag: '🇧🇴', query: 'album bolivia' },
        { name: 'República Dominicana', flag: '🇩🇴', query: 'album republica dominicana' },
        { name: 'Honduras', flag: '🇭🇳', query: 'album honduras' },
        { name: 'Paraguay', flag: '🇵🇾', query: 'album paraguay' },
        { name: 'El Salvador', flag: '🇸🇻', query: 'album el salvador' },
        { name: 'Nicaragua', flag: '🇳🇮', query: 'album nicaragua' },
        { name: 'Costa Rica', flag: '🇨🇷', query: 'album costa rica' },
        { name: 'Panamá', flag: '🇵🇦', query: 'album panama' },
        { name: 'Uruguay', flag: '🇺🇾', query: 'album uruguay' },
        { name: 'Puerto Rico', flag: '🇵🇷', query: 'album puerto rico' },
    ];

    // ===== CONFIGURACIÓN =====
    let DEFAULT_QUERY = 'album mexico';
    let currentCountry = 'México';

    // ===== DOM REFERENCES =====
    const grid = document.getElementById('musicGrid');
    const statAlbums = document.getElementById('statAlbums');
    const statArtists = document.getElementById('statArtists');
    const statYears = document.getElementById('statYears');
    const statUpdated = document.getElementById('statUpdated');
    const resultBadge = document.getElementById('resultBadge');
    const totalCount = document.getElementById('totalCount');
    const artistCount = document.getElementById('artistCount');
    const pageInfo = document.getElementById('pageInfo');
    const paginationInfo = document.getElementById('paginationInfo');
    const recentReleases = document.getElementById('recentReleases');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const pageNumbers = document.getElementById('pageNumbers');
    const sectionTitle = document.getElementById('sectionTitle');
    const currentCountryEl = document.getElementById('currentCountry');
    const countryDropdown = document.getElementById('countryDropdown');
    const countryGrid = document.getElementById('countryGrid');
    const countrySidebar = document.getElementById('countrySidebar');
    const dropdownToggle = document.querySelector('.dropdown-toggle');

    // ===== ESTADO =====
    let currentPage = 0;
    let totalResults = 0;
    let currentQuery = DEFAULT_QUERY;
    let allDocs = [];

    // ===== FUNCIONES DE PAÍSES =====

    /**
     * Renderiza todos los países en el dropdown y sidebar
     */
    function renderCountries() {
        // Dropdown
        if (countryGrid) {
            countryGrid.innerHTML = '';
            LATAM_COUNTRIES.forEach(country => {
                const div = document.createElement('div');
                div.className = 'country-item';
                div.innerHTML = `
                    <span class="flag">${country.flag}</span>
                    <span class="country-name">${country.name}</span>
                `;
                div.addEventListener('click', function() {
                    selectCountry(country);
                    if (countryDropdown) countryDropdown.style.display = 'none';
                });
                countryGrid.appendChild(div);
            });
        }

        // Sidebar
        if (countrySidebar) {
            countrySidebar.innerHTML = '';
            LATAM_COUNTRIES.forEach(country => {
                const div = document.createElement('div');
                div.className = 'country-item';
                if (country.name === currentCountry) {
                    div.classList.add('active');
                }
                div.innerHTML = `
                    <span class="flag">${country.flag}</span>
                    <span class="country-name">${country.name}</span>
                `;
                div.addEventListener('click', function() {
                    selectCountry(country);
                });
                countrySidebar.appendChild(div);
            });
        }
    }

    /**
     * Selecciona un país y carga su música
     */
    function selectCountry(country) {
        currentCountry = country.name;
        currentQuery = country.query;
        DEFAULT_QUERY = country.query;
        
        // Actualizar UI
        if (currentCountryEl) currentCountryEl.textContent = country.name;
        if (sectionTitle) sectionTitle.textContent = `🎵 Álbumes de ${country.name}`;
        
        // Actualizar sidebar activo
        if (countrySidebar) {
            document.querySelectorAll('#countrySidebar .country-item').forEach(el => {
                el.classList.remove('active');
                const nameEl = el.querySelector('.country-name');
                if (nameEl && nameEl.textContent === country.name) {
                    el.classList.add('active');
                }
            });
        }

        // Actualizar enlace "Música" con el país actual
        const musicLink = document.querySelector('.header-links a[data-query]');
        if (musicLink) {
            musicLink.textContent = `🎵 ${country.name}`;
            musicLink.dataset.query = country.query;
        }

        // Cargar música
        loadMusic(country.query, 0);
    }

    // ===== FUNCIONES DE RENDERIZADO =====

    /**
     * Crea una tarjeta de álbum
     */
    function createMusicCard(item) {
        const card = document.createElement('div');
        card.className = 'music-card';

        const coverUrl = API.getImageUrl(item.identifier);
        const title = item.title || 'Sin título';
        const creator = item.creator || 'Artista desconocido';
        const date = API.formatDate(item.date);

        // Cover
        const coverDiv = document.createElement('div');
        coverDiv.className = 'card-cover';
        if (coverUrl) {
            const img = document.createElement('img');
            img.src = coverUrl;
            img.alt = title;
            img.loading = 'lazy';
            img.onerror = function() {
                this.style.display = 'none';
                this.parentElement.innerHTML = `
                    <div class="no-image">
                        🎵
                        <span>Sin portada</span>
                    </div>
                `;
            };
            coverDiv.appendChild(img);
        } else {
            coverDiv.innerHTML = `
                <div class="no-image">
                    🎵
                    <span>Sin portada</span>
                </div>
            `;
        }
        card.appendChild(coverDiv);

        // Info
        const infoDiv = document.createElement('div');
        infoDiv.className = 'card-info';
        infoDiv.innerHTML = `
            <div class="card-title" title="${title.replace(/"/g, '&quot;')}">${title}</div>
            <div class="card-artist" title="${creator.replace(/"/g, '&quot;')}">${creator}</div>
            <div class="card-date">${date}</div>
        `;
        card.appendChild(infoDiv);

        // Actions
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'card-actions';

        const playBtn = document.createElement('button');
        playBtn.className = 'btn-play';
        playBtn.textContent = '▶ Reproducir';
        playBtn.dataset.identifier = item.identifier;
        playBtn.dataset.title = title;
        playBtn.dataset.artist = creator;
        playBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (window.Kuikayotl && window.Kuikayotl.playTrack) {
                window.Kuikayotl.playTrack(item.identifier, title, creator);
            } else {
                Player.playTrack(item.identifier, title, creator, API.getAudioUrl);
            }
        });
        actionsDiv.appendChild(playBtn);

        const detailBtn = document.createElement('button');
        detailBtn.className = 'btn-detail';
        detailBtn.textContent = 'Detalles';
        detailBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            window.open(`https://archive.org/details/${item.identifier}`, '_blank');
        });
        actionsDiv.appendChild(detailBtn);

        card.appendChild(actionsDiv);

        return card;
    }

    /**
     * Actualiza las estadísticas de la página
     */
    function updateStats(docs) {
        const total = docs.length;

        // Álbumes
        if (statAlbums) statAlbums.textContent = total > 0 ? total : '0';
        if (resultBadge) resultBadge.textContent = `${total} álbumes`;
        if (totalCount) totalCount.textContent = totalResults > 0 ? totalResults : docs.length;

        // Artistas únicos
        const artistSet = new Set();
        docs.forEach(d => {
            const creators = API.extractArtists(d.creator || '');
            if (creators.length > 0) {
                creators.forEach(a => artistSet.add(a.toLowerCase()));
            } else {
                const id = d.identifier || '';
                if (id) {
                    const parts = id.split('-');
                    if (parts.length > 0) {
                        const possibleArtist = parts[0].replace(/[0-9]/g, '').trim();
                        if (possibleArtist.length > 2 && possibleArtist.length < 20) {
                            artistSet.add(possibleArtist.toLowerCase());
                        }
                    }
                }
            }
        });

        const uniqueArtists = artistSet.size;
        if (statArtists) statArtists.textContent = uniqueArtists > 0 ? uniqueArtists : '0';
        if (artistCount) artistCount.textContent = uniqueArtists > 0 ? uniqueArtists : '0';

        // Años
        const years = docs.filter(d => d.date).map(d => new Date(d.date).getFullYear()).filter(y => !isNaN(y));
        if (statYears) {
            if (years.length > 0) {
                const minYear = Math.min(...years);
                const maxYear = Math.max(...years);
                statYears.textContent = `${minYear} - ${maxYear}`;
            } else {
                statYears.textContent = 'N/A';
            }
        }

        // Último lanzamiento
        const sortedByDate = [...docs].filter(d => d.date).sort((a, b) => new Date(b.date) - new Date(a.date));
        if (statUpdated) {
            if (sortedByDate.length > 0) {
                statUpdated.textContent = API.formatDate(sortedByDate[0].date);
            } else {
                statUpdated.textContent = 'N/A';
            }
        }

        // Paginación
        if (pageInfo) pageInfo.textContent = `Página ${currentPage + 1}`;
        if (paginationInfo) {
            paginationInfo.textContent = totalResults > 0 ? `de ${Math.ceil(totalResults / API.CONFIG.RESULTS_PER_PAGE)} páginas` : '';
        }
    }

    /**
     * Actualiza la lista de lanzamientos recientes en el sidebar
     */
    function updateRecentReleases(docs) {
        const sortedByDate = [...docs].filter(d => d.date).sort((a, b) => new Date(b.date) - new Date(a.date));
        const recentDocs = sortedByDate.slice(0, 5);

        if (recentReleases) {
            recentReleases.innerHTML = '';
            if (recentDocs.length === 0) {
                recentReleases.innerHTML = '<p class="loading-text">No hay lanzamientos recientes</p>';
            } else {
                recentDocs.forEach(item => {
                    const div = document.createElement('div');
                    div.style.cssText = `
                        padding: 4px 0;
                        border-bottom: 1px dotted #e8eef5;
                        font-size: 0.8rem;
                    `;
                    div.innerHTML = `
                        <strong>${item.title || 'Sin título'}</strong>
                        <br>
                        <span style="color: #5a7a9e; font-size: 0.7rem;">${item.creator || 'Artista desconocido'} · ${API.formatDate(item.date)}</span>
                    `;
                    recentReleases.appendChild(div);
                });
            }
        }
    }

    /**
     * Actualiza los controles de paginación
     */
    function updatePagination(total) {
        const totalPages = Math.min(Math.ceil(total / API.CONFIG.RESULTS_PER_PAGE), API.CONFIG.MAX_PAGES);
        const current = currentPage;

        if (prevPageBtn) prevPageBtn.disabled = current === 0;
        if (nextPageBtn) nextPageBtn.disabled = current >= totalPages - 1 || totalPages === 0;

        if (pageNumbers) {
            pageNumbers.innerHTML = '';

            if (totalPages === 0) {
                pageNumbers.innerHTML = '<span class="page-info">Sin resultados</span>';
                return;
            }

            let startPage = Math.max(0, current - 3);
            let endPage = Math.min(totalPages - 1, current + 3);

            if (endPage - startPage < 6) {
                if (startPage === 0) {
                    endPage = Math.min(totalPages - 1, 6);
                } else if (endPage === totalPages - 1) {
                    startPage = Math.max(0, totalPages - 7);
                }
            }

            if (startPage > 0) {
                addPageButton(0);
                if (startPage > 1) {
                    addEllipsis();
                }
            }

            for (let i = startPage; i <= endPage; i++) {
                const btn = addPageButton(i);
                if (i === current) {
                    btn.classList.add('active');
                }
            }

            if (endPage < totalPages - 1) {
                if (endPage < totalPages - 2) {
                    addEllipsis();
                }
                addPageButton(totalPages - 1);
            }
        }
    }

    function addPageButton(pageNum) {
        const btn = document.createElement('button');
        btn.textContent = pageNum + 1;
        btn.addEventListener('click', function() {
            if (pageNum !== currentPage) {
                loadMusic(currentQuery, pageNum);
            }
        });
        if (pageNumbers) pageNumbers.appendChild(btn);
        return btn;
    }

    function addEllipsis() {
        const ellipsis = document.createElement('span');
        ellipsis.textContent = '…';
        ellipsis.style.padding = '6px 4px';
        ellipsis.style.color = '#6a8aaa';
        if (pageNumbers) pageNumbers.appendChild(ellipsis);
    }

    // ===== FUNCIÓN PRINCIPAL DE CARGA =====

    async function loadMusic(query = DEFAULT_QUERY, page = 0) {
        try {
            if (grid) {
                grid.innerHTML = `
                    <div class="loading-spinner">
                        <div class="spinner"></div>
                        <p>Cargando música desde Internet Archive...</p>
                    </div>
                `;
            }

            const result = await API.searchMusic(query, page);
            const docs = result.docs;
            totalResults = result.total;

            currentQuery = query;
            currentPage = page;
            allDocs = docs;

            updateStats(docs);

            if (grid) {
                grid.innerHTML = '';

                if (docs.length === 0) {
                    grid.innerHTML = `<div class="no-results">No se encontraron resultados para "${query}"</div>`;
                    updatePagination(0);
                    return;
                }

                docs.forEach(item => {
                    const card = createMusicCard(item);
                    grid.appendChild(card);
                });
            }

            updateRecentReleases(docs);
            updatePagination(totalResults);

        } catch (error) {
            console.error('Error en loadMusic:', error);
            if (grid) {
                grid.innerHTML = `
                    <div class="error-message">
                        ⚠️ Error al cargar la música: ${error.message}
                        <br>
                        <button onclick="location.reload()" style="margin-top: 10px; padding: 8px 20px; background: #1a5c9e; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            Intentar de nuevo
                        </button>
                    </div>
                `;
            }
        }
    }

    // ===== INICIALIZACIÓN =====

    function init() {
        // Exponer función de reproducción para Player
        window.Kuikayotl = {
            playTrack: function(identifier, title, artist) {
                Player.playTrack(identifier, title, artist, API.getAudioUrl);
            }
        };

        // Inicializar reproductor
        Player.init();

        // Renderizar países
        renderCountries();

        // Toggle del dropdown de países
        if (dropdownToggle && countryDropdown) {
            dropdownToggle.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                const isVisible = countryDropdown.style.display === 'block';
                countryDropdown.style.display = isVisible ? 'none' : 'block';
            });
        }

        // Cerrar dropdown al hacer clic fuera
        document.addEventListener('click', function(e) {
            if (countryDropdown && countryDropdown.style.display === 'block') {
                if (!countryDropdown.contains(e.target) && e.target !== dropdownToggle) {
                    countryDropdown.style.display = 'none';
                }
            }
        });

        // Event listeners de paginación
        if (prevPageBtn) {
            prevPageBtn.addEventListener('click', function() {
                if (currentPage > 0) {
                    loadMusic(currentQuery, currentPage - 1);
                }
            });
        }

        if (nextPageBtn) {
            nextPageBtn.addEventListener('click', function() {
                const totalPages = Math.ceil(totalResults / API.CONFIG.RESULTS_PER_PAGE);
                if (currentPage < totalPages - 1) {
                    loadMusic(currentQuery, currentPage + 1);
                }
            });
        }

        // Event listeners de búsqueda
        if (searchButton && searchInput) {
            searchButton.addEventListener('click', function() {
                const query = searchInput.value.trim();
                if (query) {
                    // Buscar si el query coincide con algún país
                    const matchedCountry = LATAM_COUNTRIES.find(c => 
                        c.name.toLowerCase() === query.toLowerCase() ||
                        c.query.toLowerCase().includes(query.toLowerCase()) ||
                        query.toLowerCase().includes(c.name.toLowerCase())
                    );
                    if (matchedCountry) {
                        selectCountry(matchedCountry);
                    } else {
                        loadMusic('album ' + query, 0);
                        if (sectionTitle) sectionTitle.textContent = `🎵 Búsqueda: "${query}"`;
                        if (currentCountryEl) currentCountryEl.textContent = query;
                    }
                } else {
                    loadMusic(DEFAULT_QUERY, 0);
                }
            });

            searchInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    searchButton.click();
                }
            });
        }

        // Enlace "Aleatorio"
        const linkRandom = document.getElementById('linkRandom');
        if (linkRandom) {
            linkRandom.addEventListener('click', function(e) {
                e.preventDefault();
                const randomCountry = LATAM_COUNTRIES[Math.floor(Math.random() * LATAM_COUNTRIES.length)];
                selectCountry(randomCountry);
            });
        }

        // Enlace "Top álbumes" (muestra todos los países)
        const linkTop = document.getElementById('linkTop');
        if (linkTop) {
            linkTop.addEventListener('click', function(e) {
                e.preventDefault();
                const allQueries = LATAM_COUNTRIES.map(c => `(${c.query})`).join(' OR ');
                currentCountry = 'Todos los países';
                currentQuery = allQueries;
                if (sectionTitle) sectionTitle.textContent = '🔥 Top álbumes de Latinoamérica';
                if (currentCountryEl) currentCountryEl.textContent = 'Todos';
                loadMusic(allQueries, 0);
            });
        }

        // Enlace "Acerca de"
        const linkAbout = document.getElementById('linkAbout');
        if (linkAbout) {
            linkAbout.addEventListener('click', function(e) {
                e.preventDefault();
                alert(
                    '🎵 Kuikayotl\n\n' +
                    'Un proyecto que muestra música latinoamericana alojada en Internet Archive.\n\n' +
                    '🌎 Selecciona un país para explorar su música.\n' +
                    '🎲 Usa "Aleatorio" para descubrir música nueva.\n' +
                    '🔥 "Top álbumes" muestra resultados de todos los países.\n\n' +
                    'Hecho con ❤️ desde Latinoamérica\n' +
                    'https://github.com/tuusuario/kuikayotl'
                );
            });
        }

        // Enlace "Acerca de" en footer
        const footerAbout = document.getElementById('footerAbout');
        if (footerAbout) {
            footerAbout.addEventListener('click', function(e) {
                e.preventDefault();
                if (linkAbout) linkAbout.click();
            });
        }

        // Enlace "Música" - vuelve al país actual
        const musicLink = document.querySelector('.header-links a[data-query]');
        if (musicLink) {
            musicLink.addEventListener('click', function(e) {
                e.preventDefault();
                // Recargar la búsqueda actual
                loadMusic(currentQuery, 0);
            });
        }

        // Enlace "Artistas" - muestra los artistas del país actual
        const artistLink = document.querySelector('.header-links a:not([data-query]):nth-child(2)');
        if (artistLink) {
            artistLink.addEventListener('click', function(e) {
                e.preventDefault();
                // Mostrar artistas del país actual
                loadMusic(currentQuery + ' artist', 0);
                if (sectionTitle) sectionTitle.textContent = `🎤 Artistas de ${currentCountry}`;
            });
        }

        // Cargar música inicial (México por defecto)
        loadMusic(DEFAULT_QUERY, 0);

        console.log('🎵 Kuikayotl inicializado correctamente');
        console.log(`🌎 Países disponibles: ${LATAM_COUNTRIES.length}`);
        console.log(`📊 Buscando: "${DEFAULT_QUERY}"`);
    }

    // ===== EJECUTAR CUANDO EL DOM ESTÉ LISTO =====
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
