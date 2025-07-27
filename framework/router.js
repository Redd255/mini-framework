class Router {
  constructor(routes, initialState = {}) {
    this.routes = routes;
    this.state = initialState;
    this.init();
  }

  init() {
    window.addEventListener("hashchange", () => this.handleRouteChange());
    this.handleRouteChange();
  }

  getState() {
    return this.state;
  }

setState(newState) {
  this.state = { ...this.state, ...newState };
}


 handleRouteChange() {
  const currentPath = window.location.hash.slice(1) || '/';
  const route = this.routes[currentPath];
  if (route) {
    route(this.state, this.setState.bind(this));  // good
  } else if (this.routes["/404"]) {
    this.routes["/404"](this.state, this.setState.bind(this));
  }
}

}

