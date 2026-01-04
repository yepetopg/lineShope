import { onSnapshot } 
from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-storage.js";
const storage = getStorage();


import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  doc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";


import { db } from "./firebase.js";


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

            item.querySelector(".menos").onclick = async () => {
                if (p.cantidad > 1) {
                    p.cantidad--;
                } else {
                    carrito.splice(index, 1);
                }
                guardarYActualizar();
            };


            item.querySelector(".mas").onclick = () => {
                if (p.cantidad >= p.stockMax) {
                    alert("No hay más stock disponible");
                    return;
                }

                p.cantidad++;
                guardarYActualizar();
            };


            item.querySelector(".btn-eliminar").onclick = async () => {
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
    const stock = parseInt(stockTexto.dataset.stock);

    mas.onclick = () => {
        if (cantidad < stock) cantidad++;
        cantidadSpan.textContent = cantidad;
    };

    menos.onclick = () => {
        if (cantidad > 1) cantidad--;
        cantidadSpan.textContent = cantidad;
    };

    boton.onclick = async () => {
    if (boton.disabled) return;

    const texto = boton.querySelector(".texto-boton");

    // 🔒 Bloqueo inmediato
    boton.disabled = true;

    // ▶️ Animación del carrito
    boton.classList.add("animando");

    // ⏱ Duración EXACTA de la animación CSS
    await new Promise(resolve => setTimeout(resolve, 2800));

    // ⛔ Fin animación
    boton.classList.remove("animando");

    // ✅ Texto feedback
    texto.textContent = "Agregado";

    await new Promise(resolve => setTimeout(resolve, 600));

    // ===============================
    // 🧠 LÓGICA REAL DE TU CARRITO
    // ===============================

    const id = producto.dataset.id;

    const existente = carrito.find(p => p.id === id);

    if (existente) {
        existente.cantidad += cantidad;
    } else {
        carrito.push({
            id: id,
            nombre: producto.querySelector(".productos-descripcion").textContent,
            precio: Number(
                producto
                    .querySelector(".productos-precio")
                    .textContent
                    .replace(/[^\d]/g, "")
            ),
            imagen: producto.querySelector(".productos-img").src,
            cantidad: cantidad,
            stockMax: parseInt(
                producto.querySelector(".productos-unidades").dataset.stock
            )
        });

    }

    guardarYActualizar();

    // 🔔 Badge animado
    const badge = document.getElementById("carritoBadge");
    if (badge) {
        badge.style.display = "block";
        badge.classList.add("pop");
        setTimeout(() => badge.classList.remove("pop"), 300);
    }
};


}


    document.querySelectorAll(".producto").forEach(activarProducto);

   /* ================= CREAR PRODUCTO ================= */

    const btnCrear = document.getElementById("crearProducto");

