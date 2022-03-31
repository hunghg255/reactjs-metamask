export const ENVIRONMENTS = {
  CHAIN_URL: process.env.REACT_APP_CHAIN_URL || '',
  CHAIN_RPC_URL: process.env.REACT_APP_CHAIN_RPC_URL || '',
  CHAIN_ID: process.env.REACT_APP_CHAIN_ID || '',
  CHAIN_HASH_ID: process.env.REACT_APP_CHAIN_HASH_ID || '',
  CHAIN_NAME: process.env.REACT_APP_CHAIN_NAME || '',
  SYMBOL: process.env.REACT_APP_SYMBOL || '',

  API_URL: process.env.REACT_APP_API_URL || '',
  APP_URL: window.location.origin,
  LOCAL_STORAGE_KEY: process.env.REACT_APP_LOCAL_STORAGE_KEY || '',
};
