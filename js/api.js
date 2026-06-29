// ============================================================
// api.js - Módulo para interactuar con la API de Internet Archive
// ============================================================

const API = (function() {
    'use strict';

    // ===== CONFIGURACIÓN =====
    const CONFIG = {
        RESULTS_PER_PAGE: 24,
        MAX_PAGES: 20,
        BASE_URL: 'https://archive.org/advancedsearch.php',
        METADATA_URL: 'https://archive.org/metadata/',
        DOWNLOAD_URL: 'https://archive.org/download/'
    };

    // ============================================================
    // FUNCIÓN PRINCIPAL DE BÚSQUEDA (CORREGIDA)
    // ============================================================

    /**
     * Busca álbumes en Internet Archive
     * @param {string} query - Término de búsqueda (ej: "album mexico")
     * @param {number} page - Número de página (0-indexed)
     * @returns {Promise<Object>} - Datos de la respuesta
     */
    async function searchMusic(query = 'album mexico', page = 0) {
        const rows = CONFIG.RESULTS_PER_PAGE;
        // 👇 AGREGAR sort[]=relevance desc al final de la URL
        const url = `${CONFIG.BASE_URL}?q=${encodeURIComponent(query)} AND mediatype:audio&fl[]=identifier,title,creator,description,date&output=json&rows=${rows}&page=${page}&sort[]=relevance desc`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return {
                docs: data.response.docs || [],
                total: data.response.numFound || 0
            };
        } catch (error) {
            console.error('Error en searchMusic:', error);
            throw error;
        }
    }

    // ============================================================
    // FUNCIONES AUXILIARES
    // ============================================================

    /**
     * Obtiene metadatos completos de un ítem por su identificador
     */
    async function getItemMetadata(identifier) {
        try {
            const response = await fetch(`${CONFIG.METADATA_URL}${identifier}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error en getItemMetadata:', error);
            throw error;
        }
    }

    /**
     * Obtiene la URL de la portada del álbum
     */
    function getImageUrl(identifier) {
        if (!identifier) return null;
        return `${CONFIG.DOWNLOAD_URL}${identifier}/__ia_thumb.jpg`;
    }

    /**
     * Obtiene la URL del primer archivo de audio (MP3, OGG, etc.)
     */
    async function getAudioUrl(identifier) {
        try {
            const data = await getItemMetadata(identifier);
            const files = data.files || [];
            const audioFile = files.find(f =>
                f.name && (f.name.endsWith('.mp3') ||
                           f.name.endsWith('.ogg') ||
                           f.name.endsWith('.wav') ||
                           f.name.endsWith('.m4a'))
            );
            if (audioFile) {
                return `${CONFIG.DOWNLOAD_URL}${identifier}/${audioFile.name}`;
            }
            return null;
        } catch (error) {
            console.error('Error en getAudioUrl:', error);
            return null;
        }
    }

    /**
     * Extrae artistas individuales del campo 'creator'
     */
    function extractArtists(creatorStr) {
        if (!creatorStr || typeof creatorStr !== 'string') return [];

        let clean = creatorStr
            .replace(/\([^)]*\)/g, '')
            .replace(/\[[^\]]*\]/g, '')
            .replace(/\b(various|unknown|anonymous|none)\b/gi, '')
            .trim();

        let parts = clean.split(/[;,]\s*|\s+and\s+/i);

        if (parts.length === 1 && parts[0] === clean) {
            if (clean.length > 0 && clean.length < 30) {
                return [clean];
            }
            return [];
        }

        return parts
            .map(p => p.trim())
            .filter(p => p.length > 0 && p.length < 30)
            .filter(p => !/^(various|unknown|anonymous|none)$/i.test(p));
    }

    /**
     * Formatea una fecha para mostrar
     */
    function formatDate(dateStr) {
        if (!dateStr) return 'Fecha desconocida';
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
        } catch {
            return dateStr;
        }
    }

    // ============================================================
    // EXPORTAR
    // ============================================================

    return {
        searchMusic,
        getItemMetadata,
        getImageUrl,
        getAudioUrl,
        extractArtists,
        formatDate,
        CONFIG
    };

})();
