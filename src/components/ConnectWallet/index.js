import Button from "react-bootstrap/Button";

const ConnectWallet = (props) => {
  const { handleConnect, isConnected, walletAddr } = props;

  return (
    <div>
      <Button
      className={isConnected ? "btn btn-success" : "btn btn-danger"}
      onClick={handleConnect}
    >
      <h3>{isConnected ? "Connected" : "Connect Wallet"}</h3>
    </Button>
    { walletAddr && <p>{walletAddr}</p>}
    </div>
  );
};

export default ConnectWallet;



