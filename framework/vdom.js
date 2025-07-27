class VNode {
  constructor(tag, attrs = {}, children = []) {
    this.tag = tag.toLowerCase();
    this.attrs = attrs;
    this.children = children;
  }

  render() {
    const el = document.createElement(this.tag);

    for (const [key, value] of Object.entries(this.attrs)) {
      if (key.startsWith("on") && typeof value === "function") {
        el.addEventListener(key.slice(2).toLowerCase(), value);
      } else if (key === "value" && el.tagName === "INPUT") {
        el.value = value;
      } else if (key === "checked" && el.tagName === "INPUT") {
        el.checked = Boolean(value);
      } else if (key !== "key") {
        el.setAttribute(key, value);
      }
    }

    this.children.forEach((child) => {
      if (child === null || child === undefined) return;
      if (typeof child === "string") {
        el.appendChild(document.createTextNode(child));
      } else {
        el.appendChild(child.render());
      }
    });

    return el;
  }
}
