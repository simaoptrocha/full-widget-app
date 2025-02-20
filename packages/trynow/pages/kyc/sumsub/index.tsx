import { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { useRouter } from 'next/router';
import SumsubWebSdk from '@sumsub/websdk-react';

import UnblockApi from '@/src/utils/UnblockApi';

import styles from './sumsub.module.css';

export default function Sumsub() {
  const [token, setToken] = useState('');
  const [cookies] = useCookies(['unblockSessionId', 'userId', 'parentDomain']);

  const router = useRouter();

  const getToken = async () => {
    const api = new UnblockApi(cookies?.parentDomain, cookies?.unblockSessionId, cookies?.userId);
    const tokenResult = await api.getKycAccessToken();

    if (tokenResult.status === 200) {
      setToken(tokenResult.data?.token);
    } else if (tokenResult.status === 500) {
      router.replace('/kyc/basic_details');
    }
  };

  useEffect(() => {
    getToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.container}>
      <div onClick={() => router.push('/')} className={styles.closeButton}></div>
      {token ? (
        <SumsubWebSdk
          accessToken={token}
          expirationHandler={async () => {
            return '';
          }}
          onMessage={(message: any, status: any) => {
            if (
              message.toLowerCase().includes('applicantstatus') &&
              ((status?.reviewStatus === 'completed' &&
                status?.reviewResult?.reviewAnswer === 'GREEN') ||
                status?.reviewStatus === 'pending')
            ) {
              router.replace('/kyc/status');
            }
          }}
          onError={(message: any) => console.error('ERROR', message)}
        />
      ) : (
        <></>
      )}
    </div>
  );
}
