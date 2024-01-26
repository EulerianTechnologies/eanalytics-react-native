import EaGeneric from "./eaGeneric";
import Params from "./classes/params";

class EASearch extends EaGeneric{
  properties: any;

  constructor(properties: any) {
    super(properties);
  }

  static Builder = class extends EaGeneric.Builder {
    properties: Record<string, any>;
    path: string;
    constructor(path: string) {
      super(path);
      this.properties = {};
      this.path = path;
    }

    set(key: string, value: any) {
      this.properties[key] = value;
      return this;
    }

    setName(name: string) {
      this.properties.isearchengine = name;
      return this;
    }

    setResults(results: number) {
      this.properties.isearchresults = results;
      return this;
    }

    setParams(params: Params) {
      this.properties.isearchparams = params.getJson();
      return this;
    }

    build() {
      return new EASearch(this);
    }
  }
}

export default EASearch;