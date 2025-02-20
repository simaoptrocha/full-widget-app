import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import dayjs, { Dayjs } from 'dayjs';
import { useCookies } from 'react-cookie';

import { poppins, validateEmail } from '@/src/utils/index';
import UnblockApi from '@/src/utils/UnblockApi';

import CircleLoader from '@/components/common/CircleLoader';
import { TextInput } from '@/components/common/TextInput';
import { DateInput } from '@/components/common/DateInput/DateInput';
import BackButton from '@/components/common/BackButton/BackButton';
import MainButton from '@/components/common/MainButton/MainButton';
import { Select } from '@/components/common/Select';

import styles from './basicDetails.module.css';

const countriesList = require('react-select-country-list');

export default function BasicDetails() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState({ value: '', error: '' });
  const [email, setEmail] = useState({ value: '', error: '' });
  const [streetAddress, setStreetAddress] = useState({ value: '', error: '' });
  const [streetAddress2, setStreetAddress2] = useState({ value: '', error: '' });
  const [city, setCity] = useState({ value: '', error: '' });
  const [postCode, setPostCode] = useState({ value: '', error: '' });
  const [country, setCountry] = useState({ value: '', error: '' });
  const [dateOfBirth, setDateOfBirth] = useState<any>({ value: null, error: '' });
  const [selectedFunds, setSelectedFunds] = useState(null);

  const [cookies] = useCookies(['unblockSessionId', 'userId', 'parentDomain']);
  const router = useRouter();

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

  const updateSelectedFunds = (ev: any) => {
    setSelectedFunds(ev.target.value);
  };

  const setInput = (value: any, setInput: Function) => {
    setInput((prev: any) => ({ ...prev, value, error: '' }));
  };

  const validateInputs = () => {
    let noErrors = true;
    if (!validateEmail(email.value)) {
      setEmail((prev) => ({ ...prev, error: 'Invalid email' }));
      noErrors = false;
    }
    if (!userName.value.length) {
      setUserName((prev) => ({ ...prev, error: 'This field cannot be empty' }));
      noErrors = false;
    }
    if (
      !dateOfBirth.value ||
      !dateOfBirth.value.isValid() ||
      dateOfBirth.value.isAfter(new Date())
    ) {
      setDateOfBirth((prev: any) => ({ ...prev, error: 'Invalid date' }));
      noErrors = false;
    }
    return noErrors;
  };

  const clearErrors = () => {
    setEmail((prev) => ({ ...prev, error: '' }));
    setUserName((prev) => ({ ...prev, error: '' }));
    setDateOfBirth((prev: any) => ({ ...prev, error: '' }));
  };

  const createApplicant = async () => {
    try {
      setLoading(true);
      const api = new UnblockApi(cookies?.parentDomain, cookies?.unblockSessionId, cookies?.userId);
      const applicantResult = await api.createKycApplicant(
        {
          address_line_1: streetAddress.value,
          address_line_2: streetAddress2.value,
          post_code: postCode.value,
          country: country.value,
          city: city.value,
        },
        dateOfBirth.value.format('YYYY-MM-DD'),
        selectedFunds ?? '',
      );
      if (applicantResult.status === 204) {
        router.push('/kyc/sumsub');
        return;
      }
    } catch (error: any) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    clearErrors();
    if (!validateInputs()) {
      return;
    }
    switch (step) {
      case 1:
      case 2:
        setStep((prev) => prev + 1);
        break;
      case 3:
        createApplicant();
        break;
    }
  };

  const disableButton = () => {
    switch (step) {
      case 1:
        return (
          userName.error ||
          !userName.value ||
          email.error ||
          !email.value ||
          dateOfBirth.error ||
          !dateOfBirth.value
        );
      case 2:
        return (
          streetAddress.error ||
          !streetAddress.value ||
          city.error ||
          !city.value ||
          country.error ||
          !country.value ||
          postCode.error ||
          !postCode.value
        );
      case 3:
        return !selectedFunds;
      default:
        return true;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
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
              <DateInput
                maxDate={dayjs()}
                value={dateOfBirth.value}
                label="Date of birth"
                error={dateOfBirth.error}
                onChange={(date: Dayjs) => setInput(date, setDateOfBirth)}
              />
            </div>
          </>
        );
      case 2:
        return (
          <>
            <div className={styles.formInput}>
              <TextInput
                value={streetAddress.value}
                onChange={(ev: any) => {
                  setInput(ev.target.value, setStreetAddress);
                }}
                label="Street address"
                error={streetAddress.error}
              />
            </div>
            <div className={styles.formInput}>
              <TextInput
                value={streetAddress2.value}
                onChange={(ev: any) => {
                  setInput(ev.target.value, setStreetAddress2);
                }}
                label="Apartment, suite, etc (optional)"
                error={streetAddress2.error}
              />
            </div>
            <div className={styles.groupedInput}>
              <div style={{}} className={styles.formInput}>
                <TextInput
                  value={city.value}
                  onChange={(ev: any) => {
                    setInput(ev.target.value, setCity);
                  }}
                  label="City"
                  error={city.error}
                />
              </div>
              <div className={[styles.formInput, styles.smallInput].join(' ')}>
                <TextInput
                  value={postCode.value}
                  onChange={(ev: any) => {
                    setInput(ev.target.value, setPostCode);
                  }}
                  label="Postcode / ZIP"
                  error={postCode.error}
                />
              </div>
            </div>
            <div className={styles.formInput}>
              <Select
                label="Country"
                title="Select country"
                placeholder="Select country"
                list={countries}
                setSelected={(value: string) =>
                  setCountry((prev) => ({ ...prev, value, error: '' }))
                }
                selected={country.value}
              />
            </div>
          </>
        );
      case 3:
        return (
          <div className={poppins.className}>
            <div className={styles.description}>
              {
                'We need to know where your funds are coming from as part of our verification process. This helps to make sure everything stays secure and legitimate on our app.'
              }
            </div>
            <div className={styles.selectorTitle}>
              {'What is the main source of funds you’re using? '}
            </div>
            <div className={styles.radioSelector}>
              <div className={styles.radioOption}>
                <input
                  type="radio"
                  id="SALARY"
                  name="funds_source"
                  value="SALARY"
                  checked={selectedFunds === 'SALARY'}
                  onChange={updateSelectedFunds}
                />
                <label htmlFor="SALARY">Salary or business income</label>
              </div>
              <div className={styles.radioOption}>
                <input
                  type="radio"
                  id="PENSION"
                  name="funds_source"
                  value="PENSION"
                  checked={selectedFunds === 'PENSION'}
                  onChange={updateSelectedFunds}
                />
                <label htmlFor="PENSION">Pension</label>
              </div>
              <div className={styles.radioOption}>
                <input
                  type="radio"
                  id="OTHER"
                  name="funds_source"
                  value="OTHER"
                  checked={selectedFunds === 'OTHER'}
                  onChange={updateSelectedFunds}
                />
                <label htmlFor="OTHER">Other</label>
              </div>
            </div>
          </div>
        );
      default:
        return <></>;
    }
  };

  const renderHeader = () => {
    switch (step) {
      case 1:
        return 'Basic information';
      case 2:
        return 'Your address';
      case 3:
        return 'Source of funds';
      default:
        return 'Back';
    }
  };

  const handleBackButton = () => {
    if (step === 1) {
      router.back();
      return;
    }
    setStep((prev) => prev - 1);
  };

  const getUserStatus = async () => {
    try {
      const api = new UnblockApi(cookies?.parentDomain, cookies?.unblockSessionId, cookies?.userId);
      const userStatus = await api.getStatus();
      if (userStatus.status === 200) {
        if (userStatus.data?.status === 'FULL_USER') {
          router.replace('/portal');
          return;
        }
        const userData = userStatus.data;
        setInput(
          userData?.first_name || userData?.last_name
            ? `${userData?.first_name ?? ''} ${userData?.last_name ?? ''}`
            : '',
          setUserName,
        );
        setInput(userData?.email, setEmail);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.container}>
      <div onClick={() => router.push('/')} className={styles.closeButton}></div>
      {loading ? (
        <div className={styles.loadingContainer}>
          <CircleLoader size={260} />
        </div>
      ) : (
        <>
          <BackButton onClick={handleBackButton}>{renderHeader()}</BackButton>
          <div className={styles.form}>{renderStep()}</div>
          <div className={styles.bottomContainer}>
            <MainButton disabled={disableButton()} onClick={handleContinue}>
              Continue
            </MainButton>
          </div>
        </>
      )}
    </div>
  );
}
