import { generateNonce, SiweMessage } from 'siwe';
import { Signer } from 'ethers';
import { Plus_Jakarta_Sans, Poppins } from '@next/font/google';
import { NextRouter } from 'next/router';
import getConfig from 'next/config';
import { boot } from '@intercom/messenger-js-sdk';

import { UnblockResponse } from '@/src/utils/UnblockApi';
import celoLogo from '@/public/images/celo_logo.svg';
import polygonLogo from '@/public/images/polygon_logo.svg';
import arbitrumLogo from '@/public/images/arbitrum_logo.svg';
// import arbitrumLogo from '../../public/images/arbitrum_logo.svg';
import optimismLogo from '@/public/images/optimism_logo.svg';
import ethereumLogo from '@/public/images/ethereum_logo.svg';
const { publicRuntimeConfig } = getConfig();

const STAGE = process?.env?.ENV ?? process?.env?.AWS_BRANCH ?? publicRuntimeConfig?.env ?? 'dev';

export const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const CHAIN_LIST = [
  {
    id: '137',
    description: 'Polygon Mainnet',
    url: 'https://api.getunblock.com',
  },
  {
    id: '1',
    description: 'Ethereum',
    url: 'https://api.getunblock.com',
  },
  {
    id: '42161',
    description: 'Arbitrum Mainnet',
    url: 'https://api.getunblock.com',
  },
  {
    id: '80001',
    description: 'Mumbai Testnet',
    url: 'https://sandbox.getunblock.com',
  },
  {
    id: '10',
    description: 'Optimism Mainnet',
    url: 'https://api.getunblock.com',
  },
  {
    id: '420',
    description: 'Optimism Testnet',
    url: 'https://sandbox.getunblock.com',
  },
  {
    id: '42220',
    description: 'Celo Mainnet',
    url: 'https://api.getunblock.com/fiat-connect',
  },
  {
    id: '44787',
    description: 'Celo (Alfajores Testnet)',
    url: 'https://sandbox.getunblock.com/fiat-connect',
  },
];



export const tokens: Record<string, { id: string; name: string; logo: string }[]> = {
  arbitrum: [
    { id: "usdc", name: "USDC", logo: "/images/tokens/usdc.svg" },
    { id: "usdce", name: "USDC.e", logo: "/images/tokens/usdc.svg" },
    { id: "usdt", name: "USDT", logo: "/images/tokens/usdt.svg" },
    { id: "ageur", name: "agEUR", logo: "/images/tokens/ageur.png" }
  ],
  mainnet: [
    { id: "usdc", name: "USDC", logo: "/images/tokens/usdc.svg" },
    { id: "usdt", name: "USDT", logo: "/images/tokens/usdt.svg" },
    { id: "ageur", name: "agEUR", logo: "/images/tokens/ageur.png" }
  ],
  polygon: [
    { id: "usdc", name: "USDC", logo: "/images/tokens/usdc.svg" },
    { id: "usdce", name: "USDC.e", logo: "/images/tokens/usdc.svg" },
    { id: "usdt", name: "USDT", logo: "/images/tokens/usdt.svg" }
  ],
  optimism: [
    { id: "usdc", name: "USDC", logo: "/images/tokens/usdc.svg" },
    { id: "usdce", name: "USDC.e", logo: "/images/tokens/usdc.svg" },
    { id: "usdt", name: "USDT", logo: "/images/tokens/usdt.svg" }
  ],
  base: [
    { id: "usdc", name: "USDC", logo: "/images/tokens/usdc.svg" }
  ],
  celo: [
    { id: "ceur", name: "cEUR", logo: "/images/tokens/ceur.webp" },
    { id: "cusd", name: "cUSD", logo: "/images/tokens/cusd.webp" }
  ]
};


export const tokenInfo = [
  {
    id: "usdc", name: "USDC"
  },
  {
    id: "usdt", name: "USDT"
  },
  {
    id: "usdce", name: "USDC.e"
  },
  {
    id: "ceur", name: "cEUR"
  },
  {
    id: "cusd", name: "cUSD"
  },
  {
    id: "ageur", name: "agEUR"
  }
]

