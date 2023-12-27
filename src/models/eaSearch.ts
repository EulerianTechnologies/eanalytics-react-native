import EAProperties from "./eaProperties";
import Params from "./classes/params";

class EASearch extends EAProperties{
  mJson: any;
  constructor(builder: any) {
    super(builder);
    this.mJson = builder.mainJson;
  }

  static Builder = class extends EAProperties.Builder {
    mainJson: Record<string, any>;
    engine: Record<string, any>;
    path: string;
    constructor(path: string) {
      super(path);
      this.mainJson = {};
      this.engine = {};
      this.path = path;
      this.init();
    }

    init() {
      this.set('isearchengine', this.engine);
    }

    set(key: string, value: any) {
      this.mainJson[key] = value;
      return this;
    }

    setName(name: string) {
      this.engine.name = name;
      return this;
    }

    setResults(results: number) {
      this.engine.results = results;
      return this;
    }

    setParams(params: Params) {
      this.engine.params = params.getJson();
      return this;
    }

    build() {
      return new EASearch(this);
    }
  }
}

export default EASearch;