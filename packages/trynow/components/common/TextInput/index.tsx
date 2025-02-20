import { HTMLInputTypeAttribute, InputHTMLAttributes } from 'react';
import { poppins } from '@/src/utils/index';
import styles from './textInput.module.css';

export type TextInputProps = {
  value: string;
  label?: string;
  placeholder?: string;
  onChange?: Function;
  type?: HTMLInputTypeAttribute;
  error?: string;
  autoFocus?: boolean;
  textInputProps?: InputHTMLAttributes<HTMLInputElement>;
  readOnly?: boolean; // New prop for read-only state
};

export const TextInput = ({
  value,
  placeholder,
  onChange,
  label,
  autoFocus,
  textInputProps,
  type = 'text',
  error = '',
  readOnly = false, // Default to false
}: TextInputProps) => {
  return (
    <div className={styles.inputContainer}>
      <label className={styles.label}>{label}</label>
      <input
        {...textInputProps}
        autoFocus={autoFocus}
        className={[
          styles.input,
          poppins.className,
          readOnly ? styles.readOnly : '',
        ].join(' ')}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange?.(event)}
        readOnly={readOnly} // Apply the readOnly attribute
      />
      <div className={styles.error}>{error}</div>
    </div>
  );
};

export default TextInput;
