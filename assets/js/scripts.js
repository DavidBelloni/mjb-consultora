// BLOQUE 1: Lógica del Slider
const slides = document.querySelectorAll('.hero-slide');
let current = 0;

function showSlide(index) {
    slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
    });
}

function nextSlide() {
    current = (current + 1) % slides.length;
    showSlide(current);
}

showSlide(current);
setInterval(nextSlide, 6000); // cambia cada 6 segundos

// ---

// BLOQUE 2: Lógica de la Animación al Hacer Scroll (Intersection Observer)
const elementosAObservar = document.querySelectorAll('.animacion-scroll');

const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Si el elemento es visible, ¡añade la clase que lo activa!
            entry.target.classList.add('is-visible');
            // Dejamos de observar para no ejecutarlo más
            observer.unobserve(entry.target); 
        }
    });
}, {
    threshold: 0.1 
});

elementosAObservar.forEach(elemento => {
    observer.observe(elemento);
});

// BLOQUE 3: Lógica del Menú de Navegación Responsive

document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.main-nav');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('is-open'); // Agrega o quita una clase
        });
    }
});

document.getElementById('contact-form').addEventListener('submit', async function(event) {
    // 1. Prevenir el envío tradicional (para evitar la recarga de la página)
    event.preventDefault(); 

    const form = event.target;
    const formData = new FormData(form);
    
    // Convertir todos los datos del formulario (incluyendo name, email, phone, message) a un objeto JSON
    const data = Object.fromEntries(formData.entries()); 

    const messageElement = document.getElementById('form-message');
    
    // Mostrar mensaje de envío y restablecer el color
    messageElement.textContent = 'Enviando...';
    messageElement.style.color = 'black';

    try {
        // 2. Enviar los datos a la función serverless de Vercel
        // La URL debe coincidir con la ubicación de tu función (api/send-email.js)
        const response = await fetch('/api/send-email', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data), // Envía los datos como JSON
        });

        const result = await response.json();

        // 3. Manejar la respuesta del servidor
        if (response.ok) {
            messageElement.textContent = '✅ ¡Mensaje enviado con éxito! Nos pondremos en contacto pronto.';
            messageElement.style.color = 'green';
            form.reset(); // Limpia el formulario después del éxito
        } else {
            // Manejar errores devueltos por la función de Vercel/Resend
            messageElement.textContent = `❌ Error al enviar: ${result.error || 'Algo salió mal en el servidor.'}`;
            messageElement.style.color = 'red';
        }
    } catch (error) {
        // Manejar errores de conexión de red
        console.error('Error de red:', error);
        messageElement.textContent = '❌ Error de conexión al servidor. Revisa tu red.';
        messageElement.style.color = 'red';
    }
});
