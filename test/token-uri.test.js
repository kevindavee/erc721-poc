const chaiAsPromised = require('chai-as-promised');
const chai = require('chai');
const { ethers } = require('hardhat');
const { deploy } = require('./utils');

chai.use(chaiAsPromised);
const { expect } = chai;

describe('TokenURI', () => {
    let contract;
    beforeEach(async () => {
        contract = await deploy();
    });

    it('should successfully get the token URI', async () => {
        const [, buyer1] = await ethers.getSigners();

        await contract.connect(buyer1).mintNFTs(1, {
            value: ethers.utils.parseEther("0.01")
        });

        const tokenURI = await contract.tokenURI(0);
        expect(tokenURI).to.equal('ipfs://somemockCID/0.json');
    });

    it('should not be able to get URI for non-existing token', async () => {
        const [, buyer1] = await ethers.getSigners();

        await contract.connect(buyer1).mintNFTs(1, {
            value: ethers.utils.parseEther("0.01")
        });
        
        const tokenURIPromise = contract.tokenURI(10);
        expect(tokenURIPromise).to.eventually.be.rejectedWith('Token is not exist');
    });
});