import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import Image from 'next/image';

import { poppins } from '@/src/utils';
import MainButton from '@/components/common/MainButton/MainButton';
import mirrorImage from '@/public/images/portal_mirror.png';
import styles from './index.module.css';
import UnblockApi from '@/src/utils/UnblockApi';

export default function Intro({
  textOptions = {
    introTitle: 'Send funds from your bank account to your wallet in under a minute',
    introDescription:
      'To start sending funds to and from your crypto wallet, directly from (or to) your bank account, all we’ll need is your name, email and the bank account you want to use to receive funds.',
    introButtonTitle: 'Let’s gooooooo!',
    introAdditionalText: 'Transferring funds on-and-off-chain has never been easier!',
  },
}) {
  const router = useRouter();
  const [cookies, setCookie] = useCookies([
    'unblockSessionId',
    'userId',
    'parentDomain',
    'walletAddress',
  ]);

  const api = new UnblockApi(cookies?.parentDomain, cookies?.unblockSessionId, cookies?.userId);

  const handleWithWallet = async () => {
    const date = new Date(new Date().valueOf() + 4 * 60 * 60 * 1000);

    setCookie('walletAddress', cookies?.walletAddress, {
      path: '/',
      expires: date,
      sameSite: 'none',
      secure: true,
    });

    const response = await api.getUserDetails(cookies?.walletAddress)
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
      console.log("Something went wrong. Please contact our support.")
    }
    
  }

  useEffect(() => {
    function handleParentMessage(event: MessageEvent) {
      if (event.data && event.data.type === 'parent-handshake') {
        console.log('Event origin', event.origin);

        const date = new Date(new Date().valueOf() + 4 * 60 * 60 * 1000);

        setCookie('parentDomain', event.origin, {
          path: '/',
          expires: date,
          sameSite: 'none',
          secure: true,
        });
      }
    }
    window.addEventListener('message', handleParentMessage);

    return () => {
      window.removeEventListener('message', handleParentMessage);
    };
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.topContainer}>
        <div className={styles.imageContainer}>
          <Image width={185} src={mirrorImage} alt="mirror" />
        </div>
        <div className={styles.textContainer}>
          <div className={styles.titleText}>{textOptions.introTitle}</div>
          <div className={[styles.regularText, poppins.className].join(' ')}>
            {textOptions.introDescription}
          </div>
          <div className={[styles.regularText, poppins.className].join(' ')}>
            {textOptions.introAdditionalText}
          </div>
        </div>
      </div>
      <div className={styles.buttonContainer}>
        <MainButton
          onClick={() =>
            cookies?.walletAddress ? handleWithWallet() : router.push('/wallet/connect')
          }>
          {textOptions.introButtonTitle}
        </MainButton>
      </div>
    </div>
  );
}
