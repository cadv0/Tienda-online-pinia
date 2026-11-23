import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { calcularTotales } from "../utils/formato.js";

export const useCarritoStore = defineStore("carrito", () => {
  // ───── state ─────
  const items = ref([]);

  // ───── getters ─────
  const cantidadItems = computed(() => items.value.reduce((suma, item) => suma + item.cantidad, 0));
  const vacio = computed(() => items.value.length === 0);
  const totales = computed(() => calcularTotales(items.value));

  // ───── actions ─────
  function agregar(producto) {
    const existe = items.value.some((item) => item.producto.id === producto.id);
    items.value = existe
      ? items.value.map((item) =>
          item.producto.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
        )
      : [...items.value, { producto, cantidad: 1 }];
  }

  function incrementar(id) {
    items.value = items.value.map((item) =>
      item.producto.id === id ? { ...item, cantidad: item.cantidad + 1 } : item
    );
  }

  function decrementar(id) {
    items.value = items.value.map((item) =>
      item.producto.id === id && item.cantidad > 1 ? { ...item, cantidad: item.cantidad - 1 } : item
    );
  }

  function eliminar(id) {
    items.value = items.value.filter((item) => item.producto.id !== id);
  }

  function vaciar() {
    items.value = [];
  }

  return { items, cantidadItems, vacio, totales, agregar, incrementar, decrementar, eliminar, vaciar };
});
