import { useEffect, useState } from "react";
import server from "./server";
import { utf8ToBytes, toHex } from "ethereum-cryptography/utils";
import { keccak256 } from "ethereum-cryptography/keccak";
import { sign, recoverPublicKey } from "ethereum-cryptography/secp256k1";

const hashMessage = (message) => {
  const messageAsUTF8Array = utf8ToBytes(message);
  return keccak256(messageAsUTF8Array);
};

function Transfer({ address, setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [hashedMessage, setHashedMessage] = useState("");
  const [signedMessage, setSignedMessage] = useState([]);

  const setValue = (setter) => (evt) => setter(evt.target.value);

  useEffect(() => {
    if (!recipient || !sendAmount) {
      return;
    }
    const message = { sendAmount, recipient };
    const hashed = hashMessage(JSON.stringify(message));
    setHashedMessage(toHex(hashed));
  }, [sendAmount, recipient]);

  useEffect(() => {
    if (!privateKey || !hashedMessage) {
      return;
    }
    sign(hashedMessage, privateKey, { recovered: true }).then((msg) => {
      setSignedMessage(msg);
      console.log("signature", msg);
    });
  }, [hashedMessage, privateKey]);

  useEffect(() => {
    console.log("signedMessage", signedMessage);
    if (!signedMessage || !hashedMessage) {
      return;
    }
    const [sig, recoveryBit] = signedMessage;
    const recoveredKey = recoverPublicKey(hashedMessage, sig, recoveryBit);
  }, [signedMessage]);

  async function transfer(evt) {
    evt.preventDefault();
    const [sig, recoveryBit] = signedMessage;
    try {
      const {
        data: { balance },
      } = await server.post(`send`, {
        sender: address,
        amount: parseInt(sendAmount),
        sig: toHex(sig),
        recoveryBit,
        hashedMessage,
        recipient,
      });
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
