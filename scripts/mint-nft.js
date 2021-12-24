require('dotenv').config();
const {API_URL, SECONDARY_PUBLIC_KEY, SECONDARY_PRIVATE_KEY, CONTRACT_ADDRESS} = process.env;
const { createAlchemyWeb3 } = require('@alch/alchemy-web3');
const alchemyWeb3 = createAlchemyWeb3(API_URL);
const contract = require('../artifacts/contracts/NFTPoc.sol/NFTPoc.json');
const ethers = require('ethers');
const contractAddress = CONTRACT_ADDRESS;
const nftContract = new alchemyWeb3.eth.Contract(contract.abi, contractAddress);

const publicKey = `0x${SECONDARY_PUBLIC_KEY}`;
const privateKey = `0x${SECONDARY_PRIVATE_KEY}`;

async function mintNFT() {
    const nonce = await alchemyWeb3.eth.getTransactionCount(publicKey, 'latest');
    const tx = {
        from: publicKey,
        to: contractAddress,
        value: ethers.utils.parseEther("0.01"),
        nonce,
        gas: 1000000,
        data: nftContract.methods
            .mintNFTs(1)
            .encodeABI()
    }

    const signPromise = alchemyWeb3.eth.accounts.signTransaction(
        tx,
        privateKey
    );

    const signedTx = await signPromise;
    const hash = await alchemyWeb3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log(`Transaction hash: ${hash.transactionHash}`);
}

mintNFT()
.then(() => process.exit(0))
.catch(error => {
  console.error(error);
  process.exit(1);
});