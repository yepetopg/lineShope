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

    if (slides.length > 0) slides[0].classList.add("active");

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

    if (slides.length > 0) startAutoPlay();

    /* ================= CARRITO ================= */

    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    const badge = document.getElementById("carritoBadge");
    const modalCarrito = document.getElementById("modalCarrito");
    const listaCarrito = document.getElementById("listaCarrito");
    const btnCarrito = document.getElementById("btnCarrito");
    const cerrarCarrito = document.getElementById("cerrarCarrito");

    function formatoPrecio(numero) {
        return "$" + Number(numero).toLocaleString("es-CO");
    }

    function actualizarBadge() {
        const total = carrito.reduce((acc, p) => acc + p.cantidad, 0);
        badge.style.display = total > 0 ? "block" : "none";
    }

    function guardarYActualizar() {
        localStorage.setItem("carrito", JSON.stringify(carrito));
        actualizarBadge();
        mostrarCarrito();
    }

    function mostrarCarrito() {
        listaCarrito.innerHTML = "";

        if (carrito.length === 0) {
            listaCarrito.innerHTML = "<p>Tu carrito está vacío</p>";
            return;
        }

        let total = 0;

        carrito.forEach((p, index) => {
            const precioNumero = parseInt(p.precio.replace(/\D/g, ""));
            const subtotal = precioNumero * p.cantidad;
            total += subtotal;

            const item = document.createElement("div");
            item.classList.add("item-carrito");

            item.innerHTML = `
                <div class="item-info">
                    <span class="item-nombre">${p.nombre}</span>
                    <span class="item-precio">${formatoPrecio(precioNumero)} x ${p.cantidad}</span>
                </div>

                <div class="item-controles">
                    <div class="item-cantidad">
                        <button class="menos">−</button>
                        <span>${p.cantidad}</span>
                        <button class="mas">+</button>
                    </div>
                    <button class="btn-eliminar">✕</button>
                </div>
            `;

            item.querySelector(".menos").onclick = () => {
                if (p.cantidad > 1) {
                    p.cantidad--;
                } else {
                    carrito.splice(index, 1);
                }
                guardarYActualizar();
            };

            item.querySelector(".mas").onclick = () => {
                p.cantidad++;
                guardarYActualizar();
            };

            item.querySelector(".btn-eliminar").onclick = () => {
                carrito.splice(index, 1);
                guardarYActualizar();
            };

            listaCarrito.appendChild(item);
        });

        const totalDiv = document.createElement("div");
        totalDiv.className = "total-carrito";
        totalDiv.textContent = `Total: ${formatoPrecio(total)}`;

        listaCarrito.appendChild(totalDiv);
    }

    btnCarrito?.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        modalCarrito.style.display = "flex";
        modalCarrito.classList.add("show");
        mostrarCarrito();
    });

    cerrarCarrito?.addEventListener("click", () => {
        modalCarrito.style.display = "none";
    });

    /* ================= PRODUCTOS ================= */

    function activarProducto(producto) {
        const menos = producto.querySelector(".menos");
        const mas = producto.querySelector(".mas");
        const cantidadSpan = producto.querySelector(".cantidad");
        const stockTexto = producto.querySelector(".productos-unidades");
        const botonCarrito = producto.querySelector(".productos-carrito");
        const textoBoton = producto.querySelector(".texto-boton");

        let cantidad = 1;
        let stock = parseInt(stockTexto.dataset.stock);

        mas.onclick = () => {
            if (cantidad < stock) {
                cantidad++;
                cantidadSpan.textContent = cantidad;
            }
        };

        menos.onclick = () => {
            if (cantidad > 1) {
                cantidad--;
                cantidadSpan.textContent = cantidad;
            }
        };

        botonCarrito.onclick = () => {
            if (botonCarrito.classList.contains("agregado")) return;

            stock -= cantidad;
            stockTexto.dataset.stock = stock;

            if (stock > 0) {
                stockTexto.textContent = `${stock} unidades disponibles`;
            } else {
                stockTexto.textContent = "Agotado";
                botonCarrito.disabled = true;
            }

            botonCarrito.classList.add("animando", "agregado");

            setTimeout(() => {
                botonCarrito.classList.remove("animando");
                textoBoton.textContent = "Agregado";
            }, 2000);

            const nombre = producto.querySelector(".productos-descripcion").innerText;
            const precio = producto.querySelector(".productos-precio").innerText;

            const existente = carrito.find(p => p.nombre === nombre);

            if (existente) {
                existente.cantidad += cantidad;
            } else {
                carrito.push({ nombre, precio, cantidad });
            }

            guardarYActualizar();

            cantidad = 1;
            cantidadSpan.textContent = cantidad;
        };
    }

    document.querySelectorAll(".producto").forEach(activarProducto);

    /* ================= CREAR PRODUCTO ================= */

    const btnCrear = document.getElementById("crearProducto");
    const contenedorProductos = document.querySelector(".productos-contenedor");

    btnCrear?.addEventListener("click", () => {
        const imgInput = document.getElementById("imgFile");
        const titulo = document.getElementById("titulo");
        const precio = document.getElementById("precio");
        const stock = document.getElementById("stock");

        if (!imgInput.files[0] || !titulo.value || !precio.value || !stock.value) {
            alert("Completa todos los campos");
            return;
        }

        const imgURL = URL.createObjectURL(imgInput.files[0]);

        const producto = document.createElement("div");
        producto.classList.add("producto");

        producto.innerHTML = `
            <img src="${imgURL}" class="productos-img">
            <div class="productos-div">
                <p class="productos-descripcion">${titulo.value}</p>
                <p class="productos-precio">$${Number(precio.value).toLocaleString("es-CO")} COP</p>
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
    });

    /* ================= FAB ================= */

    document.querySelectorAll(".fab").forEach(fab => {
        const main = fab.querySelector(".fab-main");
        main?.addEventListener("click", () => fab.classList.toggle("open"));
    });

    actualizarBadge();
});
