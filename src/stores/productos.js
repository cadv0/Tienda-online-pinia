import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { calcularValorConDescuento } from "../utils/formato.js";

const img = (nombre) => `${import.meta.env.BASE_URL}img/${nombre}.jpg`;

// Store del catálogo: guarda los productos y el estado de los filtros.
export const useProductosStore = defineStore("productos", () => {
  // ───── state ─────
  const productos = ref([
    { id: 1, imagen: img("portatil"), descripcion: 'Portátil 14" Ryzen 5, 16 GB RAM', valor: 2899000, descuento: 15, categoria: "Computadores" },
    { id: 2, imagen: img("smartphone"), descripcion: "Smartphone 128 GB, cámara 50 MP", valor: 1150000, descuento: 10, categoria: "Celulares" },
    { id: 3, imagen: img("audifonos"), descripcion: "Audífonos inalámbricos con cancelación de ruido", valor: 420000, descuento: 25, categoria: "Audio" },
    { id: 4, imagen: img("reloj"), descripcion: "Reloj inteligente deportivo con GPS", valor: 560000, descuento: 0, categoria: "Wearables" },
    { id: 5, imagen: img("mouse"), descripcion: "Mouse ergonómico inalámbrico", valor: 95000, descuento: 20, categoria: "Accesorios" },
    { id: 6, imagen: img("tablet"), descripcion: 'Tablet 10" 64 GB con lápiz', valor: 980000, descuento: 5, categoria: "Computadores" },
    { id: 7, imagen: img("teclado"), descripcion: "Teclado mecánico inalámbrico, switches rojos", valor: 245000, descuento: 30, categoria: "Accesorios" },
    { id: 8, imagen: img("parlante"), descripcion: "Parlante Bluetooth resistente al agua", valor: 189000, descuento: 0, categoria: "Audio" },
  ]);

  const busqueda = ref("");
  const categoriaActiva = ref("Todas");
  const soloOfertas = ref(false);
  const precioMin = ref("");
  const precioMax = ref("");
  const orden = ref("relevancia");

  // ───── getters ─────
  const categorias = computed(() => ["Todas", ...new Set(productos.value.map((p) => p.categoria))]);
  const mayorDescuento = computed(() => Math.max(0, ...productos.value.map((p) => p.descuento)));
  const destacados = computed(() => productos.value.slice(0, 3));

  // Quita tildes y mayúsculas para que "audifonos" encuentre "Audífonos".
  const normalizar = (texto) => texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const hayValor = (v) => v !== "" && v !== null && v !== undefined;

  const productosFiltrados = computed(() => {
    const texto = normalizar(busqueda.value.trim());
    const lista = productos.value.filter((p) => {
      const final = calcularValorConDescuento(p); // se compara con lo que realmente paga el cliente
      return (
        (!texto || normalizar(`${p.descripcion} ${p.categoria}`).includes(texto)) &&
        (categoriaActiva.value === "Todas" || p.categoria === categoriaActiva.value) &&
        (!soloOfertas.value || p.descuento > 0) &&
        (!hayValor(precioMin.value) || final >= precioMin.value) &&
        (!hayValor(precioMax.value) || final <= precioMax.value)
      );
    });
    const ordenar = {
      "precio-asc": (a, b) => calcularValorConDescuento(a) - calcularValorConDescuento(b),
      "precio-desc": (a, b) => calcularValorConDescuento(b) - calcularValorConDescuento(a),
      descuento: (a, b) => b.descuento - a.descuento,
    }[orden.value];
    return ordenar ? [...lista].sort(ordenar) : lista;
  });

  const hayFiltros = computed(
    () =>
      busqueda.value !== "" ||
      categoriaActiva.value !== "Todas" ||
      soloOfertas.value ||
      hayValor(precioMin.value) ||
      hayValor(precioMax.value) ||
      orden.value !== "relevancia"
  );

  // ───── actions ─────
  function limpiarFiltros() {
    busqueda.value = "";
    categoriaActiva.value = "Todas";
    soloOfertas.value = false;
    precioMin.value = "";
    precioMax.value = "";
    orden.value = "relevancia";
  }

  return {
    productos, busqueda, categoriaActiva, soloOfertas, precioMin, precioMax, orden,
    categorias, mayorDescuento, destacados, productosFiltrados, hayFiltros,
    limpiarFiltros,
  };
});
