# RULES FOR REACT STATE MANAGEMENT & EFFECT AVOIDANCE

## 1. THE GOLDEN RULE

- NEVER use `useEffect` to synchronize, transform, or derive React state based on other states or local storage.
- Avoid calling `setState` synchronously inside a `useEffect` body. This triggers cascading renders (double renders), hurts performance, and causes UI flickering.

## 2. STATE INITIALIZATION FROM EXTERNAL STORAGE (LocalStorage, SessionStorage, Cookie)

- **WRONG (Anti-pattern):** Initializing state with a default value and filling it via `useEffect`.
- **RIGHT (Lazy State Initialization):** Pass an initializer function directly into `useState` so it executes exactly ONCE during the initial render.

_Code Example:_

```typescript
// ❌ BAD: Causes cascading render
const [data, setData] = useState(null);
useEffect(() => {
  const saved = localStorage.getItem('key');
  if (saved) setData(JSON.parse(saved));
}, []);

//  GOOD: Single pass render, no flicker
const [data, setData] = useState(() => {
  if (typeof window === 'undefined') return null; // SSR safety
  const saved = localStorage.getItem('key');
  return saved ? JSON.parse(saved) : null;
});
```
