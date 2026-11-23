<script setup>
import { watch, onMounted, onBeforeUnmount, nextTick } from "vue";
import AppHeader from "./components/AppHeader.vue";
import FiltrosProductos from "./components/FiltrosProductos.vue";
import ListaProductos from "./components/ListaProductos.vue";
import CarritoCompra from "./components/CarritoCompra.vue";
import FacturaCompra from "./components/FacturaCompra.vue";
import AppFooter from "./components/AppFooter.vue";
import { useProductosStore } from "./stores/productos.js";
import { useFacturaStore } from "./stores/factura.js";

const productosStore = useProductosStore();
const factura = useFacturaStore();

const nombreTienda = "TecnoStore";
const anio = new Date().getFullYear();
const contacto = "contacto@tecnostore.edu.co";

const frases = [
  "Compra en pocos clics",
  "Precios en pesos colombianos",
  "Factura al instante",
  "Descuentos en tecnología",
];
const cinta = [...frases, ...frases];

watch(
  () => factura.mostrar,
  (visible) => {
    if (visible) {
      if (location.hash !== "#factura") location.hash = "factura";
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (location.hash === "#factura") {
      history.replaceState(null, "", location.pathname + location.search); // quita #factura de la dirección
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }
);

async function alCambiarHash() {
  const quiereFactura = location.hash === "#factura";
  if (quiereFactura && !factura.mostrar) {
    factura.abrir();
  } else if (!quiereFactura && factura.mostrar) {
    factura.cerrar();
    await nextTick();
    document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

onMounted(() => window.addEventListener("hashchange", alCambiarHash));
onBeforeUnmount(() => window.removeEventListener("hashchange", alCambiarHash));
</script>

<template>
  <AppHeader :nombre-tienda="nombreTienda" />

  <main class="principal">
    <Transition name="pagina" mode="out-in">
      <div v-if="factura.mostrar" key="factura" class="zona-factura">
        <FacturaCompra />
      </div>

      <div v-else key="tienda">
    <!-- Portada: solo markup y estilos, sin props ni eventos nuevos -->
        <section id="inicio" class="hero" aria-labelledby="titulo-hero">
          <div class="hero__cuerpo">
            <div class="hero__texto">
              <p class="hero__aviso">Ofertas de {{ nombreTienda }} · hasta {{ productosStore.mayorDescuento }} % menos</p>
              <h1 id="titulo-hero">Tecnología con descuento, sin vueltas.</h1>
              <p class="hero__sub">
                Portátiles, audífonos y más. Elige, suma al carrito y recibe tu factura al instante.
              </p>
              <a class="btn btn--claro hero__boton" href="#catalogo">Ver el catálogo</a>
            </div>

            <div class="escena" aria-hidden="true">
              <span class="forma forma--1"></span>
              <span class="forma forma--2"></span>
              <div
                v-for="(producto, i) in productosStore.destacados"
                :key="producto.id"
                class="pegatina"
                :class="[`pegatina--${i + 1}`, `tono-${producto.id % 4}`]"
              >
                <img :src="producto.imagen" alt="" />
              </div>
            </div>
          </div>

          <div class="cinta" aria-hidden="true">
            <div class="cinta__pista">
              <span v-for="(frase, i) in cinta" :key="i">{{ frase }} <b>✦</b></span>
            </div>
          </div>
        </section>

        <div class="disposicion">
          <div id="catalogo" class="columna">
            <FiltrosProductos />
            <ListaProductos />
          </div>

          <div class="disposicion__carrito">
            <CarritoCompra />
          </div>
        </div>
      </div>
    </Transition>
  </main>

  <AppFooter :nombre-tienda="nombreTienda" :anio="anio" :contacto="contacto" />
</template>

<style scoped>
.principal { max-width: 1200px; margin: 0 auto; padding: 2rem 1.25rem 0; }
.zona-factura { margin-top: 3rem; }
.disposicion { display: grid; gap: 2.5rem; grid-template-columns: 1fr; align-items: start; }
.disposicion__carrito { scroll-margin-top: 90px; padding-right: 6px; padding-bottom: 6px; }

@media (min-width: 980px) {
  .disposicion { grid-template-columns: minmax(0, 1fr) 350px; }
  .disposicion__carrito { position: sticky; top: 90px; }
}



.hero {
  background: var(--violeta); color: #fff;
  border: var(--borde); border-radius: 24px; box-shadow: 8px 8px 0 var(--tinta);
  overflow: hidden; margin-bottom: 3rem;
}
.hero__cuerpo {
  display: grid; grid-template-columns: 1.1fr 1fr; gap: 1rem; align-items: center;
  padding: clamp(1.5rem, 4vw, 3rem);
}
.hero__aviso {
  display: inline-block; background: var(--sol); color: var(--tinta);
  border: 2.5px solid var(--tinta); border-radius: 999px;
  padding: 0.15rem 0.9rem; font-weight: 800; font-size: 0.9rem; margin-bottom: 1rem;
  animation: baja 0.6s cubic-bezier(0.2, 0.9, 0.3, 1.3) both;
}
.hero h1 {
  font-size: clamp(2.2rem, 5.2vw, 3.9rem); font-weight: 800;
  line-height: 1.02; letter-spacing: -0.035em; max-width: 14ch;
  animation: baja 0.6s 0.1s cubic-bezier(0.2, 0.9, 0.3, 1.3) both;
}
.hero__sub { margin: 1rem 0 1.5rem; max-width: 42ch; font-size: 1.1rem; color: #ece8ff; animation: baja 0.6s 0.2s both; }
.hero__boton { animation: baja 0.6s 0.3s both; }
@keyframes baja { from { opacity: 0; transform: translateY(-18px); } }


.escena { position: relative; min-height: 320px; }
.pegatina {
  position: absolute; width: 46%; aspect-ratio: 1;
  border: var(--borde); border-radius: 22px; box-shadow: 6px 6px 0 var(--tinta);
  display: grid; place-items: center; padding: 0.6rem;
  animation: flota 4.5s ease-in-out infinite;
}
.pegatina img { width: 100%; border-radius: 12px; }
.pegatina--1 { top: 2%; left: 4%; --giro: -8deg; }
.pegatina--2 { top: 8%; right: 0; --giro: 7deg; animation-delay: -1.5s; }
.pegatina--3 { bottom: 0; left: 28%; --giro: -3deg; animation-delay: -3s; }
@keyframes flota {
  0%, 100% { transform: translateY(0) rotate(var(--giro)); }
  50% { transform: translateY(-14px) rotate(calc(var(--giro) * -0.5)); }
}
.forma { position: absolute; border: var(--borde); border-radius: 50%; }
.forma--1 { width: 90px; height: 90px; background: var(--coral); top: 52%; left: 0; animation: gira 14s linear infinite; border-radius: 30% 70% 60% 40%; }
.forma--2 { width: 60px; height: 60px; background: var(--menta); top: 0; left: 46%; animation: flota 5s ease-in-out infinite; --giro: 0deg; }
@keyframes gira { to { transform: rotate(360deg); } }

/* Cinta con texto que se desplaza */
.cinta { background: var(--tinta); color: var(--sol); border-top: var(--borde); overflow: hidden; }
.cinta__pista { display: flex; width: max-content; animation: desplaza 30s linear infinite; }
.cinta__pista span { padding: 0.55rem 1.4rem; font-weight: 800; white-space: nowrap; }
.cinta__pista b { color: var(--coral); margin-left: 1.4rem; }
@keyframes desplaza { to { transform: translateX(-50%); } }

@media (max-width: 800px) {
  .hero__cuerpo { grid-template-columns: 1fr; }
  .escena { min-height: 260px; }
}

.pagina-enter-active { transition: opacity 0.35s, transform 0.45s cubic-bezier(0.2, 1.2, 0.4, 1); }
.pagina-leave-active { transition: opacity 0.18s, transform 0.18s; }
.pagina-enter-from { opacity: 0; transform: translateY(24px) scale(0.98); }
.pagina-leave-to { opacity: 0; transform: translateY(-10px); }

.columna { min-width: 0; }
</style>
