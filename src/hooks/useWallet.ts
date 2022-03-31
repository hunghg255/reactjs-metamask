import { BigNumber, ethers } from 'ethers';
import { WALLET_TYPE } from '../utils/constants/walltet';
import { READ_ONLY_PROVIDER } from '../utils/common';
import { ENVIRONMENTS } from '../utils/constants/environments';
import { CURRENT_NET } from '../utils/constants/blockchain';
import { useState } from 'react';

declare const window: any;

let ETHER_PROVIDER: any;

export const useWallet = () => {
  const [walletState, setWalletState] = useState(() => {
    const infoCache = localStorage.getItem(ENVIRONMENTS.LOCAL_STORAGE_KEY);

    let initialInfo;
    if (infoCache) {
      initialInfo = JSON.parse(infoCache);
    }

    return {
      walletInfo: {
        formattedAddress: initialInfo?.formattedAddress,
        address: initialInfo?.address,
      },
      walletBalance: {
        balance: undefined,
        originalBalance: undefined,
      },
      walletType: initialInfo?.walletType,
      cacheInfo: initialInfo,
    };
  });

  const disconnectWallet = () => {
    setWalletState({
      walletInfo: {
        formattedAddress: undefined,
        address: undefined,
      },
      walletBalance: {
        balance: undefined,
        originalBalance: undefined,
      },
      walletType: undefined,
      cacheInfo: undefined,
    });
    localStorage.clear();
  };

  const isOnNetwork = async () => {
    const request = getRequest();
    if (request) {
      let chainId = await request({ method: 'eth_chainId' });
      if (walletState.walletType === WALLET_TYPE.WALLET_CONNECT) {
        return (
          BigNumber.from(`${chainId}`).toHexString() === CURRENT_NET.chainId
        );
      }
      return chainId === CURRENT_NET.chainId;
    }
    return false;
  };

  const getProvider = async () => {
    let provider: any;
    const onNetwork = await isOnNetwork();
    if (!onNetwork) {
      provider = READ_ONLY_PROVIDER;
      return provider;
    }
    //
    if (walletState.walletType === WALLET_TYPE.WALLET_CONNECT) {
      // provider = WALLET_CONNECT_PROVIDER;
    } else if (window?.ethereum?.isCoin98) {
      if (!ETHER_PROVIDER) {
        ETHER_PROVIDER = new ethers.providers.Web3Provider(
          window.coin98.provider
        );
      }
      provider = ETHER_PROVIDER;
    } else if (window?.ethereum?.isMetaMask && !window?.ethereum?.isCoin98) {
      ETHER_PROVIDER = new ethers.providers.Web3Provider(window.ethereum);
      provider = ETHER_PROVIDER;
    } else {
      provider = READ_ONLY_PROVIDER;
    }
    return provider;
  };

  const getRequest = () => {
    let request: any;
    if (walletState.walletType === WALLET_TYPE.WALLET_CONNECT) {
      // request = WALLET_CONNECT_PROVIDER.provider.request;
    } else if (window?.ethereum?.isCoin98) {
      request = window.coin98.provider.request;
    } else if (window?.ethereum?.isMetaMask && !window?.ethereum?.isCoin98) {
      request = window.ethereum.request;
    } else {
      if (!READ_ONLY_PROVIDER.request) {
        READ_ONLY_PROVIDER.request = ({ method, params }: any) =>
          READ_ONLY_PROVIDER.send(method, params);
      }

      request = READ_ONLY_PROVIDER.request;
    }
    return request;
  };

  // const getWalletBalanceRequest = useRequest(
  //   async (address: string) => {
  //     const request = getRequest();
  //     // console.log(request,)
  //     const balance = await request({
  //       method: 'eth_getBalance',
  //       params: [address, 'latest'],
  //     });

  //     return balance;
  //   },
  //   {
  //     manual: true,
  //     formatResult: (r) => {
  //       const BNB = numeral(utils.formatEther(r).toString()).format('0.0[00]');
  //       return {
  //         balance: BNB || 0,
  //         originalBalance: r,
  //       };
  //     },
  //     onSuccess: (balance) => {
  //       setWalletState({
  //         ...walletState,
  //         walletBalance: balance,
  //       });
  //     },
  //     onError: () => {},
  //   },
  // );

  const getCurrentChainId = async () => {
    const request = getRequest();
    if (request) {
      let chainId = await request({ method: 'eth_chainId' });
      return chainId;
    }
    return undefined;
  };

  const switchNetwork = async () => {
    const request = getRequest();
    if (request) {
      let chainId = await request({ method: 'eth_chainId' });
      if (chainId !== CURRENT_NET.chainId) {
        try {
          await request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: ENVIRONMENTS.CHAIN_HASH_ID }], // chainId must be in hexadecimal numbers
          });
        } catch (error: any) {
          if (error.code === 4902) {
            await request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  ...CURRENT_NET,
                },
              ],
            });
          }
        }
        chainId = await request({ method: 'eth_chainId' });

        if (chainId === CURRENT_NET.chainId) {
          return Promise.resolve();
        } else {
          return Promise.reject(new Error('Not on chain'));
        }
      }
    }
  };

  return {
    disconnectWallet,
    walletState,
    setWalletState,
    // getWalletBalanceRequest,
    getRequest,
    getProvider,
    isOnNetwork,
    switchNetwork,
    getCurrentChainId,
  };
};
