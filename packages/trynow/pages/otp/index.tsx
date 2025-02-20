import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import CircleLoader from '@/components/common/CircleLoader';
import BackButton from '@/components/common/BackButton/BackButton';
import FlexButton from '@/components/common/FlexButton/FlexButton';
import { poppins, handleOtpResponse, checkUserNextStep } from '@/src/utils/index';
import { useCookies } from 'react-cookie';

import styles from './index.module.css';
import UnblockApi from '@/src/utils/UnblockApi';

export default function Otp({ setBottomElement }: { setBottomElement: Function }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [cookies, setCookie] = useCookies([
    'unblockSessionId',
    'userId',
    'walletAddress',
    'intercomUserHash',
    'parentDomain',
  ]);
  const router = useRouter();

  const memoizedCircleLoader = useMemo(() => {
    return (
      <div className={styles.loadingContainer}>
        <CircleLoader size={48} />
      </div>
    );
  }, []);

  useEffect(() => {
    if (verificationCode.every((digit) => digit !== '')) {
      handleVerification();
    }
  }, [verificationCode]);

  const handleInputChange = (
    value: string,
    index: number,
    event?: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    const updatedCode = [...verificationCode];

    if (event?.key === 'Backspace') {
      if (updatedCode[index] !== '') {
        updatedCode[index] = '';
      } else if (index > 0) {
        updatedCode[index - 1] = '';
        const prevInput = document.getElementById(`digit-${index - 1}`);
        prevInput?.focus();
      }

      setVerificationCode(updatedCode);
      return;
    }

    if (/^\d$/.test(value)) {
      updatedCode[index] = value;
      setVerificationCode(updatedCode);

      if (index < verificationCode.length - 1) {
        const nextInput = document.getElementById(`digit-${index + 1}`);
        nextInput?.focus();
      }
    } else if (event?.key === 'ArrowLeft' && index > 0) {
      const prevInput = document.getElementById(`digit-${index - 1}`);
      prevInput?.focus();
    } else if (event?.key === 'ArrowRight' && index < verificationCode.length - 1) {
      const nextInput = document.getElementById(`digit-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const pasteData = event.clipboardData.getData('Text');
    if (!/^\d{6}$/.test(pasteData)) return;

    const updatedCode = pasteData.split('');
    setVerificationCode(updatedCode);

    const lastInput = document.getElementById(`digit-${updatedCode.length - 1}`);
    lastInput?.focus();
  };

  const requestOtp = async () => {
    const userId = sessionStorage.getItem('userId') || '';
    if (!userId) {
      setError('User ID not found. Please log in again.');
      // router.replace('/otp/basic_details_b');
      return;
    }
    const api = new UnblockApi(cookies?.parentDomain ?? '', '', userId ?? '');
    try {
      setLoading(true);
      await api.requestOtp(userId);
      setLoading(false);
      setCooldown(60); // Start cooldown after requesting OTP
    } catch (error: any) {
      console.error(error);
      setError('Failed to request OTP. Please try again.');
      setLoading(false);
    }
  };

  const handleVerification = async () => {
    const userId = sessionStorage.getItem('userId') || '';
    const otp = verificationCode.join('');

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP.');
      return;
    }

    if (!userId) {
      setError('User ID not found. Please log in again.');
      // router.replace('/otp/basic_details_b');
      return;
    }

    const api = new UnblockApi(cookies?.parentDomain ?? '', userId ?? '');

    try {
      setLoading(true);

      const wallet = sessionStorage.getItem('walletAddress') || '';
      const response = await api.submitOtp(otp, userId);
      console.log('Response', response);
      const date = new Date(new Date().valueOf() + 4 * 60 * 60 * 1000);
      setCookie('unblockSessionId', response.data.unblock_session_id, {
        path: '/',
        expires: date,
        sameSite: 'none',
        secure: true,
      });
      setCookie('userId', response.data.user_uuid, {
        path: '/',
        expires: date,
        sameSite: 'none',
        secure: true,
      });
      handleOtpResponse(response, wallet, setCookie);
      if (response.status === 200) {
        const { unblock_session_id, user_uuid } = response.data;
        await navigateTo(unblock_session_id, user_uuid);
      } else if (
        response.status === 400 &&
        response?.data?.message?.toLowerCase()?.includes('user not found')
      ) {
        router.push('/basic_details');
      } else if (
        response.status === 404 &&
        response.data?.name === 'UserNotAssociatedWithMerchant'
      ) {
        setError(
          'This wallet is already associated with another merchant. Please try using a different wallet',
        );
      } else if (
        response.status === 401 &&
        response?.data?.error?.toLowerCase()?.includes('code_mismatch')
      ) {
        setError('Code is invalid or expired.');
      } else {
        setError(
          'An error has occurred while connecting your wallet. Please try again later or contact our support team.',
        );
      }
    } catch (error) {
      console.error(error);
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const navigateTo = async (unblockSessionId: string, userId: string) => {
    const api = new UnblockApi(cookies?.parentDomain, unblockSessionId, userId);
    const [status, banks, transactions] = await Promise.all([
      api.getStatus(),
      api.getRemoteBankAccounts(),
      api.getTransactions(),
    ]);
    checkUserNextStep(router, status, banks, transactions);
  };

  // useEffect(() => {
  //   const storedEmail = sessionStorage.getItem('email');
  //   if (!storedEmail) {
  //     setError('Email not found. Please log in again.');
  //     router.replace('/otp/basic_details_b');
  //     return;
  //   }

  //   // setEmail(storedEmail);

  //   // requestOtp();
  // }, [router]);

  useEffect(() => {
    const { email } = router.query;

    if (email && typeof email === 'string') {
      setEmail(email);
      requestOtp();
    } else {
      setError('Email not found. Please log in again.');
      // router.replace('/basic_details');
    }
  }, [router.query]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  return (
    <div className={styles.container}>
      <BackButton>Log in</BackButton>
      <div className={styles.topContainer}>
        <div className={styles.textContainer}>
          <div className={[styles.regularText, poppins.className].join(' ')}>
            {`A verification code has been sent to ${email}. Please enter it below to verify your account`}
          </div>
        </div>
      </div>
      <div className={styles.codeInputContainer}>
        {verificationCode.map((digit, index) => (
          <input
            key={index}
            id={`digit-${index}`}
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e) => handleInputChange(e.target.value, index)}
            onKeyDown={(e) => handleInputChange('', index, e)}
            onPaste={handlePaste}
            className={styles.codeInputBox}
          />
        ))}
      </div>
      <div className={styles.bottomContainer}>
        <div className={styles.errorText}>{error}</div>
        {loading ? (
          memoizedCircleLoader
        ) : (
          <FlexButton onClick={handleVerification}>Continue</FlexButton>
        )}
        <div
          className={styles.clickText}
          style={{
            cursor: cooldown > 0 ? 'not-allowed' : 'pointer',
            opacity: cooldown > 0 ? 0.5 : 1,
          }}
          onClick={cooldown === 0 ? requestOtp : undefined}>
          {cooldown > 0 ? `Resend Code in ${cooldown}s` : 'Resend Code'}
        </div>
      </div>
    </div>
  );
}
