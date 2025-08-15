import { EventRegistry } from './eventhandler.js';
const EventRegistryInstance = new EventRegistry();

export class VNode {
  constructor(tag, attrs = {}, children = []) {
    this.tag = tag.toLowerCase();
    this.attrs = attrs;
    this.children = children;
  }

  render() {
    const el = document.createElement(this.tag);

    for (const [key, value] of Object.entries(this.attrs)) {
      if (key.startsWith("on") && typeof value === "function") {
        const eventType = key.slice(2).toLowerCase();
        //could be a counter or UUID
        const handlerId = `${eventType}-${Math.random().toString(36).slice(2)}`;
        EventRegistryInstance.register(eventType, handlerId, value);
        el.setAttribute(`data-on${eventType}`, handlerId);
      }else if (key === "value" && el.tagName === "INPUT") {
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