/* eslint-disable @typescript-eslint/no-explicit-any */
const scriptLoadingStatus = {
  isLoading: false,
  isLoaded: false,
};

declare global {
  interface Window {
    SimpleWidgetLoader: any;
  }
}

window.SimpleWidgetLoader = window.SimpleWidgetLoader || {};
// ${process?.env?.DEPLOYED_URL}
function constructUrl(options: any): string {
  const baseUrl = 'https://main.d2a9fj2wdht669.amplifyapp.com/index.js';
  const params = new URLSearchParams();

  if (options?.text) {
    params.append('text', encodeURIComponent(JSON.stringify(options.text)));
  }

  if (options?.styles) {
    params.append('styles', encodeURIComponent(JSON.stringify(options.styles)));
  }

  return `${baseUrl}?${params.toString()}`;
}

async function loadCustomWidget() {
  console.log('loadCustomWidget');
  return new Promise((resolve, reject) => {
    const scriptSrc = constructUrl({
      text: {
        introTitle: 'main title example',
        introDescription: 'description example',
        introButtonTitle: 'Intro button Title',
      },
      styles: { backgroundColor: 'red', color: 'white' },
    });
    const existingScript = document.querySelector(`script[src="${scriptSrc}"]`);
    scriptLoadingStatus.isLoading = true;

    const checkLoaded = (count = 0) => {
      console.log(`Checking for SimpleWidgetLoader... Attempt: ${count}`);
      if (window.SimpleWidgetLoader) {
        console.log('SimpleWidgetLoader is available.');
        scriptLoadingStatus.isLoading = false;
        scriptLoadingStatus.isLoaded = true;
        const originalInit = window.SimpleWidgetLoader.init;
        const wrappedInit = (options: any) => {
          const widgetInstance = originalInit(options);
          setTimeout(() => {
            const instance = widgetInstance.getWidgetInstance();
            if (instance && instance.targetWindow) {
              console.log('Sending handshake message to widget');
              instance.targetWindow.postMessage(
                {
                  type: 'parent-handshake',
                  parentOrigin: window.location.origin,
                  text: options.text || {}, 
                },
                '*'
              ); 
            } else {
              console.warn(
                'Widget instance or targetWindow not available',
                instance,
                widgetInstance.getWidgetInstance()
              );
            }
          }, 10000); 
          return widgetInstance;
        };
        resolve(wrappedInit);
        return;
      }
      if (count > 200) {
        scriptLoadingStatus.isLoading = false;
        reject(new Error('Loading custom widget script timed out.'));
        return;
      }
    };

    if (existingScript) {
      console.log('Script already exists. Checking availability...');
      checkLoaded();
    } else {
      console.log('Attempting to load script from:', scriptSrc);
      const script = document.createElement('script');
      script.async = true;
      script.src = scriptSrc;

      script.addEventListener('load', () => {
        console.log('Script loaded successfully.');
        scriptLoadingStatus.isLoading = false;
        scriptLoadingStatus.isLoaded = true;
        if (window.SimpleWidgetLoader) {
          const originalInit = window.SimpleWidgetLoader.init;
          const wrappedInit = (options: any) => {
            const widgetInstance = originalInit(options);
            setTimeout(() => {
              const instance = widgetInstance.getWidgetInstance();
              if (instance && instance.targetWindow) {
                console.log('Sending handshake message to widget');
                instance.targetWindow.postMessage(
                  {
                    type: 'parent-handshake',
                    parentOrigin: window.location.origin,
                    text: options.text || {}, 
                  },
                  '*'
                );
              } else {
                console.warn('Widget instance or targetWindow not available');
              }
            }, 10000);
            return widgetInstance;
          };
          resolve(wrappedInit);
        } else {
          console.error('SimpleWidgetLoader is not available after script load.');
          reject(new Error('SimpleWidgetLoader is not available after script load.'));
        }
      });

      script.addEventListener('error', (error) => {
        console.error('Failed to load script:', error);
        scriptLoadingStatus.isLoading = false;
        scriptLoadingStatus.isLoaded = false;
        reject(new Error('Failed to load custom widget script.'));
      });

      document.body.appendChild(script);
    }
  });
}
console.log('loadCustomWidget');
export { loadCustomWidget };
