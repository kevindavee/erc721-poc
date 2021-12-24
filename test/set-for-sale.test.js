const chaiAsPromised = require('chai-as-promised');
const chai = require('chai');
const { ethers } = require('hardhat');
const { deploy } = require('./utils');

chai.use(chaiAsPromised);
const { expect } = chai;

describe('setForSale', () => {
    let contract;
    beforeEach(async () => {
        contract = await deploy();
    });

    it('should successfully get set NFT for sale', async () => {
        const [, buyer1] = await ethers.getSigners();

        await contract.connect(buyer1).mintNFTs(1, {
            value: ethers.utils.parseEther("0.01")
        });

        await contract.connect(buyer1).setForSale(0, ethers.utils.parseEther("0.02"));
        const salePrice = await contract.connect(buyer1).tokenSalePrice(0);

        expect(salePrice.eq(ethers.utils.parseEther("0.02"))).to.be.true;
    });

    it('should not be able to set NFT for sale if not the owner', async () => {
        const [, buyer1] = await ethers.getSigners();

        await contract.connect(buyer1).mintNFTs(1, {
            value: ethers.utils.parseEther("0.01")
        });

        const setForSalePromise = contract.setForSale(0, ethers.utils.parseEther("0.02"));

        expect(setForSalePromise).to.eventually.be.rejectedWith('Not owner of this token');
    });

    it('should not be able to set NFT for sale if price is zero', async () => {
        const [, buyer1] = await ethers.getSigners();

        await contract.connect(buyer1).mintNFTs(1, {
            value: ethers.utils.parseEther("0.01")
        });

        const setForSalePromise = contract.connect(buyer1).setForSale(0, ethers.utils.parseEther("0"));

        expect(setForSalePromise).to.eventually.be.rejectedWith('Price cannot be zero');
    });
});