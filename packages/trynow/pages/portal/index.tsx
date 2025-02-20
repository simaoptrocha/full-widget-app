import { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { useRouter } from 'next/router';
import Tooltip from '@mui/material/Tooltip';
import Fade from '@mui/material/Fade';
import Link from 'next/link';

import { getChains, checkValidChain, formatSortCode, poppins, getChainById, getChainNameById, getChainLabelByName, getTokenNameById } from '@/src/utils/index';
import UnblockApi from '@/src/utils/UnblockApi';
import CircleLoader from '@/components/common/CircleLoader';

import styles from './portal.module.css';

export default function Portal({ setBottomElement }: { setBottomElement: Function }) {
  const [selectedTab, setSelectedTab] = useState('in');
  const [loading, setLoading] = useState(true);
  const [unblockBankAccount, setUnblockBankAccount] = useState<any>(null);
  const [remoteBankAccount, setRemoteBankAccount] = useState<any>(null);
  const [offRampAddress, setOffRampAddress] = useState<any>(null);
  const [exchangeRate, setExchangeRate] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [chainInfo, setChainInfo] = useState<any>(null)
  // const [inCurrency, setInCurrency] = useState<any>(null)

  const [cookies] = useCookies(['unblockSessionId', 'userId', 'parentDomain', 'chain', 'currency']);
  const router = useRouter();
  const selectedChain = getChainById(cookies?.chain)

  const getBankAndLedgers = async () => {
    setLoading(true);
    const api = new UnblockApi(cookies?.parentDomain, cookies?.unblockSessionId, cookies?.userId);
    const [userStatus, banks, unblockBanks,  tokenPreferences] = await Promise.all([
      api.getStatus(),
      api.getRemoteBankAccounts(),
      api.getUnblockBankAccounts(),
      api.getTokenPreferences(),
    ]);
    const offRampAddress = await api.getOffRampAddress(selectedChain?.name || '')
    console.log("userStatus, banks, unblockBanks, offRampAddress, tokenPreferences", userStatus, banks, unblockBanks, offRampAddress, tokenPreferences)

    if (userStatus.status === 401) {
      router.replace('/');
      return;

    }
    if (userStatus.status === 200) {
      setUser(userStatus.data);
    }
    if (offRampAddress.status == 200) {
      setOffRampAddress(offRampAddress.data[0].address);
    }
    if (banks.status === 200 && unblockBanks.status === 200) {
      const mainBank = banks.data.find(
        ({ main_beneficiary }: { main_beneficiary: boolean }) => main_beneficiary,
      );

      console.log("main bank before reroute", mainBank)
      if (!mainBank) {
        router.replace('/bank/add');
        return;
      }
      const mainBankCurrency = mainBank?.iban?.length > 10 ? 'EUR' : 'GBP';
      // setInCurrency(mainBankCurrency);
      if (userStatus?.data?.userData?.currency || mainBank?.currency || mainBankCurrency) {
        const userCurrency =
          userStatus?.data?.userData?.currency || mainBank?.currency || mainBankCurrency;
        const foundSelected = tokenPreferences?.data.find(
          ({ currency }: { currency: string }) =>
            currency.toLowerCase() === userCurrency.toLowerCase(),
        );
        setChainInfo(foundSelected)
        console.log("Found selected", foundSelected)
        if (
          foundSelected &&
          checkValidChain(selectedChain?.id || -1) &&
          foundSelected?.chain.toLowerCase() !== selectedChain?.name
        ) {
          router.push(
            `/select_network?switch_network=${foundSelected?.chain.toLowerCase()}&currency=${userCurrency}`,
          );
          return;
        }

        console.log("1. Found selected", foundSelected);
        console.log("2. Selected Chain", selectedChain)
        console.log("3. User currency", userCurrency)
        if (foundSelected?.token.toUpperCase() !== selectedChain?.defaultToken.toUpperCase()) {
          // api.setTokenPreferences({
          //   currency: userCurrency.toUpperCase(),
          //   token: selectedChain?.defaultToken ?? '',
          //   chain: selectedChain?.name ?? '',
          // });
        }
      }
      setRemoteBankAccount(mainBank);
      console.log("Main bank after set", mainBank)

      const remoteCurrencyBank = unblockBanks.data.find(
        ({ currency }: { currency: string }) =>
          currency === (mainBank.currency || mainBankCurrency),
      );

      const unblockBankUuid = (await api.createUnblockBankAccount(cookies?.currency)).data.uuid

      // const unblockBankUuid = remoteCurrencyBank
      //   ? remoteCurrencyBank.uuid
      //   : (await api.createUnblockBankAccount(mainBank.currency || mainBankCurrency)).data?.uuid;

      if (unblockBankUuid) {
        const unblockBank = await api.getUnblockBankAccount(unblockBankUuid);
        console.log("Unblock bank", unblockBank)
        setUnblockBankAccount(unblockBank.data);
      }

      const [exchangeRateResult, transactionFees] = await Promise.all([
        api.getExchangeRates('EUR', mainBank.currency || mainBankCurrency),
        api.getTransactionFees(mainBank.currency || mainBankCurrency, 'USDC'),
      ]);

      console.log("Main bank currency", mainBankCurrency)

      console.log("exchange rates, transactions", exchangeRateResult, transactionFees)
      if (exchangeRateResult.status === 200) {
        setExchangeRate({
          from: 'agEUR',
          to: (mainBank.currency || mainBankCurrency).toUpperCase(),
          exchangeRate: exchangeRateResult.data.exchange_rate,
          fees: transactionFees.data?.total_fee_percentage || NaN,
        });
        
      }
    }
    setLoading(false);
  };

  useEffect(() => {

      getBankAndLedgers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cookies?.chain]);

  useEffect(() => {
    getBankAndLedgers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cookies?.chain]);

  useEffect(() => {
    // setBottomElement(
    //   <div>
    //     Need help with anything?{' '}
    //     <Link target="_blank" href={'https://www.getunblock.com/policies/policies'}>
    //       Get in touch
    //     </Link>
    //     <br />
    //     Our team is available Mon – Fri, 9h00 — 18h00 CET
    //   </div>,
    // );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.container}>
      {loading ? (
        <CircleLoader size={380} />
      ) : (
        <>
          <div className={styles.tabSelectorContainer}>
            <div className={styles.tabButtonsContainer}>
              <div
                onClick={() => setSelectedTab('in')}
                className={[styles.tabSelectorButton, selectedTab === 'in' && styles.selected].join(
                  ' ',
                )}>
                Portal in
              </div>
              <div
                onClick={() => setSelectedTab('out')}
                className={[
                  styles.tabSelectorButton,
                  selectedTab === 'out' && styles.selected,
                ].join(' ')}>
                Portal out
              </div>
            </div>
            <div className={styles.horizontalSeparator}></div>
          </div>
          <div className={styles.tabbedContent}>
            {selectedTab === 'in' ? (
              <div className={styles.tabContainer}>
                <div className={[styles.infoTextContainer, poppins.className].join(' ')}>
                  <div className={styles.boldText}>
                    Send {unblockBankAccount?.currency} from a bank account in your name to this account to get {chainInfo?.token}
                  </div>
                  <div>
                    {
                      'Use these account details to transfer funds to your wallet directly from your bank account.'
                    }
                  </div>
                </div>
                <div>
                  {unblockBankAccount?.account_name && (
                    <Info
                      label="Beneficiary account name"
                      content={unblockBankAccount?.account_name}
                    />
                  )}
                  {unblockBankAccount?.currency === 'EUR' ? (
                    <>
                      <Info label="IBAN" content={unblockBankAccount?.iban} />
                      <Info label="SWIFT / BIC" content={unblockBankAccount?.bic} />
                    </>
                  ) : (
                    <>
                      <Info
                        label="Sort code"
                        content={formatSortCode(unblockBankAccount?.sort_code)}
                      />
                      <Info label="Account number" content={unblockBankAccount?.account_number} />
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className={styles.tabContainer}>
                <div className={styles.infoTextContainer}>
                  <div className={styles.boldText}>{`Send supported crypto to this 0x wallet to get ${
                    unblockBankAccount?.currency ?? ''
                  }.`}</div>
                  <div>{`Sending funds to the wallet address below sends ${
                    unblockBankAccount?.currency ?? ''
                  } directly to your bank account. Make sure you’re sending funds on the ${
                    selectedChain?.label
                  } network.`}</div>
                </div>
                <div>
                  <Info label="Wallet address" content={offRampAddress} />
                  <Info action={null} label="Network" content={getChainLabelByName(chainInfo?.chain) ?? ''} />
                  {unblockBankAccount?.currency === 'EUR' ? (
                    <Info
                      action={null}
                      label={`Bank account where  you’ll receive your ${
                        unblockBankAccount?.currency ?? ''
                      }`}
                      content={remoteBankAccount?.iban}
                    />
                  ) : (
                    <>
                      <Info
                        action={null}
                        label={`Bank account where  you’ll receive your ${
                          unblockBankAccount?.currency ?? ''
                        }`}
                        content={remoteBankAccount?.account_number}
                      />
                      <Info
                        action={null}
                        label={`Sort code`}
                        content={formatSortCode(remoteBankAccount?.sort_code)}
                      />
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className={styles.bottomContainer}>
            <div className={styles.feesContainer}>
              {exchangeRate && (
                <>
                  <div>Fees = {(exchangeRate.fees * 100).toFixed(2)}%</div>
                  <div>
                    {`Current rate ${exchangeRate.exchangeRate.toFixed(5)} ${exchangeRate.to} ≈ 1 ${
                      exchangeRate.from
                    }`}
                  </div>
                </>
              )}
            </div>
            {user?.status === 'KYC_PENDING' && (
              <div className={styles.kycStatusContainer}>
                <div className={styles.kycSymbol}></div>
                <div className={styles.kycStatusText}>
                  <span className={styles.bold}>Verification in progress. </span>
                  {
                    'You’ll be notified once we have reviewed your identity verification. This usually takes 5 minutes.'
                  }
                </div>
              </div>
            )}
            {/* {user?.email &&
              user?.userData?.createdAt &&
              new Date(user?.userData?.createdAt).valueOf() + 3 * 60 * 60 * 1000 >
                new Date().valueOf() && (
                <div className={styles.emailInfo}>
                  <div className={styles.emailSymbol}></div>
                  <div className={styles.emailText}>
                    {`We’ve also sent your Portal details to ${user?.email}. Use it from anywhere!`}
                  </div>
                </div>
              )} */}
          </div>
        </>
      )}
    </div>
  );
}

const Info = ({
  label,
  content,
  action,
}: {
  label: string;
  content: string;
  action?: { label: string; onClick: Function } | null;
}) => {
  const [open, setOpen] = useState(false);

  const handleTooltipClose = () => {
    setOpen(false);
  };

  const copyToClipboard = () => {
    setOpen(true);
    navigator.clipboard.writeText(content);
    setTimeout(() => setOpen(false), 1000);
  };

  return (
    <div className={styles.infoContainer}>
      <div className={styles.infoLabel}>{label}</div>
      <div className={styles.bottomInfo}>
        <div className={styles.infoContent}>
          {content?.length > 30 ? `${content.slice(0, 3)}...${content.slice(-20)}` : content}
        </div>
        {action !== null && (
          <Tooltip
            PopperProps={{
              disablePortal: true,
            }}
            onClose={handleTooltipClose}
            open={open}
            TransitionComponent={Fade}
            TransitionProps={{ timeout: 600 }}
            disableFocusListener
            disableHoverListener
            disableTouchListener
            title="copied">
            <div
              className={[styles.copyButton, poppins.className].join(' ')}
              onClick={() => action?.onClick() ?? copyToClipboard()}>
              {action?.label ?? 'copy'}
            </div>
          </Tooltip>
        )}
      </div>
    </div>
  );
};
