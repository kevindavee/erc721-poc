const chaiAsPromised = require('chai-as-promised');
const chai = require('chai');
const { ethers } = require('hardhat');
const { deploy } = require('./utils');

chai.use(chaiAsPromised);
const { expect } = chai;

describe('disallowBuy', () => {
    let contract;
    beforeEach(async () => {
        contract = await deploy();
    });

    it('should successfully remove NFT from sale', async () => {
        const [, buyer1] = await ethers.getSigners();

        await contract.connect(buyer1).mintNFTs(1, {
            value: ethers.utils.parseEther("0.01")
        });

        await contract.connect(buyer1).setForSale(0, ethers.utils.parseEther("0.02"));
        await contract.connect(buyer1).disallowBuy(0);
        const salePrice = await contract.connect(buyer1).tokenSalePrice(0);

        expect(salePrice.toNumber()).to.be.equal(0);
    });

    it('should not be able to set NFT for sale if not the owner', async () => {
        const [, buyer1] = await ethers.getSigners();

        await contract.connect(buyer1).mintNFTs(1, {
            value: ethers.utils.parseEther("0.01")
        });

        await contract.connect(buyer1).setForSale(0, ethers.utils.parseEther("0.02"));
        const disallowBuyPromise = contract.disallowBuy(0);

        expect(disallowBuyPromise).to.eventually.be.rejectedWith('Not owner of this token');
    });
});