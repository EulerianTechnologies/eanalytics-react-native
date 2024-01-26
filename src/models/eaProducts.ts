import EaGeneric from "./eaGeneric";
import Helper from "../utils/helper";
import Product from "./classes/product";

const KEY_PRODUCTS = "products";


class EAProducts extends EaGeneric {
  mJson: any;

  // Dichiarazione della proprietà mJson

  constructor(builder: any) {
    super(builder);
    this.mJson = builder.mainJson;
  }

  static Builder = class extends EaGeneric.Builder{
    private mainJson: Record<string, any>;
    private jsonProducts: Record<string, any>[] = [];

    constructor(reference: string) {
      super(reference);
      this.mainJson = {
        ref: reference,
      };
    }

    addProduct(product: Product) {
      this.jsonProducts.push(product.getJson());
      return this;
    }

    build() {
      var eaProducts = new EAProducts(this);
      super.set(KEY_PRODUCTS, this.jsonProducts);
      return eaProducts;
    }
  };
}

export default EAProducts;