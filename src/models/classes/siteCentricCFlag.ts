class SiteCentricCFlag {
  mJson: any;
  constructor(builder: any) {
    this.mJson = builder.jsonUnderConstruction;
  }

  getJson() {
    return this.mJson;
  }

  static Builder = class {
    jsonUnderConstruction: Record<string, any>;
    constructor() {
      this.jsonUnderConstruction = {};
    }

    set(key: string, ...values: any[]) {
      const jsonArray:any = [];
      for (const value of values) {
        jsonArray.push(value);
      }
      this.jsonUnderConstruction[key] = jsonArray;
      return this;
    }

    build() {
      if (Object.keys(this.jsonUnderConstruction).length === 0) {
        const clzName = 'SiteCentricCFlag';
        console.warn(
          `${clzName}: You might want to provide at least one set of key values to make ${clzName} valid.`
        );
      }
      return new SiteCentricCFlag(this);
    }
  }
}


export default SiteCentricCFlag;