// Modern Client-Side Router for SQL Mastery Quest
class Router {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
        this.middleware = [];
        this.notFoundHandler = null;
        this.beforeRouteChange = null;
        this.afterRouteChange = null;
        
        // Bind methods
        this.navigate = this.navigate.bind(this);
        this.handlePopState = this.handlePopState.bind(this);
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize with current path
        this.init();
    }
    
    // Initialize router with current URL
    init() {
        this.handleRoute(window.location.pathname, { replace: true });
    }
    
    // Setup event listeners for navigation
    setupEventListeners() {
        // Handle browser back/forward
        window.addEventListener('popstate', this.handlePopState);
        
        // Handle link clicks
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[data-route]');
            if (link && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
                e.preventDefault();
                const path = link.getAttribute('href') || link.getAttribute('data-route');
                this.navigate(path);
            }
        });
        
        // Handle form submissions with data-route
        document.addEventListener('submit', (e) => {
            const form = e.target.closest('form[data-route]');
            if (form) {
                e.preventDefault();
                const path = form.getAttribute('data-route');
                const formData = new FormData(form);
                const params = Object.fromEntries(formData.entries());
                this.navigate(path, { params });
            }
        });
    }
    
    // Add middleware
    use(middleware) {
        this.middleware.push(middleware);
        return this;
    }
    
    // Set before route change hook
    beforeEach(handler) {
        this.beforeRouteChange = handler;
        return this;
    }
    
    // Set after route change hook
    afterEach(handler) {
        this.afterRouteChange = handler;
        return this;
    }
    
    // Define a route
    route(path, handler, options = {}) {
        const route = {
            path,
            handler,
            regex: this.pathToRegex(path),
            params: this.extractParams(path),
            meta: options.meta || {},
            middleware: options.middleware || [],
            title: options.title || 'SQL Mastery Quest'
        };
        
        this.routes.set(path, route);
        return this;
    }
    
    // Set 404 handler
    notFound(handler) {
        this.notFoundHandler = handler;
        return this;
    }
    
    // Convert path to regex for matching
    pathToRegex(path) {
        const regexStr = path
            .replace(/\//g, '\\/')
            .replace(/:([^\/]+)/g, '([^\/]+)')
            .replace(/\*/g, '(.*)');
        return new RegExp(`^${regexStr}$`);
    }
    
    // Extract parameter names from path
    extractParams(path) {
        const params = [];
        const matches = path.match(/:([^\/]+)/g);
        if (matches) {
            matches.forEach(match => {
                params.push(match.substring(1));
            });
        }
        return params;
    }
    
    // Parse URL parameters
    parseParams(path, route) {
        const matches = path.match(route.regex);
        const params = {};
        
        if (matches && route.params.length > 0) {
            route.params.forEach((param, index) => {
                params[param] = matches[index + 1];
            });
        }
        
        return params;
    }
    
    // Parse query string
    parseQuery(search = window.location.search) {
        const params = new URLSearchParams(search);
        const query = {};
        
        for (const [key, value] of params.entries()) {
            query[key] = value;
        }
        
        return query;
    }
    
    // Find matching route
    findRoute(path) {
        for (const [routePath, route] of this.routes) {
            if (route.regex.test(path)) {
                return route;
            }
        }
        return null;
    }
    
    // Execute middleware chain
    async executeMiddleware(context, middlewareList) {
        for (const middleware of middlewareList) {
            const result = await middleware(context);
            if (result === false) {
                return false; // Stop execution
            }
        }
        return true;
    }
    
    // Handle route navigation
    async handleRoute(path, options = {}) {
        const route = this.findRoute(path);
        
        if (!route && this.notFoundHandler) {
            await this.notFoundHandler({ path, query: this.parseQuery() });
            return;
        }
        
        if (!route) {
            console.error(`No route found for path: ${path}`);
            return;
        }
        
        // Parse parameters and query
        const params = this.parseParams(path, route);
        const query = this.parseQuery();
        
        // Create route context
        const context = {
            path,
            params,
            query,
            route,
            meta: route.meta,
            options: options.params || {}
        };
        
        // Execute before route change hook
        if (this.beforeRouteChange) {
            const canProceed = await this.beforeRouteChange(context, this.currentRoute);
            if (canProceed === false) return;
        }
        
        // Execute global middleware
        const globalMiddlewarePassed = await this.executeMiddleware(context, this.middleware);
        if (!globalMiddlewarePassed) return;
        
        // Execute route-specific middleware
        const routeMiddlewarePassed = await this.executeMiddleware(context, route.middleware);
        if (!routeMiddlewarePassed) return;
        
        // Update browser history
        if (!options.replace) {
            if (window.location.pathname !== path) {
                window.history.pushState({ path }, route.title, path);
            }
        }
        
        // Update document title
        document.title = route.title;
        
        // Execute route handler
        try {
            await route.handler(context);
            this.currentRoute = context;
            
            // Execute after route change hook
            if (this.afterRouteChange) {
                await this.afterRouteChange(context);
            }
            
        } catch (error) {
            console.error('Route handler error:', error);
            if (this.notFoundHandler) {
                await this.notFoundHandler({ path, query, error });
            }
        }
    }
    
    // Navigate to a new route
    async navigate(path, options = {}) {
        if (path === window.location.pathname) {
            return; // Already on this route
        }
        
        await this.handleRoute(path, options);
    }
    
    // Handle browser back/forward
    handlePopState(event) {
        const path = window.location.pathname;
        this.handleRoute(path, { replace: true });
    }
    
    // Navigate back
    back() {
        window.history.back();
    }
    
    // Navigate forward
    forward() {
        window.history.forward();
    }
    
    // Replace current route
    replace(path, options = {}) {
        this.navigate(path, { ...options, replace: true });
    }
    
    // Refresh current route
    refresh() {
        this.handleRoute(window.location.pathname, { replace: true });
    }
    
    // Get current route info
    current() {
        return this.currentRoute;
    }
    
    // Check if path matches current route
    isActive(path) {
        return window.location.pathname === path;
    }
    
    // Generate URL with parameters
    url(routePath, params = {}) {
        let url = routePath;
        
        // Replace parameters
        Object.keys(params).forEach(key => {
            url = url.replace(`:${key}`, params[key]);
        });
        
        return url;
    }
}

