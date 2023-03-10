import server from "./server";
import { utf8ToBytes, toHex } from "ethereum-cryptography/utils";
import { keccak256 } from "ethereum-cryptography/keccak";
import {
  sign,
  recoverPublicKey,
  getPublicKey,
} from "ethereum-cryptography/secp256k1";

function Wallet({
  address,
  setAddress,
  balance,
  setBalance,
  privateKey,
  setPrivateKey,
}) {
  const getAddress = (publicKey) => {
    const keyWithoutFormat = publicKey.slice(1, publicKey.length);
    const hashedKey = keccak256(keyWithoutFormat);
    return hashedKey.slice(-20);
  };

  async function onChange(evt) {
    const privateKey = evt.target.value;
    setPrivateKey(privateKey);
    if (!evt.target.value) {
      return;
    }
    const address = toHex(getAddress(await getPublicKey(privateKey)));
    setAddress(address);
    if (address) {
      const {
        data: { balance },
      } = await server.get(`balance/${address}`);
      setBalance(balance);
    } else {
      setBalance(0);
    }
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Private Key
        <input
          placeholder="Type in a private key"
          value={privateKey}
          onChange={onChange}
        ></input>
      </label>

      <div className="Address">Address {address}</div>
      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Wallet;
