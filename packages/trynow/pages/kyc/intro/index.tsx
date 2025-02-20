import { useState } from 'react';
import { useCookies } from 'react-cookie';
import { useRouter } from 'next/router';

import UnblockApi from '@/src/utils/UnblockApi';
import MainButton from '@/components/common/MainButton/MainButton';
import { poppins } from '@/src/utils/index';
import CircleLoader from '@/components/common/CircleLoader';

import styles from './intro.module.css';

export default function Intro() {
  const [loading, setLoading] = useState(false);
  const [cookies] = useCookies(['unblockSessionId', 'userId', 'parentDomain']);

  const router = useRouter();

  const goNextPage = async () => {
    try {
      setLoading(true);
      const api = new UnblockApi(cookies?.parentDomain, cookies?.unblockSessionId, cookies?.userId);
      const kycApplicantToken = await api.getKycAccessToken();
      if (
        kycApplicantToken.status === 400 &&
        kycApplicantToken.data.error.includes('No KYC applicant exists for user with UUID')
      ) {
        router.push('/kyc/basic_details');
      } else if (kycApplicantToken.status === 200) {
        router.push('/kyc/sumsub');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div onClick={() => router.push('/')} className={styles.closeButton}></div>
      <div className={styles.header}></div>
      <div className={styles.textContainer}>
        <div className={styles.title}>It’s time to verify...</div>
        <div className={[styles.description, poppins.className].join(' ')}>
          {
            "To keep using your Portal, we're legally required to verify your identity. It should take a few minutes (You’ll only be asked to do this once!)"
          }
        </div>
        <div className={styles.listTitle}>{"Here's what you’ll need to do:"}</div>
        <ol className={styles.list}>
          <li className={[styles.listItem, poppins.className].join(' ')}>
            Provide some basic information
          </li>
          <li className={[styles.listItem, poppins.className].join(' ')}>
            Upload a photo of your ID or passport
          </li>
          <li className={[styles.listItem, poppins.className].join(' ')}>Take a selfie</li>
        </ol>
      </div>
      <div className={styles.bottom}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <CircleLoader size={45} />
          </div>
        ) : (
          <MainButton onClick={goNextPage}>Continue</MainButton>
        )}
      </div>
    </div>
  );
}
