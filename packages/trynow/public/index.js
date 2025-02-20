(function (global) {
  // SimpleWidget Class
  class SimpleWidget {
    baseUrl = "https://main.d2a9fj2wdht669.amplifyapp.com" 
    constructor({ variant, containerNodeSelector, walletAddress, chain, token, options }) {
      if (!variant) {
        throw new Error("Variant is required to initialize the widget.");
      }

      this.variant = variant;
      this.options = options;
      this.containerNodeSelector = containerNodeSelector || "#widget-container"; // Default selector if not provided
      this.walletAddress = walletAddress || null; // Store the wallet address (if any)
      this.chain = chain || null;
      this.token = token || null;
      this.widgetInstance = null;
    }

    getWidgetInstance() {
      return this.widgetInstance
    }

    show() {
      this.cleanupEventListeners();

      switch (this.variant) {
        case "overlay":
          this.widgetInstance = this.createOverlayWidget();
          break;

        case "embedded":
          this.widgetInstance = this.createEmbeddedWidget();
          break;

        default:
          throw new Error(`Unsupported variant: ${this.variant}`);
      }

      if (this.variant === "overlay") {
        window.addEventListener("keydown", this.handleEscPress.bind(this));
      }

      return this.widgetInstance;
    }

    createOverlayWidget() {
      // Define the base URL for the overlay widget.
      // If a wallet address is provided, append it as a query parameter.
      let url = this.baseUrl;
      if (this.walletAddress) {
        url += `?walletAddress=${encodeURIComponent(this.walletAddress)}`;
      }

      const overlay = document.createElement("div");
      overlay.classList.add("simple-widget__overlay");
      overlay.setAttribute("data-simple-widget", "true");

      const iframe = document.createElement("iframe");
      iframe.src = url;
      iframe.width = "100%";
      iframe.height = "100%";
      iframe.style.border = "none";
      // iframe.addEventListener("load", () => iframe.classList.add("visible"));

      const closeButton = document.createElement("button");
      closeButton.classList.add("simple-widget__close");
      closeButton.innerHTML = "✕";
      closeButton.addEventListener("click", () => this.cleanupOverlay(overlay));

      overlay.appendChild(closeButton);
      overlay.appendChild(iframe);
      document.body.appendChild(overlay);

      return {
        cleanup: () => this.cleanupOverlay(overlay),
        targetWindow: iframe.contentWindow,
      };
    }

    createEmbeddedWidget() {
      const url = this.constructUrl();

      const container = document.querySelector(this.containerNodeSelector);
      if (!container) {
        throw new Error(`Container not found for selector: ${this.containerNodeSelector}`);
      }


      const iframe = this.createIframe(url);
      container.appendChild(iframe);

      return {
        cleanup: () => iframe.remove(),
        targetWindow: iframe.contentWindow,
      };
    }

    constructUrl() {
      let url = this.baseUrl;
  
      if (this.walletAddress) {
        url += `?walletAddress=${encodeURIComponent(this.walletAddress)}`;
      }
  
      if (this.options?.text) {
        const textParam = encodeURIComponent(JSON.stringify(this.options.text));
        url += `${this.walletAddress ? '&' : '?'}text=${textParam}`;
      }

      if (this.options?.styles) {
        const stylesParam = encodeURIComponent(JSON.stringify(this.options.styles));
        url += `${this.walletAddress || this.text ? '&' : '?'}styles=${stylesParam}`;
      }

      if (this.chain) {
        url += `${this.walletAddress || this.text || this.styles ? '&' : '?'}chain=${this.chain}`;
      }

      if (this.token) {
        url += `${this.walletAddress || this.text || this.styles || this.chain ? '&' : '?'}token=${this.token}`;
      }
  
      return url;
    }

    createIframe(url) {
      const iframe = document.createElement("iframe");
      iframe.src = url;
      iframe.width = "100%";
      iframe.height = "100%";
      iframe.style.border = "none";
      // iframe.addEventListener("load", () => iframe.classList.add("visible"));
      return iframe;
    }

    createCloseButton(onClick) {
      const closeButton = document.createElement("button");
      closeButton.classList.add("simple-widget__close");
      closeButton.innerHTML = "✕";
      closeButton.addEventListener("click", onClick);
      return closeButton;
    }


    cleanupOverlay(overlay) {
      overlay.remove();
      // Removing event listener: note that binding creates a new function, so you might
      // want to store the bound function in a variable if you need to remove it properly.
      window.removeEventListener("keydown", this.handleEscPress.bind(this));
    }

    cleanupEventListeners() {
      window.removeEventListener("keydown", this.handleEscPress.bind(this));
    }

    handleEscPress(event) {
      if (event.key === "Escape") {
        const overlay = document.querySelector('[data-simple-widget="true"]');
        if (overlay) {
          this.cleanupOverlay(overlay);
        }
      }
    }
  }

  // Singleton instance
  let instance = null;

  // Expose globally as `SimpleWidgetLoader`
  global.SimpleWidgetLoader = {
    init: (options) => {
      if (instance) {
        instance.cleanupEventListeners();
        instance = null;
      }
      instance = new SimpleWidget(options);
      return instance;
    },
  };
})(window);
