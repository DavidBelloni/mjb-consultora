/**
 * scripts.js
 * Lógica principal del sitio web.
 * Estructurada en módulos para facilitar mantenimiento y evitar errores.
 */

document.addEventListener("DOMContentLoaded", () => {
  initHeroSlider();
  initScrollAnimations();
  initMobileMenu();
  initContactForm();
  initReviewsSlider(); // Slider de reseñas
});

/* ==========================================================================
1. LÓGICA DEL SLIDER (HERO)
   ========================================================================== */
function initHeroSlider() {
  const slides = document.querySelectorAll(".hero-slide");
  if (slides.length === 0) return;

  let current = 0;
  const intervalTime = 6000;

  function nextSlide() {
    slides[current].classList.remove("active");
    current = (current + 1) % slides.length;
    slides[current].classList.add("active");
  }

  slides[0].classList.add("active");
  setInterval(nextSlide, intervalTime);
}

/* ==========================================================================
2. ANIMACIÓN SCROLL (INTERSECTION OBSERVER)
   ========================================================================== */
function initScrollAnimations() {
  const elementos = document.querySelectorAll(".animacion-scroll");
  if (elementos.length === 0) return;

  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);

  elementos.forEach((el) => observer.observe(el));
}

/* ==========================================================================
3. MENÚ DE NAVEGACIÓN RESPONSIVE
   ========================================================================== */
function initMobileMenu() {
  const menuToggle = document.querySelector(".menu-toggle");
  const navMenu = document.querySelector(".main-nav");
  if (!menuToggle || !navMenu) return;

  menuToggle.addEventListener("click", () => {
    navMenu.classList.toggle("is-open");
    const isExpanded = navMenu.classList.contains("is-open");
    menuToggle.setAttribute("aria-expanded", isExpanded);
  });

  const menuLinks = navMenu.querySelectorAll("a");
  menuLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (navMenu.classList.contains("is-open")) {
        navMenu.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
      }
    });
  });
}

/* ==========================================================================
4. FORMULARIO DE CONTACTO
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const messageElement = document.getElementById("form-message");

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (messageElement) {
      messageElement.textContent = "Enviando mensaje...";
      messageElement.style.color = "var(--color-text-base, #333)";
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        if (messageElement) {
          messageElement.textContent =
            "✅ ¡Mensaje enviado con éxito! Nos pondremos en contacto pronto.";
          messageElement.style.color = "green";
        }
        form.reset();
      } else {
        throw new Error(result.error || "Error desconocido del servidor");
      }
    } catch (error) {
      console.error("Error al enviar:", error);
      if (messageElement) {
        messageElement.textContent =
          "❌ Hubo un problema al enviar. Por favor intenta más tarde.";
        messageElement.style.color = "red";
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}

/* ==========================================================================
5. SLIDER DE RESEÑAS (DINÁMICO CON JSON)
   ========================================================================== */
function initReviewsSlider() {
    const slider = document.querySelector('.reviews-slider');
    const container = document.getElementById('reviews-container');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');

    if (!slider || !container) return;

    let currentIndex = 0;
    let cardWidth = 0;
    let sliderPadding = 0;

    // Cargar reseñas desde JSON
    fetch('assets/data/reseñas.json')
      .then(res => res.json())
      .then(data => {
        data.forEach(r => {
          let stars = '';
          for (let i = 1; i <= 5; i++) {
            stars += `<img src="assets/img/icons/${i <= r.rating ? 'star-f' : 'star-e'}.svg" alt="star">`;
          }

          container.innerHTML += `
            <div class="review-card">
              <div class="review-meta">
                <div class="review-name">${r.name}</div>
                <div class="review-date">${r.date}</div>
              </div>
              <div class="review-stars">${stars}</div>
              <p class="review-text">${r.text}</p>
            </div>
          `;
        });

        // calcular ancho real de tarjeta y padding del slider
        const firstCard = container.querySelector('.review-card');
        if (firstCard) {
          const style = window.getComputedStyle(firstCard);
          const gap = parseInt(style.marginRight) || 24; // gap ≈ 24px
          cardWidth = firstCard.offsetWidth + gap;

          const sliderStyle = window.getComputedStyle(slider);
          sliderPadding = parseInt(sliderStyle.paddingLeft) || 0;
        }
      });

    // función para ir a una tarjeta
    function goToCard(index) {
      const cards = document.querySelectorAll('.review-card');
      if (cards.length === 0 || cardWidth === 0) return;

      currentIndex = index;
      slider.scrollTo({
        left: sliderPadding + currentIndex * cardWidth,
        behavior: 'smooth'
      });
    }

    // auto-scroll
    function autoScroll() {
      const cards = document.querySelectorAll('.review-card');
      if (cards.length === 0) return;

      currentIndex = (currentIndex + 1) % cards.length;
      goToCard(currentIndex);
    }
    setInterval(autoScroll, 4000);

    // botones manuales
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        currentIndex = Math.max(currentIndex - 1, 0);
        goToCard(currentIndex);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const cards = document.querySelectorAll('.review-card');
        currentIndex = Math.min(currentIndex + 1, cards.length - 1);
        goToCard(currentIndex);
      });
    }
}