import { ReactNode, useState } from 'react';
import { poppins } from '@/src/utils/index';

import styles from './flexButton.module.css';

type ButtonProps = {
  children: ReactNode;
  className?: string;
  onClick: Function;
  onHover?: Function;
  invertColor?: boolean;
};

export const FlexButton = ({
  children,
  onClick,
  className,
  invertColor = false,
  onHover = () => {},
}: ButtonProps) => {
  return (
    <button
      onClick={() => onClick()}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      className={[
        poppins.className,
        styles.button,
        invertColor ? styles.invertColor : styles.standardColor,
        className,
      ].join(' ')}>
      {children}
    </button>
  );
};

export default FlexButton;
