export interface PropChange<T> {
  firstChange: boolean;
  previousValue: T;
  currentValue: T;
  isFirstChange: () => boolean;
}

export function OnChange<T, Self>(
  callback: (value: T, self: Self, simpleChange?: PropChange<T>) => void,
) {
  let _cachedValue: T;
  let _isFirstChange = true;
  return (target: Self, key: PropertyKey) => {
    Object.defineProperty(target, key, {
      set: function (value) {
        // No operation if new value is same as old value
        if (!_isFirstChange && _cachedValue === value) {
          return;
        }
        const oldValue = _cachedValue;
        _cachedValue = value;
        const simpleChange: PropChange<T> = {
          firstChange: _isFirstChange,
          previousValue: oldValue,
          currentValue: _cachedValue,
          isFirstChange: () => _isFirstChange,
        };
        _isFirstChange = false;
        callback.call(this, _cachedValue, this, simpleChange);
      },
      get: function () {
        return _cachedValue;
      },
    });
  };
}

export function NgOnChange() {}
