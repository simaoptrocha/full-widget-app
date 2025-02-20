import { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import Image from 'next/image';
import { useRouter } from 'next/router';

import useWallet from '@/src/wallet/WalletContext';
import { getChains } from '@/src/utils/index';
import UnblockApi from '@/src/utils/UnblockApi';

import CircleLoader from '@/components/common/CircleLoader';
import BackButton from '@/components/common/BackButton/BackButton';
import MainButton from '@/components/common/MainButton/MainButton';

import styles from './reviewBank.module.css';

export default function ReviewBank() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [bankAccount, setBankAccount] = useState<any>(null);

  const [cookies] = useCookies(['unblockSessionId', 'userId', 'parentDomain']);
  const { wallet, chain } = useWallet();

  const router = useRouter();

  const selectedChain = getChains().find(({ id }) => id === chain);

  const loadInfo = async () => {
    try {
      const api = new UnblockApi(cookies?.parentDomain, cookies?.unblockSessionId, cookies?.userId);
      const [status, banks] = await Promise.all([api.getStatus(), api.getRemoteBankAccounts()]);
      setUserData(status?.data);
      setBankAccount(banks?.data?.find((bank: any) => bank.main_beneficiary));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.container}>
      {loading ? (
        <CircleLoader size={260} />
      ) : (
        <>
          <BackButton>{"Let's Review"}</BackButton>
          <div className={styles.topContainer}>
            <div className={styles.boldText}>Wallet address where you’ll receive your crypto</div>
            <div className={styles.walletInfoHolder}>
              <div className={styles.chainLogo}>
                <Image
                  style={{ width: 42, height: 42 }}
                  src={selectedChain?.logo}
                  alt={`${selectedChain?.label} logo`}
                />
              </div>
              <div className={styles.walletInfoTextContainer}>
                <div className={styles.chainName}>{`${selectedChain?.label} wallet address`}</div>
                <div className={styles.walletAddress}>{`${wallet.slice(0, 3)}...${wallet.slice(
                  20,
                  -1,
                )}`}</div>
              </div>
            </div>
            <div>
              <InfoElement
                label="Legal name"
                value={`${userData?.first_name} ${userData?.last_name}`}
              />
              <InfoElement label="Email address" value={userData?.email} />
              <InfoElement
                label="Primary bank account"
                value={bankAccount?.iban ?? bankAccount?.account_number ?? ''}
              />
            </div>
          </div>
          <div className={styles.bottomContainer}>
            <MainButton onClick={() => router.push('/portal')}>View portal details</MainButton>
          </div>
        </>
      )}
    </div>
  );
}

const InfoElement = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className={styles.infoElement}>
      <div className={[styles.infoElementLabel, styles.boldText].join(' ')}>{label}</div>
      <div className={styles.infoElementData}>
        <div className={styles.infoElementDataText}>{value}</div>
        <div className={styles.infoElementDataButton}></div>
      </div>
    </div>
  );
};
