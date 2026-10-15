/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports */
// Mock localStorage for Jest Node environment
const storage: Record<string, string> = {};

(global as any).localStorage = {
  getItem: (key: string) => (key in storage ? storage[key] : null),
  setItem: (key: string, value: string) => {
    storage[key] = String(value);
  },
  removeItem: (key: string) => {
    delete storage[key];
  },
  clear: () => {
    Object.keys(storage).forEach((k) => delete storage[k]);
  },
  key: (i: number) => Object.keys(storage)[i] || null,
  length: 0,
};

// Ensure Zustand stores evaluate current state on React renderToString (which queries getInitialState)
try {
  const vanilla = require('zustand/vanilla');
  const originalCreateStore = vanilla.createStore;
  vanilla.createStore = (createState: any) => {
    const store = originalCreateStore(createState);
    store.getInitialState = store.getState;
    return store;
  };
} catch {
  // Ignore if zustand is not available in context
}

// Global browser stubs
(global as any).window = {
  location: { hash: '' },
  addEventListener: () => {},
  removeEventListener: () => {},
};

(global as any).document = {
  getElementById: () => ({
    scrollIntoView: () => {},
  }),
};

// React 19 hook dispatcher for node environment
try {
  const React = require('react');
  if (React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE) {
    const testDispatcher = {
      useState: (initial: any) => [typeof initial === 'function' ? initial() : initial, () => {}],
      useEffect: (fn: any) => {
        try {
          fn();
        } catch {}
      },
      useCallback: (fn: any) => fn,
      useMemo: (fn: any) => fn(),
      useSyncExternalStore: (_sub: any, getSnapshot: any) => getSnapshot(),
      useDebugValue: () => {},
      useRef: (initial: any) => ({ current: initial }),
      useId: () => 'test-id',
      useContext: (context: any) => context?._currentValue,
      useReducer: (reducer: any, init: any) => [init, () => {}],
    };
    React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE.H = testDispatcher;
  }
} catch {
  // Ignore
}


