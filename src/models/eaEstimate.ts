import EaGeneric from "./eaGeneric";
import Helper from "../utils/helper";
import Product from "./classes/product";

const KEY_AMOUNT = "amount";
const KEY_QUANTITY = "quantity";

class EAEstimate extends EaGeneric{
  properties: any;
  constructor(builder: any) {
    super(builder);
  }

  getProperties() {
    return this.properties;
  }

  static Builder = class extends EaGeneric.Builder {
    properties: Record<string, any>;
    path: string;
    ref: string;
    constructor(path: string) {
      super(path);
      this.properties = {
        products: []
      };
      this.path = path;
      this.ref = "";
      this.init();
    }

    static async create(path: string) {
      const builder = new EAEstimate.Builder(path);
      await builder.initInternalParams();
      return builder;
    }
  
    init() {
      this.set('estimate', '1');
    }

    setRef(ref: string) {
      this.set("ref", ref);
      return this;
    }

    set(key: string, value: any) {
      this.properties[key] = value;
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
      productJson[KEY_AMOUNT] = amount;
      productJson[KEY_QUANTITY] = quantity;
      this.properties.products.push(productJson);
      return this;
    }
  
    build() {
      return new EAEstimate(this);
    }
  }
  
}

export default EAEstimate;