// Onboard settings
export const chains = [
  {
    id: 137,
    token: 'MATIC',
    label: 'Polygon',
    rpcUrl: 'https://polygon-mainnet.infura.io',
    logo: polygonLogo,
    icon: 'polygon_logo',
    env: 'mainnet',
    name: 'polygon',
    defaultToken: 'agEUR',
  },
  {
    id: 80002, //Replace to Amoi 
    token: 'MATIC',
    label: 'Polygon Amoy',
    rpcUrl: 'https://polygon-amoy.drpc.org/',
    logo: polygonLogo,
    icon: 'polygon_logo',
    env: 'testnet',
    name: 'polygon',
    defaultToken: 'agEUR', // something different
  },
  {
    id: 42161,
    token: 'ETH',
    label: 'Arbitrum',
    rpcUrl: 'https://arbitrum-mainnet.infura.io',
    logo: arbitrumLogo,
    icon: 'arbitrum_logo',
    env: 'mainnet',
    name: 'arbitrum',
    defaultToken: 'agEUR',
  },
  {
    id: 421614,
    token: 'ETH',
    label: 'Arbitrum Sepolia',
    rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
    logo: arbitrumLogo,
    icon: 'arbitrum_logo',
    env: 'testnet',
    name: 'arbitrum',
    defaultToken: 'agEUR',
  },
  {
    id: 1,
    token: 'ETH',
    label: 'Ethereum',
    rpcUrl: 'https://ethereum-mainnet.infura.io',
    logo: ethereumLogo,
    icon: 'ethereum_logo',
    env: 'mainnet',
    name: 'mainnet',
    defaultToken: 'agEUR',
  },
  {
    id: 11155111,
    token: 'ETH',
    label: 'Ethereum Sepolia',
    rpcUrl: 'https://rpc.sepolia.dev',
    logo: ethereumLogo,
    icon: 'ethereum_logo',
    env: 'testnet',
    name: 'mainnet',
    defaultToken: 'agEUR',
  },
  {
    id: 10,
    token: 'ETH',
    label: 'Optimism',
    rpcUrl: 'https://optimism-mainnet.infura.io',
    logo: optimismLogo,
    icon: 'optimism_logo',
    env: 'mainnet',
    name: 'optimism',
    defaultToken: 'agEUR',
  },
  // {
  //   id: 420,
  //   token: 'ETH',
  //   label: 'Optimism Goerli',
  //   rpcUrl: 'https://goerli.optimism.io/',
  //   logo: optimismLogo,
  //   env: 'testnet',
  //   name: 'optimism',
  //   defaultToken: 'agEUR',
  // },
];

export const appMetadata = {
  name: 'Try now',
  // icon: logo,
  description: 'Try now using Onboard',
  recommendedInjectedWallets: [{ name: 'MetaMask', url: 'https://metamask.io' }],
};

const chainNetwork = STAGE === 'dev' ? 'testnet' : 'mainnet';
export const getChains = (filterEnv = chainNetwork) =>
  chains.filter(({ env }) => env === filterEnv);

export const createSiweMessage = async (signer: Signer, chain: number) => {
  try {
    // const url = (() => {
    //   switch (STAGE) {
    //     case 'staging':
    //       return 'https://sandbox.getunblock.com/wallet/confirm';
    //     case 'prod':
    //       return 'https://angle.getunblock.com/wallet/confirm';
    //     default:
    //       return 'https://dev.getunblock.com/auth/login';
    //   }
    // })();
    const url = 'https://main.d2a9fj2wdht669.amplifyapp.com/';

    const walletAddress = await signer?.getAddress();
    const domainUrl = new URL(url);
    console.log(domainUrl);
    const SESSION_DURATION_MS = 1000 * 60 * 60 * 4; // 4 hours (max allowed)
    const expirationDate = new Date(Date.now() + SESSION_DURATION_MS - 60000);
    const message = new SiweMessage({
      domain: domainUrl.hostname,
      address: walletAddress,
      statement: "I confirm ownership of this address and agree to Unblock's terms and conditions",
      uri: domainUrl.href,
      version: '1',
      chainId: chain,
      nonce: generateNonce(),
      expirationTime: expirationDate.toISOString(),
      issuedAt: new Date(Date.now() - 60000).toISOString(),
    });
    const preparedMessage = message.prepareMessage();

    const signature = await signer?.signMessage(preparedMessage);

    return {
      message: preparedMessage,
      signature,
    };
  } catch (error) {
    console.error(error);
    return {
      message: null,
      signature: null,
    };
  }
};

