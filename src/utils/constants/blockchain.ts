import { ethers } from 'ethers';
import { ENVIRONMENTS } from './environments';

const BLOCKCHAIN_NET = {
  chainName: ENVIRONMENTS.CHAIN_NAME,
  rpcUrls: [ENVIRONMENTS.CHAIN_RPC_URL],
  chainId: ENVIRONMENTS.CHAIN_HASH_ID,
  nativeCurrency: {
    symbol: ENVIRONMENTS.SYMBOL,
    decimals: 18,
  },
  blockExplorerUrls: [ENVIRONMENTS.CHAIN_URL],
};

export const CURRENT_NET = BLOCKCHAIN_NET;

export const CHAIN_ID: { [key: string]: string } = {
  '0x61': 'BSC Testnet',
  '0x38': 'BSC',
  56: 'BSC',
  97: 'BSC Testnet',
  '0x1': 'ETH',
  1: 'ETH',
};

export const getConnectedChain = (chainId: string) => {
  return {
    name: CHAIN_ID[chainId] ? CHAIN_ID[chainId] : 'Unknown',
    id: chainId,
    isOnDeployedChain:
      ethers.BigNumber.from(chainId).toHexString() ===
      ENVIRONMENTS.CHAIN_HASH_ID,
  };
};
