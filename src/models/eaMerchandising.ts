import EaGeneric from "./eaGeneric";

// === Keys EATpView (Impression) ===
export const KEY_DYNTPVIEW = "dyntpview";
export const KEY_TPVIEWPRD = "tpviewprd";

// === Keys EATpClick (Click) ===
const KEY_DYNTPCLICK = "dyntpclick";
const KEY_PRODUCT_REF = "ecprdr";
const KEY_PRODUCT_POS = "ecpos";
const KEY_TOTAL_PRODUCT = "ecnbr";
export const KEY_TPCLICKPRODUCT = "tpclickproduct";


// ---------------------------------------------------------------------------
// EATpView — Tracks impressions of products inside a promotional block
// ---------------------------------------------------------------------------
class EATpView extends EaGeneric {
    readonly type = "EATpView";
    private _siteName: string = "";
    private _campaignName: string = "";
    private _placement: string = "";
    private _publisher: string = "";
    private _media: string = "";
    private _category: string = "";
    private _url: string = "";
    private _tpviewProducts: [string, number?][] = [];

    constructor(builder: any) {
      super(builder);
      this._siteName = builder._siteName;
      this._campaignName = builder._campaignName;
      this._placement = builder._placement;
      this._publisher = builder._publisher;
      this._media = builder._media;
      this._category = builder._category;
      this._url = builder._url;
      this._tpviewProducts = builder._tpviewProducts;
    }

  static fromRawData(rawData: any): EATpView {
    const props = rawData.properties[KEY_DYNTPVIEW];
    const builder = new EATpView.Builder(rawData.path || "");

    if (props && typeof props === 'object') {
      if (props.siteName) builder.setSiteName(props.siteName);
      if (props.campaign) builder.setCampaign(props.campaign);
      if (props.placement) builder.setPlacement(props.placement);
      if (props.publisher) builder.setPublisher(props.publisher);
      if (props.media) builder.setMedia(props.media);
      if (props.category) builder.setCategory(props.category);
      if (props.url) builder.setUrl(props.url);
    }

    const products = rawData.properties[KEY_TPVIEWPRD];
    if (Array.isArray(products)) {
      products.forEach(([ref, pos]) => builder.addProduct(ref, pos));
    }

    return builder.build();
  }

  toQueryString(): string {  
      const randomNum = Math.floor(Math.random() * 1000000000);

      let url = `${encodeURIComponent(this._siteName)}/${encodeURIComponent(this._campaignName)}/${encodeURIComponent(this._placement)}/${encodeURIComponent(this._siteName)}/generic/${randomNum}?`;

      const products: [string, number?][] = this._tpviewProducts || [];
      products.forEach((prod, index) => {
        const ref = prod[0];
        const pos = prod[1];
        url += `evprdr${index}=${encodeURIComponent(ref)}&`;
        if (pos !== undefined) {
          url += `evprdpos${index}=${pos}&`;
        }
      });

      
      if (this._url) {
        url += `url=${encodeURIComponent(this._url)}&`;
      }

      return url;
    }

  static Builder = class extends EaGeneric.Builder {
    private _siteName: string = "";
    private _campaignName: string = "";
    private _placement: string = "";
    private _publisher: string = "";
    private _media: string = "";
    private _category: string = "";
    private _url: string = "";
    private _tpviewProducts: [string, number?][] = [];

    constructor(path: string) {
      super(path);
    }

    static async create(path: string) {
      const builder = new EATpView.Builder(path);
      await builder.initInternalParams();
      return builder;
    }

    setSiteName(value: string) {
      this._siteName = value;
      return this;
    }

    setCampaign(value: string) {
      this._campaignName = value;
      return this;
    }

    setPlacement(value: string) {
      this._placement = value;
      return this;
    }

    setPublisher(value: string) {
      this._publisher = value;
      return this;
    }

    setMedia(value: string) {
      this._media = value;
      return this;
    }

    setCategory(value: string) {
      this._category = value;
      return this;
    }

    setUrl(value: string) {
      this._url = value;
      return this;
    }
    
    addProduct(ref: string, position?: number) {
      this._tpviewProducts.push(position !== undefined ? [ref, position] : [ref]);
      return this;
    }

    build() {
      const instance = new EATpView(this);
      instance._siteName = this._siteName;
      instance._campaignName = this._campaignName;
      instance._placement = this._placement;
      instance._publisher = this._publisher;
      instance._media = this._media;
      instance._category = this._category;
      instance._url = this._url;
      instance._tpviewProducts = this._tpviewProducts;

      this.properties[KEY_DYNTPVIEW] = [
        this._siteName,
        this._campaignName,
        this._placement,
        this._publisher,
        this._media,
        this._category,
        this._url,
      ];
      this.properties[KEY_TPVIEWPRD] = this._tpviewProducts;
      return instance;
    }
  };
}


