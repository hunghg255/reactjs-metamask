import { ethers } from 'ethers';
import { ENVIRONMENTS } from '../constants/environments';
import { WALLET_TYPE } from '../constants/walltet';
declare const window: any;
export const READ_ONLY_PROVIDER: any = new ethers.providers.JsonRpcProvider(
  ENVIRONMENTS.CHAIN_RPC_URL
);

export let walletConnectProvider = undefined;

export const resetWalletConnectProvider = () => {
  walletConnectProvider = undefined;
};

export const WALLET_CONNECT_PROVIDER: any = undefined;

export const checkMetaMaskInstalled = () => !!window?.ethereum?.isMetaMask;

export const checkCoin98Installed = () => !!window?.ethereum?.isCoin98;

export const formatWalletAddress = (address: string, toNumber = 4) => {
  const _stringDel = address.substring(6, address.length - toNumber);
  return address.replace(_stringDel, '...');
};

export const delay = (secs: number) =>
  new Promise((resolve) => setTimeout(resolve, secs));

export const downloadExtention = (typeWallet: string) => {
  switch (typeWallet) {
    case WALLET_TYPE.META_MASK:
      window.open('https://metamask.io/download', '_blank');
      break;
    case WALLET_TYPE.COIN_98:
      window.open('https://coin98.com/wallet', '_blank');
      break;
    default:
      break;
  }
};

export const connectMetaService = async () => {
  const isMetamaskInstalled = checkMetaMaskInstalled();
  if (!isMetamaskInstalled) {
    return Promise.reject({ message: 'Metamask is not installed!' });
  }

  const isCoin98Installed = checkCoin98Installed();
  if (isCoin98Installed) {
    return Promise.reject({
      message:
        'Coin98 extension is enabled, you cannot use both Metamask and Coin98 at once.',
    });
  }

  const accounts = await window.ethereum.request({
    method: 'eth_requestAccounts',
  });
  return accounts[0];
};
