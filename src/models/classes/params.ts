class Params {
  private mJson: Record<string, any>; // Dichiarazione della proprietà mJson

  constructor(properties: any) {
    this.mJson = properties.mainJson;
  }

  getJson() {
    return this.mJson;
  }

  static Builder = class {
    mainJson: Record<string, any>;

    constructor() {
      this.mainJson = {};
    }

    addParam(key: string, value: any) {
      this.mainJson[key] = value;
      return this;
    }

    build() {
      return new Params(this);
    }
  };
}

export default Params;