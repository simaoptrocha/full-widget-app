import { useEffect, useState, ReactNode } from 'react';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import Script from 'next/script';
import { CookiesProvider } from 'react-cookie';
import { useCookies } from 'react-cookie';

import { WalletProvider } from '@/src/wallet/WalletContext';
import Layout from '@/components/layout';

import '@/styles/global.css';

export const GA_TRACKING_ID = 'G-D6C1B2GY1M'; // replace with your measurement id

declare global {
  interface Window {
    gtag: any;
  }
}

// Google Analytics tracking
export const pageview = (url: string) => {
  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
  });
};

export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label: string;
  value: number;
}) => {
  const parentDomain = window.location.ancestorOrigins[0] || 'unknown parent';

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
    parentDomain: parentDomain,
  });
};

export default function App({ Component, pageProps }: AppProps) {
  const [bottomElement, setBottomElement] = useState<ReactNode | null>(null);
  const { asPath, events, query } = useRouter();
  const [options, setOptions] = useState<Record<string, any>>({});

  // Listen for messages from the widget (e.g., handshake)
  useEffect(() => {
    function handleParentMessage(event: MessageEvent) {
      // We expect a message with type 'parent-handshake'
      if (event.data && event.data.type === 'parent-handshake') {
        const receivedDomain = event.data.parentOrigin;
        console.log('Message received from origin:', event.origin);
        console.log('Widget received parent domain:', receivedDomain);
      }
    }
    window.addEventListener('message', handleParentMessage);

    // // Clean up the event listener on unmount.
    return () => {
      window.removeEventListener('message', handleParentMessage);
    };
  }, []);

  // Read and apply query params (e.g., theme, referralCode, walletAddress)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const textParam = urlParams.get('text');
    const stylesParam = urlParams.get('styles');

    const newOptions: Record<string, any> = {};

    if (textParam) {
      console.log('TEXT', JSON.parse(decodeURIComponent(textParam)));

      try {
        newOptions.text = JSON.parse(decodeURIComponent(textParam));
      } catch (error) {
        console.error('Failed to parse text parameter:', error);
      }
    }

    if (stylesParam) {
      try {
        newOptions.styles = JSON.parse(decodeURIComponent(stylesParam));
      } catch (error) {
        console.error('Failed to parse styles parameter:', error);
      }
    }

    setOptions(newOptions);
  }, []);

  // Handle pageview tracking
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      pageview(url);
    };
    events.on('routeChangeComplete', handleRouteChange);
    return () => {
      events.off('routeChangeComplete', handleRouteChange);
    };
  }, [events]);

  const updateBottomElement = (element: ReactNode) => {
    setTimeout(() => setBottomElement(element), 100);
  };

  useEffect(() => {
    setBottomElement(<></>);
  }, [asPath]);

  // Read and apply query styling params
  useEffect(() => {
    const applyQueryStyles = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const stylesParam = urlParams.get('styles');

      if (stylesParam) {
        try {
          const styles = JSON.parse(decodeURIComponent(stylesParam));
          setOptions((prevOptions) => ({
            ...prevOptions,
            styles: {
              ...prevOptions.styles,
              ...styles,
            },
          }));
        } catch (error) {
          console.error('Failed to parse styles parameter:', error);
        }
      }
    };

    applyQueryStyles();
  }, []);

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_path: window.location.pathname,
              'cookie_flags': 'samesite=none;secure'
            });
          `,
        }}
      />
      <CookiesProvider>
        <WalletProvider>
          <Layout bottomElement={bottomElement} styleOptions={options?.styles}>
            <Component
              {...pageProps}
              setBottomElement={updateBottomElement}
              textOptions={options?.text}
            />
          </Layout>
        </WalletProvider>
      </CookiesProvider>
    </>
  );
}
