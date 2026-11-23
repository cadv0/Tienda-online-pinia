# TecnoStore · Tienda virtual con Vue 3 y Pinia (tercer corte)

Es la misma tienda del segundo corte (catálogo, filtros, carrito y factura), pero ahora el **estado compartido
vive en stores de Pinia** en lugar de pasarse con props y emits desde `App.vue`.

## Cómo ejecutarlo

```bash
npm install
npm run dev       # desarrollo en http://localhost:5173
npm run build     # genera dist/ para desplegar
```

Requisitos: Node.js LTS. Herramientas: Vite, Vue 3 (Composition API con `<script setup>`) y **Pinia** (setup stores).
Sin vue-router, sin Nuxt y sin otras librerías.

## ¿Qué cambió respecto al segundo corte?

```
ANTES                                   AHORA
App.vue (estado + lógica)               stores/productos.js ─┐
  ├─ props ↓  / emits ↑                 stores/carrito.js  ──┼─► cualquier componente
  └─ hijos                              stores/factura.js  ──┘   lee y modifica el estado
```

## Estructura

```
src/
├── App.vue                    ← arma la página (portada, catálogo, carrito, factura)
├── main.js                    ← crea la app y registra Pinia: app.use(createPinia())
├── style.css
├── utils/formato.js           ← funciones puras: moneda COP, descuento, totales, IVA
├── stores/
│   ├── productos.js           ← catálogo + filtros
│   ├── carrito.js             ← items del carrito y sus acciones
│   └── factura.js             ← factura emitida, consecutivo, fecha
└── components/
    ├── AppHeader.vue
    ├── FiltrosProductos.vue   ← (nuevo) panel de filtros, antes estaba dentro de App.vue
    ├── ListaProductos.vue
    ├── ProductoCard.vue
    ├── CarritoCompra.vue
    ├── FacturaCompra.vue
    └── AppFooter.vue
public/img/                   ← imágenes de los productos
```

## Los stores

Se usan **setup stores** (`defineStore("id", () => { ... })`), que se escriben igual que `<script setup>`:
`ref` = *state*, `computed` = *getters*, funciones = *actions*.

### `useProductosStore` (stores/productos.js)
| Tipo | Nombre | Para qué sirve |
|---|---|---|
| state | `productos` | Los 8 productos (6 con descuento) |
| state | `busqueda`, `categoriaActiva`, `soloOfertas`, `precioMin`, `precioMax`, `orden` | Estado de los filtros |
| getter | `productosFiltrados` | Lista que se ve en el catálogo según los filtros |
| getter | `categorias`, `mayorDescuento`, `destacados`, `hayFiltros` | Datos derivados |
| action | `limpiarFiltros()` | Reinicia los filtros |

### `useCarritoStore` (stores/carrito.js)
| Tipo | Nombre | Para qué sirve |
|---|---|---|
| state | `items` | `[{ producto, cantidad }]` |
| getter | `cantidadItems` | Unidades totales (insignia del encabezado) |
| getter | `vacio` | Deshabilita "Finalizar compra" y muestra el mensaje de carrito vacío |
| getter | `totales` | Subtotal sin descuento, descuentos, subtotal, IVA 19 % y total |
| action | `agregar(producto)` | Agrega, o suma cantidad si ya estaba (no duplica) |
| action | `incrementar(id)`, `decrementar(id)`, `eliminar(id)`, `vaciar()` | Cambios del carrito (la cantidad no baja de 1) |

### `useFacturaStore` (stores/factura.js)
| Tipo | Nombre | Para qué sirve |
|---|---|---|
| state | `mostrar`, `items`, `consecutivo`, `fecha` | La factura emitida (`items` es una copia del carrito) |
| getter | `numero` | `FAC-0001`, `FAC-0002`… |
| getter | `totales` | Totales de la factura |
| action | `emitir()` | Copia el carrito y muestra la factura (**usa el store del carrito**) |
| action | `abrir()`, `cerrar()` | Controlan si se ve la factura |
| action | `nuevaCompra()` | Vacía el carrito, oculta la factura y sube el consecutivo |

## Cómo se comunican ahora los componentes

- **Comprar:** `ProductoCard` → `carrito.agregar(producto)`. El encabezado y el carrito se actualizan solos porque leen el mismo store.
- **Carrito:** `CarritoCompra` lee `items`, `vacio` y `totales` del store y llama `incrementar`, `decrementar`, `eliminar`.
- **Finalizar compra:** `CarritoCompra` → `factura.emitir()`. `App.vue` ve que `factura.mostrar` cambió y muestra `FacturaCompra`.
- **Factura:** `FacturaCompra` lee todo de `useFacturaStore`. "Nueva compra" llama `factura.nuevaCompra()`.
- **Filtros:** `FiltrosProductos` escribe en el store con `v-model`; `ListaProductos` lee `productosFiltrados`.

Se mantienen dos props porque no son estado compartido: `ProductoCard` recibe `producto` (el dato de cada tarjeta del
`v-for`, con validación) y `AppHeader`/`AppFooter` reciben el nombre de la tienda, el año y el contacto.

## Factura como pantalla aparte

Al finalizar la compra se muestra solo la factura, con su propia dirección (`#factura`). El botón **Atrás** del
navegador vuelve a la tienda, y los enlaces del encabezado también te sacan de la factura. `App.vue` sincroniza
el store con la dirección usando `watch` y el evento `hashchange`, sin librerías de rutas.

## Fórmulas

- `valorConDescuento = Math.round(valor × (1 − descuento / 100))`
- Subtotal = Σ (valorConDescuento × cantidad). Descuentos = Σ (valor × cantidad) − subtotal.
- IVA = `Math.round(subtotal × 0.19)`. Total a pagar = subtotal + IVA.
- Moneda: `Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" })`, con 0 decimales.

## Pruebas realizadas en navegador

Búsqueda sin tildes, categorías, precio, "solo ofertas", orden y "limpiar filtros"; agregar sin duplicar, +, −, eliminar;
insignia del encabezado; factura con IVA y total; botones Atrás/Adelante; enlaces del encabezado desde la factura;
"Nueva compra" (carrito vacío, dirección limpia y consecutivo FAC-0002); sin desbordamiento en celular y sin errores de consola.

## Subirlo a GitHub

Crea un repositorio **nuevo y vacío** (por ejemplo `tienda-vue-pinia`), para no mezclarlo con el del segundo corte.

```bash
git init
git branch -M main
git add package.json package-lock.json vite.config.js index.html .gitignore src/main.js src/style.css src/utils public
git commit -m "feat: proyecto base con Vite y Pinia"
git add src/stores
git commit -m "feat: stores de Pinia (productos, carrito y factura)"
git add src/components
git commit -m "refactor: componentes leen y modifican el estado desde los stores"
git add src/App.vue
git commit -m "refactor: App.vue sin estado local, factura sincronizada con la URL"
git add README.md .github
git commit -m "docs: README y despliegue en GitHub Pages"
git remote add origin https://github.com/TU-USUARIO/tienda-vue-pinia.git
git push -u origin main
```

Para publicar la página: en el repositorio ve a **Settings → Pages → Source: GitHub Actions**
(el archivo `.github/workflows/deploy.yml` ya está incluido) y revisa la pestaña **Actions**.

## Autores

Escribe aquí los nombres del grupo.
