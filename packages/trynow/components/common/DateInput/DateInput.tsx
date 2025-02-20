import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker, DatePickerProps } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Dayjs } from 'dayjs';

import styles from './dateInput.module.css';

export type DateInputProps = {
  value: Dayjs | null;
  label: string;
  onChange: Function;
  error?: string;
  maxDate?: Dayjs;
  datePickerProps?: DatePickerProps<Dayjs>;
};

export const DateInput = ({
  value,
  onChange,
  label,
  maxDate,
  error = '',
  datePickerProps,
}: DateInputProps) => {
  return (
    <div className={styles.inputContainer}>
      <label className={styles.label}>{label}</label>
      <div>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            sx={{
              '& .MuiOutlinedInput-root': {
                '& > fieldset': {
                  borderColor: '#e7e7e7',
                  borderRadius: '8px',
                },
                '& > input': {
                  borderRadius: '8px',
                  borderColor: '#fff',
                },
              },
              '.Mui-focused': {
                '& > fieldset.MuiOutlinedInput-notchedOutline': {
                  borderColor: '#8d1bf1',
                  borderWidth: 1,
                },
              },
            }}
            value={value}
            maxDate={maxDate}
            className={styles.datePicker}
            onChange={(ev) => onChange(ev)}
            format={'DD-MM-YYYY'}
            {...datePickerProps}
          />
        </LocalizationProvider>
      </div>
      <div className={styles.error}>{error}</div>
    </div>
  );
};

export default DateInput;