btnCrear.addEventListener("click", async () => {
  const imgInput = document.getElementById("imgFile");
  const titulo = document.getElementById("titulo");
  const precio = document.getElementById("precio");
  const stock = document.getElementById("stock");
  const categoria = document.getElementById("categoria");

  if (!imgInput.files[0] || !titulo.value || !precio.value || !stock.value) {
    alert("Completa todos los campos");
    return;
  }

  try {
    // 📸 Convertir imagen a Base64
    const file = imgInput.files[0];
    const reader = new FileReader();

    reader.onload = async () => {
      const base64Imagen = reader.result; // 🔥 Esta es la cadena Base64 completa

      // 📦 Guardar producto en Firestore
      await addDoc(collection(db, "productos"), {
        nombre: titulo.value,
        precio: Number(precio.value),
        stock: Number(stock.value),
        categoria: categoria.value,
        imagen: base64Imagen // 🔥 Guardamos directamente la imagen en Base64
      });

      alert("Producto creado correctamente");

      // Limpiar campos
      imgInput.value = "";
      titulo.value = "";
      precio.value = "";
      stock.value = "";

      // Refrescar productos
      iniciarProductosRealtime();
    };

    reader.readAsDataURL(file); // Convierte la imagen a Base64
  } catch (error) {
    console.error(error);
    alert("Error al crear producto");
  }
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

function obtenerNumeroFactura() {
    let numero = localStorage.getItem("numeroFactura");

    if (!numero) {
        numero = 100; // número inicial
    } else {
        numero = parseInt(numero) + 1;
    }

    localStorage.setItem("numeroFactura", numero);
    return numero;
}

document.getElementById("btnFactura").addEventListener("click", async () => {

    if (carrito.length === 0) {
        alert("Tu carrito está vacío");
        return;
    }

    try {
        // 🔥 DESCONTAR STOCK REAL (SOLO AQUÍ)
        for (const item of carrito) {
            const ref = doc(db, "productos", item.id);
            const snap = await getDoc(ref);

            if (!snap.exists()) {
                alert(`El producto ${item.nombre} ya no existe`);
                return;
            }

            const stockActual = snap.data().stock;

            if (item.cantidad > stockActual) {
                alert(`Stock insuficiente para ${item.nombre}`);
                return;
            }

            await updateDoc(ref, {
                stock: stockActual - item.cantidad
            });
        }

        // ✅ AQUÍ YA ES SEGURO GENERAR FACTURA

        const { jsPDF } = window.jspdf;
        const docPDF = new jsPDF();

        const numeroFactura = obtenerNumeroFactura();
        const pageWidth = docPDF.internal.pageSize.width;
        let y = 20;

        /* ===== ENCABEZADO ===== */
        docPDF.setFillColor(30, 30, 30);
        docPDF.rect(0, 0, pageWidth, 38, "F");

        docPDF.setTextColor(255);
        docPDF.setFontSize(18);
        docPDF.text("LINEA STORE", 14, 24);

        docPDF.setFontSize(11);
        docPDF.text(`Factura #${numeroFactura}`, pageWidth - 70, 24);

        /* ===== INFO ===== */
        docPDF.setTextColor(0);
        y = 50;
        docPDF.setFontSize(11);
        docPDF.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, y);

        y += 8;
        docPDF.line(14, y, pageWidth - 14, y);
        y += 10;

        let total = 0;

        carrito.forEach(p => {
            const subtotal = p.precio * p.cantidad;
            total += subtotal;

            docPDF.text(p.nombre, 14, y);
            docPDF.text(String(p.cantidad), 125, y);
            docPDF.text(`$${subtotal.toLocaleString("es-CO")}`, 155, y);
            y += 8;
        });

        y += 6;
        docPDF.line(14, y, pageWidth - 14, y);
        y += 10;

        docPDF.setFontSize(14);
        docPDF.text("TOTAL:", 120, y);
        docPDF.text(`$${total.toLocaleString("es-CO")}`, 155, y);

        docPDF.save(`Factura_Linea_Store_${numeroFactura}.pdf`);

        // 🧹 LIMPIAR CARRITO
        carrito = [];
        localStorage.removeItem("carrito");
        actualizarBadge();
        mostrarCarrito();

        // 🔄 REFRESCAR PRODUCTOS (esto dispara onSnapshot)
        iniciarProductosRealtime();

        // 📲 WhatsApp
        const mensaje = encodeURIComponent(
            "Hola 👋 Te envío la factura de mi compra. Gracias por el excelente servicio"
        );
        window.open(`https://wa.me/573137878407?text=${mensaje}`, "_blank");

    } catch (error) {
        console.error("Error al procesar la compra:", error);
        alert("Ocurrió un error al procesar la compra");
    }
});

const iconoBusqueda = document.getElementById("iconoBusqueda");
const overlay = document.getElementById("buscadorOverlay");
const cerrar = document.getElementById("cerrarBuscador");

iconoBusqueda.addEventListener("click", () => {
    overlay.style.display = "flex";
    document.getElementById("buscador").focus();
});

cerrar.addEventListener("click", () => {
    overlay.style.display = "none";
});

const buscador = document.getElementById("buscador");

buscador.addEventListener("input", function () {
    const texto = this.value.toLowerCase().trim();
    const productos = document.querySelectorAll(".producto");

    productos.forEach(producto => {
        const nombre = producto
            .querySelector(".productos-descripcion")
            .textContent
            .toLowerCase();

        if (nombre.includes(texto)) {
            producto.style.display = "flex";
        } else {
            producto.style.display = "none";
        }
    });
});

async function cargarProductosDesdeFirebase() {
  const productosRef = collection(db, "productos");
  const snapshot = await getDocs(productosRef);

  const productos = [];

  snapshot.forEach(doc => {
    productos.push({
      id: doc.id,
      ...doc.data()
    });
  });

  console.log("Productos desde Firebase:", productos);
  return productos;
}

    function iniciarProductosRealtime() {
    const productosRef = collection(db, "productos");

    onSnapshot(productosRef, (snapshot) => {
        const contenedor = document.querySelector(".productos-contenedor");
        contenedor.innerHTML = "";

        snapshot.forEach(docu => {
        crearProductoHTML({
            id: docu.id,
            ...docu.data()
        });
        });
    });
    }


iniciarProductosRealtime();


function crearProductoHTML(producto) {
    const contenedorProductos = document.querySelector(".productos-contenedor");

    const div = document.createElement("div");
    div.classList.add("producto");
    div.dataset.categoria = producto.categoria;
    div.dataset.id = producto.id; // 🔥 ESTE ES CLAVE

    div.innerHTML = `
        <img src="${producto.imagen}" class="productos-img">

        <div class="productos-div">
            <p class="productos-descripcion">${producto.nombre}</p>
            <p class="productos-precio">$${producto.precio.toLocaleString("es-CO")}</p>

            <p class="productos-unidades" data-stock="${producto.stock}">
                ${producto.stock > 0 ? producto.stock + " unidades disponibles" : "Agotado"}
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

            <button class="btn-eliminar-sutil" title="Eliminar producto">✕</button>
        </div>
    `;

    contenedorProductos.appendChild(div);
    activarProducto(div);

    // Acción del botón eliminar
    const btnEliminar = div.querySelector(".btn-eliminar-sutil");
    btnEliminar.addEventListener("click", async () => {
        if (confirm("¿Seguro que quieres eliminar este producto?")) {
            try {
                // Eliminar del DOM
                div.remove();
                // Eliminar de Firebase
                const docRef = doc(db, "productos", producto.id);
                await deleteDoc(docRef);
                alert("Producto eliminado correctamente");
            } catch (error) {
                console.error(error);
                alert("Error al eliminar producto");
            }
        }
    });
}

    actualizarBadge();
});
