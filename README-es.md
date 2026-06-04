# React Native SDK — Eulerian Analytics

Guía completa de instalación y etiquetado para el SDK React Native de Eulerian Analytics.

---

## Índice

- [Instalación](#instalación)
- [Inicialización](#inicialización)
- [Patrón Builder](#patrón-builder)
- [Tipos de tags](#tipos-de-tags)
  - [Página genérica](#página-genérica--eageneric) — `EaGeneric`
  - [Página de producto](#página-de-producto--eaproducts-1-producto) — `EAProducts` (1 producto)
  - [Página de categoría](#página-de-categoría--eaproducts-n-productos) — `EAProducts` (N productos)
  - [Página de buscador](#página-de-buscador--easearch) — `EASearch`
  - [Página de error 404](#página-de-error-404--eageneric) — `EaGeneric`
  - [Presupuesto](#presupuesto--eaestimate) — `EAEstimate`
  - [Carrito](#carrito--eacart) — `EACart`
  - [Pedido](#pedido--eaorder) — `EAOrder`
  - [Tracking de merchandising](#tracking-de-merchandising--eatpview--eatpclick) — `EATpView` / `EATpClick`
  - [Acciones](#acciones--action) — `Action`
  - [Context Flag (CFLAG)](#context-flag-cflag--sitecentriccflag) — `SiteCentricCFlag`
- [Tracking WebView](#tracking-webview)
- [Métricas de la aplicación](#métricas-de-la-aplicación)
- [Consentimiento (RGPD)](#consentimiento-rgpd)

---

## Instalación

### Dependencias nativas

El SDK requiere las siguientes bibliotecas de React Native. Añádelas a tu proyecto:

```bash
npm install \
  @react-native-async-storage/async-storage \
  @react-native-community/netinfo \
  @sparkfabrik/react-native-idfa-aaid \
  react-native-device-info \
  react-native-fs \
  react-native-logs \
  react-native-play-install-referrer
```

### iOS — Configuración adicional

Enlaza las dependencias nativas:

```bash
cd ios && pod install
```

Para recoger el IDFA (opcional), añade la clave `NSUserTrackingUsageDescription` en tu `Info.plist`:

```xml
<key>NSUserTrackingUsageDescription</key>
<string>Esta aplicación utiliza el identificador publicitario para personalizar el contenido.</string>
```

### Android — Configuración adicional

`react-native-play-install-referrer` no requiere configuración manual más allá del autolinking estándar.

Para `@sparkfabrik/react-native-idfa-aaid`, asegúrate de que tu `android/build.gradle` define `minSdkVersion >= 21`.

### Integración del SDK

Copia la carpeta `src/` del repositorio en tu proyecto. La estructura requerida es:

```
src/
├── eAnalytics.ts
├── models/
│   ├── eaGeneric.ts
│   ├── eaCart.ts
│   ├── eaEstimate.ts
│   ├── eaOrder.ts
│   ├── eaProducts.ts
│   ├── eaSearch.ts
│   ├── eaMerchandising.ts
│   └── classes/
│       ├── action.ts
│       ├── params.ts
│       ├── product.ts
│       ├── siteCentricCFlag.ts
│       └── siteCentricProperty.ts
└── utils/
    ├── currencyISO.ts
    └── ...
```

**Versiones soportadas:** React `>=18.2.0` · ReactNative `>0.72.4` · Node `>=16`

---

## Inicialización

Llama a `EAnalytics.init` **una sola vez** al arrancar la aplicación, antes de cualquier llamada a `track`. El SDK es un singleton — una segunda llamada a `init` se ignora.

```typescript
import EAnalytics from './src/eAnalytics';

// En el componente raíz o en el punto de entrada de la aplicación
useEffect(() => {
  EAnalytics.init("example.demo.com", false);
}, []);
```

El segundo parámetro activa (`true`) o desactiva (`false`) los logs de depuración en la consola.

> **Subdominio de tracking:** el valor a pasar es proporcionado por tu equipo Eulerian. Tiene el formato `example.demo.com` — no incluir `https://` ni `/`. El SDK rechaza hosts que contengan `.eulerian.com`.

> **Offline & retry:** si el dispositivo no tiene conexión en el momento de llamar a `track`, el tag se serializa localmente y se reenvía automáticamente en la siguiente llamada a `track` o en el siguiente arranque de la aplicación. El timestamp real de la interacción se conserva (`ereplay-time`).

> **Android — Install Referrer:** en Android el SDK recoge automáticamente el referrer de instalación de Google Play en el primer arranque y lo incluye en los tags siguientes (`ea-android-referrer`).

---

## Patrón Builder

Todos los modelos del SDK utilizan una **clase Builder interna** con una API fluida. La estructura general es:

```typescript
const tag = new ModelClass.Builder("ruta/de/la/pagina")
  .setUID("123")
  .setEmail("user@example.com")
  // ... otros métodos
  .build();

EAnalytics.track(tag);
```

El método `.build()` crea la instancia final. Cada método del Builder devuelve `this`, por lo que las llamadas son encadenables.

> **`path` (nombre de página) es obligatorio en cada tag.** Nunca se infiere automáticamente. Usa una convención jerárquica con `|` como separador, por ejemplo `"home|landing"`, `"catalogo|zapatos|hombre"`, `"funnel|pago|confirmacion"`. El valor es libre pero debe ser estable y significativo para el reporting.

> **Método genérico `.set(key, value)`**: disponible en todos los Builders, permite añadir cualquier parámetro personalizado no cubierto por los métodos dedicados. Ejemplo: `.set("suscripcion", "mensual")`.

---

## Tipos de tags

### Página genérica — `EaGeneric`

Usar en todas las páginas que no sean fichas de producto, carrito, pedido o presupuesto (incluida la homepage y los pasos intermedios del funnel). Envía el tráfico site-centric, las páginas vistas, las visitas y las fuentes orgánicas.

**Import:**
```typescript
import EaGeneric from './src/models/eaGeneric';
```

**Métodos del Builder:**

| Método | Descripción |
|--------|-------------|
| `new EaGeneric.Builder(path)` | Nombre de la página **(obligatorio)** |
| `.setUID(uid)` | ID interno del usuario logueado; consolida el historial multi-dispositivo |
| `.setEmail(email)` | Dirección de email del usuario — debe hashearse en SHA256LC |
| `.setProfile(profile)` | Perfil de usuario (ej. `visitor`, `buyer`, `looker`) |
| `.setPageGroup(group)` | Grupo de páginas para el reporting |
| `.setLocation(lat, lon)` | Coordenadas GPS del dispositivo |
| `.setNewCustomer(boolean)` | `true` si es nuevo cliente |
| `.set(key, value)` | Parámetro personalizado libre |
| `.setAction(action)` | Adjunta una acción (reemplaza la anterior) |
| `.putAction(action)` | Acumula múltiples acciones en el mismo tag |
| `.setProperty(property)` | Propiedad site-centric (`SiteCentricProperty`) |
| `.setCFlag(cflag)` | Context flag (`SiteCentricCFlag`) |
| `.setStandalone()` | No cuenta como página vista en Eulerian |

```typescript
import EaGeneric from './src/models/eaGeneric';

const props = new EaGeneric.Builder("home|landing")
  .setUID("123asd")
  .setEmail("test@test.com")
  .setProfile("visitor")
  .setPageGroup("MY-PAGEGROUP")
  .set("suscripcion", "mensual")
  .build();

EAnalytics.track(props);
```

---

### Página de producto — `EAProducts` (1 producto)

Rastrea las páginas vistas de producto y alimenta el informe "Adquisición & Rendimiento de producto". Un tag se trata como página de producto cuando contiene **exactamente un** producto.

**Import:**
```typescript
import EAProducts from './src/models/eaProducts';
import Product from './src/models/classes/product';
import Params from './src/models/classes/params';
```

**Métodos del Builder `Product`:**

| Método | Descripción |
|--------|-------------|
| `new Product.Builder(ref)` | Referencia del producto **(obligatorio)** |
| `.setName(name)` | Nombre legible del producto para el reporting |
| `.setGroup(group)` | Grupo de margen (`A` o `B`) |
| `.setParams(params)` | Categorías del producto (ej. `prdparam-category`, `prdparam-brand`) |

**Métodos del Builder `Params`:**

| Método | Descripción |
|--------|-------------|
| `new Params.Builder()` | Constructor |
| `.addParam(key, value)` | Añade un par clave/valor (cadena o número) |

```typescript
import EAProducts from './src/models/eaProducts';
import Product from './src/models/classes/product';
import Params from './src/models/classes/params';

const params = new Params.Builder()
  .addParam("category", "clothes")
  .addParam("brand", "nike")
  .build();

const product = new Product.Builder("ref-product")
  .setName("name-product")
  .setGroup("A")
  .setParams(params)
  .build();

const page = new EAProducts.Builder("producto|ficha")
  .setUID("123asd")
  .setEmail("test@test.com")
  .setProfile("looker")
  .addProduct(product)
  .build();

EAnalytics.track(page);
```

---

### Página de categoría — `EAProducts` (N productos)

Envía las N referencias de producto mostradas en una página de resultados o categoría. Un tag se trata como página de categoría cuando contiene **más de un** producto.

Usa la misma clase `EAProducts`, pasando múltiples productos con `.addProduct()`.

```typescript
import EAProducts from './src/models/eaProducts';
import Product from './src/models/classes/product';

const product1 = new Product.Builder("ref-product1").setName("Producto 1").build();
const product2 = new Product.Builder("ref-product2").setName("Producto 2").build();
const product3 = new Product.Builder("ref-product3").setName("Producto 3").build();

const page = new EAProducts.Builder("categoria|zapatos")
  .setUID("123asd")
  .setEmail("test@test.com")
  .setPageGroup("my-pagegroup")
  .addProduct(product1)
  .addProduct(product2)
  .addProduct(product3)
  .build();

EAnalytics.track(page);
```

---

### Página de buscador — `EASearch`

Rastrea las consultas del buscador interno, el número de resultados y los parámetros de búsqueda.

**Import:**
```typescript
import EASearch from './src/models/eaSearch';
import Params from './src/models/classes/params';
```

**Métodos del Builder:**

| Método | Descripción |
|--------|-------------|
| `new EASearch.Builder(path)` | Nombre de la página **(obligatorio)** |
| `.setName(name)` | Nombre del buscador **(obligatorio)** |
| `.setResults(count)` | Número de resultados devueltos |
| `.setParams(params)` | Parámetros de búsqueda (pares clave/valor correspondientes a `isearchkey`/`isearchdata`) |
| `.setUID(uid)` | ID interno del usuario |
| `.set(key, value)` | Parámetro personalizado libre |

```typescript
import EASearch from './src/models/eaSearch';
import Params from './src/models/classes/params';

const searchParams = new Params.Builder()
  .addParam("palabra_clave", "chaqueta")
  .addParam("precio_min", "100.00")
  .addParam("precio_max", "400.00")
  .build();

const page = new EASearch.Builder("buscador_interno|chaqueta")
  .setUID("34678")
  .setName("buscador_interno")
  .setResults(150)
  .setParams(searchParams)
  .build();

EAnalytics.track(page);
```

---

### Página de error 404 — `EaGeneric`

Señala una página de error 404 añadiendo `.set("error", "1")` a un tag `EaGeneric`. Alimenta el informe "Páginas con error".

```typescript
import EaGeneric from './src/models/eaGeneric';

const props = new EaGeneric.Builder("error|404")
  .set("error", "1")
  .build();

EAnalytics.track(props);
```

---

### Presupuesto — `EAEstimate`

Rastrea los presupuestos y los productos asociados. Los presupuestos se deduplicán por referencia: una segunda llamada con el mismo `ref` se ignora.

**Import:**
```typescript
import EAEstimate from './src/models/eaEstimate';
import CurrencyISO from './src/utils/currencyISO';
```

**Métodos del Builder:**

| Método | Descripción |
|--------|-------------|
| `new EAEstimate.Builder(path)` | Nombre de la página **(obligatorio)** |
| `.setRef(ref)` | Referencia única del presupuesto **(obligatorio)** |
| `.setAmount(amount)` | Importe total IVA incluido (separador decimal: punto) |
| `.setType(type)` | Tipo de presupuesto según tu propia taxonomía |
| `.setCurrency(currency)` | Divisa si es diferente de la configurada en la interfaz |
| `.addProduct(product, amount, quantity)` | Añade un producto con su importe unitario y su cantidad |
| `.setUID(uid)` | ID interno del usuario |
| `.setEmail(email)` | Dirección de email del usuario — debe hashearse en SHA256LC |
| `.set(key, value)` | Parámetro personalizado libre |

```typescript
import EAEstimate from './src/models/eaEstimate';
import Product from './src/models/classes/product';
import CurrencyISO from './src/utils/currencyISO';

const product = new Product.Builder("505").setName("Producto presupuesto").build();

const page = new EAEstimate.Builder("credito|presupuesto")
  .setRef("C4536567")
  .setUID("123asd")
  .setEmail("test@test.com")
  .setAmount(5000.00)
  .setType("credito_48meses")
  .setCurrency(CurrencyISO.EUR)
  .set("custom-param-key", "custom-value")
  .addProduct(product, 5000.00, 1)
  .build();

EAnalytics.track(page);
```

---

### Carrito — `EACart`

Rastrea los carritos iniciados y permite el cálculo de las tasas de conversión y abandono. La duración de vida de un carrito es de 30 minutos deslizantes.

**Import:**
```typescript
import EACart from './src/models/eaCart';
```

**Métodos del Builder:**

| Método | Descripción |
|--------|-------------|
| `new EACart.Builder(path)` | Nombre de la página **(obligatorio)** |
| `.setCartCumul(boolean)` | `false`: los productos del tag representan el carrito completo (snapshot); `true`: los productos se acumulan en cada llamada sucesiva |
| `.addProduct(product, amount, quantity)` | Añade un producto con su importe unitario y su cantidad |
| `.setUID(uid)` | ID interno del usuario |
| `.setEmail(email)` | Dirección de email del usuario — debe hashearse en SHA256LC |
| `.setProfile(profile)` | Perfil del usuario |
| `.setPageGroup(group)` | Grupo de páginas |
| `.set(key, value)` | Parámetro personalizado libre |

```typescript
import EACart from './src/models/eaCart';
import Product from './src/models/classes/product';
import Params from './src/models/classes/params';

const params = new Params.Builder()
  .addParam("category", "T-Shirt")
  .addParam("brand", "Nike")
  .build();

const product = new Product.Builder("product-123")
  .setName("product-name")
  .setParams(params)
  .build();

const page = new EACart.Builder("carrito")
  .setUID("123asd")
  .setEmail("test@test.com")
  .setProfile("shopper")
  .setPageGroup("my-page-group")
  .setCartCumul(false)
  .addProduct(product, 50.30, 2)
  .build();

EAnalytics.track(page);
```

---

### Pedido — `EAOrder`

Rastrea las conversiones y el ROI. Los pedidos se deduplicán por referencia. Implementa este tag lo antes posible en el funnel de pago para no perderlo si el usuario no regresa a la app después de la plataforma de pago.

**Import:**
```typescript
import EAOrder from './src/models/eaOrder';
import CurrencyISO from './src/utils/currencyISO';
```

**Métodos del Builder:**

| Método | Descripción |
|--------|-------------|
| `new EAOrder.Builder(path)` | Nombre de la página **(obligatorio)** |
| `.setRef(ref)` | Referencia única del pedido **(obligatorio)** |
| `.setAmount(amount)` | Importe total IVA incluido, sin gastos de envío **(obligatorio)** |
| `.setPayment(payment)` | Método de pago utilizado (ej. `credit card`, `paypal`) |
| `.setType(type)` | Tipo de venta según tu propia taxonomía |
| `.setCurrency(currency)` | Divisa si es diferente de la configurada en la interfaz |
| `.setNewCustomer(boolean)` | `true`: nuevo comprador; `false`: cliente recurrente |
| `.setEstimateRef(estimateRef)` | Referencia del presupuesto asociado a este pedido |
| `.addProduct(product, amount, quantity)` | Añade un producto con su importe unitario y su cantidad |
| `.setUID(uid)` | ID interno del usuario |
| `.setEmail(email)` | Dirección de email del usuario — debe hashearse en SHA256LC |
| `.setProfile(profile)` | Perfil del usuario |
| `.set(key, value)` | Parámetro personalizado libre |

```typescript
import EAOrder from './src/models/eaOrder';
import Product from './src/models/classes/product';
import Params from './src/models/classes/params';
import CurrencyISO from './src/utils/currencyISO';

const params = new Params.Builder()
  .addParam("category", "T-Shirt")
  .addParam("brand", "Nike")
  .build();

const product = new Product.Builder("product-123")
  .setName("product-name")
  .setParams(params)
  .build();

const page = new EAOrder.Builder("funnel|confirmacion")
  .setRef("F654335671")
  .setUID("123asd")
  .setEmail("test@test.com")
  .setProfile("buyer")
  .setNewCustomer(true)
  .setAmount(50.30)
  .setType("online")
  .setPayment("credit card")
  .setCurrency(CurrencyISO.EUR)
  .set("custom-param-key", "custom-value")
  .addProduct(product, 25.15, 2)
  .build();

EAnalytics.track(page);
```

---

### Tracking de merchandising — `EATpView` / `EATpClick`

Rastrea las impresiones y clics en los bloques de merchandising (listas de recomendación, banners, etc.). Enviados en **GET** a `/tpview/` y `/tpclick/` — a diferencia del resto de tags que se envían en POST. Comparte el mismo mecanismo de retry offline que el resto del SDK.

**Import:**
```typescript
import { EATpView, EATpClick } from './src/models/eaMerchandising';
```

**Métodos del Builder `EATpView` (impresión):**

| Método | Descripción |
|--------|-------------|
| `new EATpView.Builder(path)` | Página de referencia **(obligatorio)** |
| `.setSiteName(name)` | Nombre del sitio comercial |
| `.setCampaign(campaign)` | Nombre de la campaña |
| `.setPlacement(placement)` | Posición del bloque en la página |
| `.addProduct(ref, position?)` | Referencia del producto y su posición en el bloque; repite para cada producto mostrado |
| `.setUrl(url)` | URL de contexto |
| `.setPublisher(publisher)` | Editor (opcional) |
| `.setMedia(media)` | Tipo de medio (opcional) |
| `.setCategory(category)` | Categoría del bloque (opcional) |

**Métodos del Builder `EATpClick` (clic):**

| Método | Descripción |
|--------|-------------|
| `new EATpClick.Builder(path)` | Página de referencia **(obligatorio)** |
| `.setSiteName(name)` | Nombre del sitio comercial |
| `.setCampaign(campaign)` | Nombre de la campaña |
| `.setPlacement(placement)` | Posición del bloque en la página |
| `.setProduct(ref, position, totalProducts?)` | Referencia y posición del producto clicado **(obligatorio)**; tercer parámetro opcional con el número total de productos en el bloque |
| `.setUrl(url)` | URL de contexto |
| `.setPublisher(publisher)` | Editor (opcional) |
| `.setMedia(media)` | Tipo de medio (opcional) |
| `.setCategory(category)` | Categoría del bloque (opcional) |

```typescript
import { EATpView, EATpClick } from './src/models/eaMerchandising';

// Impresión en un bloque de merchandising
const view = new EATpView.Builder("homepage")
  .setSiteName("my-site")
  .setCampaign("summer_sale")
  .setPlacement("banner_top")
  .addProduct("PROD_001", 0)
  .addProduct("PROD_002", 1)
  .setUrl("https://www.example.com")
  .build();

EAnalytics.track(view);

// Clic en un producto del bloque
const click = new EATpClick.Builder("homepage")
  .setSiteName("my-site")
  .setCampaign("summer_sale")
  .setPlacement("banner_top")
  .setProduct("PROD_001", 0)
  .setUrl("https://www.example.com")
  .build();

EAnalytics.track(click);
```

---

### Acciones — `Action`

Las acciones permiten rastrear interacciones del usuario (funnels de suscripción, encuestas, navegación entre secciones, etc.) fuera de las páginas vistas clásicas. Una acción puede adjuntarse a cualquier tag mediante `.setAction()` (reemplaza cualquier acción anterior) o `.putAction()` (acumula múltiples acciones en el mismo tag).

Para enviar una acción sin página vista asociada, llama a `.setStandalone()` en el tag — el hit no contará como página vista en Eulerian.

**Import:**
```typescript
import Action from './src/models/classes/action';
import Params from './src/models/classes/params';
```

**Métodos del Builder `Action`:**

| Método | Descripción |
|--------|-------------|
| `new Action.Builder()` | Constructor |
| `.setName(name)` | Nombre de la acción **(obligatorio)** |
| `.setMode(mode)` | Dirección de la acción: `"in"` (entrada), `"out"` (salida) o `"neat"` |
| `.setLabel(label)` | Etiqueta de la acción |
| `.setReference(ref)` | Referencia que identifica la acción en tus sistemas |
| `.setParams(params)` | Parámetros adicionales clave/valor |

**Acción adjunta a una página vista:**

```typescript
import EaGeneric from './src/models/eaGeneric';
import Action from './src/models/classes/action';

const action1 = new Action.Builder()
  .setName("suscripcion-paso1")
  .setMode("in")
  .setLabel("oferta-premium")
  .build();

const action2 = new Action.Builder()
  .setName("suscripcion-paso1")
  .setMode("out")
  .setLabel("abandono")
  .build();

const props = new EaGeneric.Builder("suscripcion|paso1")
  .setUID("123asd")
  .putAction(action1)
  .putAction(action2)
  .build();

EAnalytics.track(props);
```

**Acción standalone (sin página vista):**

> `path` es opcional con `.setStandalone()`. El Builder acepta `new EaGeneric.Builder()` sin argumento.

```typescript
import EaGeneric from './src/models/eaGeneric';
import Action from './src/models/classes/action';
import Params from './src/models/classes/params';

const action = new Action.Builder()
  .setName("clic-cta")
  .setMode("in")
  .setLabel("hero-banner")
  .setParams(new Params.Builder()
    .addParam("origen", "martinica")
    .build())
  .build();

const props = new EaGeneric.Builder()  // path omitido para standalone
  .setStandalone()   // no cuenta como página vista
  .setUID("123asd")
  .putAction(action)
  .build();

EAnalytics.track(props);
```

---

### Propiedad site-centric — `SiteCentricProperty`

Asocia propiedades de producto site-centric a cualquier tag. Tiene la misma API variadic que `SiteCentricCFlag` pero rellena el campo `property` en lugar de `cflag`.

**Import:**
```typescript
import SiteCentricProperty from './src/models/classes/siteCentricProperty';
```

**Métodos del Builder:**

| Método | Descripción |
|--------|-------------|
| `new SiteCentricProperty.Builder()` | Constructor |
| `.set(key, ...values)` | Define una dimensión de propiedad con uno o más valores (variadic) |

```typescript
import EaGeneric from './src/models/eaGeneric';
import SiteCentricProperty from './src/models/classes/siteCentricProperty';

const property = new SiteCentricProperty.Builder()
  .set("universo", "pescado", "carne")
  .set("tipo", "fresco")
  .build();

const props = new EaGeneric.Builder("home|landing")
  .setUID("123asd")
  .setProperty(property)
  .build();

EAnalytics.track(props);
```

---

### Context Flag (CFLAG) — `SiteCentricCFlag`

Asocia uno o más context flags a cualquier tag para enriquecer tus informes con dimensiones contextuales. Cada flag acepta múltiples valores.

**Import:**
```typescript
import SiteCentricCFlag from './src/models/classes/siteCentricCFlag';
```

**Métodos del Builder:**

| Método | Descripción |
|--------|-------------|
| `new SiteCentricCFlag.Builder()` | Constructor |
| `.set(key, ...values)` | Define una dimensión contextual con uno o más valores (variadic) |

```typescript
import EaGeneric from './src/models/eaGeneric';
import SiteCentricCFlag from './src/models/classes/siteCentricCFlag';

const cflag = new SiteCentricCFlag.Builder()
  .set("categoria_1", "rolandgarros", "wimbledon")
  .set("categoria_2", "tenis")
  .set("categoria_3", "usopen")
  .build();

const props = new EaGeneric.Builder("home|landing")
  .setUID("123asd")
  .setEmail("email@test.com")
  .setCFlag(cflag)
  .build();

EAnalytics.track(props);
```

---

## Tracking WebView

Para aplicaciones híbridas que abren una WebView, pasa el identificador interno del SDK en la URL de apertura para garantizar la continuidad del tracking entre la app nativa y la sesión web. Añade también el parámetro `edev` para calificar el tráfico como nativo.

El parámetro `ea-euidl-bypass` debe llevar el **identificador persistente del dispositivo** que el SDK incluye en cada hit — no el identificador publicitario. El SDK React Native no expone un método `getEuidl()` dedicado, recupéralo directamente desde `react-native-device-info`:

- **Android** — Android ID (`euidl` en el SDK): `DeviceInfo.getAndroidId()`
- **iOS** — IDFV (`ea-ios-idfv` en el SDK): `DeviceInfo.getUniqueId()`

> `EAnalytics.getAdInfoId()` devuelve el **identificador publicitario** (IDFA / GAID), que es un identificador diferente y **no debe** usarse para `ea-euidl-bypass`.

```typescript
import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

const euidl = Platform.OS === 'android'
  ? await DeviceInfo.getAndroidId()
  : await DeviceInfo.getUniqueId();

// Construir la URL con los parámetros obligatorios
const baseUrl = "https://www.example.com/landing";
const edev = Platform.OS === 'android' ? "AppNativeAndroidphone" : "AppNativeIOSphone";
const webViewUrl = `${baseUrl}?ea-euidl-bypass=${encodeURIComponent(euidl)}&edev=${edev}`;

// Cargar en la WebView
<WebView source={{ uri: webViewUrl }} />
```

Valores aceptados para `edev`:

| Valor | Dispositivo |
|-------|-------------|
| `AppNativeIOSphone` | iPhone |
| `AppNativeIOStablet` | iPad |
| `AppNativeAndroidphone` | Teléfono Android |
| `AppNativeAndroidtablet` | Tablet Android |

> `ea-euidl-bypass` debe estar presente en **cada cambio de URL** en la WebView, de lo contrario se pierde el enlace entre la navegación en la app y la web.

---

## Métricas de la aplicación

Rastrea descargas y actualizaciones incluyendo estos parámetros en el primer tag enviado al arrancar la aplicación.

| Parámetro | Valor | Descripción |
|-----------|-------|-------------|
| `ea-appname` | Nombre de la app | Identificador de la app — **nunca debe cambiar** — recogido automáticamente por el SDK |
| `ea-appversion` | Cadena de versión | Versión actual — recogida automáticamente por el SDK |
| `ea-appinstalled` | `1` | Pasar manualmente si la app existía antes de la integración de Eulerian |

Estos parámetros se recogen **automáticamente** por el SDK en cada hit mediante `react-native-device-info`. No es necesario hacer nada salvo pasar `ea-appinstalled` durante una migración.

**Lógica del sistema:**
- La métrica **Descarga** se incrementa cuando `ea-appname` se ve por primera vez para ese usuario (sin `ea-appinstalled`).
- La métrica **Actualización** se incrementa cuando `ea-appname` no ha cambiado pero `ea-appversion` tiene un nuevo valor respecto al último arranque.

**Migración (app existente antes de Eulerian):**

```typescript
import EaGeneric from './src/models/eaGeneric';

const props = new EaGeneric.Builder("home|landing")
  .set("ea-appinstalled", "1")
  .build();

EAnalytics.track(props);
```

---

## Consentimiento (RGPD)

> Los dos modos siguientes son **mutuamente excluyentes**. Elige uno y no los uses nunca juntos en la misma aplicación.

### Modo 1 — TCF v2 (`gdpr_consent`)

Transmite la TCString generada por tu CMP una sola vez por visitante, en el momento en que el usuario expresa su opt-in u opt-out.

```typescript
import EaGeneric from './src/models/eaGeneric';

const props = new EaGeneric.Builder("universo|seccion|pagina")
  .setUID("5434742")
  .set("suscripcion", "mensual")
  .set("gdpr_consent", "EADURF214345") // tu TCString
  .build();

EAnalytics.track(props);
```

### Modo 2 — Categorías (`pmcat`)

Pasa los IDs de Eulerian de las categorías **rechazadas**, separados por `-`. Envía `-` solo si el usuario acepta todas las categorías.

```typescript
import EaGeneric from './src/models/eaGeneric';

const props = new EaGeneric.Builder("universo|seccion|pagina")
  .setUID("5434742")
  .set("suscripcion", "mensual")
  .set("pmcat", "1-10") // IDs de las categorías rechazadas
  .build();

EAnalytics.track(props);
```

Ejemplo de mapeo de categorías:

| Categoría | ID Eulerian |
|-----------|-------------|
| analytics | 1 |
| publicidad | 10 |
| funcional | 19 |

*Ejemplo: el usuario rechaza analytics + publicidad → `pmcat` = `1-10`*

### Resumen

| | Modo TCF v2 | Modo Categorías |
|---|---|---|
| **Parámetro** | `gdpr_consent` | `pmcat` |
| **Cuándo** | Al opt-in/out | Al opt-in/out |
| **Contenido** | TCString | IDs rechazados o `-` |
| **Compatibilidad CMP** | CMP TCF v2 | CMP propio / no-TCF |

---

## Notas por plataforma

**Android TV:** `PersistentIdentity.getAdvertisingId()` no está soportado en Android TV y no devolverá el Advertising ID del dispositivo debido a una limitación de React Native en esta plataforma.

**iOS — IDFA:** el SDK recoge automáticamente el IDFA si el usuario ha concedido el permiso mediante `ATTrackingManager`. No se requiere configuración adicional en el SDK más allá de declarar `NSUserTrackingUsageDescription` en `Info.plist`.

**Android — Advertising ID:** el SDK recoge automáticamente el GAID (Google Advertising ID) mediante `@sparkfabrik/react-native-idfa-aaid`. Si el usuario ha activado "Inhabilitar la personalización de anuncios", el flag LAT (`ea-android-islat`) será `true`.
