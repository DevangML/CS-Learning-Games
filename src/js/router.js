// Client-side router with pattern params support
(function () {
  function toRegex(pathPattern) {
    // Convert "/blog/quiz/:quizId" -> /^\/blog\/quiz\/([^/]+)$/ with keys
    const keys = [];
    const regexStr = pathPattern
      .replace(/\//g, '\\/')
      .replace(/:(\w+)/g, (_, key) => {
        keys.push(key);
        return '([^/]+)';
      });
    return { regex: new RegExp('^' + regexStr + '$'), keys };
  }

  function Router() {
    this.routes = [];
  }

  Router.prototype.route = function (pathPattern, handler, options = {}) {
    const { regex, keys } = toRegex(pathPattern);
    this.routes.push({ regex, keys, handler, options });
    return this;
  };

  Router.prototype.resolve = function (path) {
    for (const r of this.routes) {
      const m = path.match(r.regex);
      if (m) {
        const params = {};
        r.keys.forEach((k, i) => (params[k] = decodeURIComponent(m[i + 1])));
        return { route: r, params };
      }
    }
    return null;
  };

  Router.prototype.navigate = function (path, replace = false) {
    if (replace) history.replaceState({}, '', path);
    else history.pushState({}, '', path);
    this.dispatch(path);
  };

  Router.prototype.dispatch = function (path) {
    const res = this.resolve(path || location.pathname);
    if (res) {
      const ctx = { params: res.params, path };
      if (res.route.options && res.route.options.title) {
        document.title = res.route.options.title;
      }
      res.route.handler(ctx);
    }
  };

  Router.prototype.start = function () {
    // Intercept clicks on links with data-route
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[data-route]');
      if (link && link.getAttribute('href')) {
        const href = link.getAttribute('data-route') || link.getAttribute('href');
        if (href.startsWith('/')) {
          e.preventDefault();
          this.navigate(href);
        }
      }
    });
    window.addEventListener('popstate', () => this.dispatch(location.pathname));
    this.dispatch(location.pathname);
  };

  window.router = new Router();
})();