export const handleSiweResponse = async (
  response: UnblockResponse,
  wallet: string,
  setCookie: Function,
) => {
  if (!response) {
    return null;
  }
  if (response.status === 200) {
    const APP_ID = process?.env?.NEXT_PUBLIC_INTERCOM_APP_ID ?? '';
    boot({
      app_id: APP_ID,
      user_id: response.data.user_uuid,
      user_hash: response.data.intercomUserHash,
    });
    const date = new Date(new Date().valueOf() + 4 * 60 * 60 * 1000);
    setCookie('unblockSessionId', response.data.unblock_session_id, {
      path: '/',
      expires: date,
    });
    setCookie('userId', response.data.user_uuid, {
      path: '/',
      expires: date,
    });
    setCookie('walletAddress', wallet, {
      path: '/',
      expires: date,
    });
    setCookie('intercomUserHash', response.data.intercomUserHash, {
      path: '/',
      expires: date,
    });
  }
};

export const handleOtpResponse = async (
  response: UnblockResponse,
  wallet: string,
  setCookie: Function,
) => {
  if (response.status === 200) {
    const date = new Date(new Date().valueOf() + 4 * 60 * 60 * 1000);
    setCookie('unblockSessionId', response.data.unblock_session_id, {
      path: '/',
      expires: date,
    });
    setCookie('userId', response.data.user_uuid, {
      path: '/',
      expires: date,
    });
    setCookie('walletAddress', wallet, {
      path: '/',
      expires: date,
    });
    setCookie('intercomUserHash', response.data.intercomUserHash, {
      path: '/',
      expires: date,
    });
  }
}

export const validateEmail = (email: string): boolean => {
  const emailRejex =
    /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
  return emailRejex.test(email);
};

export const currenciesList = [
  {
    id: 'gbp',
    name: 'British Pounds',
    icon: 'gb',
  },
  {
    id: 'eur',
    name: 'Euro',
    icon: 'eu',
  },
];

