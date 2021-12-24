const { ethers } = require('hardhat');

module.exports.deploy = async () => {
    const baseTokenURI = 'ipfs://somemockCID/';
    const contractFactory = await ethers.getContractFactory('NFTPoc');
    const contract = await contractFactory.deploy(baseTokenURI);
    await contract.deployed();
    return contract;
}