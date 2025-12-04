/**
 * scripts.js
 * Lógica principal del sitio web.
 * Estructurada en módulos para facilitar mantenimiento y evitar errores.
 */

document.addEventListener('DOMContentLoaded', () => {
    initHeroSlider();
    initScrollAnimations();
    initMobileMenu();
    initContactForm();
});

/* ==========================================================================
1. LÓGICA DEL SLIDER (HERO)
   ========================================================================== */
function initHeroSlider() {
    const slides = document.querySelectorAll('.hero-slide');
    
    // Si no hay slides en esta página, salimos para evitar errores.
    if (slides.length === 0) return;

    let current = 0;
    const intervalTime = 6000;

    function nextSlide() {
        // Quitamos la clase al slide actual
        slides[current].classList.remove('active');
        // Calculamos el siguiente índice (loop infinito)
        current = (current + 1) % slides.length;
        // Activamos el nuevo slide
        slides[current].classList.add('active');
    }

    // Inicializar el primer slide (por seguridad, aunque esté en HTML)
    slides[0].classList.add('active');

    // Iniciar rotación automática
    setInterval(nextSlide, intervalTime);
}

/* ==========================================================================
2. ANIMACIÓN SCROLL (INTERSECTION OBSERVER)
   ========================================================================== */
function initScrollAnimations() {
    const elementos = document.querySelectorAll('.animacion-scroll');

    // Si no hay elementos animados, no instanciamos el observador
    if (elementos.length === 0) return;

    const observerOptions = {
        threshold: 0.1, // Se activa cuando el 10% del elemento es visible
        rootMargin: "0px 0px -50px 0px" // Margen inferior para activar un poco antes
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                obs.unobserve(entry.target); // Dejar de observar tras la animación
            }
        });
    }, observerOptions);

    elementos.forEach(el => observer.observe(el));
}

/* ==========================================================================
3. MENÚ DE NAVEGACIÓN RESPONSIVE
   ========================================================================== */
function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.main-nav');

    if (!menuToggle || !navMenu) return;

    // Abrir / Cerrar menú
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('is-open');
        // Accesibilidad: indicar al navegador si está expandido
        const isExpanded = navMenu.classList.contains('is-open');
        menuToggle.setAttribute('aria-expanded', isExpanded);
    });

    // UX: Cerrar el menú automáticamente al hacer clic en un enlace
    const menuLinks = navMenu.querySelectorAll('a');
    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('is-open')) {
                navMenu.classList.remove('is-open');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    });
}

/* ==========================================================================
4. FORMULARIO DE CONTACTO
   ========================================================================== */
function initContactForm() {
    const form = document.getElementById('contact-form');
    
    // Si no estamos en la página de contacto, no hacemos nada
    if (!form) return;

    const messageElement = document.getElementById('form-message');

    form.addEventListener('submit', async function(event) {
        event.preventDefault();

        // Feedback visual inmediato
        if (messageElement) {
            messageElement.textContent = 'Enviando mensaje...';
            messageElement.style.color = 'var(--color-text-base, #333)';
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = true; // Evitar doble envío

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/api/contact', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok) {
                // Éxito
                if (messageElement) {
                    messageElement.textContent = '✅ ¡Mensaje enviado con éxito! Nos pondremos en contacto pronto.';
                    messageElement.style.color = 'green';
                }
                form.reset();
            } else {
                // Error del servidor
                throw new Error(result.error || 'Error desconocido del servidor');
            }
        } catch (error) {
            // Error de red o catch del throw anterior
            console.error('Error al enviar:', error);
            if (messageElement) {
                messageElement.textContent = '❌ Hubo un problema al enviar. Por favor intenta más tarde.';
                messageElement.style.color = 'red';
            }
        } finally {
            // Reactivar botón siempre, ocurra error o éxito
            if (submitBtn) submitBtn.disabled = false;
        }
    });
}