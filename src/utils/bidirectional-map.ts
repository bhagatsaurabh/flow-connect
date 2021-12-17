// This is strictly for one-to-one mapping, many-to-one mapping will not work
export class BiMap<K, V> {
  map: Map<K | V, V | K>;
  reverseMap: Map<V | K, K | V>;

  constructor() {
    this.map = new Map();
    this.reverseMap = new Map();
  }

  get(keyOrVal: K | V): V | K {
    return this.map.get(keyOrVal) || this.reverseMap.get(keyOrVal);
  }
  set(key: K | V, value: V | K) {
    this.map.set(key, value);
    this.reverseMap.set(value, key);
  }
  has(keyOrVal: K | V): boolean {
    return this.map.has(keyOrVal) || this.reverseMap.has(keyOrVal);
  }
  delete(keyOrVal: K | V) {
    let temp1 = this.map.get(keyOrVal);
    let temp2 = this.reverseMap.get(keyOrVal);
    if (typeof temp1 !== 'undefined') { this.map.delete(keyOrVal); }
    if (typeof temp2 !== 'undefined') { this.reverseMap.delete(keyOrVal); }

    // I have a gut feeling that this is required, for some edge case that I cannot grab from my subconscious mind
    this.map.delete(temp1);
    this.reverseMap.delete(temp1);
    this.map.delete(temp2);
    this.reverseMap.delete(temp2);
  }
  clear() {
    this.map.clear();
    this.reverseMap.clear();
  }
}
