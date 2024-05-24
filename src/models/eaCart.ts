import EaGeneric from "./eaGeneric";
import Helper from "../utils/helper";
import Product from "./classes/product";

const KEY_SCART = "scart";
const KEY_CUMUL = "scartcumul";
const KEY_AMOUNT = "amount";
const KEY_QUANTITY = "quantity";
const KEY_PRODUCTS = "products";

class EACart extends EaGeneric {
  private jsonProducts: Record<string, any>;

  constructor(properties: any) {
    super(properties);
    this.jsonProducts = properties.mainJson;
  }

  static Builder = class extends EaGeneric.Builder {
    private mainJson: Record<string, any>;

    constructor(path: string) {
      super(path)
      this.mainJson = [];
      super.set(KEY_SCART, "1");
    }

    static async create(path: string) {
      const builder = new EACart.Builder(path);
      await builder.initInternalParams();
      return builder;
    }

    setCartCumul(cumul: boolean) {
      super.set(KEY_CUMUL, cumul ? 1 : 0);
      return this;
    }

    addParam(key: string, value: any) {
      this.mainJson[key] = value;
      return this;
    }

    addProduct(product: Product, amount: number, quantity: number) {
      const productJson = product.getJson();
      productJson[KEY_AMOUNT] = amount;
      productJson[KEY_QUANTITY] = quantity;
      this.mainJson.push(productJson);
      return this;
    }

    build() {
      var eaProducts = new EACart(this);
      super.set(KEY_PRODUCTS, eaProducts.jsonProducts);
      return eaProducts;
    }
  };
}

export default EACart;