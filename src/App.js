import './App.css';
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

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
  

  const provider = new ethers.providers.JsonRpcProvider();
  const signer = provider.getSigner();
  const contract = new ethers.Contract(contractAddress, abi, signer);
  

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
        const network = await provider.getNetwork();
        setNetwork(`${network.name} (${network.chainId})`);
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

  const switchToArbitrum = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xA4B1' }] // Arbitrum One Chain ID (42161)
      });
    } catch (switchError) {
      // Si la red Arbitrum no está en la billetera, la añadimos
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0xA4B1',
              chainName: 'Arbitrum One',
              rpcUrls: ['https://arb1.arbitrum.io/rpc'],
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18
              },
              blockExplorerUrls: ['https://arbiscan.io/']
            }]
          });
        } catch (addError) {
          console.error('No se pudo añadir la red Arbitrum', addError);
        }
      }
    }
  };

  const handleConnectWallet = async () => {
    try {
      await provider.send('eth_requestAccounts', []);
      const accounts = await provider.listAccounts();
      setWalletAddress(accounts[0]);
      setConnected(true);
      
      // Verifica si el usuario está en la red Arbitrum
      const chainId = await provider.getNetwork().then(network => network.chainId);
      if (chainId !== 42161) { // 42161 es el Chain ID de Arbitrum One
        await switchToArbitrum(); // Cambia a la red Arbitrum si es necesario
      }
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
    if (isNaN(ethAmount) || ethAmount <= 0 || ethAmount > 0.54) {
      setEthAmount(0);
      setDuffAmount(0);
      return;
    }
  
    setEthAmount(ethAmount);
    
    // Convertir ETH a wei
    let weiAmount;
    if (ethAmount >= 0.01) {
      weiAmount = ethers.utils.parseEther(ethAmount.toFixed(4));
    } else if (ethAmount >= 0.001) {
      weiAmount = ethers.utils.parseEther(ethAmount.toFixed(5));
    } else {
      weiAmount = ethers.utils.parseEther(ethAmount.toFixed(6));
    }
    
    const duffPricePerEth = presalePrice / ethPrice; // Calcular el precio de DUFF por ETH
    const duffAmount = ethAmount / duffPricePerEth; // Calcular la cantidad de DUFF
    setDuffAmount(duffAmount.toFixed(2));
  };

  const handleBuyDuff = async () => {
    if (!connected) {
      alert('Por favor, conecta tu billetera');
      return;
    }
  
    const ethAmount = parseFloat(inputValue);
    if (ethAmount <= 0 || ethAmount > 0.54) {
      alert('Por favor, ingresa una cantidad de ETH válida (entre 0.004 y 0.54)');
      return;
    }
  
    // Convertir ETH a wei
    let weiAmount;
    if (ethAmount >= 0.01) {
      weiAmount = ethers.utils.parseEther(ethAmount.toFixed(4));
    } else if (ethAmount >= 0.001) {
      weiAmount = ethers.utils.parseEther(ethAmount.toFixed(5));
    } else {
      weiAmount = ethers.utils.parseEther(ethAmount.toFixed(6));
    }
  
    const tx = {
      to: '0xf9bce13e2e56cc5b11dbb4e2a34d93e0f97aa2aa', // Dirección del contrato de DUFF
      value: weiAmount,
    };
  
    try {
      const txResponse = await signer.sendTransaction(tx);
      await txResponse.wait(); // Espera a que la transacción sea confirmada
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