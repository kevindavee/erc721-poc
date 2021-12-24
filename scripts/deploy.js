require('dotenv').config();
const { ethers } = require("hardhat");

const { IPFS_URL } = process.env;
const baseTokenURI = IPFS_URL;

async function deploy(contractName, baseTokenURI) {
    const [deployer] = await ethers.getSigners();
    console.log(baseTokenURI);
    console.log("Deploying contracts with the account: ", deployer.address);
    console.log("Account balance: ", (await deployer.getBalance()).toString());

    const contractFactory = await ethers.getContractFactory(contractName);

    const contract = await contractFactory.deploy(baseTokenURI);
    await contract.deployed();
    console.log("Contract deployed to address: ", contract.address);
    return contract;
}

deploy('NFTPoc', baseTokenURI)
.then(() => process.exit(0))
.catch(error => {
  console.error(error);
  process.exit(1);
});