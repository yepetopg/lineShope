document.addEventListener("DOMContentLoaded", () => {

    /* ================= NAV INTELIGENTE ================= */

    let lastScrollTop = 0;
    const nav = document.querySelector(".nav");

    if (nav) {
        window.addEventListener("scroll", () => {
            const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

            if (currentScroll > lastScrollTop && currentScroll > 100) {
                nav.classList.add("hide");
            } else {
                nav.classList.remove("hide");
            }

            lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
        });
    }

    /* ================= CARRUSEL ================= */

    const track = document.querySelector(".carousel-track");
    const slides = document.querySelectorAll(".carousel-track img");
    const dots = document.querySelectorAll(".dot");
    const next = document.querySelector(".arrow.right");
    const prev = document.querySelector(".arrow.left");

    let index = 0;
    let interval;

    if (slides.length > 0) {
        slides[0].classList.add("active");
    }

    function updateCarousel() {
        track.style.transform = `translateX(-${index * 100}%)`;

        slides.forEach(slide => slide.classList.remove("active"));
        slides[index].classList.add("active");

        dots.forEach(dot => dot.classList.remove("active"));
        dots[index].classList.add("active");
    }

    function nextSlide() {
        index = (index + 1) % slides.length;
        updateCarousel();
    }

    function prevSlide() {
        index = (index - 1 + slides.length) % slides.length;
        updateCarousel();
    }

    if (next && prev) {
        next.addEventListener("click", () => {
            nextSlide();
            resetAutoPlay();
        });

        prev.addEventListener("click", () => {
            prevSlide();
            resetAutoPlay();
        });
    }

    dots.forEach((dot, i) => {
        dot.addEventListener("click", () => {
            index = i;
            updateCarousel();
            resetAutoPlay();
        });
    });

    function startAutoPlay() {
        interval = setInterval(nextSlide, 4000);
    }

    function resetAutoPlay() {
        clearInterval(interval);
        startAutoPlay();
    }

    if (slides.length > 0) {
        startAutoPlay();
    }

    /* ================= FUNCIÓN PRODUCTO ================= */

    function activarProducto(producto) {

        const menos = producto.querySelector(".menos");
        const mas = producto.querySelector(".mas");
        const cantidadSpan = producto.querySelector(".cantidad");
        const stockTexto = producto.querySelector(".productos-unidades");
        const botonCarrito = producto.querySelector(".productos-carrito");
        const textoBoton = producto.querySelector(".texto-boton");

        if (!menos || !mas || !cantidadSpan || !stockTexto || !botonCarrito || !textoBoton) return;

        let cantidad = 1;
        let stock = parseInt(stockTexto.dataset.stock);

        mas.addEventListener("click", () => {
            if (cantidad < stock) {
                cantidad++;
                cantidadSpan.textContent = cantidad;
            }
        });

        menos.addEventListener("click", () => {
            if (cantidad > 1) {
                cantidad--;
                cantidadSpan.textContent = cantidad;
            }
        });

        botonCarrito.addEventListener("click", () => {

            if (botonCarrito.classList.contains("agregado")) return;
            if (cantidad > stock) return;

            stock -= cantidad;
            stockTexto.dataset.stock = stock;

            if (stock > 0) {
                stockTexto.textContent = `${stock} unidades disponibles`;
            }

            if (stock <= 5 && stock > 0) {
                stockTexto.classList.add("pocas");
            }

            if (stock === 0) {
                stockTexto.textContent = "Agotado";
                stockTexto.classList.add("agotado");
                botonCarrito.disabled = true;
            }

            botonCarrito.classList.add("animando", "agregado");
            botonCarrito.disabled = true;

            setTimeout(() => {
                botonCarrito.classList.remove("animando");
                textoBoton.textContent = "Agregado";
                textoBoton.style.opacity = "1";
            }, 2200);

            cantidad = 1;
            cantidadSpan.textContent = cantidad;
        });
    }

    /* ================= ACTIVAR PRODUCTOS EXISTENTES ================= */

    document.querySelectorAll(".producto").forEach(producto => {
        activarProducto(producto);
    });

    /* ================= MENSAJE BONITO ================= */

    function mostrarMensaje(texto) {
        const modal = document.getElementById("modal");
        const modalText = document.getElementById("modal-text");
        const cerrar = document.getElementById("cerrarModal");

        modalText.textContent = texto;
        modal.classList.add("show");

        cerrar.onclick = () => {
            modal.classList.remove("show");
        };
    }

    /* ================= CREAR PRODUCTO ================= */

    const contenedorProductos = document.querySelector(".productos-contenedor");
    const btnCrear = document.getElementById("crearProducto");

    if (btnCrear) {
        btnCrear.addEventListener("click", () => {

            const imgInput = document.getElementById("imgFile");
            const titulo = document.getElementById("titulo");
            const precio = document.getElementById("precio");
            const stock = document.getElementById("stock");

            if (!imgInput.files[0] || !titulo.value || !precio.value || !stock.value) {
                mostrarMensaje("Completa todos los campos");
                return;
            }

            const imgURL = URL.createObjectURL(imgInput.files[0]);

            const producto = document.createElement("div");
            producto.classList.add("producto");

            producto.innerHTML = `
                <img src="${imgURL}" class="productos-img">

                <div class="productos-div">
                    <p class="productos-descripcion">${titulo.value}</p>
                    <p class="productos-precio">$${precio.value} COP</p>
                    <p class="productos-unidades" data-stock="${stock.value}">
                        ${stock.value} unidades disponibles
                    </p>

                    <div class="cantidad-control">
                        <button class="menos">−</button>
                        <span class="cantidad">1</span>
                        <button class="mas">+</button>
                    </div>

                    <button class="productos-carrito">
                        <span class="texto-boton">Agregar al carrito</span>
                        <span class="icono-carrito">🛒</span>
                    </button>
                </div>
            `;

            contenedorProductos.appendChild(producto);
            activarProducto(producto);

            imgInput.value = "";
            titulo.value = "";
            precio.value = "";
            stock.value = "";

            mostrarMensaje("Producto creado correctamente ✅");
        });
    }

    /* ================= FAB WHATS + CREAR ================= */


    // FAB WhatsApp / Instagram
    const fabRedes = document.getElementById("fab");
    const fabRedesMain = document.getElementById("fabMain");

    fabRedesMain.addEventListener("click", () => {
        fabRedes.classList.toggle("open");
    });

    // FAB Crear producto
    const fabCrear = document.querySelector(".fab-crear");
    const fabCrearMain = fabCrear.querySelector(".fab-main");

    fabCrearMain.addEventListener("click", () => {
        fabCrear.classList.toggle("open");
    });

});


