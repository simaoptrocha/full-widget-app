import axios, { Method } from 'axios';
import getConfig from 'next/config';

export type UnblockResponse = {
  status: number;
  data: any;
};

enum PaymentMethod {
  BANK_TRANSFER = 'bank_transfer',
}

enum PaymentDirection {
  fiatToCrypto = 'fiatToCrypto',
  cryptoToFiat = 'cryptoToFiat',
}

type StringObject = { [key: string]: any };

const { publicRuntimeConfig } = getConfig();

const STAGE = process?.env?.ENV ?? process?.env?.AWS_BRANCH ?? publicRuntimeConfig?.env ?? 'dev';

export class UnblockApi {
  private env: string = 'dev';
  private _unblockSessionId: string = '';
  private baseUrl: string = '';
  private _userId: string = '';
  private _domain: string = '';

  constructor(domain: string = '', unblockSession: string = '', userId: string = '') {
    this.env = STAGE;
    this.setBaseUrl();
    this._unblockSessionId = unblockSession;
    this._userId = userId;
    this._domain = domain;
  }

  get unblockSessionId() {
    return this._unblockSessionId;
  }
  set unblockSessionId(sessionId: string) {
    this._unblockSessionId = sessionId;
  }
  get userId() {
    return this._userId;
  }
  set userId(userId: string) {
    this._userId = userId;
  }

  get domain() {
    return this._domain;
  }
  set domain(domain: string) {
    this._domain = domain;
  }

  private setBaseUrl() {
    // switch (this.env) {
    //   case 'staging':
    //     this.baseUrl = 'https://4wbc6o3wpj.execute-api.eu-west-2.amazonaws.com';
    //     break;
    //   case 'prod':
    //     this.baseUrl = 'https://0itpirwfg6.execute-api.eu-west-2.amazonaws.com';
    //     break;
    //   default:
    //     this.baseUrl = 'https://k47ghkrnoj.execute-api.eu-west-2.amazonaws.com';
    // }
    this.baseUrl = 'https://k7rtugk1re.execute-api.eu-west-1.amazonaws.com/proxy';
  }

  async constructRequest(
    method: Method,
    url: string,
    data: any = null,
    params: StringObject | null = null,
  ) {
    try {
      const result = await axios({
        headers: {
          'unblock-session-id': this.unblockSessionId ?? '',
          'user-id': this.userId ?? '',
          'user-uuid': this.userId ?? '',
          // 'x-parent-origin': this._domain ?? '',
          'x-parent-origin' : "http://localhost:5173",
          'Content-Type': 'application/json',
        },
        baseURL: this.baseUrl, 
        method, 
        url, 
        data, 
        withCredentials: true,
        params
      });

      return {
        status: result.status,
        data: result?.data,
      };
    } catch (error: any) {
      console.error(error);
      return {
        status: error.response?.status ?? 500,
        data: error.response?.data ?? { error: 'Unknown error' },
      };
    }
  }

  async loginSiwe(message: string, signature: string) {
    return this.constructRequest('POST', '/auth/login', {
      message,
      signature,
    });
  }

  async requestOtp(user_uuid: string) {
    return this.constructRequest('POST', '/auth/login', {
      user_uuid,
    });
  }

  async submitOtp(otp: string, user_uuid: string) {
    return this.constructRequest('POST', '/auth/otp/', {
      one_time_password: otp,
      user_uuid: user_uuid,
    });
  }

  async createUser(
    first_name: string,
    last_name: string,
    email: string,
    target_address: string,
    country: string,
    currencyPref: string,
    tokenPreferences: Array<{ currency: string; chain: string; token: string }>,
    referral_code: string | null = null,
  ) {
    const data: {
      first_name: string;
      last_name: string;
      email: string;
      target_address: string;
      country: string;
      currency: string;
      tokenPreferences: Array<{ currency: string; chain: string; token: string }>;
      referral_code?: string;
    } = {
      first_name,
      last_name,
      email,
      target_address,
      country: country.toUpperCase(),
      currency: currencyPref,
      tokenPreferences,
    };

    if (referral_code) {
      data.referral_code = referral_code;
    }

    return this.constructRequest('POST', '/user', data);
  }


  async getUserDetails(wallet: string) {
    return this.constructRequest('GET', 'user-details', null, { walletAddress: wallet });
}



  async getStatus() {
    return this.constructRequest('GET', '/user', null);
  }

  async getExchangeRates(baseCurrency: string, targetCurrency: string) {
    return this.constructRequest('GET', '/exchange-rates', null, {
      base_currency: baseCurrency.toUpperCase(),
      target_currency: targetCurrency.toUpperCase(),
    });
  }

  async getTransactionFees(
    baseCurrency: string,
    targetCurrency: string,
    direction: string = PaymentDirection.fiatToCrypto,
    paymentMethod: string = PaymentMethod.BANK_TRANSFER,
  ) {
    return this.constructRequest('GET', '/fees/', null, {
      input_currency: baseCurrency.toUpperCase(),
      output_currency: targetCurrency.toUpperCase(),
      direction,
      amount: 1,
      payment_method: paymentMethod,
    });
  }

  async getRemoteBankAccounts() {
    return this.constructRequest('GET', '/user/bank-account/remote', null);
  }
  async getUnblockBankAccounts() {
    return this.constructRequest('GET', '/user/bank-account/unblock', null);
  }
  async getUnblockBankAccount(uuid: string) {
    return this.constructRequest('GET', `/user/bank-account/unblock/${uuid}`, null);
  }
  async getOffRampAddress(chain: string) {
    return this.constructRequest('GET', `/user/wallet/${chain}`, null);
  }

  async createUnblockBankAccount(currency: string) {
    return this.constructRequest('POST', '/user/bank-account/unblock', {
      currency: currency.toUpperCase(),
    });
  }

  async createRemoteBankAccount(
    currency: string,
    accountDetails: any,
    mainBeneficiary: boolean = false,
    offRampAddress: string = '',
  ) {
    const account_details =
      currency === 'eur'
        ? {
            currency: currency.toUpperCase(),
            iban: accountDetails.iban,
          }
        : {
            currency: currency.toUpperCase(),
            account_number: accountDetails.accountNumber,
            sort_code: accountDetails.sortCode,
          };
    const account_name = currency === 'eur' ? accountDetails.iban : accountDetails.account_number;
    return this.constructRequest('POST', '/user/bank-account/remote', {
      account_details,
      account_name,
      main_beneficiary: mainBeneficiary,
      offRampAddress,
    });
  }

  async getKycAccessToken() {
    return this.constructRequest('GET', '/user/kyc/applicant/token', null);
  }
  async getTransactions() {
    return this.constructRequest('GET', '/user/transactions', null);
  }
  async getTokenPreferences() {
    return this.constructRequest('GET', '/user/token-preferences', null);
  }
  async setTokenPreferences(tokenPreferences: { currency: string; chain: string; token: string }) {
    return this.constructRequest('PATCH', '/user/token-preferences', tokenPreferences);
  }

  async createKycApplicant(
    address: {
      address_line_1: string;
      address_line_2: string;
      post_code: string;
      city: string;
      country: string;
    },
    dateOfBirth: string,
    sourceOfFunds: string,
  ) {
    return this.constructRequest('POST', '/user/kyc/applicant', {
      address,
      date_of_birth: dateOfBirth,
      source_of_funds: sourceOfFunds,
    });
  }
}

export default UnblockApi;
