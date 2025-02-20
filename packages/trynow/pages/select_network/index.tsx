import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useCookies } from 'react-cookie';

import UnblockApi from '@/src/utils/UnblockApi';
import useWallet from '@/src/wallet/WalletContext';
import { getChains, poppins } from '@/src/utils/index';
import CircleLoader from '@/components/common/CircleLoader';

import styles from './index.module.css';

export default function SelectNetwork() {
  const [loading, setLoading] = useState(false);
  const [prevNetwork, setPrevNetwork] = useState<any>(null);
  const [currency, setCurrency] = useState<any>(null);
  const [cookies] = useCookies(['unblockSessionId', 'userId', 'parentDomain']);

  const { asPath, replace } = useRouter();
  const { setChain, chain } = useWallet();

  const validChains = getChains();
  const selectedNetwork = validChains.find(({ id }) => id === chain);

  const handleSelectedNetwork = async (id: number) => {
    setLoading(true);
    await setChain(id);
    setLoading(false);
  };

  const handleStay = async () => {
    setLoading(true);
    await setChain(prevNetwork.id);
    replace('/portal');
  };

  const handleSwitchNetwork = async () => {
    setLoading(true);
    try {
      const api = new UnblockApi(cookies?.parentDomain, cookies?.unblockSessionId, cookies?.userId);
      const result = await api.setTokenPreferences({
        currency,
        token: selectedNetwork?.defaultToken ?? '',
        chain: selectedNetwork?.name ?? '',
      });
      if (result.status === 204) {
        replace('/portal');
        return;
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    const query = new URLSearchParams(`?${asPath.split('?')[1] ?? ''}`);
    // @ts-ignore
    setPrevNetwork(validChains.find(({ name }) => name === query.get('switch_network') ?? false));
    setCurrency(query.get('currency')?.toUpperCase() ?? 'fiat');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.container}>
      {loading || prevNetwork === null ? (
        <CircleLoader size={260} />
      ) : (
        <>
          {prevNetwork || selectedNetwork ? (
            <>
              <div className={styles.networkConfirmContainer}>
                <div className={styles.networkConfirmTop}>
                  <div className={styles.networkConfirmHeader}></div>
                  <div
                    className={
                      styles.selectTitle
                    }>{`You are about to change your Portals default network to ${selectedNetwork?.label}. Are you sure?`}</div>
                  <div
                    className={
                      styles.text
                    }>{`Funds sent from your bank account appear on the ${selectedNetwork?.label} chain if you switch.`}</div>
                </div>
                <div className={styles.networkConfirmBottom}>
                  {prevNetwork && (
                    <NetworkSelectorButton
                      id={prevNetwork?.id ?? 0}
                      label={`Stay on ${prevNetwork?.label}`}
                      networkLogo={prevNetwork?.logo}
                      onClick={handleStay}
                    />
                  )}
                  <NetworkSelectorButton
                    id={selectedNetwork?.id ?? 0}
                    label={`Switch to ${selectedNetwork?.label}`}
                    networkLogo={selectedNetwork?.logo}
                    onClick={handleSwitchNetwork}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className={styles.networkSelector}>
                <div className={styles.selectTitle}>
                  Oops.
                  <br />
                  Looks like you’re connected to an unsupported network
                </div>
                <div className={styles.buttonContainer}>
                  {validChains.map(({ id, logo, label }) => (
                    <NetworkSelectorButton
                      key={id}
                      id={id}
                      label={`Switch to ${label}`}
                      networkLogo={logo}
                      onClick={() => handleSelectedNetwork(id)}
                    />
                  ))}
                </div>
              </div>
              <div className={styles.background}></div>
            </>
          )}
        </>
      )}
    </div>
  );
}

const NetworkSelectorButton = ({
  id,
  networkLogo,
  label,
  onClick,
}: {
  id: number;
  networkLogo: string;
  label: string;
  onClick: Function;
}) => {
  return (
    <div className={styles.button} onClick={() => onClick()}>
      <div className={styles.buttonContent}>
        <div className={styles.buttonLogo}>
          <Image alt={``} src={networkLogo} />
        </div>
        <div className={[styles.buttonName, poppins.className].join(' ')}>{label}</div>
      </div>
    </div>
  );
};
