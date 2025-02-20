export const initialWallet = {
  provider: null,
  wallet: null,
  chain: null,
  loading: true,
};

const reducer = (state: any, action: any) => {
  const { payload, type } = action;
  switch (type) {
    case 'setWallet':
      return {
        ...state,
        wallet: payload.wallet,
        chain: typeof payload.chain === 'string' ? Number.parseInt(payload.chain) : payload.chain,
        provider: payload.provider,
        loading: false,
      };
    case 'setChain':
      return {
        ...state,
        chain: typeof payload.chain === 'string' ? Number.parseInt(payload.chain) : payload.chain,
        loading: false,
      };
    case 'resetWallet':
      return {
        ...state,
        chain: null,
        wallet: null,
        provider: null,
        loading: false,
      };
    case 'setLoading':
      return {
        ...state,
        loading: payload.loading,
      };
    default:
      return state;
  }
};

export default reducer;
