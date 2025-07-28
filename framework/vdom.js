// Vnode class used  construct the node (render it)
// it accept 3 params in the constructor the tag name as str-> an object of attributs , and array of children 
// attrbuts stored in obeject since they have a key and value not like children need just value such as tags and texts
// it has  render method to current elemnt to real DOM element  
// thing about as receipe ,, p , h1 , div , class , receipe -> converted into object via the constructor ,, then render comes to cook it ,, and give us the real DOM

// explication of render method
// this -> belong to the current object , so this.tag means current tag
//  step -> 1 create the element by its name -> <div> </div>
//  step -> 2  iterate over the attrbs objects ,, using object.Entries to bring key and value 
// if the attrbuts  name start with on such as on-click on-input -> and the type of value is afunction -> attach an event listner to it 
// example ->  onClick: () => alert('clicked'), ,, slice ,, to make on click cliclk 
// if the tag is type input and has attrbut value ,, means attach the elemnt.value <= value
// if the tag is type input and has attrbut checkbox .. gives the checked value -> el.checked = Boolean(value); true of false depends 
// special case like onClick, value, or checked
// the else is just normal attrbs like placeholder  etc
// step -> 3 iterate over the children tag 
// if the child is null or undef ,, means no child ,, just skip 
// if the child is text  (string) => create text node and append it to the elemnt
// if child is node ,, appned it and recall the render func
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
