/**
 * scripts.js
 * Lógica principal del sitio web.
 * Estructurada en módulos para facilitar mantenimiento y evitar errores.
 */

document.addEventListener("DOMContentLoaded", () => {
  initHeroSlider();
  initScrollAnimations();
  initMobileMenu();
  initReviewsSlider(); // Slider de reseñas
  // Ya no llamamos initContactForm porque el flujo lo maneja reCAPTCHA con onSubmit()
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
4. FORMULARIO DE CONTACTO (con reCAPTCHA v2 invisible + honeypot)
========================================================================== */
function onSubmit(token) {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const messageElement = document.getElementById("form-feedback");
  const submitBtn = form.querySelector("button[type='submit']");

  // Estado inicial
  if (messageElement) {
    messageElement.textContent = "Enviando mensaje...";
    messageElement.className = "sending";
  }
  if (submitBtn) submitBtn.disabled = true;

  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  // Adjuntamos el token de reCAPTCHA
  data.token = token;

  fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((response) => response.json().then((result) => ({ response, result })))
    .then(({ response, result }) => {
      if (response.ok) {
        if (messageElement) {
          messageElement.textContent =
            "✅ ¡Mensaje enviado con éxito! Nos pondremos en contacto pronto.";
          messageElement.className = "success";
        }
        form.reset();
      } else {
        throw new Error(result.error || "Error desconocido del servidor");
      }
    })
    .catch((error) => {
      console.error("Error al enviar:", error);
      if (messageElement) {
        messageElement.textContent =
          "❌ Hubo un problema al enviar. Por favor intenta más tarde.";
        messageElement.className = "error";
      }
    })
    .finally(() => {
      if (submitBtn) submitBtn.disabled = false;
    });
}

/* ==========================================================================
5. SLIDER DE RESEÑAS (DINÁMICO CON JSON)
========================================================================== */
function initReviewsSlider() {
  const slider = document.querySelector(".reviews-slider");
  const container = document.getElementById("reviews-container");
  const prevBtn = document.querySelector(".prev");
  const nextBtn = document.querySelector(".next");

  if (!slider || !container) return;

  let currentIndex = 0;
  let cardWidth = 0;
  let autoScrollInterval;

  fetch("assets/data/reseñas.json")
    .then((res) => res.json())
    .then((data) => {
      data.forEach((r) => {
        let stars = "";
        for (let i = 1; i <= 5; i++) {
          stars += `<img src="assets/img/icons/${
            i <= r.rating ? "star-f" : "star-e"
          }.svg" alt="star">`;
        }

        container.insertAdjacentHTML(
          "beforeend",
          `
            <div class="review-card">
              <div class="review-icon">
                <img src="assets/img/icons/google.svg" alt="Google">
              </div>
              <div class="review-meta">
                <div class="review-name">${r.name}</div>
                <div class="review-date">${r.date}</div>
              </div>
              <div class="review-stars">${stars}</div>
              <p class="review-text">${r.text}</p>
            </div>
          `
        );
      });

      const firstCard = container.querySelector(".review-card");
      if (firstCard) {
        cardWidth = firstCard.offsetWidth;
      }

      startAutoScroll();
    });

  function goToCard(index) {
    const cards = document.querySelectorAll(".review-card");
    if (cards.length === 0 || cardWidth === 0) return;

    currentIndex = index;
    slider.scrollTo({
      left: currentIndex * cardWidth,
      behavior: "smooth",
    });
  }

  function autoScroll() {
    const cards = document.querySelectorAll(".review-card");
    if (cards.length === 0) return;

    currentIndex = (currentIndex + 1) % cards.length;
    goToCard(currentIndex);
  }

  function startAutoScroll() {
    autoScrollInterval = setInterval(autoScroll, 10000);
  }

  function stopAutoScroll() {
    clearInterval(autoScrollInterval);
  }

  slider.addEventListener("mouseenter", stopAutoScroll);
  slider.addEventListener("mouseleave", startAutoScroll);

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      currentIndex = Math.max(currentIndex - 1, 0);
      goToCard(currentIndex);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      const cards = document.querySelectorAll(".review-card");
      currentIndex = Math.min(currentIndex + 1, cards.length - 1);
      goToCard(currentIndex);
    });
  }
}
