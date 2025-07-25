class EventRegistry {
  constructor() {
    this.handlers = {
      click: {},
      keydown: {},
      scroll: {},
      dblclick: {}
    };
    
    // Custom double-click tracking
    this.clickDelay = 300; // milliseconds
    this.lastClickTarget = null;
    this.lastClickTime = 0;
    this.clickTimer = null;
    this.isMouseDown = false;
    this.mouseDownTarget = null;
    this.mouseDownTime = 0;
  }

  register(type, id, fn) {
    this.handlers[type][id] = fn;
  }

  dispatch(type, event) {
    let target = event.target;
    while (target && target !== document) {
      const handlerId = target.getAttribute(`data-on${type}`);
      if (handlerId && this.handlers[type][handlerId]) {
        this.handlers[type][handlerId](event);
        break;
      }
      target = target.parentElement;
    }
  }

  handleClickWithDoubleClickDetection(event) {
    const currentTime = Date.now();
    const timeDiff = currentTime - this.lastClickTime;
    
    // Check if this is a potential double-click
    if (this.lastClickTarget === event.target && timeDiff < this.clickDelay) {
      // This is a double-click - dispatch dblclick event
      this.dispatch('dblclick', event);
      
      // Reset tracking
      this.lastClickTarget = null;
      this.lastClickTime = 0;
      
      // Clear any pending single-click timer
      if (this.clickTimer) {
        clearTimeout(this.clickTimer);
        this.clickTimer = null;
      }
    } else {
      // Store this click and set timer for potential single-click
      this.lastClickTarget = event.target;
      this.lastClickTime = currentTime;
      
      // Clear any existing timer
      if (this.clickTimer) {
        clearTimeout(this.clickTimer);
      }
      
      // Set timer to dispatch single click if no double-click follows
      this.clickTimer = setTimeout(() => {
        this.dispatch('click', event);
        this.clickTimer = null;
        this.lastClickTarget = null;
        this.lastClickTime = 0;
      }, this.clickDelay);
    }
  }

  init() {
    // Use onXXX properties instead of addEventListener
    const self = this;
    
    document.onclick = function(event) {
      self.handleClickWithDoubleClickDetection(event);
    };
    
    document.onkeydown = function(event) {
      self.dispatch('keydown', event);
    };
    
    document.onscroll = function(event) {
      self.dispatch('scroll', event);
    };
  }
}

const eventRegistry = new EventRegistry();
eventRegistry.init();