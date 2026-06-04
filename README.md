# React Native SDK — Eulerian Analytics

Complete installation and tagging guide for the Eulerian Analytics React Native SDK.

---

## Table of Contents

- [Installation](#installation)
- [Initialization](#initialization)
- [Builder Pattern](#builder-pattern)
- [Tag Types](#tag-types)
  - [Generic Page](#generic-page--eageneric) — `EaGeneric`
  - [Product Page](#product-page--eaproducts-1-product) — `EAProducts` (1 product)
  - [Category Page](#category-page--eaproducts-n-products) — `EAProducts` (N products)
  - [Search Engine Page](#search-engine-page--easearch) — `EASearch`
  - [404 Error Page](#404-error-page--eageneric) — `EaGeneric`
  - [Estimate / Quote](#estimate--quote--eaestimate) — `EAEstimate`
  - [Cart](#cart--eacart) — `EACart`
  - [Order](#order--eaorder) — `EAOrder`
  - [Merchandise Tracking](#merchandise-tracking--eatpview--eatpclick) — `EATpView` / `EATpClick`
  - [Actions](#actions--action) — `Action`
  - [Context Flag (CFLAG)](#context-flag-cflag--sitecentriccflag) — `SiteCentricCFlag`
- [WebView Tracking](#webview-tracking)
- [App Metrics](#app-metrics)
- [Consent (GDPR)](#consent-gdpr)

---

## Installation

### Native Dependencies

The SDK requires the following React Native libraries. Add them to your project:

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

### iOS — Additional Setup

Link native dependencies:

```bash
cd ios && pod install
```

To collect the IDFA (optional), add the `NSUserTrackingUsageDescription` key to your `Info.plist`:

```xml
<key>NSUserTrackingUsageDescription</key>
<string>This app uses the advertising identifier to personalize content.</string>
```

### Android — Additional Setup

`react-native-play-install-referrer` requires no manual configuration beyond standard autolinking.

For `@sparkfabrik/react-native-idfa-aaid`, ensure your `android/build.gradle` sets `minSdkVersion >= 21`.

### SDK Integration

Copy the `src/` folder from the repository into your project. The required structure is:

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

**Supported versions:** React `>=18.2.0` · ReactNative `>0.72.4` · Node `>=16`

---

## Initialization

Call `EAnalytics.init` **once** at app startup, before any call to `track`. The SDK is a singleton — a second call to `init` is ignored.

```typescript
import EAnalytics from './src/eAnalytics';

// In the root component or app entry point
useEffect(() => {
  EAnalytics.init("example.demo.com", false);
}, []);
```

The second parameter enables (`true`) or disables (`false`) debug logs in the console.

> **Tracking subdomain:** the value to pass is provided by your Eulerian team. It looks like `example.demo.com` — do not include `https://` or `/`. The SDK rejects hosts containing `.eulerian.com`.

> **Offline & retry:** if the device has no connection when `track` is called, the tag is serialized locally and automatically resent on the next `track` call or on the next app launch. The real timestamp of the interaction is preserved (`ereplay-time`).

> **Android — Install Referrer:** on Android the SDK automatically collects the Google Play install referrer on the first launch and includes it in subsequent tags (`ea-android-referrer`).

---

## Builder Pattern

All SDK models use an **inner Builder class** with a fluent API. The general structure is:

```typescript
const tag = new ModelClass.Builder("page/path")
  .setUID("123")
  .setEmail("user@example.com")
  // ... other methods
  .build();

EAnalytics.track(tag);
```

The `.build()` method creates the final instance. Every Builder method returns `this`, so calls are chainable.

> **`path` (page name) is required on every tag.** It is never inferred automatically. Use a hierarchical convention with `|` as separator, for example `"home|landing"`, `"catalog|shoes|men"`, `"funnel|payment|confirmation"`. The value is free but must be stable and meaningful for reporting.

> **Generic method `.set(key, value)`**: available on all Builders, it lets you add any custom parameter not covered by dedicated methods. Example: `.set("subscription", "monthly")`.

---

## Tag Types

### Generic Page — `EaGeneric`

Use on all pages that are not product pages, cart, order, or estimate (including the homepage and intermediate funnel steps). Sends site-centric traffic, page views, visits, and organic sources.

**Import:**
```typescript
import EaGeneric from './src/models/eaGeneric';
```

**Builder methods:**

| Method | Description |
|--------|-------------|
| `new EaGeneric.Builder(path)` | Page name **(required)** |
| `.setUID(uid)` | Internal user ID for logged-in users; consolidates multi-device history |
| `.setEmail(email)` | User email address — should be hashed in SHA256LC |
| `.setProfile(profile)` | User profile (e.g. `visitor`, `buyer`, `looker`) |
| `.setPageGroup(group)` | Page group for reporting |
| `.setLocation(lat, lon)` | Device GPS coordinates |
| `.setNewCustomer(boolean)` | `true` if new customer |
| `.set(key, value)` | Free-form custom parameter |
| `.setAction(action)` | Attach an action (replaces any previous one) |
| `.putAction(action)` | Accumulate multiple actions on the same tag |
| `.setProperty(property)` | Site-centric property (`SiteCentricProperty`) |
| `.setCFlag(cflag)` | Context flag (`SiteCentricCFlag`) |
| `.setStandalone()` | Does not count as a page view in Eulerian |

```typescript
import EaGeneric from './src/models/eaGeneric';

const props = new EaGeneric.Builder("home|landing")
  .setUID("123asd")
  .setEmail("test@test.com")
  .setProfile("visitor")
  .setPageGroup("MY-PAGEGROUP")
  .set("subscription", "monthly")
  .build();

EAnalytics.track(props);
```

---

### Product Page — `EAProducts` (1 product)

Tracks product page views and feeds the "Acquisition & Product Performance" report. A tag is treated as a product page when it contains **exactly one** product.

**Import:**
```typescript
import EAProducts from './src/models/eaProducts';
import Product from './src/models/classes/product';
import Params from './src/models/classes/params';
```

**`Product` Builder methods:**

| Method | Description |
|--------|-------------|
| `new Product.Builder(ref)` | Product reference **(required)** |
| `.setName(name)` | Human-readable product name for reporting |
| `.setGroup(group)` | Margin group (`A` or `B`) |
| `.setParams(params)` | Product categories (e.g. `prdparam-category`, `prdparam-brand`) |

**`Params` Builder methods:**

| Method | Description |
|--------|-------------|
| `new Params.Builder()` | Constructor |
| `.addParam(key, value)` | Adds a key/value pair (string or number) |

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

const page = new EAProducts.Builder("product|detail")
  .setUID("123asd")
  .setEmail("test@test.com")
  .setProfile("looker")
  .addProduct(product)
  .build();

EAnalytics.track(page);
```

---

### Category Page — `EAProducts` (N products)

Sends the N product references displayed on a results or category page. A tag is treated as a category page when it contains **more than one** product.

Use the same `EAProducts` class, passing multiple products with `.addProduct()`.

```typescript
import EAProducts from './src/models/eaProducts';
import Product from './src/models/classes/product';

const product1 = new Product.Builder("ref-product1").setName("Product 1").build();
const product2 = new Product.Builder("ref-product2").setName("Product 2").build();
const product3 = new Product.Builder("ref-product3").setName("Product 3").build();

const page = new EAProducts.Builder("category|shoes")
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

### Search Engine Page — `EASearch`

Tracks internal search engine queries, result counts, and search parameters.

**Import:**
```typescript
import EASearch from './src/models/eaSearch';
import Params from './src/models/classes/params';
```

**Builder methods:**

| Method | Description |
|--------|-------------|
| `new EASearch.Builder(path)` | Page name **(required)** |
| `.setName(name)` | Search engine name **(required)** |
| `.setResults(count)` | Number of results returned |
| `.setParams(params)` | Search parameters (key/value pairs mapping to `isearchkey`/`isearchdata`) |
| `.setUID(uid)` | Internal user ID |
| `.set(key, value)` | Free-form custom parameter |

```typescript
import EASearch from './src/models/eaSearch';
import Params from './src/models/classes/params';

const searchParams = new Params.Builder()
  .addParam("keyword", "jacket")
  .addParam("price_min", "100.00")
  .addParam("price_max", "400.00")
  .build();

const page = new EASearch.Builder("internal_search|jacket")
  .setUID("34678")
  .setName("internal_search")
  .setResults(150)
  .setParams(searchParams)
  .build();

EAnalytics.track(page);
```

---

### 404 Error Page — `EaGeneric`

Report a 404 error page by adding `.set("error", "1")` to an `EaGeneric` tag. Feeds the "Error Pages" report.

```typescript
import EaGeneric from './src/models/eaGeneric';

const props = new EaGeneric.Builder("error|404")
  .set("error", "1")
  .build();

EAnalytics.track(props);
```

---

### Estimate / Quote — `EAEstimate`

Tracks estimates and their associated products. Estimates are deduplicated by reference: a second call with the same `ref` is ignored.

**Import:**
```typescript
import EAEstimate from './src/models/eaEstimate';
import CurrencyISO from './src/utils/currencyISO';
```

**Builder methods:**

| Method | Description |
|--------|-------------|
| `new EAEstimate.Builder(path)` | Page name **(required)** |
| `.setRef(ref)` | Unique estimate reference **(required)** |
| `.setAmount(amount)` | Total amount including tax (decimal separator: dot) |
| `.setType(type)` | Estimate type according to your own taxonomy |
| `.setCurrency(currency)` | Currency if different from the one configured in the interface |
| `.addProduct(product, amount, quantity)` | Adds a product with its unit amount and quantity |
| `.setUID(uid)` | Internal user ID |
| `.setEmail(email)` | User email address — should be hashed in SHA256LC |
| `.set(key, value)` | Free-form custom parameter |

```typescript
import EAEstimate from './src/models/eaEstimate';
import Product from './src/models/classes/product';
import CurrencyISO from './src/utils/currencyISO';

const product = new Product.Builder("505").setName("Estimate product").build();

const page = new EAEstimate.Builder("credit|quote")
  .setRef("C4536567")
  .setUID("123asd")
  .setEmail("test@test.com")
  .setAmount(5000.00)
  .setType("credit_48months")
  .setCurrency(CurrencyISO.EUR)
  .set("custom-param-key", "custom-value")
  .addProduct(product, 5000.00, 1)
  .build();

EAnalytics.track(page);
```

---

### Cart — `EACart`

Tracks started carts and enables computation of conversion and abandonment rates. A cart session lasts 30 sliding minutes.

**Import:**
```typescript
import EACart from './src/models/eaCart';
```

**Builder methods:**

| Method | Description |
|--------|-------------|
| `new EACart.Builder(path)` | Page name **(required)** |
| `.setCartCumul(boolean)` | `false`: the products in the tag represent the full cart (snapshot); `true`: products accumulate across successive calls |
| `.addProduct(product, amount, quantity)` | Adds a product with its unit amount and quantity |
| `.setUID(uid)` | Internal user ID |
| `.setEmail(email)` | User email address — should be hashed in SHA256LC |
| `.setProfile(profile)` | User profile |
| `.setPageGroup(group)` | Page group |
| `.set(key, value)` | Free-form custom parameter |

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

const page = new EACart.Builder("cart")
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

### Order — `EAOrder`

Tracks conversions and ROI. Orders are deduplicated by reference. Implement this tag as early as possible in the payment funnel to avoid missing it if the user does not return to the app after the payment platform.

**Import:**
```typescript
import EAOrder from './src/models/eaOrder';
import CurrencyISO from './src/utils/currencyISO';
```

**Builder methods:**

| Method | Description |
|--------|-------------|
| `new EAOrder.Builder(path)` | Page name **(required)** |
| `.setRef(ref)` | Unique order reference **(required)** |
| `.setAmount(amount)` | Total amount including tax, excluding shipping **(required)** |
| `.setPayment(payment)` | Payment method used (e.g. `credit card`, `paypal`) |
| `.setType(type)` | Sale type according to your own taxonomy |
| `.setCurrency(currency)` | Currency if different from the one configured in the interface |
| `.setNewCustomer(boolean)` | `true`: new buyer; `false`: returning customer |
| `.setEstimateRef(estimateRef)` | Reference of the estimate associated with this order |
| `.addProduct(product, amount, quantity)` | Adds a product with its unit amount and quantity |
| `.setUID(uid)` | Internal user ID |
| `.setEmail(email)` | User email address — should be hashed in SHA256LC |
| `.setProfile(profile)` | User profile |
| `.set(key, value)` | Free-form custom parameter |

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

const page = new EAOrder.Builder("funnel|confirmation")
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

### Merchandise Tracking — `EATpView` / `EATpClick`

Tracks impressions and clicks on merchandise blocks (recommendation lists, banners, etc.). Sent as **GET** requests to `/tpview/` and `/tpclick/` — unlike other tags which are POSTed. Shares the same offline retry mechanism as the rest of the SDK.

**Import:**
```typescript
import { EATpView, EATpClick } from './src/models/eaMerchandising';
```

**`EATpView` Builder methods (impression):**

| Method | Description |
|--------|-------------|
| `new EATpView.Builder(path)` | Reference page **(required)** |
| `.setSiteName(name)` | Merchant site name |
| `.setCampaign(campaign)` | Campaign name |
| `.setPlacement(placement)` | Block position within the page |
| `.addProduct(ref, position?)` | Product reference and its position in the block; repeat for each displayed product |
| `.setUrl(url)` | Context URL |
| `.setPublisher(publisher)` | Publisher (optional) |
| `.setMedia(media)` | Media type (optional) |
| `.setCategory(category)` | Block category (optional) |

**`EATpClick` Builder methods (click):**

| Method | Description |
|--------|-------------|
| `new EATpClick.Builder(path)` | Reference page **(required)** |
| `.setSiteName(name)` | Merchant site name |
| `.setCampaign(campaign)` | Campaign name |
| `.setPlacement(placement)` | Block position within the page |
| `.setProduct(ref, position, totalProducts?)` | Reference and position of the clicked product **(required)**; optional third parameter with the total number of products in the block |
| `.setUrl(url)` | Context URL |
| `.setPublisher(publisher)` | Publisher (optional) |
| `.setMedia(media)` | Media type (optional) |
| `.setCategory(category)` | Block category (optional) |

```typescript
import { EATpView, EATpClick } from './src/models/eaMerchandising';

// Impression on a merchandise block
const view = new EATpView.Builder("homepage")
  .setSiteName("my-site")
  .setCampaign("summer_sale")
  .setPlacement("banner_top")
  .addProduct("PROD_001", 0)
  .addProduct("PROD_002", 1)
  .setUrl("https://www.example.com")
  .build();

EAnalytics.track(view);

// Click on a product inside that block
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

### Actions — `Action`

Actions let you track user interactions (subscription funnels, surveys, inter-section navigation, etc.) outside of classic page views. An action can be attached to any tag via `.setAction()` (replaces any previous action) or `.putAction()` (accumulates multiple actions on the same tag).

To send an action without an associated page view, call `.setStandalone()` on the tag — the hit will not count as a page view in Eulerian.

**Import:**
```typescript
import Action from './src/models/classes/action';
import Params from './src/models/classes/params';
```

**`Action` Builder methods:**

| Method | Description |
|--------|-------------|
| `new Action.Builder()` | Constructor |
| `.setName(name)` | Action name **(required)** |
| `.setMode(mode)` | Action direction: `"in"` (entry), `"out"` (exit), or `"neat"` |
| `.setLabel(label)` | Action label |
| `.setReference(ref)` | Reference identifying the action in your systems |
| `.setParams(params)` | Additional key/value parameters |

**Action attached to a page view:**

```typescript
import EaGeneric from './src/models/eaGeneric';
import Action from './src/models/classes/action';

const action1 = new Action.Builder()
  .setName("subscription-step1")
  .setMode("in")
  .setLabel("premium-offer")
  .build();

const action2 = new Action.Builder()
  .setName("subscription-step1")
  .setMode("out")
  .setLabel("abandoned")
  .build();

const props = new EaGeneric.Builder("subscription|step1")
  .setUID("123asd")
  .putAction(action1)
  .putAction(action2)
  .build();

EAnalytics.track(props);
```

**Standalone action (without page view):**

> `path` is optional when using `.setStandalone()`. The builder accepts `new EaGeneric.Builder()` with no argument.

```typescript
import EaGeneric from './src/models/eaGeneric';
import Action from './src/models/classes/action';
import Params from './src/models/classes/params';

const action = new Action.Builder()
  .setName("cta-click")
  .setMode("in")
  .setLabel("hero-banner")
  .setParams(new Params.Builder()
    .addParam("origin", "martinique")
    .build())
  .build();

const props = new EaGeneric.Builder()  // path omitted for standalone
  .setStandalone()   // does not count as a page view
  .setUID("123asd")
  .putAction(action)
  .build();

EAnalytics.track(props);
```

---

### Site-Centric Property — `SiteCentricProperty`

Associates site-centric product properties with any tag. Has the same variadic API as `SiteCentricCFlag` but populates the `property` field instead of `cflag`.

**Import:**
```typescript
import SiteCentricProperty from './src/models/classes/siteCentricProperty';
```

**Builder methods:**

| Method | Description |
|--------|-------------|
| `new SiteCentricProperty.Builder()` | Constructor |
| `.set(key, ...values)` | Defines a property dimension with one or more values (variadic) |

```typescript
import EaGeneric from './src/models/eaGeneric';
import SiteCentricProperty from './src/models/classes/siteCentricProperty';

const property = new SiteCentricProperty.Builder()
  .set("universe", "fish", "meat")
  .set("type", "fresh")
  .build();

const props = new EaGeneric.Builder("home|landing")
  .setUID("123asd")
  .setProperty(property)
  .build();

EAnalytics.track(props);
```

---

### Context Flag (CFLAG) — `SiteCentricCFlag`

Associate one or more context flags with any tag to enrich your reports with contextual dimensions. Each flag accepts multiple values.

**Import:**
```typescript
import SiteCentricCFlag from './src/models/classes/siteCentricCFlag';
```

**Builder methods:**

| Method | Description |
|--------|-------------|
| `new SiteCentricCFlag.Builder()` | Constructor |
| `.set(key, ...values)` | Defines a contextual dimension with one or more values (variadic) |

```typescript
import EaGeneric from './src/models/eaGeneric';
import SiteCentricCFlag from './src/models/classes/siteCentricCFlag';

const cflag = new SiteCentricCFlag.Builder()
  .set("category_1", "rolandgarros", "wimbledon")
  .set("category_2", "tennis")
  .set("category_3", "usopen")
  .build();

const props = new EaGeneric.Builder("home|landing")
  .setUID("123asd")
  .setEmail("email@test.com")
  .setCFlag(cflag)
  .build();

EAnalytics.track(props);
```

---

## WebView Tracking

For hybrid apps that open a WebView, pass the SDK's internal identifier in the opening URL to ensure tracking continuity between the native app and the web session. Also add the `edev` parameter to qualify traffic as native.

The `ea-euidl-bypass` parameter must carry the **device persistent identifier** that the SDK embeds in every hit — not the advertising ID. The React Native SDK does not expose a dedicated `getEuidl()` helper, so retrieve it directly from `react-native-device-info`:

- **Android** — Android ID (`ea-android-id` / `euidl` in the SDK): `DeviceInfo.getAndroidId()`
- **iOS** — IDFV (`ea-ios-idfv` in the SDK): `DeviceInfo.getUniqueId()`

> `EAnalytics.getAdInfoId()` returns the **advertising ID** (IDFA / GAID), which is a different identifier and must **not** be used for `ea-euidl-bypass`.

```typescript
import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

const euidl = Platform.OS === 'android'
  ? await DeviceInfo.getAndroidId()
  : await DeviceInfo.getUniqueId();

// Build the URL with the required parameters
const baseUrl = "https://www.example.com/landing";
const edev = Platform.OS === 'android' ? "AppNativeAndroidphone" : "AppNativeIOSphone";
const webViewUrl = `${baseUrl}?ea-euidl-bypass=${encodeURIComponent(euidl)}&edev=${edev}`;

// Load in the WebView
<WebView source={{ uri: webViewUrl }} />
```

Accepted values for `edev`:

| Value | Device |
|-------|--------|
| `AppNativeIOSphone` | iPhone |
| `AppNativeIOStablet` | iPad |
| `AppNativeAndroidphone` | Android phone |
| `AppNativeAndroidtablet` | Android tablet |

> `ea-euidl-bypass` must be present on **every URL change** in the WebView, otherwise the link between app and web navigation is lost.

---

## App Metrics

Track downloads and updates by including these parameters in the first tag sent at app launch.

| Parameter | Value | Description |
|-----------|-------|-------------|
| `ea-appname` | App name | App identifier — **must never change** — collected automatically by the SDK |
| `ea-appversion` | Version string | Current version — collected automatically by the SDK |
| `ea-appinstalled` | `1` | Pass manually if the app existed before Eulerian integration |

These parameters are collected **automatically** by the SDK on every hit via `react-native-device-info`. No action is required except passing `ea-appinstalled` during a migration.

**System logic:**
- The **Download** metric is incremented when `ea-appname` is seen for the first time for that user (without `ea-appinstalled`).
- The **Update** metric is incremented when `ea-appname` is unchanged but `ea-appversion` has a new value compared to the last launch.

**Migration (app existing before Eulerian):**

```typescript
import EaGeneric from './src/models/eaGeneric';

const props = new EaGeneric.Builder("home|landing")
  .set("ea-appinstalled", "1")
  .build();

EAnalytics.track(props);
```

---

## Consent (GDPR)

> The two modes below are **mutually exclusive**. Choose one and never use both together in the same application.

### Mode 1 — TCF v2 (`gdpr_consent`)

Transmit the TCString generated by your CMP once per visitor, at the moment the user expresses their opt-in or opt-out.

```typescript
import EaGeneric from './src/models/eaGeneric';

const props = new EaGeneric.Builder("universe|section|page")
  .setUID("5434742")
  .set("subscription", "monthly")
  .set("gdpr_consent", "EADURF214345") // your TCString
  .build();

EAnalytics.track(props);
```

### Mode 2 — Categories (`pmcat`)

Pass the Eulerian IDs of **refused** categories, separated by `-`. Send `-` alone if the user accepts all categories.

```typescript
import EaGeneric from './src/models/eaGeneric';

const props = new EaGeneric.Builder("universe|section|page")
  .setUID("5434742")
  .set("subscription", "monthly")
  .set("pmcat", "1-10") // IDs of refused categories
  .build();

EAnalytics.track(props);
```

Example category mapping:

| Category | Eulerian ID |
|----------|-------------|
| analytics | 1 |
| advertising | 10 |
| functional | 19 |

*Example: user refuses analytics + advertising → `pmcat` = `1-10`*

### Summary

| | TCF v2 Mode | Categories Mode |
|---|---|---|
| **Parameter** | `gdpr_consent` | `pmcat` |
| **When** | At opt-in/out | At opt-in/out |
| **Content** | TCString | Refused IDs or `-` |
| **CMP compatibility** | TCF v2 CMP | Custom / non-TCF CMP |

---

## Platform Notes

**Android TV:** `PersistentIdentity.getAdvertisingId()` is unsupported on Android TV and will not return the device Advertising ID due to a React Native platform limitation.

**iOS — IDFA:** the SDK automatically collects the IDFA if the user has granted permission via `ATTrackingManager`. No additional SDK-side configuration is required beyond declaring `NSUserTrackingUsageDescription` in `Info.plist`.

**Android — Advertising ID:** the SDK automatically collects the GAID (Google Advertising ID) via `@sparkfabrik/react-native-idfa-aaid`. If the user has enabled "Opt out of Ads Personalization", the LAT flag (`ea-android-islat`) will be `true`.
