import React, { useContext, useEffect, useRef } from 'react';
import {
  checkCoin98Installed,
  connectMetaService,
  delay,
  formatWalletAddress,
} from '../utils/common';
import { ENVIRONMENTS } from '../utils/constants/environments';
import { WALLET_TYPE } from '../utils/constants/walltet';
import useMount from '../hooks/useMount';
import { useWallet } from '../hooks/useWallet';

declare const window: any;

export const WalletContext = React.createContext({});

export const useWalletContextConsumer = () => {
  return useContext(WalletContext);
};

export const useWalletInfo = () => {
  const { walletInfo: walletState }: any = useContext(WalletContext);
  return walletState.walletInfo;
};

export const WalletContextProvider = (props: any) => {
  const {
    walletState,
    setWalletState,
    disconnectWallet,
    getProvider,
    getRequest,
  } = useWallet();

  const walletType = walletState?.walletType;
  const address = walletState?.walletInfo?.address;
  const walletTypeRef = useRef();
  const addressRef = useRef();

  useEffect(() => {
    walletTypeRef.current = walletType;
    addressRef.current = address;
  }, [walletType, address]);

  useMount(async () => {
    const request = getRequest();
    if (walletState.cacheInfo) {
      if (!walletState?.cacheInfo?.walletType) {
        disconnectWallet();
        return;
      }

      if (
        walletState?.cacheInfo?.walletType === WALLET_TYPE.META_MASK &&
        checkCoin98Installed()
      ) {
        disconnectWallet();
        return;
      }

      // if (
      //   walletState?.cacheInfo?.walletType === WALLET_TYPE.WALLET_CONNECT &&
      //   !walletConnectProvider.connected
      // ) {
      //   disconnectWallet();
      //   return;
      // }

      if (request) {
        const result = await request({
          method: 'eth_requestAccounts',
        });
        if (
          result &&
          result[0] &&
          result[0].toLowerCase() ===
            walletState?.cacheInfo?.address?.toLowerCase()
        ) {
          setWalletState({
            ...walletState,
            walletType: walletState.cacheInfo.walletType,
          });
        }
        return;
      }

      // disconnectWallet();
      return;
    }
  });

  const saveUserInfo = (account: string) => {
    const formattedAddress = formatWalletAddress(account);
    localStorage.setItem(
      ENVIRONMENTS.LOCAL_STORAGE_KEY,
      JSON.stringify({
        address: account,
        formattedAddress,
        walletType,
      })
    );

    setWalletState({
      ...walletState,
      walletInfo: {
        ...walletState.walletInfo,
        address: account,
        formattedAddress,
      },
    });
  };

  useMount(() => {
    const loop = async () => {
      const provider = await getProvider();
      const request = getRequest();
      if (
        walletTypeRef.current === WALLET_TYPE.COIN_98 &&
        !!addressRef.current &&
        provider &&
        request
      ) {
        const accounts = await request({
          method: 'eth_requestAccounts',
        });
        if (
          accounts[0] &&
          addressRef?.current &&
          accounts[0].toLowerCase() !== `${addressRef.current}`.toLowerCase()
        ) {
          provider?.emit('accountsChanged', accounts);
        }
      }
      await delay(2000);

      await loop();
    };
    loop();
  });

  const initListener = async () => {
    // web3 provider
    let eventSubcriber: any;

    if (walletType === WALLET_TYPE.META_MASK) {
      eventSubcriber = window.ethereum;
    } else if (walletType === WALLET_TYPE.COIN_98) {
      eventSubcriber = window.coin98?.provider;
    } else if (walletType === WALLET_TYPE.WALLET_CONNECT) {
      // eventSubcriber = WALLET_CONNECT_PROVIDER.provider;
    }

    if (eventSubcriber) {
      eventSubcriber?.on('accountsChanged', (accounts: any) => {
        const account = accounts[0];

        if (account) {
          saveUserInfo(account);
        } else {
          disconnectWallet();
        }
      });
      eventSubcriber?.on('chainChanged', () => {
        window.location.reload();
      });
      eventSubcriber?.on('disconnect', () => {
        disconnectWallet();
      });
    } else if (!eventSubcriber) {
      disconnectWallet();
    }

    return () => {
      eventSubcriber?.removeAllListeners();
    };
  };

  useEffect(() => {
    initListener();
  }, [walletType]);

  const handleConnectMetamask = async () => {
    try {
      const address = await connectMetaService();
      const formattedAddress = formatWalletAddress(address);
      localStorage.setItem(
        ENVIRONMENTS.LOCAL_STORAGE_KEY,
        JSON.stringify({
          walletType: WALLET_TYPE.META_MASK,
          address,
          formattedAddress,
        })
      );
      setWalletState({
        ...walletState,
        walletType: WALLET_TYPE.META_MASK,
        walletInfo: { address, formattedAddress },
      });
    } catch (error) {}
  };

  return (
    <WalletContext.Provider
      value={{
        walletInfo: walletState,
        setWalletState,
        disconnectWallet,
        handleConnectMetamask,
      }}
    >
      {props.children}
    </WalletContext.Provider>
  );
};
