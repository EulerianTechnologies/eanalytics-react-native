# React Native SDK — Eulerian Analytics

Guide complet d'installation et de taggage pour le SDK React Native Eulerian Analytics.

---

## Sommaire

- [Installation](#installation)
- [Initialisation](#initialisation)
- [Pattern Builder](#pattern-builder)
- [Types de tags](#types-de-tags)
  - [Page générique](#page-générique--eageneric) — `EaGeneric`
  - [Page produit](#page-produit--eaproducts-1-produit) — `EAProducts` (1 produit)
  - [Page catégorie](#page-catégorie--eaproducts-n-produits) — `EAProducts` (N produits)
  - [Page moteur de recherche](#page-moteur-de-recherche--easearch) — `EASearch`
  - [Page erreur 404](#page-erreur-404--eageneric) — `EaGeneric`
  - [Devis](#devis--eaestimate) — `EAEstimate`
  - [Panier](#panier--eacart) — `EACart`
  - [Commande](#commande--eaorder) — `EAOrder`
  - [Tracking marchandisage](#tracking-marchandisage--eatpview--eatpclick) — `EATpView` / `EATpClick`
  - [Actions](#actions--action) — `Action`
  - [Context Flag (CFLAG)](#context-flag-cflag--sitecentriccflag) — `SiteCentricCFlag`
- [Tracking WebView](#tracking-webview)
- [Métriques application](#métriques-application)
- [Consentement (RGPD)](#consentement-rgpd)

---

## Installation

### Dépendances natives

Le SDK requiert les bibliothèques React Native suivantes. Ajoutez-les à votre projet :

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

### iOS — Configuration complémentaire

Liez les dépendances natives :

```bash
cd ios && pod install
```

Pour collecter l'IDFA (optionnel), ajoutez la clé `NSUserTrackingUsageDescription` dans votre `Info.plist` :

```xml
<key>NSUserTrackingUsageDescription</key>
<string>Cette application utilise l'identifiant publicitaire pour personnaliser le contenu.</string>
```

### Android — Configuration complémentaire

`react-native-play-install-referrer` ne requiert aucune configuration manuelle au-delà de l'autolinking standard.

Pour `@sparkfabrik/react-native-idfa-aaid`, assurez-vous que votre `android/build.gradle` définit `minSdkVersion >= 21`.

### Intégration du SDK

Copiez le dossier `src/` du dépôt dans votre projet. La structure requise est :

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

**Versions supportées :** React `>=18.2.0` · ReactNative `>0.72.4` · Node `>=16`

---

## Initialisation

Appelez `EAnalytics.init` **une seule fois** au démarrage de l'application, avant tout appel à `track`. Le SDK est un singleton — un second appel à `init` est ignoré.

```typescript
import EAnalytics from './src/eAnalytics';

// Dans le composant racine ou le point d'entrée de l'application
useEffect(() => {
  EAnalytics.init("example.demo.com", false);
}, []);
```

Le second paramètre active (`true`) ou désactive (`false`) les logs de debug dans la console.

> **Sous-domaine de tracking :** la valeur à passer est fournie par votre équipe Eulerian. Elle ressemble à `example.demo.com` — ne pas inclure `https://` ni `/`. Le SDK refuse les hôtes contenant `.eulerian.com`.

> **Offline & retry :** si l'appareil n'a pas de connexion au moment de l'appel à `track`, le tag est sérialisé localement et renvoyé automatiquement au prochain appel `track` ou au prochain lancement de l'application. Le timestamp réel de l'interaction est conservé (`ereplay-time`).

> **Android — Install Referrer :** sur Android, le SDK collecte automatiquement le referrer d'installation Google Play au premier lancement et l'inclut dans les tags suivants (`ea-android-referrer`).

---

## Pattern Builder

Tous les modèles du SDK utilisent une **classe Builder interne** avec une API fluente. La structure générale est :

```typescript
const tag = new ModelClass.Builder("chemin/de/la/page")
  .setUID("123")
  .setEmail("user@example.com")
  // ... autres méthodes
  .build();

EAnalytics.track(tag);
```

La méthode `.build()` crée l'instance finale. Chaque méthode du Builder renvoie `this`, les appels sont donc chaînables.

> **`path` (nom de la page) est obligatoire sur chaque tag.** Il n'est jamais déduit automatiquement. Utilisez une convention hiérarchique avec `|` comme séparateur, par exemple `"home|landing"`, `"catalogue|chaussures|homme"`, `"tunnel|paiement|confirmation"`. La valeur est libre mais doit être stable et significative pour le reporting.

> **Méthode générique `.set(key, value)`** : disponible sur tous les Builders, elle permet d'ajouter n'importe quel paramètre personnalisé non couvert par les méthodes dédiées. Exemple : `.set("abonnement", "mensuel")`.

---

## Types de tags

### Page générique — `EaGeneric`

À utiliser sur toutes les pages qui ne sont pas des fiches produit, panier, commande ou devis (y compris la homepage et les étapes intermédiaires du tunnel). Remonte le trafic site-centric, les pages vues, les visites et les sources naturelles.

**Import :**
```typescript
import EaGeneric from './src/models/eaGeneric';
```

**Méthodes du Builder :**

| Méthode | Description |
|---------|-------------|
| `new EaGeneric.Builder(path)` | Nom de la page **(obligatoire)** |
| `.setUID(uid)` | ID interne de l'utilisateur connecté ; consolide l'historique multi-device |
| `.setEmail(email)` | Adresse email de l'utilisateur — doit être hashée en SHA256LC |
| `.setProfile(profile)` | Profil utilisateur (ex. `visitor`, `buyer`, `looker`) |
| `.setPageGroup(group)` | Groupe de pages pour le reporting |
| `.setLocation(lat, lon)` | Coordonnées GPS de l'appareil |
| `.setNewCustomer(boolean)` | `true` si nouveau client |
| `.set(key, value)` | Paramètre personnalisé libre |
| `.setAction(action)` | Attache une action (remplace la précédente) |
| `.putAction(action)` | Accumule plusieurs actions sur le même tag |
| `.setProperty(property)` | Propriété site-centric (`SiteCentricProperty`) |
| `.setCFlag(cflag)` | Context flag (`SiteCentricCFlag`) |
| `.setStandalone()` | Ne compte pas comme page vue dans Eulerian |

```typescript
import EaGeneric from './src/models/eaGeneric';

const props = new EaGeneric.Builder("home|landing")
  .setUID("123asd")
  .setEmail("test@test.com")
  .setProfile("visitor")
  .setPageGroup("MY-PAGEGROUP")
  .set("abonnement", "mensuel")
  .build();

EAnalytics.track(props);
```

---

### Page produit — `EAProducts` (1 produit)

Suit les pages vues produit et alimente le rapport « Acquisition & Performance produit ». Un tag est considéré comme page produit quand il contient **exactement un** produit.

**Import :**
```typescript
import EAProducts from './src/models/eaProducts';
import Product from './src/models/classes/product';
import Params from './src/models/classes/params';
```

**Méthodes du Builder `Product` :**

| Méthode | Description |
|---------|-------------|
| `new Product.Builder(ref)` | Référence produit **(obligatoire)** |
| `.setName(name)` | Nom lisible du produit pour le reporting |
| `.setGroup(group)` | Groupe de marge (`A` ou `B`) |
| `.setParams(params)` | Catégories produit (ex. `prdparam-category`, `prdparam-brand`) |

**Méthodes du Builder `Params` :**

| Méthode | Description |
|---------|-------------|
| `new Params.Builder()` | Constructeur |
| `.addParam(key, value)` | Ajoute une paire clé/valeur (chaîne ou nombre) |

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

const page = new EAProducts.Builder("produit|fiche")
  .setUID("123asd")
  .setEmail("test@test.com")
  .setProfile("looker")
  .addProduct(product)
  .build();

EAnalytics.track(page);
```

---

### Page catégorie — `EAProducts` (N produits)

Envoie les N références produit affichées sur une page de résultats ou de catégorie. Un tag est considéré comme page catégorie quand il contient **plus d'un** produit.

Utilisez la même classe `EAProducts`, en passant plusieurs produits avec `.addProduct()`.

```typescript
import EAProducts from './src/models/eaProducts';
import Product from './src/models/classes/product';

const product1 = new Product.Builder("ref-product1").setName("Produit 1").build();
const product2 = new Product.Builder("ref-product2").setName("Produit 2").build();
const product3 = new Product.Builder("ref-product3").setName("Produit 3").build();

const page = new EAProducts.Builder("categorie|chaussures")
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

### Page moteur de recherche — `EASearch`

Suit les requêtes du moteur de recherche interne, le nombre de résultats et les paramètres de recherche.

**Import :**
```typescript
import EASearch from './src/models/eaSearch';
import Params from './src/models/classes/params';
```

**Méthodes du Builder :**

| Méthode | Description |
|---------|-------------|
| `new EASearch.Builder(path)` | Nom de la page **(obligatoire)** |
| `.setName(name)` | Nom du moteur de recherche **(obligatoire)** |
| `.setResults(count)` | Nombre de résultats retournés |
| `.setParams(params)` | Paramètres de recherche (couples clé/valeur correspondant à `isearchkey`/`isearchdata`) |
| `.setUID(uid)` | ID interne de l'utilisateur |
| `.set(key, value)` | Paramètre personnalisé libre |

```typescript
import EASearch from './src/models/eaSearch';
import Params from './src/models/classes/params';

const searchParams = new Params.Builder()
  .addParam("motcle", "veste")
  .addParam("prix_min", "100.00")
  .addParam("prix_max", "400.00")
  .build();

const page = new EASearch.Builder("moteur_interne|veste")
  .setUID("34678")
  .setName("moteur_interne")
  .setResults(150)
  .setParams(searchParams)
  .build();

EAnalytics.track(page);
```

---

### Page erreur 404 — `EaGeneric`

Signalez une page d'erreur 404 en ajoutant `.set("error", "1")` à un tag `EaGeneric`. Alimente le rapport « Pages en erreur ».

```typescript
import EaGeneric from './src/models/eaGeneric';

const props = new EaGeneric.Builder("erreur|404")
  .set("error", "1")
  .build();

EAnalytics.track(props);
```

---

### Devis — `EAEstimate`

Suit les devis et les produits associés. Les devis sont dédoublonnés par référence : un second appel avec la même `ref` est ignoré.

**Import :**
```typescript
import EAEstimate from './src/models/eaEstimate';
import CurrencyISO from './src/utils/currencyISO';
```

**Méthodes du Builder :**

| Méthode | Description |
|---------|-------------|
| `new EAEstimate.Builder(path)` | Nom de la page **(obligatoire)** |
| `.setRef(ref)` | Référence unique du devis **(obligatoire)** |
| `.setAmount(amount)` | Montant total TTC (séparateur décimal : point) |
| `.setType(type)` | Type de devis selon votre propre référentiel |
| `.setCurrency(currency)` | Devise si différente de celle configurée dans l'interface |
| `.addProduct(product, amount, quantity)` | Ajoute un produit avec son montant unitaire et sa quantité |
| `.setUID(uid)` | ID interne de l'utilisateur |
| `.setEmail(email)` | Adresse email de l'utilisateur — doit être hashée en SHA256LC |
| `.set(key, value)` | Paramètre personnalisé libre |

```typescript
import EAEstimate from './src/models/eaEstimate';
import Product from './src/models/classes/product';
import CurrencyISO from './src/utils/currencyISO';

const product = new Product.Builder("505").setName("Produit devis").build();

const page = new EAEstimate.Builder("credit|devis")
  .setRef("C4536567")
  .setUID("123asd")
  .setEmail("test@test.com")
  .setAmount(5000.00)
  .setType("credit_48mois")
  .setCurrency(CurrencyISO.EUR)
  .set("custom-param-key", "custom-value")
  .addProduct(product, 5000.00, 1)
  .build();

EAnalytics.track(page);
```

---

### Panier — `EACart`

Suit les paniers commencés et permet le calcul des taux de conversion et d'abandon. La durée de vie d'un panier est de 30 minutes glissantes.

**Import :**
```typescript
import EACart from './src/models/eaCart';
```

**Méthodes du Builder :**

| Méthode | Description |
|---------|-------------|
| `new EACart.Builder(path)` | Nom de la page **(obligatoire)** |
| `.setCartCumul(boolean)` | `false` : les produits du tag représentent l'intégralité du panier (snapshot) ; `true` : les produits s'accumulent à chaque appel successif |
| `.addProduct(product, amount, quantity)` | Ajoute un produit avec son montant unitaire et sa quantité |
| `.setUID(uid)` | ID interne de l'utilisateur |
| `.setEmail(email)` | Adresse email de l'utilisateur — doit être hashée en SHA256LC |
| `.setProfile(profile)` | Profil de l'utilisateur |
| `.setPageGroup(group)` | Groupe de pages |
| `.set(key, value)` | Paramètre personnalisé libre |

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

const page = new EACart.Builder("panier")
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

### Commande — `EAOrder`

Suit les conversions et le ROI. Les commandes sont dédoublonnées par référence. Implémentez ce tag le plus tôt possible dans le tunnel de paiement pour ne pas le manquer si l'utilisateur ne revient pas sur l'app après la plateforme de paiement.

**Import :**
```typescript
import EAOrder from './src/models/eaOrder';
import CurrencyISO from './src/utils/currencyISO';
```

**Méthodes du Builder :**

| Méthode | Description |
|---------|-------------|
| `new EAOrder.Builder(path)` | Nom de la page **(obligatoire)** |
| `.setRef(ref)` | Référence unique de la commande **(obligatoire)** |
| `.setAmount(amount)` | Montant total TTC hors frais de port **(obligatoire)** |
| `.setPayment(payment)` | Moyen de paiement utilisé (ex. `credit card`, `paypal`) |
| `.setType(type)` | Type de vente selon votre propre référentiel |
| `.setCurrency(currency)` | Devise si différente de celle configurée dans l'interface |
| `.setNewCustomer(boolean)` | `true` : nouvel acheteur ; `false` : client fidèle |
| `.setEstimateRef(estimateRef)` | Référence du devis associé à cette commande |
| `.addProduct(product, amount, quantity)` | Ajoute un produit avec son montant unitaire et sa quantité |
| `.setUID(uid)` | ID interne de l'utilisateur |
| `.setEmail(email)` | Adresse email de l'utilisateur — doit être hashée en SHA256LC |
| `.setProfile(profile)` | Profil de l'utilisateur |
| `.set(key, value)` | Paramètre personnalisé libre |

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

const page = new EAOrder.Builder("tunnel|confirmation")
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

### Tracking marchandisage — `EATpView` / `EATpClick`

Suit les impressions et clics sur les blocs de marchandisage (listes de recommandation, bannières, etc.). Envoyés en **GET** sur `/tpview/` et `/tpclick/` — contrairement aux autres tags envoyés en POST. Supporte le même mécanisme de retry offline que le reste du SDK.

**Import :**
```typescript
import { EATpView, EATpClick } from './src/models/eaMerchandising';
```

**Méthodes du Builder `EATpView` (impression) :**

| Méthode | Description |
|---------|-------------|
| `new EATpView.Builder(path)` | Page de référence **(obligatoire)** |
| `.setSiteName(name)` | Nom du site marchand |
| `.setCampaign(campaign)` | Nom de la campagne |
| `.setPlacement(placement)` | Emplacement du bloc dans la page |
| `.addProduct(ref, position?)` | Référence produit et sa position dans le bloc ; répétez pour chaque produit affiché |
| `.setUrl(url)` | URL de contexte |
| `.setPublisher(publisher)` | Éditeur (optionnel) |
| `.setMedia(media)` | Type de média (optionnel) |
| `.setCategory(category)` | Catégorie du bloc (optionnel) |

**Méthodes du Builder `EATpClick` (clic) :**

| Méthode | Description |
|---------|-------------|
| `new EATpClick.Builder(path)` | Page de référence **(obligatoire)** |
| `.setSiteName(name)` | Nom du site marchand |
| `.setCampaign(campaign)` | Nom de la campagne |
| `.setPlacement(placement)` | Emplacement du bloc dans la page |
| `.setProduct(ref, position, totalProducts?)` | Référence et position du produit cliqué **(obligatoire)** ; troisième paramètre optionnel avec le nombre total de produits dans le bloc |
| `.setUrl(url)` | URL de contexte |
| `.setPublisher(publisher)` | Éditeur (optionnel) |
| `.setMedia(media)` | Type de média (optionnel) |
| `.setCategory(category)` | Catégorie du bloc (optionnel) |

```typescript
import { EATpView, EATpClick } from './src/models/eaMerchandising';

// Impression sur un bloc marchandisage
const view = new EATpView.Builder("homepage")
  .setSiteName("my-site")
  .setCampaign("summer_sale")
  .setPlacement("banner_top")
  .addProduct("PROD_001", 0)
  .addProduct("PROD_002", 1)
  .setUrl("https://www.example.com")
  .build();

EAnalytics.track(view);

// Clic sur un produit du bloc
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

Les actions permettent de tracker des interactions utilisateur (tunnel de souscription, questionnaire, navigation inter-sections, etc.) en dehors des pages vues classiques. Une action peut être attachée à n'importe quel tag via `.setAction()` (remplace toute action précédente) ou `.putAction()` (accumule plusieurs actions sur le même tag).

Pour envoyer une action sans page vue associée, appelez `.setStandalone()` sur le tag — le hit ne comptera pas comme page vue dans Eulerian.

**Import :**
```typescript
import Action from './src/models/classes/action';
import Params from './src/models/classes/params';
```

**Méthodes du Builder `Action` :**

| Méthode | Description |
|---------|-------------|
| `new Action.Builder()` | Constructeur |
| `.setName(name)` | Nom de l'action **(obligatoire)** |
| `.setMode(mode)` | Sens de l'action : `"in"` (entrée), `"out"` (sortie) ou `"neat"` |
| `.setLabel(label)` | Label de l'action |
| `.setReference(ref)` | Référence identifiant l'action dans vos systèmes |
| `.setParams(params)` | Paramètres supplémentaires clé/valeur |

**Action sur une page vue :**

```typescript
import EaGeneric from './src/models/eaGeneric';
import Action from './src/models/classes/action';

const action1 = new Action.Builder()
  .setName("souscription-etape1")
  .setMode("in")
  .setLabel("offre-premium")
  .build();

const action2 = new Action.Builder()
  .setName("souscription-etape1")
  .setMode("out")
  .setLabel("abandon")
  .build();

const props = new EaGeneric.Builder("souscription|etape1")
  .setUID("123asd")
  .putAction(action1)
  .putAction(action2)
  .build();

EAnalytics.track(props);
```

**Action standalone (sans page vue) :**

> `path` est optionnel avec `.setStandalone()`. Le Builder accepte `new EaGeneric.Builder()` sans argument.

```typescript
import EaGeneric from './src/models/eaGeneric';
import Action from './src/models/classes/action';
import Params from './src/models/classes/params';

const action = new Action.Builder()
  .setName("clic-cta")
  .setMode("in")
  .setLabel("hero-banner")
  .setParams(new Params.Builder()
    .addParam("provenance", "martinique")
    .build())
  .build();

const props = new EaGeneric.Builder()  // path omis pour standalone
  .setStandalone()   // ne compte pas comme page vue
  .setUID("123asd")
  .putAction(action)
  .build();

EAnalytics.track(props);
```

---

### Propriété site-centric — `SiteCentricProperty`

Associe des propriétés produit site-centric à n'importe quel tag. Même API variadic que `SiteCentricCFlag` mais alimente le champ `property` au lieu de `cflag`.

**Import :**
```typescript
import SiteCentricProperty from './src/models/classes/siteCentricProperty';
```

**Méthodes du Builder :**

| Méthode | Description |
|---------|-------------|
| `new SiteCentricProperty.Builder()` | Constructeur |
| `.set(key, ...values)` | Définit une dimension de propriété avec une ou plusieurs valeurs (variadic) |

```typescript
import EaGeneric from './src/models/eaGeneric';
import SiteCentricProperty from './src/models/classes/siteCentricProperty';

const property = new SiteCentricProperty.Builder()
  .set("univers", "poisson", "viande")
  .set("type", "frais")
  .build();

const props = new EaGeneric.Builder("home|landing")
  .setUID("123asd")
  .setProperty(property)
  .build();

EAnalytics.track(props);
```

---

### Context Flag (CFLAG) — `SiteCentricCFlag`

Associez un ou plusieurs context flags à n'importe quel tag pour enrichir vos rapports de dimensions contextuelles. Chaque flag accepte plusieurs valeurs.

**Import :**
```typescript
import SiteCentricCFlag from './src/models/classes/siteCentricCFlag';
```

**Méthodes du Builder :**

| Méthode | Description |
|---------|-------------|
| `new SiteCentricCFlag.Builder()` | Constructeur |
| `.set(key, ...values)` | Définit une dimension contextuelle avec une ou plusieurs valeurs (variadic) |

```typescript
import EaGeneric from './src/models/eaGeneric';
import SiteCentricCFlag from './src/models/classes/siteCentricCFlag';

const cflag = new SiteCentricCFlag.Builder()
  .set("categorie_1", "rolandgarros", "wimbledon")
  .set("categorie_2", "tennis")
  .set("categorie_3", "usopen")
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

Pour les applications hybrides ouvrant une WebView, passez l'identifiant interne du SDK dans l'URL d'ouverture pour assurer la continuité du tracking entre l'app native et la session web. Ajoutez aussi le paramètre `edev` pour qualifier le trafic comme natif.

Le paramètre `ea-euidl-bypass` doit porter l'**identifiant persistant du dispositif** que le SDK inclut dans chaque hit — pas l'identifiant publicitaire. Le SDK React Native n'expose pas de méthode `getEuidl()` dédiée, récupérez-le directement depuis `react-native-device-info` :

- **Android** — Android ID (`euidl` dans le SDK) : `DeviceInfo.getAndroidId()`
- **iOS** — IDFV (`ea-ios-idfv` dans le SDK) : `DeviceInfo.getUniqueId()`

> `EAnalytics.getAdInfoId()` retourne l'**identifiant publicitaire** (IDFA / GAID), qui est un identifiant différent et ne doit **pas** être utilisé pour `ea-euidl-bypass`.

```typescript
import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

const euidl = Platform.OS === 'android'
  ? await DeviceInfo.getAndroidId()
  : await DeviceInfo.getUniqueId();

// Construire l'URL avec les paramètres obligatoires
const baseUrl = "https://www.example.com/landing";
const edev = Platform.OS === 'android' ? "AppNativeAndroidphone" : "AppNativeIOSphone";
const webViewUrl = `${baseUrl}?ea-euidl-bypass=${encodeURIComponent(euidl)}&edev=${edev}`;

// Charger dans la WebView
<WebView source={{ uri: webViewUrl }} />
```

Valeurs acceptées pour `edev` :

| Valeur | Appareil |
|--------|----------|
| `AppNativeIOSphone` | iPhone |
| `AppNativeIOStablet` | iPad |
| `AppNativeAndroidphone` | Téléphone Android |
| `AppNativeAndroidtablet` | Tablette Android |

> `ea-euidl-bypass` doit être présent à **chaque changement d'URL** dans la WebView, sinon le lien entre navigation app et web est perdu.

---

## Métriques application

Suivez les téléchargements et mises à jour en incluant ces paramètres dans le premier tag envoyé au lancement de l'application.

| Paramètre | Valeur | Description |
|-----------|--------|-------------|
| `ea-appname` | Nom de l'app | Identifiant app — **ne doit jamais changer** — collecté automatiquement par le SDK |
| `ea-appversion` | Chaîne de version | Version courante — collectée automatiquement par le SDK |
| `ea-appinstalled` | `1` | À passer manuellement si l'app existait avant l'intégration Eulerian |

Ces paramètres sont collectés **automatiquement** par le SDK à chaque hit via `react-native-device-info`. Vous n'avez rien à faire sauf passer `ea-appinstalled` lors d'une migration.

**Logique système :**
- La métrique **Téléchargement** est incrémentée quand `ea-appname` est vu pour la première fois pour cet utilisateur (sans `ea-appinstalled`).
- La métrique **Mise à jour** est incrémentée quand `ea-appname` est inchangé mais `ea-appversion` a une nouvelle valeur par rapport au dernier lancement.

**Migration (app existante avant Eulerian) :**

```typescript
import EaGeneric from './src/models/eaGeneric';

const props = new EaGeneric.Builder("home|landing")
  .set("ea-appinstalled", "1")
  .build();

EAnalytics.track(props);
```

---

## Consentement (RGPD)

> Les deux modes ci-dessous sont **mutuellement exclusifs**. Choisissez-en un et ne les utilisez jamais ensemble dans la même application.

### Mode 1 — TCF v2 (`gdpr_consent`)

Transmettez la TCString générée par votre CMP une seule fois par visiteur, au moment où l'utilisateur exprime son opt-in ou opt-out.

```typescript
import EaGeneric from './src/models/eaGeneric';

const props = new EaGeneric.Builder("univers|rubrique|page")
  .setUID("5434742")
  .set("abonnement", "mensuel")
  .set("gdpr_consent", "EADURF214345") // votre TCString
  .build();

EAnalytics.track(props);
```

### Mode 2 — Catégories (`pmcat`)

Passez les IDs Eulerian des catégories **refusées**, séparés par `-`. Envoyez `-` seul si l'utilisateur accepte toutes les catégories.

```typescript
import EaGeneric from './src/models/eaGeneric';

const props = new EaGeneric.Builder("univers|rubrique|page")
  .setUID("5434742")
  .set("abonnement", "mensuel")
  .set("pmcat", "1-10") // IDs des catégories refusées
  .build();

EAnalytics.track(props);
```

Exemple de mapping des catégories :

| Catégorie | ID Eulerian |
|-----------|-------------|
| analytics | 1 |
| publicité | 10 |
| fonctionnel | 19 |

*Exemple : l'utilisateur refuse analytics + publicité → `pmcat` = `1-10`*

### Récapitulatif

| | Mode TCF v2 | Mode Catégories |
|---|---|---|
| **Paramètre** | `gdpr_consent` | `pmcat` |
| **Quand** | Lors de l'opt-in/out | Lors de l'opt-in/out |
| **Contenu** | TCString | IDs refusés ou `-` |
| **Compatibilité CMP** | CMP TCF v2 | CMP maison / non-TCF |

---

## Notes par plateforme

**Android TV :** `PersistentIdentity.getAdvertisingId()` n'est pas supporté sur Android TV et ne retournera pas l'Advertising ID de l'appareil en raison d'une limitation React Native sur cette plateforme.

**iOS — IDFA :** le SDK collecte automatiquement l'IDFA si l'utilisateur a accordé l'autorisation via `ATTrackingManager`. Aucune configuration supplémentaire n'est requise côté SDK au-delà de la déclaration `NSUserTrackingUsageDescription` dans `Info.plist`.

**Android — Advertising ID :** le SDK collecte automatiquement le GAID (Google Advertising ID) via `@sparkfabrik/react-native-idfa-aaid`. Si l'utilisateur a activé « Désactiver la personnalisation des annonces », le flag LAT (`ea-android-islat`) sera `true`.