export const validCountriesList = [
  { value: 'AL', label: 'Albania' },
  { value: 'DZ', label: 'Algeria' },
  { value: 'AD', label: 'Andorra' },
  { value: 'AO', label: 'Angola' },
  { value: 'AG', label: 'Antigua and Barbuda' },
  { value: 'AR', label: 'Argentina' },
  { value: 'AM', label: 'Armenia' },
  { value: 'AU', label: 'Australia' },
  { value: 'AT', label: 'Austria' },
  { value: 'BS', label: 'Bahamas' },
  { value: 'BH', label: 'Bahrain' },
  { value: 'BD', label: 'Bangladesh' },
  { value: 'BE', label: 'Belgium' },
  { value: 'BZ', label: 'Belize' },
  { value: 'BJ', label: 'Benin' },
  { value: 'BT', label: 'Bhutan' },
  { value: 'BO', label: 'Bolivia, Plurinational State of' },
  { value: 'BA', label: 'Bosnia and Herzegovina' },
  { value: 'BR', label: 'Brazil' },
  { value: 'BN', label: 'Brunei Darussalam' },
  { value: 'BG', label: 'Bulgaria' },
  { value: 'CV', label: 'Cabo Verde' },
  { value: 'CM', label: 'Cameroon' },
  { value: 'CA', label: 'Canada' },
  { value: 'CO', label: 'Colombia' },
  { value: 'KM', label: 'Comoros' },
  { value: 'CG', label: 'Congo' },
  { value: 'CR', label: 'Costa Rica' },
  { value: 'HR', label: 'Croatia' },
  { value: 'CY', label: 'Cyprus' },
  { value: 'CZ', label: 'Czechia' },
  { value: 'CI', label: "Côte d'Ivoire" },
  { value: 'DK', label: 'Denmark' },
  { value: 'DJ', label: 'Djibouti' },
  { value: 'DM', label: 'Dominica' },
  { value: 'DO', label: 'Dominican Republic' },
  { value: 'EC', label: 'Ecuador' },
  { value: 'EG', label: 'Egypt' },
  { value: 'SV', label: 'El Salvador' },
  { value: 'GQ', label: 'Equatorial Guinea' },
  { value: 'ER', label: 'Eritrea' },
  { value: 'SZ', label: 'Eswatini' },
  { value: 'ET', label: 'Ethiopia' },
  { value: 'FJ', label: 'Fiji' },
  { value: 'FI', label: 'Finland' },
  { value: 'FR', label: 'France' },
  { value: 'GA', label: 'Gabon' },
  { value: 'GM', label: 'Gambia' },
  { value: 'GE', label: 'Georgia' },
  { value: 'DE', label: 'Germany' },
  { value: 'GR', label: 'Greece' },
  { value: 'GD', label: 'Grenada' },
  { value: 'GT', label: 'Guatemala' },
  { value: 'GY', label: 'Guyana' },
  { value: 'VA', label: 'Holy See' },
  { value: 'HN', label: 'Honduras' },
  { value: 'HU', label: 'Hungary' },
  { value: 'IS', label: 'Iceland' },
  { value: 'IN', label: 'India' },
  { value: 'ID', label: 'Indonesia' },
  { value: 'IE', label: 'Ireland' },
  { value: 'IL', label: 'Israel' },
  { value: 'IT', label: 'Italy' },
  { value: 'KE', label: 'Kenya' },
  { value: 'KI', label: 'Kiribati' },
  { value: 'KR', label: 'Korea, Republic of' },
  { value: 'KW', label: 'Kuwait' },
  { value: 'LA', label: "Lao People's Democratic Republic" },
  { value: 'LV', label: 'Latvia' },
  { value: 'LB', label: 'Lebanon' },
  { value: 'LS', label: 'Lesotho' },
  { value: 'LR', label: 'Liberia' },
  { value: 'LI', label: 'Liechtenstein' },
  { value: 'LT', label: 'Lithuania' },
  { value: 'LU', label: 'Luxembourg' },
  { value: 'MG', label: 'Madagascar' },
  { value: 'MW', label: 'Malawi' },
  { value: 'MY', label: 'Malaysia' },
  { value: 'MV', label: 'Maldives' },
  { value: 'ML', label: 'Mali' },
  { value: 'MT', label: 'Malta' },
  { value: 'MH', label: 'Marshall Islands' },
  { value: 'MR', label: 'Mauritania' },
  { value: 'MU', label: 'Mauritius' },
  { value: 'MX', label: 'Mexico' },
  { value: 'FM', label: 'Micronesia, Federated States of' },
  { value: 'MC', label: 'Monaco' },
  { value: 'MN', label: 'Mongolia' },
  { value: 'ME', label: 'Montenegro' },
  { value: 'MM', label: 'Myanmar' },
  { value: 'NA', label: 'Namibia' },
  { value: 'NR', label: 'Nauru' },
  { value: 'NP', label: 'Nepal' },
  { value: 'NL', label: 'Netherlands' },
  { value: 'NZ', label: 'New Zealand' },
  { value: 'NE', label: 'Niger' },
  { value: 'NG', label: 'Nigeria' },
  { value: 'MK', label: 'North Macedonia' },
  { value: 'NO', label: 'Norway' },
  { value: 'OM', label: 'Oman' },
  { value: 'PW', label: 'Palau' },
  { value: 'PG', label: 'Papua New Guinea' },
  { value: 'PY', label: 'Paraguay' },
  { value: 'PE', label: 'Peru' },
  { value: 'PL', label: 'Poland' },
  { value: 'PT', label: 'Portugal' },
  { value: 'QA', label: 'Qatar' },
  { value: 'RO', label: 'Romania' },
  { value: 'RW', label: 'Rwanda' },
  { value: 'KN', label: 'Saint Kitts and Nevis' },
  { value: 'LC', label: 'Saint Lucia' },
  { value: 'VC', label: 'Saint Vincent and the Grenadines' },
  { value: 'WS', label: 'Samoa' },
  { value: 'SM', label: 'San Marino' },
  { value: 'ST', label: 'Sao Tome and Principe' },
  { value: 'SA', label: 'Saudi Arabia' },
  { value: 'SN', label: 'Senegal' },
  { value: 'RS', label: 'Serbia' },
  { value: 'SC', label: 'Seychelles' },
  { value: 'SL', label: 'Sierra Leone' },
  { value: 'SG', label: 'Singapore' },
  { value: 'SK', label: 'Slovakia' },
  { value: 'SI', label: 'Slovenia' },
  { value: 'SB', label: 'Solomon Islands' },
  { value: 'ZA', label: 'South Africa' },
  { value: 'ES', label: 'Spain' },
  { value: 'LK', label: 'Sri Lanka' },
  { value: 'SR', label: 'Suriname' },
  { value: 'SE', label: 'Sweden' },
  { value: 'CH', label: 'Switzerland' },
  { value: 'TL', label: 'Timor-Leste' },
  { value: 'TG', label: 'Togo' },
  { value: 'TO', label: 'Tonga' },
  { value: 'TT', label: 'Trinidad and Tobago' },
  { value: 'TV', label: 'Tuvalu' },
  { value: 'AE', label: 'United Arab Emirates' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'UY', label: 'Uruguay' },
  { value: 'UZ', label: 'Uzbekistan' },
  { value: 'VE', label: 'Venezuela, Bolivarian Republic of' },
  { value: 'EH', label: 'Western Sahara' },
  { value: 'ZM', label: 'Zambia' },
];

