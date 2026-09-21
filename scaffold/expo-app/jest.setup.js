jest.mock('react-native-mmkv', () => {
  class MMKV {
    store = new Map();
    getString(key) {
      return this.store.get(key);
    }
    set(key, value) {
      this.store.set(key, value);
    }
    remove(key) {
      this.store.delete(key);
    }
    delete(key) {
      this.store.delete(key);
    }
    contains(key) {
      return this.store.has(key);
    }
  }
  return {
    MMKV,
    createMMKV: () => new MMKV(),
  };
});
