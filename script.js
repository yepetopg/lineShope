document.addEventListener("DOMContentLoaded", () => {

    /* ================= NAV ================= */

    let lastScrollTop = 0;
    const nav = document.querySelector(".nav");

    if (nav) {
        window.addEventListener("scroll", () => {
            const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
            nav.classList.toggle("hide", currentScroll > lastScrollTop && currentScroll > 100);
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

    next?.addEventListener("click", () => { nextSlide(); resetAutoPlay(); });
    prev?.addEventListener("click", () => { prevSlide(); resetAutoPlay(); });

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

    function formatoPrecio(num) {
        return "$" + Number(num).toLocaleString("es-CO");
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
            const subtotal = p.precio * p.cantidad;
            total += subtotal;

            const item = document.createElement("div");
            item.className = "item-carrito";

            item.innerHTML = `
                <img src="${p.imagen}" class="item-img">

                <div class="item-info">
                    <strong>${p.nombre}</strong>
                    <span>${formatoPrecio(p.precio)}</span>
                </div>

                <div class="item-controles">
                    <button class="menos">−</button>
                    <span class="cantidad">${p.cantidad}</span>
                    <button class="mas">+</button>
                    <button class="btn-eliminar">✕</button>
                </div>
            `;

            item.querySelector(".menos").onclick = () => {
                if (p.cantidad > 1) p.cantidad--;
                else carrito.splice(index, 1);
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

        document.querySelectorAll(".total-carrito").forEach(t => t.remove());

        const totalDiv = document.createElement("div");
        totalDiv.className = "total-carrito";
        totalDiv.innerHTML = `<strong>Total: ${formatoPrecio(total)}</strong>`;
        listaCarrito.appendChild(totalDiv);
    }

    btnCarrito?.addEventListener("click", e => {
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
        const boton = producto.querySelector(".productos-carrito");

        let cantidad = 1;
        let stock = parseInt(stockTexto.dataset.stock);

        mas.onclick = () => {
            if (cantidad < stock) cantidad++;
            cantidadSpan.textContent = cantidad;
        };

        menos.onclick = () => {
            if (cantidad > 1) cantidad--;
            cantidadSpan.textContent = cantidad;
        };

        boton.onclick = () => {
            if (boton.classList.contains("agregado")) return;

            stock -= cantidad;
            stockTexto.dataset.stock = stock;
            stockTexto.textContent = stock > 0 ? `${stock} unidades disponibles` : "Agotado";

            boton.classList.add("animando", "agregado");
            setTimeout(() => boton.classList.remove("animando"), 1000);
            boton.querySelector(".texto-boton").textContent = "Agregado"; // ← cambia el texto
            boton.disabled = true; // ← deshabilita

            const nombre = producto.querySelector(".productos-descripcion").innerText;
            const precio = Number(producto.querySelector(".productos-precio").innerText.replace(/\D/g, ""));
            const imagen = producto.querySelector(".productos-img").src;

            const existente = carrito.find(p => p.nombre === nombre);
            if (existente) existente.cantidad += cantidad;
            else carrito.push({ nombre, precio, cantidad, imagen });

            guardarYActualizar();
            cantidad = 1;
            cantidadSpan.textContent = cantidad;
        };
    }

    document.querySelectorAll(".producto").forEach(activarProducto);

    /* ================= CREAR PRODUCTO ================= */

    const btnCrear = document.getElementById("crearProducto");
    const contenedorProductos = document.querySelector(".productos-contenedor");
    const selectCategoria = document.getElementById("categoria");

    btnCrear?.addEventListener("click", () => {
        const imgInput = document.getElementById("imgFile");
        const titulo = document.getElementById("titulo");
        const precio = document.getElementById("precio");
        const stock = document.getElementById("stock");

        if (!imgInput.files[0] || !titulo.value || !precio.value || !stock.value) return;

        const imgURL = URL.createObjectURL(imgInput.files[0]);

        const categoria = document.getElementById("categoria").value;

        const producto = document.createElement("div");
        producto.classList.add("producto");
        producto.dataset.categoria = categoria;

        producto.innerHTML = `
            <img src="${imgURL}" class="productos-img">
            <div class="productos-div">
                <p class="productos-descripcion">${titulo.value}</p>
                <p class="productos-precio">$${Number(precio.value).toLocaleString("es-CO")}</p>
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
        fab.querySelector(".fab-main")?.addEventListener("click", () => {
            fab.classList.toggle("open");
        });
    });

    /* ================= FILTRO POR CATEGORÍA ================= */

    const categorias = document.querySelectorAll(".categoria-card");
    const productos = document.querySelectorAll(".producto");

    categorias.forEach(cat => {
    cat.addEventListener("click", () => {
        const categoria = cat.dataset.categoria;
        const productosActuales = document.querySelectorAll(".producto"); // ← dinámico

        productosActuales.forEach(producto => {
            const categoriaProducto = producto.dataset.categoria;

            if (categoria === "todos" || categoria === categoriaProducto) {
                producto.style.display = "flex";
            } else {
                producto.style.display = "none";
            }
        });

        // Marca la categoría como activa
        categorias.forEach(c => c.classList.remove("activa"));
        cat.classList.add("activa");
    });
});


    
/* ================= CARRUSEL CATEGORÍAS ================= */

const categoriasTrack = document.querySelector(".categorias-track");
const categoriaSlides = document.querySelectorAll(".categoria-card");
const categoriaDots = document.querySelectorAll(".dot");
const categoriaNext = document.querySelector(".arrow.right");
const categoriaPrev = document.querySelector(".arrow.left");

let categoriaIndex = 0;
let categoriaInterval;

// ancho real de cada card
function getCategoriaWidth() {
    return categoriaSlides[0]?.offsetWidth + 15;
}

function updateCategoriaCarousel() {
    const moveX = categoriaIndex * getCategoriaWidth();
    categoriasTrack.style.transform = `translateX(-${moveX}px)`;

    categoriaDots.forEach(dot => dot.classList.remove("active"));
    if (categoriaDots[categoriaIndex]) {
        categoriaDots[categoriaIndex].classList.add("active");
    }
}

function nextCategoria() {
    if (categoriaIndex < categoriaSlides.length - 1) {
        categoriaIndex++;
    } else {
        categoriaIndex = 0;
    }
    updateCategoriaCarousel();
}

function prevCategoria() {
    if (categoriaIndex > 0) {
        categoriaIndex--;
    } else {
        categoriaIndex = categoriaSlides.length - 1;
    }
    updateCategoriaCarousel();
}

// Flechas
categoriaNext?.addEventListener("click", () => {
    nextCategoria();
    resetCategoriaAuto();
});

categoriaPrev?.addEventListener("click", () => {
    prevCategoria();
    resetCategoriaAuto();
});

// Dots
categoriaDots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
        categoriaIndex = i;
        updateCategoriaCarousel();
        resetCategoriaAuto();
    });
});

// Auto slide
function startCategoriaAuto() {
    categoriaInterval = setInterval(nextCategoria, 4000);
}

function resetCategoriaAuto() {
    clearInterval(categoriaInterval);
    startCategoriaAuto();
}

if (categoriaSlides.length > 0) {
    updateCategoriaCarousel();
    startCategoriaAuto();
}
/* ================= FILTRO POR CATEGORÍA ================= */

categorias.forEach(cat => {
    cat.addEventListener("click", () => {
        const categoria = cat.dataset.categoria;

        productos.forEach(producto => {
            const categoriaProducto = producto.dataset.categoria;

            if (categoria === "todos" || categoria === categoriaProducto) {
                producto.style.display = "flex";
            } else {
                producto.style.display = "none";
            }
        });
    });
});

document.getElementById("btnFactura").addEventListener("click", () => {

    if (carrito.length === 0) {
        alert("Tu carrito está vacío");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.width;
    let y = 20;

    // 🎨 ENCABEZADO
    doc.setFillColor(255, 152, 0); // naranja
    doc.rect(0, 0, pageWidth, 35, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text("LINEA STORE", 14, 22);

    doc.setFontSize(11);
    doc.text("Factura de compra", pageWidth - 70, 22);

    // RESET COLOR
    doc.setTextColor(0, 0, 0);

    y = 45;

    // INFO GENERAL
    doc.setFontSize(11);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, y);

    y += 10;

    // LINEA SEPARADORA
    doc.setDrawColor(200);
    doc.line(14, y, pageWidth - 14, y);

    y += 10;

    // ENCABEZADOS TABLA
    doc.setFontSize(11);
    doc.text("Producto", 14, y);
    doc.text("Cant.", 120, y);
    doc.text("Total", 160, y);

    y += 6;
    doc.line(14, y, pageWidth - 14, y);
    y += 6;

    let total = 0;

    carrito.forEach(producto => {
        const subtotal = producto.precio * producto.cantidad;
        total += subtotal;

        doc.text(producto.nombre, 14, y);
        doc.text(String(producto.cantidad), 125, y);
        doc.text(`$${subtotal.toLocaleString("es-CO")}`, 160, y);

        y += 8;
    });

    y += 8;
    doc.line(14, y, pageWidth - 14, y);
    y += 10;

    // TOTAL
    doc.setFontSize(14);
    doc.text("TOTAL:", 120, y);
    doc.text(`$${total.toLocaleString("es-CO")}`, 160, y);

    // PIE DE PÁGINA
    y += 20;
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text("Gracias por tu compra 💛", pageWidth / 2, y, { align: "center" });
    doc.text("Linea Store", pageWidth / 2, y + 6, { align: "center" });

    // GUARDAR
    doc.save("factura-linea-store.pdf");

    // WHATSAPP
    const mensaje = encodeURIComponent(
        "Hola 👋 Te envío la factura de mi compra."
    );

    window.open(`https://wa.me/573137878407?text=${mensaje}`, "_blank");
});


    actualizarBadge();
});
