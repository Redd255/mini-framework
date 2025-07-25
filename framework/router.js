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
    this.handleRouteChange(); 
  }

  handleRouteChange() {
    const currentPath = window.location.hash.slice(1) || '/';
    const route = this.routes[currentPath];
  if (route) {
    route(this.state, this.setState.bind(this));
  } else if (this.routes['/404']) {
    if (currentPath !== '/404') {
      window.location.hash = '#/404';
    } else {
      this.routes['/404'](this.state, this.setState.bind(this)); // prevent infinite loop
    }
  }
  }
}

