class EventEmitter {
  constructor(){ this._l = {}; }
  addListener(t, f){ (this._l[t] = this._l[t] || []).push(f); return {remove(){}}; }
  emit(t, ...a){ (this._l[t]||[]).forEach(f => f(...a)); }
}
module.exports = EventEmitter;
module.exports.default = EventEmitter;
