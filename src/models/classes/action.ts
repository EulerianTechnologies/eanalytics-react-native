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
    outsJson: Record<string, any>;
    constructor() {
      this.mainJson = {};
      this.outsJson = [];
    }

    setReference(ref: string) {
      this.mainJson.ref = ref;
      return this;
    }

    setIn(inValue: string) {
      this.mainJson.in = inValue;
      return this;
    }

    addOut(...outs: string[]) {
      this.outsJson.push(...outs);
      return this;
    }

    build() {
      if (this.outsJson.length > 0) {
        this.mainJson.out = this.outsJson;
      }
      if (!this.mainJson.in && (!this.mainJson.out || this.mainJson.out.length === 0)) {
        console.warn(
          'Action: One of setIn() or addOut() method must be called to create a valid Action.'
        );
      }
      return new Action(this);
    }
  }

}

export default Action;