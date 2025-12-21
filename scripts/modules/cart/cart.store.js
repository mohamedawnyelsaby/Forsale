// PATH: scripts/modules/cart/cart.store.js

const subscribers = new Set();

let state = {
  items: [],
  total: 0,
  currency: "PI"
};

export function getCartState() {
  return state;
}

export function setCartState(nextState) {
  state = nextState;
  subscribers.forEach(fn => fn(state));
}

export function subscribeCart(fn) {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}
