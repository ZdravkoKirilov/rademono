export class ContextManager {

  private handlers: Map<any, Set<Function>> = new Map();

  private data: Map<any, any> = new Map();

  set(key: any, value: any) {
    this.data.set(key, value);
    const callbacks = this.handlers.get(key);
    if (callbacks) {
      callbacks.forEach(cb => cb(value));
    }
  }

  get(key: any) {
    return this.data.get(key);
  }

  subscribe = (key: any, callback: Function) => {
    const self = this;
    if (this.handlers.get(key)) {
      this.handlers.set(key, new Set());
    }
    this.handlers.get(key)!.add(callback);
    callback(this.data.get(key));

    return {
      unsubscribe() {
        self.handlers.get(key)!.delete(callback);
      }
    }
  }
}