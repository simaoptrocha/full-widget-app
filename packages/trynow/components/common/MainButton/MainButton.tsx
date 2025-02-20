import { ReactNode } from 'react';

import styles from './mainButton.module.css';

type ButtonProps = {
  children: ReactNode;
  onClick: Function;
  invertedColor?: boolean;
  disabled?: boolean;
};

export const Button = ({ children, onClick, disabled = false, invertedColor }: ButtonProps) => {
  return (
    <button
      disabled={disabled}
      className={[styles.button, invertedColor ? styles.invertColor : ''].join(' ')}
      onClick={() => onClick()}>
      {children}
    </button>
  );
};

export default Button;
