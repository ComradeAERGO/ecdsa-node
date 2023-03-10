const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const { toHex } = require("ethereum-cryptography/utils");
const { recoverPublicKey } = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");

app.use(cors());
app.use(express.json());

const balances = {
  "1da550a6b94f6f23c1030d11e33471263b7c1d2b": 100, // Anthony
  "7db7e3db5d33925cb32e2b2e60ad03767454a039": 50, // Bob
  "83b78e245f2336a0d86737769bc92f30ff9a06a3": 75, // Sylvie
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", async (req, res) => {
  const { sender, recipient, amount, sig, recoveryBit, hashedMessage } =
    req.body;
  const publicKey = recoverPublicKey(hashedMessage, sig, recoveryBit);

  const getAddress = (publicKey) => {
    const keyWithoutFormat = publicKey.slice(1, publicKey.length);
    const hashedKey = keccak256(keyWithoutFormat);
    return hashedKey.slice(-20);
  };

  const senderAddress = toHex(getAddress(publicKey));

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else if (senderAddress !== sender) {
    res.status(400).send({ message: "Signature error" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
