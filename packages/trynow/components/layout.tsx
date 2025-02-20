import { ReactNode, useMemo, useEffect } from 'react';
import Head from 'next/head';
import { Plus_Jakarta_Sans } from '@next/font/google';
import { useCookies } from 'react-cookie';
import { Intercom } from '@intercom/messenger-js-sdk';

import Navbar from './Navbar';
import cloud1 from '@/public/images/cloud_1.png';
import cloud2 from '@/public/images/cloud_2.png';
import cloud3 from '@/public/images/cloud_3.png';
import cloud4 from '@/public/images/cloud_4.png';

import styles from '@/styles/layout.module.scss';

const images = [cloud1, cloud2, cloud3, cloud4];

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export default function Layout({
  bottomElement,
  children,
  styleOptions,
}: {
  bottomElement?: ReactNode;
  children: ReactNode;
  styleOptions: Record<string, any>;
}) {
  const [cookies] = useCookies(['unblockSessionId', 'userId', 'walletAddress', 'intercomUserHash']);
  // const clouds = useMemo(
  //   () =>
  //     [
  //       [-50, 204, 3],
  //       [143, 491, 1],
  //       [1056, 272, 4],
  //       [1656, 596, 2],
  //       [1703, 184, 1],
  //     ].map(([left, top, imageIndex], i) => {
  //       const image = images[imageIndex - 1];
  //       return {
  //         index: i,
  //         image: `url(${image.src})`,
  //         top: top + Math.floor(Math.random() * 100) - 50,
  //         left: left + Math.floor(Math.random() * 100) - 50,
  //       };
  //     }),
  //   [],
  // );
  useEffect(() => {
    const APP_ID = process?.env?.NEXT_PUBLIC_INTERCOM_APP_ID ?? '';
    Intercom({
      app_id: APP_ID,
      user_id: cookies.userId,
      user_hash: cookies.intercomUserHash,
    });
  }, []);

  const applyStyles = (styleOptions: Record<string, any>) => {
    return styleOptions ? { ...styleOptions } : undefined;
  };

  return (
    <main className={[jakarta.className, styles.main].join(' ')}>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <meta name="description" content="Try Unblock" />
        <meta name="og:title" content="Try now" />

        <link rel="apple-touch-icon" sizes="180x180" href="/icons/favicon/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon/favicon-16x16.png" />
        <link rel="manifest" href="/icons/favicon/site.webmanifest" />
        <link rel="mask-icon" href="/icons/favicon/safari-pinned-tab.svg" color="#5bbad5" />

        <meta name="theme-color" content="#ffffff"></meta>

        <title>Try now</title>
      </Head>
      <div className={styles.main}>
        {/* <Navbar /> */}
        <div className={styles.centralContainer} style={applyStyles(styleOptions)}>
          <div className={styles.innerCentralContainer} style={applyStyles(styleOptions)}>
            <div className={styles.paddedContainer}>{children}</div>
          </div>
          {bottomElement ? (
            <div className={styles.bottomElementContainer}>
              <div className={styles.bottomElement}>{bottomElement}</div>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
