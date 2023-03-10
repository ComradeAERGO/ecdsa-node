const secp = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { toHex } = require("ethereum-cryptography/utils");

const privateKey = secp.utils.randomPrivateKey();

console.log("Private key:", toHex(privateKey));

const publicKey = secp.getPublicKey(privateKey);

console.log("Public key:", toHex(publicKey));

const getAddress = (publicKey) => {
  const keyWithoutFormat = publicKey.slice(1, publicKey.length);
  const hashedKey = keccak256(keyWithoutFormat);
  return hashedKey.slice(-20);
};

const address = getAddress(publicKey);

console.log("Address:", toHex(address));
