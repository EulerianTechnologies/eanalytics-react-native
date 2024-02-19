import EaGeneric from "./eaGeneric";
import Product from "./classes/product";

class EAEstimate extends EaGeneric{
  mJson: any;
  constructor(builder: any) {
    super(builder);
    this.mJson = builder.mainJson;
  }

  getJson() {
    return this.mJson;
  }

  static Builder = class extends EaGeneric.Builder {
    mainJson: Record<string, any>;
    products: Record<string, any>;
    path: string;
    ref: string;
    constructor(path: string) {
      super(path);
      this.mainJson = {};
      this.products = [];
      this.path = path;
      this.ref = "";
      this.init();
    }
  
    init() {
      this.set('estimate', '1');
    }

    setRef(ref: string) {
      this.set("ref", ref);
      return this;
    }

    set(key: string, value: any) {
      this.mainJson[key] = value;
      return this;
    }
  
    setAmount(amount: number) {
      this.set('amount', amount);
      return this;
    }
  
    setCurrency(currency: string) {
      this.set('currency', currency);
      return this;
    }
  
    setType(type: string) {
      this.set('type', type);
      return this;
    }
  
    addProduct(product: Product, amount: number, quantity: number) {
      if (quantity <= 0) {
        console.warn(
          `EAEstimate: quantity might be > 0. Current is ${quantity}`
        );
      }
      const productJson = product.getJson();
      productJson.amount = amount.toString();
      productJson.quantity = quantity;
      this.products.push(productJson);
      return this;
    }
  
    build() {
      this.set('products', this.products);
      return new EAEstimate(this);
    }
  }
  
}

export default EAEstimate;