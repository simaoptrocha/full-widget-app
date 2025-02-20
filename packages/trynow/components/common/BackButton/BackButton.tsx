import { ReactNode } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';

import styles from './backButton.module.css';
import backArrow from '@/public/icons/leftArrow.svg';

type ButtonProps = {
  children: ReactNode;
  onClick?: Function;
};

export const BackButton = ({ children, onClick }: ButtonProps) => {
  const router = useRouter();
  return (
    <div
      onClick={() => (typeof onClick === 'function' ? onClick() : router.back())}
      className={styles.container}
    >
      <div className={styles.backButtonArrowContainer}>
        <Image src={backArrow} alt="back arrow" />
      </div>
      <div className={styles.text}>{children}</div>
    </div>
  );
};

export default BackButton;
