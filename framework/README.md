
# Mini JavaScript Framework Documentation

Welcome to the documentation for your minimal virtual DOM framework. This document covers everything a developer needs to understand, use, and extend the framework efficiently.

---

## ✨ Features

- **Virtual DOM rendering** with diffing and keyed reconciliation
- **Declarative element creation** using `VNode`
- **Event handling** via attributes (e.g., `onClick`, `onInput`) or with an `EventRegistry`
- **Component state management** with `VDOMManager`
- **Hash-based routing** with the `Router` class
- **Support for dynamic updates** through `setState`

---

## 📦 Core Concepts

### 1. `VNode` – Virtual Node

This class represents a virtual DOM element.

#### How to create an element

```js
const myDiv = new VNode("div", { id: "main" }, ["Hello World"]);
document.body.appendChild(myDiv.render());
```

#### How it works

- `tag` is the element tag (`div`, `input`, `button`, etc.)
- `attrs` is an object for attributes like `id`, `class`, or events like `onClick`
- `children` is an array of strings or other VNodes

---

## 🔗 Nesting Elements

```js
const nested = new VNode("div", {}, [
  new VNode("h1", {}, ["Welcome"]),
  new VNode("p", {}, ["This is a paragraph."]),
]);
```

---

## ⚡ Adding Events

You can bind DOM events directly using attributes starting with `on`:

```js
const button = new VNode("button", {
  onClick: () => alert("Clicked!")
}, ["Click Me"]);
```

Internally, this attaches the event using `addEventListener`.

---

## 🧩 Adding Attributes

Just include any attributes in the `attrs` object:

```js
new VNode("input", {
  type: "text",
  value: "Type here",
  placeholder: "Your name",
  id: "username"
});
```

Special handling is applied for:
- `checked` (boolean)
- `value` (for inputs)
- `key` (used in keyed diffing logic)

---

## 🧠 VDOMManager – State + Diff + Render

`VDOMManager` handles rendering and updating the DOM efficiently when the state changes.

### Example:

```js
function App(state, setState) {
  return new VNode("div", {}, [
    new VNode("h2", {}, [`Counter: ${state.count}`]),
    new VNode("button", { onClick: () => setState({ count: state.count + 1 }) }, ["+"])
  ]);
}

const manager = new VDOMManager(document.getElementById("app"), App, { count: 0 });
manager.mount();
```

### How it works:

- `mount()` renders the initial DOM
- `setState()` triggers a diff + update using `updateElement`

---

## 🔁 Diffing & Reconciliation

The `updateElement()` function compares the new virtual DOM to the old one and updates the real DOM as needed.

- If keys are present, keyed diffing is used (more efficient)
- Otherwise, elements are diffed by index
- Changes in attributes or tag types will cause the node to be replaced

---

## 🧭 Router – Hash-Based Client Routing

You can define route handlers using the `Router` class.

### Example

```js
const routes = {
  "/": (state, setState) => { /* render home */ },
  "/about": (state, setState) => { /* render about */ },
  "/404": (state, setState) => { /* render not found */ },
};

const router = new Router(routes);
```

This will call the appropriate function whenever the `#hash` changes in the URL.

---

## 🧷 EventRegistry – Global Delegated Events

`EventRegistry` provides advanced global event management including:

- Double-click detection
- Global `click`, `keydown`, `scroll`, `input`, and `change` listeners

### Registering and Using

```js
const registry = new EventRegistry();
registry.register("click", "myButton", () => console.log("Clicked!"));
registry.init();
```

In your HTML or VNode:
```js
new VNode("button", { "data-onclick": "myButton" }, ["Click Me"]);
```

This allows global delegated event handling with consistent IDs.

---

## 🧪 Why This Design Works

- **Declarative**: VNode allows for a JSX-like structure without needing a compiler.
- **Efficient**: Only changed parts of the DOM are updated.
- **Simple**: Small surface area, easy to learn.
- **Composable**: Everything is just JavaScript objects and functions.
- **Keyed Diffing**: Improves performance for dynamic lists (e.g., to-do apps).

---

## ✅ Summary

| Feature               | Supported |
|-----------------------|-----------|
| Virtual DOM           | ✅         |
| Event Binding         | ✅         |
| Attribute Management  | ✅         |
| Keyed Reconciliation  | ✅         |
| State Management      | ✅         |
| Hash Routing          | ✅         |
| Global Event Delegation | ✅      |

---

## 📁 File Structure (suggested)

```
framework/
│
├── VNode.js           # Virtual node definitions
├── VDOMManager.js     # Main rendering logic with diffing
├── Router.js          # Client-side routing
└── EventRegistry.js   # Centralized event delegation
```

---

## 🧱 Extendability

You can extend this framework by adding:

- JSX support (via Babel or a compiler)
- Components with lifecycle methods
- Server-side rendering (SSR)
- Effects and memoization

---

Happy coding! 🚀