export const checkValidChain = (chainId: number) => {
  return !!getChains().find(({ id }) => id === chainId);
};

export const checkUserNextStep = (
  router: NextRouter,
  status: UnblockResponse,
  banks: UnblockResponse,
  transactions: UnblockResponse,
) => {
  if (status.status === 200) {
    sessionStorage.setItem('user', JSON.stringify(status.data));
    sessionStorage.setItem('banks', JSON.stringify(banks.data));
    sessionStorage.setItem('transactions', JSON.stringify(transactions.data?.processes));
    if (!banks.data.length) {
      router.push('/bank/add');
      return;
    }
    if (status.data.status !== 'FULL_USER' && transactions?.data) {
      const { amount, total } = transactions?.data.reduce(
        (r: any, t: any) => {
          return {
            amount: r.amount + 1,
            total: t.direction === 'cryptoToFiat' ? t.output?.amount : t.input?.amount,
          };
        },
        { total: 0, amount: 0 },
      );
      if (amount >= 700 || total >= 2) {
        router.push('/kyc/intro');
        return;
      }
    }
    if (status.data?.status !== 'FULL_USER') {
      router.push('/kyc/warning');
      return;
    }
    router.push('/portal');
  }
  if (status.status === 401) {
    router.replace('/intro');
  }
};

export const formatSortCode = (value: string) => {
  if (!value) {
    return value;
  }
  return value.replace(/\D/g, '').slice(0, 6).replace(/.{2}/g, '$&-').replace(/-+$/, '');
};

export const getSessionValue = (key: string) => {
  try {
    return JSON.parse(sessionStorage.getItem(key) ?? '');
  } catch (err) {
    return null;
  }
};

export const getChainIdByLabel = (chainLabel: string): number | undefined => {
  const chain = chains.find(({ label }) => label.toLowerCase() === chainLabel.toLowerCase());
  return chain?.id;
};

export const getChainSlugByLabel = (chainLabel: string): string | undefined => {
  const chain = chains.find(({ label }) => label.toLowerCase() === chainLabel.toLowerCase());
  return chain?.name;
};

export const getChainIdByName = (chainName: string): number | undefined => {
  const chain = chains.find(({ name }) => name.toLowerCase() === chainName.toLowerCase());
  return chain?.id;
}

export const getChainLabelById = (chainId: number): string | undefined => {
  const chain = chains.find(({ id }) => id == chainId);
  return chain?.label
}

export const getChainLabelByName = (chainName: string): string | undefined => {
  const chain = chains.find(({ name }) => name == chainName);
  return chain?.label
}

export const getTokenNameById = (tokenId: string): string | undefined => {
  const token = tokenInfo.find(({ id }) => id === tokenId);
  return token?.name;
}

export const getChainNameById = (chainId: number): string | undefined => {
  const chain = chains.find(({ id }) => id == chainId);
  return chain?.name;
}

export const getChainById = (chainId: number): any | undefined => {
  const chain = chains.find(({ id }) => id == chainId);
  return chain;
}

export enum CurrenciesSymbols {
  EUR = '€',
  GBP = '£',
  USD = '$',
}

export enum CurrenciesNames {
  EUR = 'euro',
  GBP = 'british pound',
  USD = 'dollar',
}
