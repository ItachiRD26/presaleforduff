import './App.css';
import React, { useState, useEffect } from 'react';
import Web3 from 'web3';

function App() {
  const [walletAddress, setWalletAddress] = useState('');
  const [network, setNetwork] = useState('');
  const [presalePrice, setPresalePrice] = useState(0.00034);
  const [ethPrice, setEthPrice] = useState(0);
  const [progress, setProgress] = useState(0);
  const [remainingTokens, setRemainingTokens] = useState(5000000000);
  const [raisedAmount, setRaisedAmount] = useState(0);
  const [goal, setGoal] = useState(500000);
  const [ethAmount, setEthAmount] = useState(0);
  const [duffAmount, setDuffAmount] = useState(0);
  const [connected, setConnected] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [loginFormVisible, setLoginFormVisible] = useState(false);

  const web3 = new Web3(window.ethereum); // Define web3 aquí

  useEffect(() => {
    const getETHPrice = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
        const data = await response.json();
        setEthPrice(data.ethereum.usd);
      } catch (error) {
        console.error("Error fetching ETH price:", error);
      }
    };

    const getNetwork = async () => {
      try {
        const networkId = await web3.eth.net.getId();
        const networkType = await web3.eth.net.getNetworkType();
        setNetwork(`${networkType} (${networkId})`);
      } catch (error) {
        console.error("Error fetching network info:", error);
      }
    };

    getETHPrice();
    setInterval(getETHPrice, 60000); // Actualiza el precio cada minuto

    if (connected) {
      getNetwork(); // Obtiene la red solo si la wallet está conectada
    }
  }, [connected]);


  const handleConnectWallet = async () => {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setWalletAddress(accounts[0]);
      setConnected(true);
    } catch (error) {
      console.error("Error connecting to wallet:", error);
    }
  };

  const handleDisconnectWallet = () => {
    setWalletAddress('');
    setConnected(false);
    window.ethereum.request({ method: 'eth_requestAccounts' }).then(accounts => {
      if (accounts.length === 0) {
        alert('Wallet disconnected successfully');
      }
    });
  };
  const handleEthAmountChange = (e) => {
    const inputValue = e.target.value;
    setInputValue(inputValue);
    const ethAmount = parseFloat(inputValue);
    setEthAmount(ethAmount);
    const duffPricePerEth = presalePrice / ethPrice; // Calculate DUFF price per ETH
    const duffAmount = ethAmount / duffPricePerEth; // Calculate DUFF amount based on input ETH amount
    setDuffAmount(duffAmount.toFixed(2));
  };

  const handleBuyDuff = async () => {
    if (!connected) {
      alert('Por favor, conecta tu billetera');
      return;
    }
  
    const ethAmount = parseFloat(inputValue);
    if (ethAmount <= 0) {
      alert('Por favor, ingresa una cantidad de ETH válida');
      return;
    }
  
    const duffAmount = (ethAmount * ethPrice) / presalePrice;
    const weiAmount = web3.utils.toWei(ethAmount.toString(), 'ether');
  
    try {
      const tx = {
        from: walletAddress,
        to: '0xf9bce13e2e56cc5b11dbb4e2a34d93e0f97aa2aa', // Dirección del contrato de DUFF
        value: weiAmount,
        gas: '500000',
        gasPrice: web3.utils.toWei('0.001', 'gwei'),
      };
  
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [tx],
      });

      // Esperar a que la transacción se confirme
      await web3.eth.getTransactionReceipt(txHash);
  
      // Actualizar el estado de la aplicación
      setRaisedAmount(raisedAmount + ethAmount * ethPrice);
      setRemainingTokens(remainingTokens - duffAmount);
      setProgress((raisedAmount / goal) * 100);
      alert(`¡Has comprado ${duffAmount} DUFF con éxito!`);
    } catch (error) {
      console.error('Error al realizar la compra:', error);
      alert('Error al realizar la compra. Por favor, intenta nuevamente.');
    }
  };

  return (
    // ... (el código del return sigue siendo el mismo)
    <div className="App">
      <div id="wallet-info">
        <div id="wallet-address">
          <span className="wallet-icon"></span> 
          Wallet Address: <span id="address-display">{walletAddress}</span>
        </div>
        <div id="network-info">
          <span className="network-icon"></span> 
          Network: <span id="network-display">{network}</span>
        </div>
      </div>

      <div className="container">
        <div className="presale-card">
          <div className="header">
          <img src={require('./img/dufflogo.jpg')} alt="DUFF Logo" class="logo" />
            <h1>DUFF ($DUFF)</h1>
          </div>
          <p className="price">Presale Price: <span id="presale-price">{presalePrice} USD</span></p>
          <p className="eth-price">Current ETH Price: <span id="eth-price">{ethPrice} USD</span></p>
          <div className="network">
          <img src={require('./img/arbitrum-arb-logo.png')} alt="Arbitrum One Logo" class="network-logo" />
            <span>Arbitrum One - ETH</span>
          </div>
          <div className="dates">
            <div className="date">
              <p>Start Date</p>
              <p>September 1, 2024</p>
            </div>
            <div className="date">
              <p>End Date</p>
              <p>October 1, 2024</p>
            </div>
          </div>
          <div className="progress-bar">
            <div className="progress" id="progress-bar" style={{ width: `${progress}%` }} />
          </div>
          <p className="tokens-remaining">Remaining Tokens: <span id="remaining-tokens">{remainingTokens}</span></p>
          <div className="raised-goal">
            <div className="raised"><span id="raised-amount">{raisedAmount}</span></div>
            <div className="goal">{goal}</div>
          </div>
          <div className="conversion">
  <div className="input-group">
    <label for="eth-amount">ETH</label>
    <input
  id="eth-amount"
  type="text"
  placeholder="0"
  value={inputValue}
  onChange={handleEthAmountChange}
  pattern="[0-9]+(\.[0-9]{1,4})?"
  inputMode="decimal"
/>
    <span id="eth-value-usd" style={{ color: 'gray', fontSize: '0.9em', marginLeft: '5px' }}>${(ethAmount * ethPrice).toFixed(2)} USD</span>
  </div>
  <div className="arrow">→</div>
  <div className="input-group">
    <label for="duff-amount">DUFF</label>
    <input
      id="duff-amount"
      type="number"
      placeholder="0"
      value={duffAmount}
      readOnly
    />
  </div>
</div>
          <div className="buttons-container">
          {connected ?
          <button className="btn btn-primary" onClick={handleBuyDuff}>Buy DUFF</button>
          :
          <button className="btn btn-primary" onClick={handleConnectWallet}>Connect Wallet</button>
          }
          {connected && <button className="btn btn-secondary" onClick={handleDisconnectWallet}>Disconnect Wallet</button>}
</div>
        </div>
      </div>
    </div>
  );
}

export default App;