// Route transition animations
class RouteTransitions {
    constructor() {
        this.transitionDuration = 300;
        this.currentTransition = null;
    }
    
    // Fade transition
    async fade(outElement, inElement) {
        return new Promise(resolve => {
            if (outElement) {
                outElement.style.opacity = '0';
                outElement.style.transition = `opacity ${this.transitionDuration}ms ease`;
            }
            
            setTimeout(() => {
                if (outElement) {
                    outElement.style.display = 'none';
                }
                
                if (inElement) {
                    inElement.style.display = 'block';
                    inElement.style.opacity = '0';
                    inElement.style.transition = `opacity ${this.transitionDuration}ms ease`;
                    
                    // Force reflow
                    inElement.offsetHeight;
                    
                    inElement.style.opacity = '1';
                }
                
                setTimeout(resolve, this.transitionDuration);
            }, outElement ? this.transitionDuration : 0);
        });
    }
    
    // Slide transition
    async slide(outElement, inElement, direction = 'left') {
        return new Promise(resolve => {
            const translateOut = direction === 'left' ? '-100%' : '100%';
            const translateIn = direction === 'left' ? '100%' : '-100%';
            
            if (outElement) {
                outElement.style.transform = `translateX(${translateOut})`;
                outElement.style.transition = `transform ${this.transitionDuration}ms ease`;
            }
            
            setTimeout(() => {
                if (outElement) {
                    outElement.style.display = 'none';
                    outElement.style.transform = '';
                }
                
                if (inElement) {
                    inElement.style.display = 'block';
                    inElement.style.transform = `translateX(${translateIn})`;
                    inElement.style.transition = `transform ${this.transitionDuration}ms ease`;
                    
                    // Force reflow
                    inElement.offsetHeight;
                    
                    inElement.style.transform = 'translateX(0)';
                }
                
                setTimeout(resolve, this.transitionDuration);
            }, outElement ? this.transitionDuration : 0);
        });
    }
}

// Export for use in other modules
window.Router = Router;
window.RouteTransitions = RouteTransitions;

// Create global router instance
window.router = new Router();
window.transitions = new RouteTransitions();