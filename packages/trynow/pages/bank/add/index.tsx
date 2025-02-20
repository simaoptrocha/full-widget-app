import { useState, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useCookies } from 'react-cookie';

import { currenciesList, formatSortCode, getChains, poppins, getChainNameById } from '@/src/utils/index';
import UnblockApi from '@/src/utils/UnblockApi';

import CircleLoader from '@/components/common/CircleLoader';
import BackButton from '@/components/common/BackButton/BackButton';
import MainButton from '@/components/common/MainButton/MainButton';
import { TextInput } from '@/components/common/TextInput';
import { Select } from '@/components/common/Select';

import styles from './addBank.module.css';

const countriesList = require('react-select-country-list');

export default function AddBank() {
  const [loading, setLoading] = useState(false);
  const [iban, setIban] = useState({ value: '', error: '' });
  const [sortCode, setSortCode] = useState({ accountNumber: '', sortCode: '', error: '' });
  const [currency, setCurrency] = useState({ value: '', error: '' });
  const [error, setError] = useState('');

  const [cookies,setCookie,removeCookie] = useCookies(['unblockSessionId', 'userId', 'parentDomain', 'intercomUserHash', 'chain', 'currency']);
  const router = useRouter();

  // const selectedChain = getChains().find(({ id }) => id === cookies?.chain);
  const selectedChain = getChainNameById(cookies?.chain)
  // const getChainSlugByLabel = (chainLabel: string): string | undefined => {
  //   const chain = chains.find(({ label }) => label.toLowerCase() === chainLabel.toLowerCase());
  //   return chain?.name;
  // };
  const countries = useMemo(
    () =>
      countriesList()
        .getData()
        .map(({ value, label }: { value: string; label: string }) => ({
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

  const setInput = (value: string, setInput: Function) => {
    setInput((prev: any) => ({ ...prev, value }));
  };

  const clearErrors = () => {
    setIban((prev) => ({ ...prev, error: '' }));
    setSortCode((prev) => ({ ...prev, error: '' }));
    setCurrency((prev) => ({ ...prev, error: '' }));
    setError('');
  };

  const addBankAccount = async () => {
    setLoading(true);
    let hasErrors = false;
    clearErrors();
    try {
      if (currency.value === 'eur' && !iban.value) {
        setIban((prev) => ({ ...prev, error: 'You need to fill in this field' }));
        hasErrors = true;
      }
      if (currency.value === 'gbp' && (!sortCode.accountNumber || !sortCode.sortCode)) {
        setSortCode((prev) => ({ ...prev, error: 'Please fill in both fields' }));
        hasErrors = true;
      }
      if (hasErrors) {
        return;
      }
      const api = new UnblockApi(
        cookies?.parentDomain,
        cookies?.unblockSessionId,
        cookies?.userId,
      );
      const offRampAddress = await api.getOffRampAddress(selectedChain || '');
      const newBankResponse = await api.createRemoteBankAccount(
        currency.value,
        {
          iban: iban.value.replace(/\s/g, ''),
          sortCode: sortCode.sortCode.replace(/\s/g, '').replace(/-/g, ''),
          accountNumber: sortCode.accountNumber.replace(/\s/g, ''),
        },
        true,
        offRampAddress?.data[0].address ?? '',
      );
      // const bankResp = await api.createUnblockBankAccount(cookies?.currency)
      // console.log("Here, Bank response", bankResp)
      // const unblockBank = await api.getUnblockBankAccount(bankResp.data.uuid);
      // console.log("Unblock bank on add screen", unblockBank)

      // setCookie()
      if (newBankResponse.status !== 201) {
        if (newBankResponse.status === 400) {
          if (
            newBankResponse.data?.error?.error?.includes('COUNTRY_NOT_ENABLED_FOR_LINKED_CLIENT')
          ) {
            throw new Error('Your country is not yet available');
          }
          if (newBankResponse.data?.message?.includes('accountNumber_sortCode_mismatch')) {
            throw new Error(
              'Invalid account number/sort code. Please check if you entered the correct values',
            );
          }
        }
        throw new Error(
          "We're unable to verify those details. Please try again or contact our support team.",
        );
      }

      router.replace('/');

    } catch (error: any) {
      console.error(error);
      setError(error.message);
    } finally {
      console.log("Log 2")
      setLoading(false);
      console.log("Log 3")
    }
  };

  const enabledButton = () => {
    return !!currency.value;
  };

  const renderBankNumberInput = () => {
    if (!currency.value) {
      return <></>;
    }
    switch (currency.value) {
      case 'eur':
        return (
          <TextInput
            value={iban.value}
            onChange={(ev: any) => {
              setInput(ev.target.value, setIban);
            }}
            placeholder="Enter IBAN"
            label="IBAN"
            error={iban.error}
          />
        );
      case 'gbp':
        return (
          <div className={styles.sortCodeContainer}>
            <div className={styles.sortCodeInput}>
              <TextInput
                value={sortCode.accountNumber}
                onChange={(ev: any) => {
                  setSortCode((prev) => ({
                    ...prev,
                    accountNumber: ev.target.value,
                  }));
                }}
                placeholder="00000000"
                label="Account number"
                error={sortCode.error}
                type="number"
              />
            </div>
            <div className={styles.sortCodeInput}>
              <TextInput
                value={sortCode.sortCode}
                onChange={(ev: any) => {
                  setSortCode((prev) => ({ ...prev, sortCode: formatSortCode(ev.target.value) }));
                }}
                placeholder="00-00-00"
                label="Sort code"
              />
            </div>
          </div>
        );
      default:
        return <></>;
    }
  };

  return (
    <div className={styles.container}>
      <BackButton>Add bank account details</BackButton>
      <div className={[styles.topInfo, poppins.className].join(' ')}>
        {"This is the account you'll receive funds in when transferring funds from crypto to fiat"}
      </div>
      <div className={styles.spacer}></div>
      <div className={styles.form}>
        <div className={styles.formInput}>
          <Select
            label="Currency of bank account"
            title="Select currency"
            placeholder="Select currency"
            list={currencies}
            setSelected={(value: string) => setCurrency((prev) => ({ ...prev, value, error: '' }))}
            selected={currency.value}
          />
        </div>
        <div className={styles.formInput}>{renderBankNumberInput()}</div>
      </div>
      <div className={styles.bottomContainer}>
        <div className={styles.errorText}>{error}</div>
        {loading ? (
          <div className={styles.loadingContainer}>
            <CircleLoader size={100} />
            <div className={styles.bottomText}>Adding bank account...</div>
          </div>
        ) : (
          <MainButton disabled={!enabledButton()} onClick={addBankAccount}>
            Add account
          </MainButton>
        )}
      </div>
    </div>
  );
}
