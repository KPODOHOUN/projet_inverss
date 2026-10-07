// A tiny event-bus toast system — no Context/Provider boilerplate needed,
// any component anywhere (even deeply nested, even outside a provider tree)
// can call toast(...) directly. ToastContainer (mounted once in App.js)
// is the only thing that listens.
const bus = new EventTarget();
let nextId = 0;

export const toast = (message, type = 'success') => {
  bus.dispatchEvent(new CustomEvent('toast', { detail: { id: ++nextId, message, type } }));
};

export const subscribeToast = (callback) => {
  const handler = (e) => callback(e.detail);
  bus.addEventListener('toast', handler);
  return () => bus.removeEventListener('toast', handler);
};
