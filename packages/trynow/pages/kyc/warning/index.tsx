import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

import { poppins, jakarta, getSessionValue, CurrenciesSymbols, CurrenciesNames } from '@/src/utils';
import MainButton from '@/components/common/MainButton/MainButton';

import styles from './kycWarning.module.css';

export default function KycWarning() {
  const [defaultCurrency, setDefaultCurrency] = useState<string>('EUR');
  const router = useRouter();

  const user = getSessionValue('user');
  const banks = getSessionValue('banks');

  const getSymbolByKey = (searchKey: string): string =>
    Object.entries(CurrenciesSymbols).find(([key]) => key === searchKey)?.[1] ?? '';
  const getNameByKey = (searchKey: string): string =>
    Object.entries(CurrenciesNames).find(([key]) => key === searchKey)?.[1] ?? '';

  useEffect(() => {
    setDefaultCurrency(
      user?.userData?.currency ??
        banks?.find(({ main_beneficiary }: any) => main_beneficiary)?.currency ??
        'EUR',
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.topContainer}>
        <div className={styles.header}></div>
        <div className={[styles.description, poppins.className].join(' ')}>
          <div className={[styles.title, jakarta.className].join(' ')}>
            {`Transferring more than ${
              defaultCurrency.toUpperCase() === 'EUR'
                ? `700${getSymbolByKey(defaultCurrency)}`
                : `${getSymbolByKey(defaultCurrency)}700`
            }?`}
          </div>
          {`If you're transferring more than 700 ${getNameByKey(defaultCurrency)}s,`}
          <br />
          {"you'll need to verify your identity."}
          <div style={{ height: 30 }} className={styles.spacer}></div>
          <div className={styles.boldText}>
            {'Also, you can only use your Portal once'}
            <br />
            {'without completing verification.'}
          </div>
          {'(But we think you should! It takes 2 minutes)'}
        </div>
      </div>
      <div className={styles.bottomContainer}>
        <MainButton onClick={() => router.push('/kyc/intro')} invertedColor={true}>
          Verify your identity now
        </MainButton>
        <div style={{ height: 14 }} className={styles.spacer}></div>
        <MainButton onClick={() => router.push('/portal')}>Continue without verifying</MainButton>
      </div>
    </div>
  );
}
