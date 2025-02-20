import { useEffect, useState } from 'react';
import { ethers, Signer } from 'ethers';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import { useCookies } from 'react-cookie';
import UnblockApi from '@/src/utils/UnblockApi';
import useWallet from '@/src/wallet/WalletContext';
import {
  chains,
  createSiweMessage,
  checkUserNextStep,
  handleSiweResponse,
} from '@/src/utils/index';
import { poppins } from '@/src/utils/index';

import CircleLoader from '@/components/common/CircleLoader';
import BackButton from '@/components/common/BackButton/BackButton';
import FlexButton from '@/components/common/FlexButton/FlexButton';

import styles from './index.module.css';

export default function Confirm({ setBottomElement }: { setBottomElement: Function }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [signer, setSigner] = useState<Signer | null>(null);
  const [_, setCookie] = useCookies([
    'unblockSessionId',
    'userId',
    'walletAddress',
    'intercomUserHash',
  ]);

  const router = useRouter();
  const { provider, wallet, chain, loading: loadingWallet } = useWallet();

  const signMessage = async () => {
    setLoading(true);
    setError('');
    try {
      const api = new UnblockApi();
      if (!signer) {
        throw new Error('No signer found');
      }
      const { message, signature } = await createSiweMessage(signer, chain);

      if (!message || !signature) {
        setError(
          'We cannot proceed without confirming ownership of this address. Please try signing the message again',
        );
        return;
      }
      const response = await api.loginSiwe(message, signature ?? '');
      handleSiweResponse(response, await signer?.getAddress(), setCookie);
      if (response.status === 200) {
        const { unblock_session_id, user_uuid } = response.data;
        await navigateTo(unblock_session_id, user_uuid);
      } else if (
        response.status === 400 &&
        response?.data?.message?.toLowerCase()?.includes('user not found')
      ) {
        sessionStorage.setItem(
          'siwe',
          JSON.stringify({
            address: wallet,
            message,
            signature,
          }),
        );
        router.push('/basic_details');
      } else if (
        response.status === 404 &&
        response.data?.name === 'UserNotAssociatedWithMerchant'
      ) {
        setError(
          'This wallet is already associated with another merchant. Please try using a different wallet',
        );
      } else {
        setError(
          'An error has occurred while connecting your wallet. Please try again later or contact our support team.',
        );
      }
    } catch (error) {
      setError(
        'An error has occurred while connecting your wallet. Please try again later or contact our support team.',
      );
    } finally {
      setLoading(false);
    }
  };

  const navigateTo = async (unblockSessionId: string, userId: string) => {
    const api = new UnblockApi(unblockSessionId, userId);
    const [status, banks, transactions] = await Promise.all([
      api.getStatus(),
      api.getRemoteBankAccounts(),
      api.getTransactions(),
    ]);
    checkUserNextStep(router, status, banks, transactions);
  };

  useEffect(() => {
    if ((!wallet || !provider) && !loadingWallet) {
      router.replace('/');
      return;
    }
    if (provider) {
      setSigner(new ethers.providers.Web3Provider(provider, 'any').getSigner());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, wallet, loadingWallet]);

  useEffect(() => {
    setBottomElement(
      <div>
        {'By confirming your wallet address above, you agree to Unblock’s '}
        <Link target="_blank" href={'https://www.getunblock.com/policies/policies'}>
          terms and conditions
        </Link>
      </div>,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedChain = chains.find(({ id }) => id === chain);

  return (
    <div className={styles.container}>
      <BackButton>Confirm ownership</BackButton>
      <div className={styles.topContainer}>
        <div className={styles.textContainer}>
          <div className={[styles.regularText, poppins.className].join(' ')}>
            {
              "Please sign with your wallet to confirm ownership of this wallet address. Don't worry, signing is free and won't require any gas fees. This process only confirms your ownership and won't grant access to any of your assets."
            }
          </div>
        </div>
        <div className={styles.boldText}>
          <br />
          {'Wallet address where you’ll receive your crypto'}
        </div>
        <div className={styles.walletAddressContainer}>
          <div className={styles.walletChainLogo}>
            {chain && <Image src={selectedChain?.logo} alt={`chain logo`} width={42} height={42} />}
          </div>
          <div className={styles.walletAddressTextContainer}>
            <div className={[styles.walletAddressDescription, poppins.className].join(' ')}>
              {`${selectedChain?.label} wallet address`}
            </div>
            <div className={styles.walletAddress}>
              {wallet && `${wallet.slice(0, 3)}...${wallet.slice(-20)}`}
            </div>
          </div>
        </div>
        <div className={styles.gradientContainer}>
          <div>
            {
              "Make sure you’ve connected the correct wallet.  Once you have signed, you won't be able to switch to another wallet."
            }
          </div>
        </div>
      </div>
      <div className={styles.bottomContainer}>
        <div className={styles.errorText}>{error}</div>
        {loading ? (
          <div className={styles.loadingContainer}>
            <CircleLoader size={100} />
            <div className={styles.bottomText}>Waiting for confirmation...</div>
          </div>
        ) : (
          <div>
            <FlexButton
              onClick={() => {
                signer && signMessage();
              }}>
              Confirm wallet address
            </FlexButton>
          </div>
        )}
      </div>
    </div>
  );
}
