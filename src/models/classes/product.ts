const KEY_REF = "ref";
const KEY_NAME = "name";
const KEY_PARAMS = "params";
const KEY_GROUP = "group";

class Product {
  private mJson: Record<string, any>; // Dichiarazione della proprietà mJson

  constructor(properties: any) {
    this.mJson = properties.mainJson;
  }

  getJson() {
    return this.mJson;
  }

  static Builder = class {
    private mainJson: Record<string, any>;

    constructor(reference: string) {
      this.mainJson = {};
      this.mainJson[KEY_REF] = reference;
    }

    setName(name: any) {
      this.mainJson[KEY_NAME] = name;
      return this;
    }

    setGroup(group: any) {
      this.mainJson[KEY_GROUP] = group;
      return this;
    }

    setParams(params: { getJson: () => any; }) {
      this.mainJson[KEY_PARAMS] = params.getJson();
      return this;
    }

    build() {
      return new Product(this);
    }
  };
}

export default Product;