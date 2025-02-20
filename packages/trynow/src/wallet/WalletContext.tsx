import { createContext, useReducer, useContext, ReactNode, useEffect } from 'react';
import { useRouter as uRouter } from 'next/navigation';
import { useRouter } from 'next/router';
import Onboard from '@web3-onboard/core';
import injectedModule from '@web3-onboard/injected-wallets';
import walletConnectModule from '@web3-onboard/walletconnect';
import { useCookies } from 'react-cookie';
import { ethers } from 'ethers';
import { shutdown, boot } from '@intercom/messenger-js-sdk';

import walletReducer, { initialWallet } from './walletReducer';
import { appMetadata, getChains, checkValidChain } from '@/src/utils/index';

const injected = injectedModule();

const onboardChains = getChains().map(({ id, token, label, rpcUrl }) => ({
  id,
  token,
  label,
  rpcUrl,
}));

const walletConnect = walletConnectModule({
  projectId: '27eae543f1106ec8afd9322f2926d99a',
});

const WalletContext = createContext(initialWallet);
const onboard = Onboard({
  wallets: [injected],
  chains: onboardChains,
  appMetadata,
  connect: {
    autoConnectLastWallet: true,
  },
  accountCenter: {
    desktop: {
      enabled: false,
    },
    mobile: {
      enabled: false,
    },
  },
});
onboard.state.actions.setWalletModules([
  injected,
  // walletConnect, - TODO: remove when wallet connect is approved
]);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(walletReducer, initialWallet);
  const [cookies, _, removeCookie] = useCookies([
    'walletAddress',
    'unblockSessionId',
    'userId',
    'intercomUserHash',
  ]);

  const { asPath } = useRouter();
  const { replace } = uRouter();

  const handleWalletChange = () => {
    shutdown();
    const APP_ID = process?.env?.NEXT_PUBLIC_INTERCOM_APP_ID ?? '';
    boot({
      app_id: APP_ID,
    });
    if (cookies?.unblockSessionId) {
      removeCookie('unblockSessionId', { path: '/' });
    }
    if (cookies?.intercomUserHash) {
      removeCookie('intercomUserHash', { path: '/' });
    }
    if (cookies?.userId) {
      removeCookie('userId', { path: '/' });
    }
    if (cookies?.walletAddress) {
      removeCookie('walletAddress', { path: '/' });
      replace('/');
    }
    dispatch({
      type: 'resetWallet',
    });
  };

  const connectToWallet = async () => {
    const wallets = await onboard.connectWallet();
    if (wallets.length && wallets[0]) {
      const selectedWallet = wallets[0];
      dispatch({
        type: 'setWallet',
        payload: {
          wallet: selectedWallet.accounts[0].address,
          chain: selectedWallet.chains[0].id,
          provider: selectedWallet.provider,
        },
      });
    }
  };

  const disconnectWallet = async () => {
    const [primaryWallet] = onboard.state.get().wallets;
    await onboard.disconnectWallet({
      label: primaryWallet.label,
    });
    handleWalletChange();
  };

  const setChain = async (chainId: number) => {
    const newChain = onboardChains.find(({ id }) => id === chainId);
    if (newChain) {
      try {
        const result = await onboard.setChain({
          chainId: newChain.id,
          rpcUrl: newChain.rpcUrl,
          label: newChain.label,
          token: newChain.token,
        });
        if (result) {
          dispatch({
            type: 'setChain',
            payload: {
              chain: chainId,
            },
          });
        }
        return result;
      } catch (error) {
        console.error(error);
        return false;
      }
    }
  };

  const checkCookies = () => {
    const cleanPath = asPath.split('?')[0];
    if (
      ![
        '/',
        '/intro',
        '/wallet/connect',
        '/wallet/confirm',
        '/select_network',
        '/basic_details',
      ].includes(cleanPath)
    ) {
      // if (!cookies?.unblockSessionId || !cookies.userId) {
      //   replace('/intro');
      // }
    }
  };

  const checkSelectedNetwork = (chain = state.chain) => {
    const query = new URLSearchParams(`?${asPath.split('?')[1] ?? ''}`);
    if (!asPath.includes('/select_network') && chain !== null && !checkValidChain(chain)) {
      replace(
        `/select_network${
          asPath.split('?')[0] && !asPath.split('?')[0]?.includes('/select_network')
            ? `?path=${asPath.split('?')[0]}`
            : ''
        }`,
      );
    }
    if (
      asPath.includes('/select_network') &&
      checkValidChain(chain) &&
      !query.get('switch_network')
    ) {
      replace(query.get('path') ?? '/');
    }
  };

  const checkCurrentAddress = async () => {
    let addresses = [];
    try {
      const provider = new ethers.providers.Web3Provider((window as any).ethereum);
      addresses = await provider.listAccounts();
    } catch (error) {
      console.error(error);
    }
    if (addresses?.length === 0) {
      dispatch({
        type: 'setLoading',
        payload: {
          loading: false,
        },
      });

      handleWalletChange();
    }
  };

  useEffect(() => {
    if (!state.loading) {
      checkSelectedNetwork();

      if (
        state.wallet &&
        cookies?.walletAddress &&
        cookies?.walletAddress?.toLowerCase() !== state.wallet?.toLowerCase()
      ) {
        handleWalletChange();
      }
      checkCookies();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asPath, state.loading, state.chain]);

  useEffect(() => {
    checkCurrentAddress();

    const walletsObservable = onboard.state.select('wallets');

    walletsObservable.subscribe((wallets) => {
      // const wallets = update.wallets;
      if (wallets.length && wallets[0] && wallets[0].accounts.length) {
        const selectedWallet = wallets[0];
        const selectedAddress = selectedWallet.accounts[0].address;
        const selectedChain =
          typeof selectedWallet.chains[0].id === 'string'
            ? Number.parseInt(selectedWallet.chains[0].id)
            : selectedWallet.chains[0].id;
        checkSelectedNetwork(selectedChain);

        if (
          cookies?.walletAddress &&
          cookies?.walletAddress?.toLowerCase() !== selectedAddress?.toLowerCase()
        ) {
          handleWalletChange();
        }

        dispatch({
          type: 'setWallet',
          payload: {
            wallet: selectedAddress,
            chain: onboardChains.find(({ id }) => id === selectedChain)?.id ?? selectedChain,
            provider: selectedWallet.provider,
          },
        });
      } else if (wallets.length && wallets[0] && !wallets[0].accounts.length) {
        handleWalletChange();
      }
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    ...state,
    connectToWallet,
    disconnectWallet,
    setChain,
  };
  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

const useWallet = (): any => {
  const context = useContext(WalletContext);

  if (context === undefined) {
    throw new Error('useWallet must be used within WalletContext');
  }

  return context;
};

export default useWallet;
