class SiteCentricProperty {
  mJson: any;
  constructor(builder: any) {
    this.mJson = builder.mainJson;
  }

  getJson() {
    return this.mJson;
  }

  static Builder = class {
    mainJson: Record<string, any>;
    constructor() {
      this.mainJson = {};
    }

    set(key: string, ...values: any[]) {
      const jsonArray:any = [];
      for (const value of values) {
        jsonArray.push(value);
      }
      this.mainJson[key] = jsonArray;
      return this;
    }

    build() {
      if (Object.keys(this.mainJson).length === 0) {
        const clzName = 'SiteCentricProperty';
        console.warn(
          `${clzName}: You might want to provide at least one key to make ${clzName} valid.`
        );
      }
      return new SiteCentricProperty(this);
    }
  }
}

export default SiteCentricProperty;