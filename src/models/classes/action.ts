import Params from "./params";

class Action {
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

    setName(name: string) {
      this.mainJson.name = name;
      return this;
    }

    setReference(ref: string) {
      this.mainJson.ref = ref;
      return this;
    }

    setMode(mode: string) {
      this.mainJson.mode = mode;
      return this;
    }

    setParams(params: Params) {
      this.mainJson.params = params.getJson();
      return this;
    }

    setLabel(label: string) {
      this.mainJson.label = label;
      return this;
    }

    build() {
      return new Action(this);
    }
  }

}

export default Action;