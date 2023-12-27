import EAProperties from "./eaProperties";
import Helper from "../utils/helper";
import Product from "./classes/product";

const KEY_SCART = "scart";
const KEY_CUMUL = "scartcumul";
const KEY_AMOUNT = "amount";
const KEY_QUANTITY = "quantity";
const KEY_PRODUCTS = "products";

class EACart extends EAProperties {
  private jsonProducts: Record<string, any>;

  constructor(properties: any) {
    super(properties);
    this.jsonProducts = properties.mainJson;
  }

  static Builder = class extends EAProperties.Builder {
    private mainJson: Record<string, any>;

    constructor(path: string) {
      super(path)
      this.mainJson = {};
      super.set(KEY_SCART, "1");
    }

    setCartCumul(cumul: boolean) {
      super.set(KEY_CUMUL, cumul ? 1 : 0);
    }

    addProduct(product: Product, amount: number, quantity: number) {
      this.mainJson = product.getJson();
      this.mainJson[KEY_AMOUNT] = amount;
      this.mainJson[KEY_QUANTITY] = quantity;

    }

    build() {
      var eaProducts = new EACart(this);
      super.set(KEY_PRODUCTS, eaProducts.jsonProducts);
      return eaProducts;
    }
  };
}

export default EACart;