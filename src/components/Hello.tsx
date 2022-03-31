import React from 'react';
import { useWalletInfo } from '../hooks/WalletContext';

export default function Hello() {
  const walletInfo = useWalletInfo();
  console.log({ walletInfo });

  return <div>Hello</div>;
}
