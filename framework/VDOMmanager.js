class VDOMManager {
  constructor(body, renderFn, initialState = {}) {
    this.body = body;
    this.oldVNode = null;
    this.renderFn = renderFn;
    this.state = initialState;
  }
  setState(newState) {
    this.state = { ...this.state, ...newState };
    const newVNode = this.renderFn(this.state, this.setState.bind(this));
    updateElement(this.body, newVNode, this.oldVNode);
    this.oldVNode = newVNode;
  }

  mount() {
    this.oldVNode = this.renderFn(this.state, this.setState.bind(this));
    this.body.appendChild(this.oldVNode.render());
  }

  store(newVNode) {
    updateElement(this.body, newVNode, this.oldVNode);
    this.oldVNode = newVNode;
  }
}

function updateElement(parent, newVNode, oldVNode, index = 0) {
  const existingEl = parent.childNodes[index];

  function createDOMNode(vnode) {
    if (typeof vnode === 'string') {
      return document.createTextNode(vnode);
    }
    return vnode.render();
  }

  if (!oldVNode) {
    parent.appendChild(createDOMNode(newVNode));
  } else if (!newVNode) {
    parent.removeChild(existingEl);
  } else if (changed(newVNode, oldVNode)) {
    parent.replaceChild(createDOMNode(newVNode), existingEl);
  } else if (newVNode.tag) {
    const newLen = newVNode.children.length;
    const oldLen = oldVNode.children.length;
    const max = Math.max(newLen, oldLen);
    for (let i = 0; i < max; i++) {
      updateElement(existingEl, newVNode.children[i], oldVNode.children[i], i);
    }
  }
}

function changed(node1, node2) {
  return typeof node1 !== typeof node2 ||
    (typeof node1 === 'string' && node1 !== node2) ||
    node1.tag !== node2.tag;
}
