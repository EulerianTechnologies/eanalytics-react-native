import EAProperties from "./eaProperties";
import Product from "./classes/product";

class EAOrder extends EAProperties {
  properties: any;
  constructor(builder: any) {
    super(builder);
  }

  getProperties() {
    return this.properties;
  }

  static Builder = class extends EAProperties.Builder{
    properties: Record<string, any>;
    path: string;
    constructor(path: string) {
      super(path)
      this.properties = {
        products: [],
      };
      this.path = path;
    }

    setRef(ref: string) {
      this.properties.ref = ref;
      return this;
    }

    setAmount(amount: number) {
      this.properties.amount = amount;
      return this;
    }

    setCurrency(currency: string) {
      this.properties.currency = currency;
      return this;
    }

    setType(type: string) {
      this.properties.type = type;
      return this;
    }

    setPayment(payment: string) {
      this.properties.payment = payment;
      return this;
    }

    setEstimateRef(estimateRef: string) {
      this.properties.estimateref = estimateRef;
      return this;
    }

    addProduct(product: Product, amount: number, quantity: number) {
      if (quantity <= 0) {
        console.warn(`EAOrder#addProduct(): quantity must be > 0. Current is ${quantity}`);
      }

      const productJson = product.getJson();
      productJson.amount = amount.toString();
      productJson.quantity = quantity;
      this.properties.products.push(productJson);
      return this;
    }

    getProperties() {
      return this.properties;
    }

    build() {
      return new EAOrder(this);
    }
  };
}

export default EAOrder;