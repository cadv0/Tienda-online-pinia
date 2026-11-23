import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { calcularTotales } from "../utils/formato.js";
import { useCarritoStore } from "./carrito.js";

// Store de la factura. Usa el store del carrito (un store puede llamar a otro).
export const useFacturaStore = defineStore("factura", () => {
  // ───── state ─────
  const mostrar = ref(false);
  const items = ref([]); // copia del carrito al emitir: la factura no cambia si luego se edita el carrito
  const consecutivo = ref(1);
  const fecha = ref("");

  // ───── getters ─────
  const numero = computed(() => `FAC-${String(consecutivo.value).padStart(4, "0")}`);
  const totales = computed(() => calcularTotales(items.value));

  // ───── actions ─────
  function emitir() {
    const carrito = useCarritoStore();
    if (carrito.vacio) return;
    items.value = carrito.items.map((item) => ({ ...item }));
    fecha.value = new Date().toLocaleDateString("es-CO");
    mostrar.value = true;
  }

  function abrir() {
    if (items.value.length > 0) mostrar.value = true;
  }

  function cerrar() {
    mostrar.value = false;
  }

  function nuevaCompra() {
    useCarritoStore().vaciar();
    items.value = [];
    mostrar.value = false;
    consecutivo.value += 1;
  }

  return { mostrar, items, consecutivo, fecha, numero, totales, emitir, abrir, cerrar, nuevaCompra };
});
