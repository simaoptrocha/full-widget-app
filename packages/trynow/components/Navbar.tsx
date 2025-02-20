import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Image from 'next/image';
import Link from 'next/link';

import { getChains } from '@/src/utils/index';

import styles from '@/styles/Navbar.module.css';

export default function Navbar() {
  const networks = getChains().map((chain) => ({ ...chain, disabled: false }));
  const [placeholder, setPlaceholder] = useState('');
  const [hoverButton, setHoverButton] = useState(false);


  return (
    <nav>
      <div className={styles.container}>
        <Link href="/">
          <div className={styles.logo}>
            <Image src="/images/unblock_logo.svg" alt="Unblock Logo" width={136} height={25} />
          </div>
        </Link>
        <div className={styles.menuItems}>
          <div className={[styles.menuItem, styles.menuText, styles.hidable].join(' ')}>
            <Link href="https://www.getunblock.com/how-unblock-works" target="_blank">
              How it works
            </Link>
          </div>
          <div className={[styles.menuItem, styles.menuText, styles.hidable].join(' ')}>
            <Link href="https://www.getunblock.com/about-us" target="_blank">
              About us
            </Link>
          </div>
          <div className={[styles.ethMenu, styles.menuItem].join(' ')}>
          </div>
        </div>
      </div>
    </nav>
  );
}
