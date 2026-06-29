// ============================================================
// player.js - Módulo del reproductor de audio
// ============================================================

const Player = (function() {
    'use strict';

    // ===== DOM REFERENCES =====
    const audio = new Audio();
    let playlist = [];
    let currentTrackIndex = -1;

    const btnPlayPause = document.getElementById('btnPlayPause');
    const btnPrev = document.getElementById('btnPrev');
    const btnNext = document.getElementById('btnNext');
    const playerInfo = document.getElementById('playerInfo');
    const playerProgressBar = document.getElementById('playerProgressBar');
    const playerTime = document.getElementById('playerTime');
    const playerProgress = document.getElementById('playerProgress');
    const nowPlaying = document.getElementById('nowPlaying');

    // ===== FUNCIONES PRIVADAS =====

    function formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return m + ':' + String(s).padStart(2, '0');
    }

    function updateNowPlaying(title, artist) {
        const text = title && artist ? `🎵 ${title} · ${artist}` : 'Selecciona una canción para reproducir';
        if (nowPlaying) nowPlaying.textContent = text;
        if (playerInfo) playerInfo.textContent = text;
    }

    function updatePlayPauseButton(isPlaying) {
        if (btnPlayPause) {
            btnPlayPause.textContent = isPlaying ? '⏸' : '▶';
        }
    }

    function updateProgress() {
        if (audio.duration && audio.currentTime) {
            const percent = (audio.currentTime / audio.duration) * 100;
            if (playerProgressBar) {
                playerProgressBar.style.width = percent + '%';
            }
            if (playerTime) {
                playerTime.textContent = formatTime(audio.currentTime) + ' / ' + formatTime(audio.duration);
            }
        }
    }

    // ===== FUNCIONES PÚBLICAS =====

    /**
     * Reproduce una pista por su identificador
     * @param {string} identifier - Identificador del ítem en Archive.org
     * @param {string} title - Título de la canción/álbum
     * @param {string} artist - Nombre del artista
     * @param {Function} getAudioUrlFn - Función para obtener la URL del audio
     */
    async function playTrack(identifier, title, artist, getAudioUrlFn) {
        if (!getAudioUrlFn || typeof getAudioUrlFn !== 'function') {
            console.error('getAudioUrlFn no está definida');
            updateNowPlaying('❌ Error: función de audio no disponible', '');
            return;
        }

        const url = await getAudioUrlFn(identifier);
        if (!url) {
            updateNowPlaying('❌ No se pudo cargar el audio', '');
            return;
        }

        audio.src = url;
        audio.play();
        updatePlayPauseButton(true);
        updateNowPlaying(title, artist);

        const index = playlist.findIndex(p => p.identifier === identifier);
        if (index === -1) {
            playlist.push({ identifier, title, artist, url });
            currentTrackIndex = playlist.length - 1;
        } else {
            currentTrackIndex = index;
        }
    }

    /**
     * Alterna entre reproducir y pausar
     */
    function togglePlayPause() {
        if (audio.paused) {
            audio.play();
            updatePlayPauseButton(true);
        } else {
            audio.pause();
            updatePlayPauseButton(false);
        }
    }

    /**
     * Reproduce la siguiente canción de la lista
     */
    function playNext() {
        if (playlist.length === 0) return;
        const nextIndex = (currentTrackIndex + 1) % playlist.length;
        const track = playlist[nextIndex];
        return track;
    }

    /**
     * Reproduce la canción anterior de la lista
     */
    function playPrev() {
        if (playlist.length === 0) return;
        const prevIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
        const track = playlist[prevIndex];
        return track;
    }

    /**
     * Obtiene la playlist actual
     */
    function getPlaylist() {
        return [...playlist];
    }

    /**
     * Obtiene el índice de la canción actual
     */
    function getCurrentIndex() {
        return currentTrackIndex;
    }

    /**
     * Inicializa el reproductor con los event listeners
     */
    function init() {
        if (btnPlayPause) {
            btnPlayPause.addEventListener('click', togglePlayPause);
        }

        if (btnNext) {
            btnNext.addEventListener('click', function() {
                const track = playNext();
                if (track && window.Kuikayotl && window.Kuikayotl.playTrack) {
                    window.Kuikayotl.playTrack(track.identifier, track.title, track.artist);
                }
            });
        }

        if (btnPrev) {
            btnPrev.addEventListener('click', function() {
                const track = playPrev();
                if (track && window.Kuikayotl && window.Kuikayotl.playTrack) {
                    window.Kuikayotl.playTrack(track.identifier, track.title, track.artist);
                }
            });
        }

        if (playerProgress) {
            playerProgress.addEventListener('click', function(e) {
                const rect = this.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
                if (audio.duration) {
                    audio.currentTime = percent * audio.duration;
                }
            });
        }

        audio.addEventListener('timeupdate', updateProgress);

        audio.addEventListener('ended', function() {
            if (btnNext) btnNext.click();
        });

        audio.addEventListener('play', function() {
            updatePlayPauseButton(true);
        });

        audio.addEventListener('pause', function() {
            updatePlayPauseButton(false);
        });

        audio.addEventListener('loadedmetadata', function() {
            if (playerTime) {
                playerTime.textContent = '0:00 / ' + formatTime(audio.duration);
            }
        });

        setInterval(updateProgress, 500);
    }

    // ===== EXPORTAR =====
    return {
        playTrack,
        togglePlayPause,
        playNext,
        playPrev,
        getPlaylist,
        getCurrentIndex,
        init,
        audio: audio
    };

})();
