import { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { useRouter } from 'next/router';

import { UnblockApi } from '@/src/utils/UnblockApi';
import CircleLoader from '@/components/common/CircleLoader';
import MainButton from '@/components/common/MainButton/MainButton';

import styles from './kycStatus.module.css';

export default function KycStatus() {
  const [loading, setLoading] = useState(true);
  const [userStatus, setUserStatus] = useState('');
  const [cookies] = useCookies(['unblockSessionId', 'userId', 'parentDomain']);

  const router = useRouter();

  const getUserStatus = async () => {
    try {
      const api = new UnblockApi(cookies?.parentDomain, cookies?.unblockSessionId, cookies?.userId);
      const status = await api.getStatus();
      if (status.status === 200) {
        setUserStatus(status.data.status);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const bodyElements = (() => {
    switch (userStatus) {
      case 'FULL_USER':
        return {
          buttonAction: () => router.push('/portal'),
          buttonText: 'Continue',
          title: 'Success!',
          description: 'Your identity has been verified',
          className: styles.completed,
        };
      case 'SOFT_KYC_FAILED':
        return {
          buttonAction: () => router.push('/kyc/sumsub'),
          buttonText: 'Try again',
          title: 'Identity verification failed',
          description: 'We were unable to verify your identity. Please contact our support team.',
          className: styles.failed,
        };
      case 'HARD_KYC_FAILED':
        return {
          buttonAction: () => router.push('mailto:someone@getunblock.com'),
          buttonText: 'Get in touch',
          title: 'Identity verification failed',
          description: 'We were unable to verify your identity. Please contact our support team.',
          className: styles.failed,
        };
      case 'CREATED':
      default:
        return {
          buttonAction: () => router.push('/portal'),
          buttonText: 'Continue',
          title: 'Thank you',
          description: 'That’s all we need to start verifying you',
          className: '',
        };
    }
  })();

  useEffect(() => {
    getUserStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.container}>
      <div onClick={() => router.push('/')} className={styles.closeButton}></div>
      {loading ? (
        <CircleLoader size={260} />
      ) : (
        <>
          <div className={styles.top}>
            <div className={[styles.header, bodyElements.className].join(' ')}></div>
            <div className={styles.title}>{bodyElements.title}</div>
            <div className={styles.description}>{bodyElements.description}</div>
          </div>
          <div className={styles.bottom}>
            <MainButton onClick={bodyElements.buttonAction}>{bodyElements.buttonText}</MainButton>
          </div>
        </>
      )}
    </div>
  );
}
