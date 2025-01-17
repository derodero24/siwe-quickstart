import { ethers } from 'ethers';
import { SiweMessage } from 'siwe';

const domain = window.location.host;
const origin = window.location.origin;
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

const BACKEND_ADDR = 'http://localhost:4000';
async function createSiweMessage(address, statement) {
  const res = await fetch(`${BACKEND_ADDR}/nonce`, {
    credentials: 'include',
  });
  const message = new SiweMessage({
    domain,
    address,
    statement,
    uri: origin,
    version: '1',
    chainId: '1',
    nonce: await res.text(),
  });
  return message.prepareMessage();
}

function connectWallet() {
  provider
    .send('eth_requestAccounts', [])
    .catch(() => console.log('user rejected request'));
}

async function signInWithEthereum() {
  const message = await createSiweMessage(
    await signer.getAddress(),
    'Sign in with Ethereum to the app.',
  );
  const signature = await signer.signMessage(message);

  const res = await fetch(`${BACKEND_ADDR}/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, signature }),
    credentials: 'include',
  });
  console.log(await res.text());
}

async function getInformation() {
  const res = await fetch(`${BACKEND_ADDR}/download_link`, {
    credentials: 'include',
  });
  document.getElementById('url').textContent = await res.text();
}

const connectWalletBtn = document.getElementById('connectWalletBtn');
const siweBtn = document.getElementById('siweBtn');
const infoBtn = document.getElementById('infoBtn');
connectWalletBtn.onclick = connectWallet;
siweBtn.onclick = signInWithEthereum;
infoBtn.onclick = getInformation;
