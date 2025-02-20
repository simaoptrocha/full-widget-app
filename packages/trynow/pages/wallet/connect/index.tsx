import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useCookies } from 'react-cookie';
import { poppins } from '@/src/utils/index';
import { ethers } from 'ethers';

import BackButton from '@/components/common/BackButton/BackButton';
import FlexButton from '@/components/common/FlexButton/FlexButton';
import { TextInput } from '@/components/common/TextInput';

import styles from './index.module.css';
import UnblockApi from '@/src/utils/UnblockApi';

export default function Connect() {
  const router = useRouter();
  const [walletAddress, setWalletAddress] = useState({ value: '', error: '' });
  const [cookies, setCookie] = useCookies(['unblockSessionId', 'userId', 'walletAddress', 'parentDomain', 'chain']);
  const api = new UnblockApi(cookies?.parentDomain, cookies?.unblockSessionId, cookies?.userId);

  const setInput = (value: string, setInput: Function) => {
    setInput((prev: any) => ({ ...prev, value }));
  };

  const validateInput = () => {
    let noErrors = true;
    const wallet = walletAddress.value;

    if (!wallet) {
      setWalletAddress((prev) => ({ ...prev, error: 'Wallet address is required' }));
      noErrors = false;
    } else if (!ethers.utils.isAddress(wallet)) {
      setWalletAddress((prev) => ({ ...prev, error: 'Invalid wallet address' }));
      noErrors = false;
    }

    return noErrors;
  }

  const clearError = () => {
    setWalletAddress((prev) => ({ ...prev, error: '' }));
  };

  const handleProceed = async () => {
    clearError()
    const date = new Date(new Date().valueOf() + 4 * 60 * 60 * 1000);

    if (!validateInput()) {
      return;
    }

    setCookie('walletAddress', walletAddress.value, {
      path: '/',
      expires: date,
      sameSite: 'none',
      secure: true,
    });

    const response = await api.getUserDetails(walletAddress.value)
    console.log("User details", response)
    if (response.status === 200) {
      setCookie('userId', response.data.userUuid, {
        path: '/',
        expires: date,
        sameSite: 'none',
        secure: true,
      });
      const email = response.data.email
      router.push({ pathname: '/otp', query: { email: email.replace(/\s/g, '') } });
    } else if (response.status === 404) {
      router.push('/basic_details')
    } else {
      setWalletAddress((prev) => ({ ...prev, error: 'Something went wrong. Please contact our support.' }));
    }
  }

  return (
    <div className={styles.container}>
      <BackButton>Connect your wallet</BackButton>
      <div className={styles.topContainer}>
        <div className={styles.imageBackgroundContainer}>
          <div className={[styles.textContainer, poppins.className].join(' ')}>
            <div className={styles.titleText}>
              Choose wisely,
              <br />
              chain explorer.
            </div>
            <div className={styles.regularText}>
              You can only connect one 0x wallet to your portal, and you won’t be able to change it.{' '}
            </div>
            <div className={styles.finger}>☝️</div>
          </div>
        </div>
      </div>
      <div className={[styles.helpText, poppins.className].join(' ')}>
        Enter the wallet you’d like to use to receive funds.
      </div>
      <div className={styles.formInput}>
      <TextInput
              value={walletAddress.value}
              onChange={(ev: any) => {
                setInput(ev.target.value, setWalletAddress);
              }}
              placeholder="0xfc0d6...Be8a3"
              error={walletAddress.error}
            />
      </div>
      <div className={styles.buttonContainer}>
        <FlexButton className={styles.button} onClick={()=> handleProceed()}>
          Proceed
        </FlexButton>
      </div>
    </div>
  );
}
