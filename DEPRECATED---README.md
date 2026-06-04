# EAnalytics - ReactNative Application

## SDK
React version : `>=18.2.0`  
ReactNative version: `>0.72.4`  
Node Version: `>=16`


## Initialization


Call `Eulerian.init` **ONCE** before any tracking request at the top-level of your app.  
It will try to sync any failed tracking attemps locally stored.

```javascript  
 EAnalytics.init("dem.eulerian.net");  
```  


To track any Eulerian Item call `Eulerian.track` from anywhere in your ReactNative app.  
If the POST request fails, it will be stored in local storage for future retry.


## Examples

EaGeneric include EACart, EAEstimate, EAOrder, EACart, EAProducts, EASearch.

  ```javascript  
  //EAOrder
    var maVente = new EAOrder.Builder("test-path")

.setRef("test-ref-antonio-5")

.setAmount(432)

.setCurrency(CurrencyISO.EUR)

.setType("test-type")

.setPayment("test-payment")

.setEstimateRef("test-estimate-ref")

.addProduct(pates, 32.32, 1)

.addProduct(lardons, 3.01, 21)

.build();

  

EAnalytics.track(maVente);
  ```  


```javascript  
//EAEstimate
const monDevis = new EAEstimate.Builder("test-path")

.setRef("test-ref")

.setAmount(432)

.setCurrency(CurrencyISO.EUR)

.setType("test-type")

.addProduct(pates, 32.111, 1)

.addProduct(lardons, 3.99, 21)

.build();

  

EAnalytics.track(monDevis); 
```  

```javascript  
//EACart
var monPanier = new EACart.Builder("path-cart")

.setCartCumul(true)

.addProduct(moufle, 2.52, 42)

.addProduct(bonnet, 2.123, 4)

.build();

  

EAnalytics.track(monPanier);
```  

```javascript  
//EASearch
var search = new EASearch.Builder("search-path")

.setName("banane")

.setParams(new Params.Builder()

.addParam("provenance", "martinique")

.addParam("couleur", "jaune")

.build())

.setResults(432)

.build();

  

EAnalytics.track(search); 
```  

```javascript  
//EAProducts
var products = new EAProducts.Builder("test-path")

.setEmail("prenom.nom@mail.com")

.setLocation(latitude, longitude)

.addProduct(product1)

.addProduct(product2)

.build();

  

EAnalytics.track(products);
```  
```javascript  
//EAGeneric
let properties = new EaGeneric.Builder("the_path")

.setNewCustomer(true)

.setEmail("test-email")

.setPageGroup("test-group")

.setLocation(latitude, longitude)

.setProfile("test-profile")

.setUID("test-uid")

.set("whatever", "...")

.set("whatever1", "...")

.set("whatever2", "...")

.setAction(new Action.Builder()

.setReference("test-ref-\"fefds$432`^")

.setIn("in-test")

.addOut("tata", "tutu", "tete")

.build())

.setProperty(new SiteCentricProperty.Builder()

.set("cle1", ["poisson", "viande"])

.set("cle2", "choucroute")

.build())

.setCFlag(new SiteCentricCFlag.Builder()

.set("categorie_1", "rolandgarros", "wimbledon")

.set("categorie_2", "tennis")

.set("categorie_3", "usopen")

.build())

.build();

  

EAnalytics.track(properties);
```

## Merchandise tracking (EATpView / EATpClick)

A dedicated **merchandise** tracking flow has been added to send impressions and clicks on product showcases, recommendation lists and similar surfaces.

Two new trackable properties, modeled as subclasses of `EaGeneric`:

- **EATpView** — impression events, sent on `GET /tpview/`
- **EATpClick** — click events, sent on `GET /tpclick/`

Unlike the existing events (`EACart`, `EAOrder`, `EAEstimate`, `EASearch`, `EAProducts`), which are POSTed to the standard tracking endpoint, merchandise events are sent as **GET** requests on the two new dedicated paths. They share the same offline retry mechanism as the rest of the SDK: if the request fails, the payload is stored locally and replayed on the next tracking call or on the next app launch.

### What's new

- New `src/models/eaMerchandising.ts` module exposing the `EATpView` and `EATpClick` models.
- `src/utils/httpHelper.ts`: GET support added.
- `src/utils/propertiesTracker.ts` and `src/utils/storedPropertiesTracker.ts`: per-type event routing and typed replay of locally stored events.
- `src/eAnalytics.ts`: merchandise events are sent as GET requests on `/tpview/` and `/tpclick/`.

### Example

```javascript
// Impression on a merchandise block — sent on GET /tpview/
const view = new EATpView.Builder("homepage")
  .setSiteName("my-site")
  .setCampaign("summer_sale")
  .setPlacement("banner_top")
  .addProduct("PROD_001", 0)
  .addProduct("PROD_002", 1)
  .setUrl("http://eulerian.net")
  .build();
EAnalytics.track(view);

// Click on a product inside that block — sent on GET /tpclick/
const click = new EATpClick.Builder("homepage")
  .setSiteName("my-site")
  .setCampaign("summer_sale")
  .setPlacement("banner_top")
  .setProduct("PROD_001", 2)
  .setUrl("http://eulerian.net")
  .build();
EAnalytics.track(click);
```


### Platform differences
On AndroidTV the method `PersistentIdentity.getAdvertisingId()` is unsupported and won't return the device Advertise Id due to ReactNative's platform limitation.
  

