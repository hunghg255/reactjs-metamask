import React from 'react';
import './App.css';
import Hello from './components/Hello';
import { useWalletContextConsumer } from './context/WalletContext';

function App() {
  const { walletInfo, handleConnectMetamask, disconnectWallet }: any =
    useWalletContextConsumer();

  return (
    <div className='App'>
      <div>Type: {walletInfo.walletType}</div>
      <div>Address: {walletInfo.walletInfo.address}</div>

      <button onClick={handleConnectMetamask}>Connect</button>

      <button onClick={disconnectWallet}>Disconnect</button>
    </div>
  );
}

export default App;
