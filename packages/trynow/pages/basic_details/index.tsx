import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { ethers, Signer } from 'ethers';
import Image from 'next/image';
import { useCookies } from 'react-cookie';
import { validateEmail, currenciesList, handleSiweResponse, validCountriesList, chains, tokens, getChainIdByLabel, getChainSlugByLabel, getTokenNameById, getChainLabelById } from '@/src/utils';
import UnblockApi from '@/src/utils/UnblockApi';

import CircleLoader from '@/components/common/CircleLoader';
import { TextInput } from '@/components/common/TextInput';
import { Select } from '@/components/common/Select';
import BackButton from '@/components/common/BackButton/BackButton';
import MainButton from '@/components/common/MainButton/MainButton';

import styles from './basicDetails.module.css';

type TokenOption = {
  id: string;
  name: string;
  searchText: string;
  content: JSX.Element;
};

export default function BasicDetails() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState({ value: '', error: '' });
  const [walletAddress, setWalletAddress] = useState({ value: '', error: '' });
  const [email, setEmail] = useState({ value: '', error: '' });
  const [currency, setCurrency] = useState({ value: '', error: '' });
  const [country, setCountry] = useState({ value: '', error: '' });
  const [cookies, setCookie, removeCookie] = useCookies([
    'unblockSessionId',
    'userId',
    'walletAddress',
    'intercomUserHash',
    'parentDomain',
    'chain',
    'token',
    'currency'
  ]);

  const [chain, setChain] = useState({ value: '', error: '' });
  const [preferredToken, setPreferredToken] = useState({ value: '', error: '' });  
  const [availableTokens, setAvailableTokens] = useState<TokenOption[]>([]);

  
  const walletFromCookie = cookies.walletAddress;
  const router = useRouter();

  const countries = useMemo(
    () =>
      validCountriesList.map(({ value, label }: { value: string; label: string }) => ({
        id: value.toLowerCase(),
        name: label,
        searchText: `${value.toLowerCase()}${label.toLowerCase()}`,
        content: (
          <div className={styles.listElement}>
            <div className={styles.flagImage}>
              <Image
                src={`/icons/flags/${value.toLowerCase()}.svg`}
                alt={'flag'}
                width={33}
                height={33}
              />
            </div>
            <div>{label}</div>
          </div>
        ),
      })),
    [],
  );

  const currencies = currenciesList.map(({ id, name, icon }) => ({
    id: id.toLowerCase(),
    name,
    searchText: `${id.toLowerCase()}${name.toLowerCase()}`,
    content: (
      <div className={styles.listElement}>
        <div className={styles.flagImage}>
          <Image
            src={`/icons/flags/${icon.toLowerCase()}.svg`}
            alt={'flag'}
            width={33}
            height={33}
          />
        </div>
        <div>{`${name} (${id.toUpperCase()})`}</div>
      </div>
    ),
  }));

  const supportedChains = chains.map(({id, name, label, icon}) => ({
    name: label,
    id: label,
    searchText: `${label.toLowerCase()}${label.toLowerCase()}`,
    
    content: (
      <div className={styles.listElement}>
        <div className={styles.flagImage}>
          <Image
            src={`/images/${icon}.svg`}
            alt={'flag'}
            width={33}
            height={33}
          />
        </div>
        <div>{`${label}`}</div>
      </div>
    ),
  }));

  const setInput = (value: string, setInput: Function) => {
    setInput((prev: any) => ({ ...prev, value }));
  };

  const validateInputs = () => {
    let noErrors = true;

    const wallet = walletFromCookie || walletAddress.value;

    if (!validateEmail(email.value)) {
      setEmail((prev) => ({ ...prev, error: 'Invalid email' }));
      noErrors = false;
    }
    if (!userName.value.length) {
      setUserName((prev) => ({ ...prev, error: 'This field cannot be empty' }));
      noErrors = false;
    }
    if (!currency.value.length) {
      setCurrency((prev) => ({ ...prev, error: 'This field cannot be empty' }));
      noErrors = false;
    }
    if (!country.value.length) {
      setCountry((prev) => ({ ...prev, error: 'This field cannot be empty' }));
      noErrors = false;
    }

    if (!chain.value.length) {
      setChain((prev) => ({ ...prev, error: 'This field cannot be empty' }));
      noErrors = false;
    }

    if (!preferredToken.value.length) {
      setPreferredToken((prev) => ({ ...prev, error: 'This field cannot be empty' }));
      noErrors = false;
    }

    if (!wallet) {
      setWalletAddress((prev) => ({ ...prev, error: 'Wallet address is required' }));
      noErrors = false;
    } else if (!ethers.utils.isAddress(wallet)) {
      setWalletAddress((prev) => ({ ...prev, error: 'Invalid wallet address' }));
      noErrors = false;
    }

    return noErrors;
  };

  const clearErrors = () => {
    setEmail((prev) => ({ ...prev, error: '' }));
    setUserName((prev) => ({ ...prev, error: '' }));
    setCurrency((prev) => ({ ...prev, error: '' }));
    setWalletAddress((prev) => ({ ...prev, error: '' }));
  };

  const createUserManual = async () => {
    try {
      setLoading(true);
      const api = new UnblockApi(cookies?.parentDomain ?? '');
      const countryCode = country.value.toUpperCase();
      const wallet = walletFromCookie || walletAddress.value;
      const nameSplit = userName.value.trim().split(' ');
      const lastName = nameSplit.length > 1 ? nameSplit.pop() : '';
      const chainValue = getChainSlugByLabel(chain.value);
      const tokenValue = preferredToken.value.toLowerCase();
      const currencyPref = currency.value.toUpperCase()

      const tokenPreferences = [
        {
          currency: currency.value.toUpperCase(),
          chain: chainValue || '',
          token: tokenValue
        }
      ];

      if (!wallet) {
        throw new Error('Wallet address is required.');
      }

      const createUserResponse = await api.createUser(
      nameSplit.join(' '),
      lastName ?? '',
      email.value.replace(/\s/g, ''),
      wallet,
      countryCode,
      currencyPref,
      tokenPreferences
      );

      if (createUserResponse.status === 201) {
        sessionStorage.setItem('userId', createUserResponse.data.user_uuid);
        sessionStorage.setItem('walletAddress', wallet);
        sessionStorage.setItem('email', email.value.replace(/\s/g, ''));

        const date = new Date(new Date().valueOf() + 4 * 60 * 60 * 1000);

        const chainValue = getChainIdByLabel(chain.value)
        const tokenValue = preferredToken.value.toLowerCase()
        setCookie('chain', chainValue, {
          path: '/',
          expires: date,
          sameSite: 'none',
          secure: true,
        });

        setCookie('token', tokenValue, {
          path: '/',
          expires: date,
          sameSite: 'none',
          secure: true,
        });

        setCookie('currency', currencyPref.toUpperCase(), {
          path: '/',
          expires: date,
          sameSite: 'none',
          secure: true,
        });

        router.replace({ pathname: '/otp', query: { email: email.value.replace(/\s/g, '') } });
      } else {
        throw new Error(createUserResponse?.data?.message);
      }
    } catch (error: any) {
      console.error(error);
      setError(error?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleContinue = () => {
    clearErrors();
    if (!validateInputs()) {
      return;
    }

    createUserManual();
  };

  useEffect(() => {
    if (chain.value) {
      const chainSlug = getChainSlugByLabel(chain.value);
      
      if (!chainSlug) {
        setAvailableTokens([]);
        return;
      }
  
      const tokensForChain = tokens[chainSlug as keyof typeof tokens] || [];
  
      const formattedTokens = tokensForChain.map((token) => ({
        id: token.id.toLowerCase(),
        name: token.name,
        searchText: token.name.toLowerCase(),
        content: (
          <div className={styles.listElement}>
            <div className={styles.flagImage}>
              <Image src={token.logo} alt={token.name} width={33} height={33} />
            </div>
            <div>{token.name}</div>
          </div>
        ),
      }));
  
      setAvailableTokens(formattedTokens);
      if(!cookies?.token)
      {
        setPreferredToken((prev) => ({ ...prev, value: '', error: '' }));
      }
    }
  }, [chain.value]);

  useEffect(() => {
    const storedChain = getChainLabelById(cookies?.chain);
    const storedToken = getTokenNameById(cookies?.token);
  
    if (storedChain) {
      setChain((prev) => ({ ...prev, value: storedChain }));
    }
  
    if (storedToken) {
      setPreferredToken((prev) => ({ ...prev, value: storedToken }));
    }
  }, [cookies.chain, cookies.token]); 
  

  const renderStep = () => {
    return (
      <>
        <div className={styles.formInput}>
          {walletFromCookie ? (
            <div className={styles.formInput}>
              <TextInput
                value={
                  walletFromCookie
                    ? `${(walletFromCookie).slice(0, 6)}...${(
                         walletFromCookie
                      ).slice(-4)}`
                    : walletAddress.value
                }
                onChange={(ev: any) => {
                  setInput(ev.target.value, setWalletAddress);
                }}
                placeholder="0xfc0d6...Be8a3"
                label="Wallet address"
                error={walletAddress.error}
                readOnly={!!(walletFromCookie)}
              />
            </div>
          ) : (
            <TextInput
              value={walletAddress.value}
              onChange={(ev: any) => {
                setInput(ev.target.value, setWalletAddress);
              }}
              placeholder="0xfc0d6...Be8a3"
              label="Wallet address"
              error={walletAddress.error}
            />
          )}
        </div>
        <div className={styles.formInput}>
          <TextInput
            value={userName.value}
            onChange={(ev: any) => {
              setInput(ev.target.value, setUserName);
            }}
            placeholder="Sarah Jane"
            label="Legal name and surname"
            error={userName.error}
          />
        </div>
        <div className={styles.formInput}>
          <TextInput
            value={email.value}
            onChange={(ev: any) => {
              setInput(ev.target.value, setEmail);
            }}
            placeholder="you@email.com"
            label="Email address"
            error={email.error}
          />
        </div>
        <div className={styles.formInput}>
          <Select
            label="Country of residence"
            title="Select country"
            placeholder="Select country"
            list={countries}
            setSelected={(value: string) => setCountry((prev) => ({ ...prev, value, error: '' }))}
            selected={country.value}
            error={country.error}
          />
        </div>
        <div className={styles.groupedInput}>
  <div className={[styles.formInput, styles.equalWidth].join(' ')}>
    {cookies.chain ? (
      <TextInput
        value={chain.value}
        label="Chain"
        readOnly
      />
    ) : (
      <Select
        label="Chain"
        title="Select chain"
        placeholder="Select chain"
        list={supportedChains}
        setSelected={(value: string) => setChain((prev) => ({ ...prev, value, error: '' }))}
        selected={chain.value}
        error={chain.error}
        tooltip="Your chain is the chain your wallet will receive tokens on when you exchange fiat to crypto"
      />
    )}
  </div>
  <div className={[styles.formInput, styles.equalWidth].join(' ')}>
    {cookies.token ? (
      <TextInput
        value={preferredToken.value}
        label="Preferred Token"
        readOnly
      />
    ) : (
      <Select
        label="Preferred Token"
        title="Select token"
        placeholder="Select token"
        list={availableTokens}
        setSelected={(value: string) => setPreferredToken((prev) => ({ ...prev, value, error: '' }))}
        selected={preferredToken.value}
        error={preferredToken.error}
        tooltip="Your preferred token is the cryptocurrency you’ll be exchanging on this chain."
        />
      )}
      </div>
      </div>
       <div className={styles.formInput}>
      <Select
        label="Primary currency you’ll be exchanging"
        title="Select currency"
        placeholder="Select currency"
        list={currencies}
        setSelected={(value: string) => setCurrency((prev) => ({ ...prev, value, error: '' }))}
        selected={currency.value}
        error={currency.error}
        tooltip="You primary currency is the currency you will send from your bank account in exchange for crypto and the currency you will receive when you exchange from crypto to fiat"
      />
        </div>
      </>
    );
  };

  const renderBack = () => {
    return 'Basic details';
  };

  return (
    <div className={styles.container}>
      <BackButton onClick={handleBack}>{renderBack()}</BackButton>
      <div className={styles.form}>{renderStep()}</div>
      <div className={styles.error}>{error}</div>
      <div className={styles.bottomContainer}>
        {loading ? (
          <div className="flex" style={{ display: 'flex', justifyContent: 'center' }}>
            <CircleLoader size={64} />
          </div>
        ) : (
          <MainButton onClick={handleContinue} disabled={loading}>
            Continue
          </MainButton>
        )}
      </div>
    </div>
  );
}
