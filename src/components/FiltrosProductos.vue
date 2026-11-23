<script setup>
import { storeToRefs } from "pinia";
import { useProductosStore } from "../stores/productos.js";

// Los filtros viven en el store: v-model escribe directo en el estado compartido.
const store = useProductosStore();
const { busqueda, categoriaActiva, soloOfertas, precioMin, precioMax, orden, categorias, hayFiltros } = storeToRefs(store);
const limpiarFiltros = store.limpiarFiltros;
</script>

<template>
  <section class="filtros" aria-label="Filtros del catálogo">
    <label class="busqueda">
      <span class="solo-lectores">Buscar productos</span>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="2.6" stroke-linecap="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" />
      </svg>
      <input v-model="busqueda" type="search" placeholder="Busca portátil, audífonos, mouse…" />
    </label>

    <div class="chips" role="group" aria-label="Categorías">
      <button
        v-for="categoria in categorias"
        :key="categoria"
        type="button"
        class="chip"
        :class="{ 'chip--activo': categoria === categoriaActiva }"
        :aria-pressed="categoria === categoriaActiva"
        @click="categoriaActiva = categoria"
      >
        {{ categoria }}
      </button>
    </div>

    <div class="filtros__fila">
      <label class="campo">
        <span>Precio mínimo</span>
        <input v-model.number="precioMin" type="number" min="0" step="50000" inputmode="numeric" placeholder="$ 0" />
      </label>
      <label class="campo">
        <span>Precio máximo</span>
        <input v-model.number="precioMax" type="number" min="0" step="50000" inputmode="numeric" placeholder="Sin límite" />
      </label>
      <label class="campo">
        <span>Ordenar por</span>
        <select v-model="orden">
          <option value="relevancia">Relevancia</option>
          <option value="precio-asc">Menor precio</option>
          <option value="precio-desc">Mayor precio</option>
          <option value="descuento">Mayor descuento</option>
        </select>
      </label>
      <label class="interruptor">
        <input v-model="soloOfertas" type="checkbox" />
        <span class="interruptor__caja" aria-hidden="true"></span>
        Solo ofertas
      </label>
      <button v-if="hayFiltros" class="btn btn--claro filtros__limpiar" type="button" @click="limpiarFiltros">
        Limpiar filtros
      </button>
    </div>
  </section>
</template>

<style scoped>
.filtros {
  background: var(--blanco); border: var(--borde); border-radius: var(--radio);
  box-shadow: var(--sombra); padding: 1.1rem; margin: 0 6px 2rem 0;
  display: grid; gap: 1rem;
}
.busqueda {
  display: flex; align-items: center; gap: 0.6rem;
  border: var(--borde); border-radius: 14px; padding: 0 0.9rem; background: var(--fondo);
  transition: box-shadow 0.15s, transform 0.15s;
}
.busqueda:focus-within { box-shadow: var(--sombra-s); transform: translate(-2px, -2px); background: #fff; }
.busqueda input {
  flex: 1; min-width: 0; border: 0; background: transparent; padding: 0.75rem 0;
  font: inherit; font-weight: 600; color: var(--tinta); outline: none;
}
.busqueda input::placeholder { color: var(--tinta-suave); font-weight: 400; }

.chips { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.chip {
  border: 2.5px solid var(--tinta); border-radius: 999px; background: var(--blanco);
  padding: 0.25rem 0.9rem; font-weight: 700; color: var(--tinta);
  transition: transform 0.12s, box-shadow 0.12s, background 0.12s;
}
.chip:hover { transform: translateY(-2px); box-shadow: 0 3px 0 var(--tinta); }
.chip--activo { background: var(--sol); box-shadow: 3px 3px 0 var(--tinta); animation: pulso-chip 0.3s; }
@keyframes pulso-chip { 50% { transform: scale(1.08); } }

.filtros__fila { display: flex; flex-wrap: wrap; gap: 0.9rem 1.1rem; align-items: flex-end; }
.campo { display: grid; gap: 0.2rem; font-size: 0.8rem; font-weight: 700; color: var(--tinta-suave); }
.campo input, .campo select {
  font: inherit; font-weight: 600; color: var(--tinta); background: var(--fondo);
  border: 2.5px solid var(--tinta); border-radius: 10px; padding: 0.45rem 0.65rem; width: 150px;
}
.campo input:focus-visible, .campo select:focus-visible { background: #fff; }

.interruptor { display: flex; align-items: center; gap: 0.55rem; font-weight: 700; cursor: pointer; padding-bottom: 0.4rem; }
.interruptor input { position: absolute; opacity: 0; width: 1px; height: 1px; }
.interruptor__caja {
  width: 44px; height: 26px; border: 2.5px solid var(--tinta); border-radius: 999px; background: var(--blanco);
  position: relative; transition: background 0.2s;
}
.interruptor__caja::after {
  content: ""; position: absolute; top: 2px; left: 2px; width: 17px; height: 17px;
  border: 2.5px solid var(--tinta); border-radius: 50%; background: var(--sol);
  transition: transform 0.25s cubic-bezier(0.3, 1.6, 0.5, 1);
}
.interruptor input:checked + .interruptor__caja { background: var(--menta); }
.interruptor input:checked + .interruptor__caja::after { transform: translateX(18px); background: var(--blanco); }
.interruptor input:focus-visible + .interruptor__caja { outline: 4px solid var(--violeta); outline-offset: 3px; }

.filtros__limpiar { padding: 0.4rem 0.9rem; font-size: 0.9rem; animation: entra-limpiar 0.3s cubic-bezier(0.3, 1.6, 0.5, 1); }
@keyframes entra-limpiar { from { opacity: 0; transform: scale(0.7); } }

@media (max-width: 560px) { .campo input, .campo select { width: 100%; } .campo { flex: 1 1 140px; } }
</style>
