class VDOMManager {
  constructor(container, renderFn, initialState = {}) {
    this.container = container;
    this.oldVNode = null;
    this.renderFn = renderFn;
    this.state = initialState;
  }

  setState = (newState) => {
    this.state = { ...this.state, ...newState };
    const newVNode = this.renderFn(this.state, this.setState);
    updateElement(this.container, newVNode, this.oldVNode);
    this.oldVNode = newVNode;
  };

  mount() {
    this.oldVNode = this.renderFn(this.state, this.setState);
    this.container.appendChild(this.oldVNode.render());
  }
}

function updateElement(parent, newVNode, oldVNode, index = 0) {
  const existingEl = parent.childNodes[index];

  if (!newVNode && oldVNode) {
    if (existingEl) parent.removeChild(existingEl);
    return;
  }
  if (newVNode && !oldVNode) {
    parent.appendChild(createDOMNode(newVNode));
    return;
  }
  if (!newVNode && !oldVNode) return;

  if (changed(newVNode, oldVNode)) {
    parent.replaceChild(createDOMNode(newVNode), existingEl);
    return;
  }

  if (typeof newVNode === "string") {
    if (existingEl.textContent !== newVNode) {
      existingEl.textContent = newVNode;
    }
    return;
  }

  updateAttributes(existingEl, newVNode.attrs, oldVNode.attrs);

  const newChildren = newVNode.children || [];
  const oldChildren = oldVNode.children || [];

  // Efficient keyed reconciliation
  reconcileKeyedChildren(existingEl, newChildren, oldChildren);
}

function reconcileKeyedChildren(parentEl, newChildren, oldChildren) {
  // Check if we have keys
  const hasKeys =
    newChildren.some((child) => child?.attrs?.key != null) ||
    oldChildren.some((child) => child?.attrs?.key != null);

  if (!hasKeys) {
    // No keys - simple index-based diffing
    const maxLength = Math.max(newChildren.length, oldChildren.length);
    for (let i = 0; i < maxLength; i++) {
      updateElement(parentEl, newChildren[i], oldChildren[i], i);
    }
    return;
  }

  // Build key maps for efficient lookups
  const oldKeyToElement = new Map();
  const oldKeyToVNode = new Map();

  oldChildren.forEach((child, index) => {
    const key = child?.attrs?.key;
    if (key != null) {
      oldKeyToElement.set(key, parentEl.childNodes[index]);
      oldKeyToVNode.set(key, child);
    }
  });

  const newElements = [];
  const usedKeys = new Set();

  // Process each new child
  newChildren.forEach((newChild, newIndex) => {
    const key = newChild?.attrs?.key;

    if (key != null && oldKeyToElement.has(key)) {
      // Reuse existing element with this key
      const existingElement = oldKeyToElement.get(key);
      const oldVNode = oldKeyToVNode.get(key);

      // Update the existing element in place
      updateAttributes(existingElement, newChild.attrs, oldVNode.attrs);
      reconcileKeyedChildren(
        existingElement,
        newChild.children || [],
        oldVNode.children || []
      );

      newElements[newIndex] = existingElement;
      usedKeys.add(key);
    } else {
      // Create new element
      newElements[newIndex] = createDOMNode(newChild);
    }
  });

  // Remove unused elements
  oldChildren.forEach((oldChild, index) => {
    const key = oldChild?.attrs?.key;
    if (key != null && !usedKeys.has(key)) {
      const elementToRemove = parentEl.childNodes[index];
      if (elementToRemove && elementToRemove.parentNode === parentEl) {
        parentEl.removeChild(elementToRemove);
      }
    }
  });

  // Reorder elements to match new order
  newElements.forEach((element, targetIndex) => {
    const currentElement = parentEl.childNodes[targetIndex];
    if (currentElement !== element) {
      if (element.parentNode === parentEl) {
        // Move existing element
        parentEl.insertBefore(element, currentElement || null);
      } else {
        // Insert new element
        parentEl.insertBefore(element, currentElement || null);
      }
    }
  });

  // Remove any remaining extra elements
  while (parentEl.childNodes.length > newChildren.length) {
    parentEl.removeChild(parentEl.lastChild);
  }
}

function createDOMNode(vnode) {
  if (vnode === null || vnode === undefined) return document.createTextNode("");
  if (typeof vnode === "string") return document.createTextNode(vnode);
  return vnode.render();
}

function changed(node1, node2) {
  if (node1 == null || node2 == null) return node1 !== node2;
  if (typeof node1 !== typeof node2) return true;
  if (typeof node1 === "string") return node1 !== node2;
  return node1.tag !== node2.tag || node1.attrs?.key !== node2.attrs?.key;
}

function updateAttributes(el, newAttrs = {}, oldAttrs = {}) {
  for (const key in oldAttrs) {
    if (!(key in newAttrs)) {
      if (key.startsWith("on") && typeof oldAttrs[key] === "function") {
        el.removeEventListener(key.slice(2).toLowerCase(), oldAttrs[key]);
      } else {
        el.removeAttribute(key);
      }
    }
  }

  for (const key in newAttrs) {
    const newVal = newAttrs[key];
    const oldVal = oldAttrs[key];
    if (newVal === oldVal) continue;

    if (key.startsWith("on") && typeof newVal === "function") {
      if (oldVal) el.removeEventListener(key.slice(2).toLowerCase(), oldVal);
      el.addEventListener(key.slice(2).toLowerCase(), newVal);
    } else if (key === "checked") {
      el.checked = Boolean(newVal);
    } else if (key === "value" && el.tagName === "INPUT") {
      if (el.value !== newVal) el.value = newVal;
    } else if (key !== "key") {
      el.setAttribute(key, newVal);
    }
  }
}
