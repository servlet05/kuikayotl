// ============================================================
// SPLASH SCREEN - Kuikayotl
// ============================================================

(function() {
    'use strict';

    // ---- CONFIGURACIÓN ----
    const SPLASH_DURATION = 3000; // milisegundos (3 segundos)
    const FADE_DURATION = 800;    // duración del difuminado

    // ---- CREAR ELEMENTOS ----
    const splash = document.createElement('div');
    splash.id = 'splash-screen';
    splash.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #0b0a0a;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        font-family: 'Inter', 'Segoe UI', sans-serif;
        transition: opacity ${FADE_DURATION}ms ease;
        user-select: none;
    `;

    // ---- CONTENIDO ----
    splash.innerHTML = `
        <div class="splash-content" style="text-align:center;position:relative;">
            <!-- LOGO -->
            <img src="logo.png" alt="Kuikayotl" class="splash-logo"
                 style="width:160px;height:auto;display:block;margin:0 auto 1.5rem auto;filter:drop-shadow(0 0 20px rgba(212,161,62,0.15));" />

            <!-- NOMBRE CON EFECTO GLITCH -->
            <div class="splash-title" style="font-size:2.2rem;font-weight:700;letter-spacing:4px;color:#f5f0eb;position:relative;display:inline-block;text-shadow:0 0 10px rgba(212,161,62,0.3);">
                Kuikayotl
                <span class="glitch" style="position:absolute;top:0;left:0;width:100%;height:100%;color:#d4a13e;mix-blend-mode:screen;clip-path:inset(40% 0 55% 0);transform:translateX(-2px);">Kuikayotl</span>
                <span class="glitch" style="position:absolute;top:0;left:0;width:100%;height:100%;color:#a84a3a;mix-blend-mode:screen;clip-path:inset(60% 0 25% 0);transform:translateX(3px);animation:glitch2 3s infinite;">Kuikayotl</span>
            </div>

            <div style="font-size:0.8rem;color:#8b6b4d;letter-spacing:6px;margin-top:0.2rem;font-weight:300;text-transform:uppercase;">Música Latinoamericana</div>

            <!-- BARRA DE CARGA -->
            <div style="width:200px;height:3px;background:#1e1814;border-radius:4px;margin:2rem auto 0.8rem auto;overflow:hidden;box-shadow:0 0 10px rgba(212,161,62,0.05);">
                <div class="splash-progress" style="width:0%;height:100%;background:linear-gradient(90deg,#d4a13e,#8b6b4d);border-radius:4px;transition:width 0.3s ease;"></div>
            </div>
            <div class="splash-percent" style="font-size:0.6rem;color:#6b5a4a;letter-spacing:2px;font-weight:300;">0%</div>

            <div style="margin-top:1.2rem;font-size:0.45rem;color:#4a3a2a;letter-spacing:3px;text-transform:uppercase;">cargando álbumes...</div>
        </div>
    `;

    // ---- ESTILOS GLOBALES PARA GLITCH ----
    const style = document.createElement('style');
    style.textContent = `
        @keyframes glitch1 {
            0% { clip-path: inset(20% 0 60% 0); transform: translateX(-3px); }
            5% { clip-path: inset(50% 0 30% 0); transform: translateX(3px); }
            10% { clip-path: inset(10% 0 70% 0); transform: translateX(-2px); }
            15% { clip-path: inset(70% 0 10% 0); transform: translateX(2px); }
            20% { clip-path: inset(30% 0 50% 0); transform: translateX(-1px); }
            25% { clip-path: inset(90% 0 5% 0); transform: translateX(1px); }
            30% { clip-path: inset(5% 0 80% 0); transform: translateX(0); }
            100% { clip-path: inset(5% 0 80% 0); transform: translateX(0); }
        }
        @keyframes glitch2 {
            0% { clip-path: inset(60% 0 20% 0); transform: translateX(4px); }
            5% { clip-path: inset(30% 0 50% 0); transform: translateX(-4px); }
            10% { clip-path: inset(80% 0 10% 0); transform: translateX(3px); }
            15% { clip-path: inset(10% 0 60% 0); transform: translateX(-3px); }
            20% { clip-path: inset(50% 0 30% 0); transform: translateX(2px); }
            25% { clip-path: inset(5% 0 85% 0); transform: translateX(-2px); }
            30% { clip-path: inset(85% 0 5% 0); transform: translateX(0); }
            100% { clip-path: inset(85% 0 5% 0); transform: translateX(0); }
        }
        .splash-title .glitch:first-of-type {
            animation: glitch1 2.5s infinite;
        }
        .splash-title .glitch:last-of-type {
            animation: glitch2 3.2s infinite;
        }
        /* Difuminado al ocultar */
        #splash-screen.hidden {
            opacity: 0;
            pointer-events: none;
        }
    `;
    document.head.appendChild(style);

    // ---- AÑADIR AL DOM ----
    document.body.prepend(splash);

    // ---- SIMULAR BARRA DE CARGA ----
    let progress = 0;
    const progressBar = splash.querySelector('.splash-progress');
    const percentText = splash.querySelector('.splash-percent');

    // Función para actualizar la barra
    function updateProgress(value) {
        progress = Math.min(value, 100);
        progressBar.style.width = progress + '%';
        percentText.textContent = Math.round(progress) + '%';
    }

    // Simular carga (0% → 100% en SPLASH_DURATION ms)
    const startTime = Date.now();
    const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const rawProgress = (elapsed / SPLASH_DURATION) * 100;
        // Pequeño efecto de "aceleración" al final
        const eased = rawProgress < 90 ? rawProgress : 90 + (rawProgress - 90) * 0.3;
        updateProgress(Math.min(eased, 100));

        if (rawProgress >= 100) {
            clearInterval(interval);
            // Asegurar 100%
            updateProgress(100);
            // Ocultar splash después de un breve momento
            setTimeout(hideSplash, 400);
        }
    }, 50);

    // ---- FUNCIÓN PARA OCULTAR SPLASH ----
    function hideSplash() {
        splash.classList.add('hidden');
        // Eliminar del DOM después de la transición
        setTimeout(() => {
            if (splash.parentNode) {
                splash.parentNode.removeChild(splash);
            }
        }, FADE_DURATION + 200);
    }

    // ---- FALLO DE SEGURIDAD: Si la página ya está cargada, ocultar splash igual ----
    if (document.readyState === 'complete') {
        // Si el script se ejecuta cuando ya todo está cargado, forzar ocultar
        setTimeout(() => {
            updateProgress(100);
            setTimeout(hideSplash, 400);
        }, 500);
    }

    // ---- TAMBIÉN OCULTAR CUANDO EL DOM ESTÉ LISTO (por si la simulación falla) ----
    document.addEventListener('DOMContentLoaded', () => {
        // Si la barra no llegó a 100%, la forzamos
        if (progress < 100) {
            updateProgress(100);
            setTimeout(hideSplash, 400);
        }
    });

    // ---- SI EL USUARIO HACE CLICK EN LA PANTALLA, OPCIONAL: SALTAR ----
    splash.addEventListener('click', () => {
        // Forzar ocultar si el usuario hace clic (opcional)
        if (progress < 100) updateProgress(100);
        clearInterval(interval);
        setTimeout(hideSplash, 200);
    });

    console.log('🎵 Kuikayotl · Splash screen activada');
})();