// ---------------------------------------------------------------------------
// EATpClick — Tracks a click on a product inside a promotional block
// ---------------------------------------------------------------------------
class EATpClick extends EaGeneric {
  readonly type = "EATpClick";
    private _siteName: string = "";
    private _campaignName: string = "";
    private _placement: string = "";
    private _publisher: string = "";
    private _media: string = "";
    private _category: string = "";
    private _url: string = "";
    private _product: { ref: string; position: number; totalProducts?: number } = { ref: "", position: 0 };
    
  constructor(builder: any) {
    super(builder);
  }

  static fromRawData(rawData: any): EATpClick {
    const props = rawData.properties[KEY_DYNTPCLICK];
    const builder = new EATpClick.Builder(rawData.path || "");

    if (props && typeof props === 'object') {
      if (props.siteName) builder.setSiteName(props.siteName);
      if (props.campaign) builder.setCampaign(props.campaign);
      if (props.placement) builder.setPlacement(props.placement);
      if (props.publisher) builder.setPublisher(props.publisher);
      if (props.media) builder.setMedia(props.media);
      if (props.category) builder.setCategory(props.category);
      if (props.url) builder.setUrl(props.url);
    }

    const product = rawData.properties[KEY_TPCLICKPRODUCT];
    if (typeof product === 'object') {
      builder.setProduct(product.ref, product.position, product.totalProducts);
    }

    return builder.build();
  }

  toQueryString(): string {  
      const randomNum = Math.floor(Math.random() * 1000000000);

      let url = `${encodeURIComponent(this._siteName)}/${encodeURIComponent(this._campaignName)}/${encodeURIComponent(this._placement)}/${encodeURIComponent(this._siteName)}/generic/${randomNum}?`;

      const product: { ref: string; position: number; totalProducts?: number } = this._product;
      url += `${KEY_PRODUCT_REF}=${encodeURIComponent(product.ref)}&${KEY_PRODUCT_POS}=${encodeURIComponent(product.position)}&`;
      if (product.totalProducts !== undefined) {
          url += `${KEY_TOTAL_PRODUCT}=${encodeURIComponent(product.totalProducts)}&`;
        }
      
      if (this._url) {
        url += `url=${encodeURIComponent(this._url)}&`;
      }

      return url;
    }

  static Builder = class extends EaGeneric.Builder {
    private _siteName: string = "";
    private _campaignName: string = "";
    private _placement: string = "";
    private _publisher: string = "";
    private _media: string = "";
    private _category: string = "";
    private _url: string = "";
    private _product: { ref: string; position: number; totalProducts?: number } = { ref: "", position: 0 };

    constructor(path: string) {
      super(path);
    }

    static async create(path: string) {
      const builder = new EATpClick.Builder(path);
      await builder.initInternalParams();
      return builder;
    }

    setSiteName(value: string) {
      this._siteName = value;
      return this;
    }

    setCampaign(value: string) {
      this._campaignName = value;
      return this;
    }

    setPlacement(value: string) {
      this._placement = value;
      return this;
    }

    setPublisher(value: string) {
      this._publisher = value;
      return this;
    }

    setMedia(value: string) {
      this._media = value;
      return this;
    }

    setCategory(value: string) {
      this._category = value;
      return this;
    }

    setUrl(value: string) {
      this._url = value;
      return this;
    }

    setProduct(ref: string, position: number, totalProducts?: number) {
      this._product = { ref, position, totalProducts };
      return this;
    }

    build() {
      const instance = new EATpClick(this);
      instance._siteName = this._siteName;
      instance._campaignName = this._campaignName;
      instance._placement = this._placement;
      instance._publisher = this._publisher;
      instance._media = this._media;
      instance._category = this._category;
      instance._url = this._url;
      instance._product = this._product;

      this.properties[KEY_DYNTPCLICK] = [
        this._siteName,
        this._campaignName,
        this._placement,
        this._publisher,
        this._media,
        this._category,
        this._product
      ];
      return instance;
    }
  };
}


export { EATpView, EATpClick };
