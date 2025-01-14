import "./App.css";
import Nav from "./Nav/Nav";
import TokenPart from "./Token/Token";
import SenderTable from "./Table";
import Transfer from "./Transfer/Transfer";
import ConnectWallet from "./ConnectWallet";
import Fee from "./Fee";
import Airdrop from "./Airdrop";
import "bootstrap/dist/css/bootstrap.min.css";
import { Spinner } from "react-bootstrap";
import { useEffect, useState } from "react";
import { ethers, isAddress } from "ethers";
import {AIRDROPPER, AIRDROPPER_ABI, ERC20, ERC20_ABI} from '../ABIs';
import { AIRDROPPER_ADDR, TOKEN_ADDR } from "../constants";
import InvalidRecipeintsTable from "./InvalidRecipientsTable/InvalidRecipeintsTable";

function App() {
  const [signer, setSigner] = useState(null);
  const [provider, setProvider] = useState(null);
  const [isConnected, setIsConnected] = useState(!1); // Connection state
  const [tokenAddress, setTokenAddress] = useState(TOKEN_ADDR); // ERC-20 token contract address
  const [airdropperAddress, setAirdropperAddress] = useState(AIRDROPPER_ADDR); // ERC-20 token contract address
  const [wallets, setWallets] = useState([]); // List of recipient addresses
  const [walletAddress, setWalletAddress] = useState("");
  const [quantity, setQuantity] = useState(0); // Tokens to send per wallet
  const [fee, setFee] = useState(0); // Gas fee per transaction (not actively used for Ethereum)
  const [loading, setLoading] = useState(!1);
  const [balanceAmount, setBalanceAmount] = useState(0); // Sender's token balance
  const [tokenContract, setTokenContract] = useState(null)
  const [airdropperContract, setAirdropperContract] = useState(null)
  const [invalidRecipientList, setInvalidRecipientList] = useState([]);

  const handleContractInit = async () => {
    const code1 = await provider.getCode(tokenAddress);
    const code2 = await provider.getCode(airdropperAddress);
    if (code1 === '0x' || code2 === '0x') {
      const addr = code1 === '0x' ? tokenAddress : airdropperAddress;
      alert('No contract found at address: ' + (addr) + ' on selected chain.')
      console.error('No contract found at this address:', addr);
      return
    }
    
    const tContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer)
    const adContract = new ethers.Contract(airdropperAddress, AIRDROPPER_ABI, signer)
    setTokenContract(tContract)
    setAirdropperContract(adContract)
  }
  
  useEffect(() => {
    if (tokenAddress && airdropperAddress && signer) {
      handleContractInit()
    }
  }, [tokenAddress, airdropperAddress, signer]);

  useEffect(_ => {
    getTokenBalance()
  }, [tokenContract])

  const getTokenBalance = async () => {
    if(!isConnected) {
      console.error("wallet not connected.")
      return
    } else if(!tokenContract) {
      console.error("token contract not initialized")
      return
    }
    try {
      const decimals = await tokenContract.decimals();
      const balance = await tokenContract.balanceOf(walletAddress);
      console.log('decimals:', decimals)
      console.log('bal of tokens:', balance)
      setBalanceAmount(Number(ethers.formatUnits(balance, decimals)));
    } catch (error) {
      console.error("Error fetching token balance:", error);
    }
  };

  const handleDisconnect = _ => {
    setSigner(null)
    setProvider(null)
    setWalletAddress('')
    setIsConnected(!1);
  }

  const handleConnect = async () => {
    if (isConnected) {
      const confirmDisconnect = window.confirm("Do you want to disconnect?");
      if (confirmDisconnect) {
        handleDisconnect();
      }
    } else {
      if (!window.ethereum) {
        alert('Couldn\'t find the Metamask!');
      }
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const accAddr = await signer.getAddress();
        setSigner(signer)
        setIsConnected(!0)
        setProvider(provider)
        setWalletAddress(accAddr)
        console.log('Connected wallet address:', accAddr);
      } catch (e) {
        console.error('Failed to connect to MetaMask:', e);
      }
    }
  };

  // Airdrop logic
  const handleAirdrop = async () => {
    if(!isConnected) {
      console.error("wallet not connected.")
      return
    }
    if (!tokenAddress || wallets.length === 0 || quantity <= 0) {
      alert("Please fill in all parameters correctly!");
      return;
    }

    setLoading(!0);
    try {
      const decimals = await tokenContract.decimals();
      const amount = ethers.parseUnits(quantity.toString(), decimals);
      console.log(`Transferring ${quantity} tokens to recipients:`, wallets);
      const tx = await airdropperContract.airdrop_multi(wallets, amount);
      await tx.wait(); // Wait for the transaction to confirm
      console.log(`Successfully sent`);
      alert("Airdrop completed successfully!");
    } catch (error) {
      console.error("Airdrop failed:", error);
    }
    setLoading(false);
  };

  return (
    <div className="App">
      <Nav />
      <div style={{ opacity: loading ? 0.5 : 1 }}>
        {loading && (
          <div className="d-flex justify-content-center align-items-center custom-loading">
            <Spinner animation="border" variant="primary" role="status" />
          </div>
        )}
        <div className="connectWallet">
          {/* Future MetaMask Connection: Placeholder */}
          <div className="connectWallet">
          <ConnectWallet
            handleConnect={handleConnect}
            isConnected={isConnected}
            walletAddr={walletAddress}
          />
        </div>
          {/* <button className="btn btn-danger" disabled>
            <h3>MetaMask (Coming Soon)</h3>
          </button> */}
        </div>
        <div className="event">
          <SenderTable wallets={wallets} setWallets={setWallets} setInvalidRecipients={setInvalidRecipientList} isConnected = {isConnected}/>
        </div>
        {
          invalidRecipientList.length > 0 &&
          <div className="event">
            <InvalidRecipeintsTable invalidRecipients={invalidRecipientList}/>
          </div>
        }
        <div className="main">
          <TokenPart
            tokenaddress={tokenAddress}
            setTokenAddress={setTokenAddress}
            balanceAmount={balanceAmount}
          />
          <Transfer
            quantity={quantity}
            setQuantity={setQuantity}
            totalQuantity={wallets?.length ? wallets.length * quantity : 0}
            balanceAmount={balanceAmount}
          />
          <Fee
            fee={fee}
            setFee={setFee}
            totalFee={wallets?.length ? wallets.length * fee : 0}
          />
        </div>
        <div className="airdrop">
          <Airdrop
            isConnected={
              isConnected && wallets?.length
                ? wallets.length * quantity < balanceAmount
                : 0
            }
            handleAirdrop={handleAirdrop}
          />
          {/* <Airdrop handleAirdrop={handleAirdrop} isConnected={true} /> */}
        </div>
      </div>
    </div>
  );
}

export default App;