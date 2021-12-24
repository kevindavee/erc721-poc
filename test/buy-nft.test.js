const chaiAsPromised = require('chai-as-promised');
const chai = require('chai');
const { ethers } = require('hardhat');
const { deploy } = require('./utils');

chai.use(chaiAsPromised);
const { expect } = chai;

describe('buyNFT', () => {
    let contract;
    beforeEach(async () => {
        contract = await deploy();
    });

    it('should successfully buyNFT', async () => {
        const [, minter, buyer] = await ethers.getSigners();

        await contract.connect(minter).mintNFTs(1, {
            value: ethers.utils.parseEther("0.01")
        });

        await contract.connect(minter).setForSale(0, ethers.utils.parseEther("0.02"));
        const currentMinterBalance = await minter.getBalance();
        await contract.connect(buyer).buyNFT(0, {
            value: ethers.utils.parseEther("0.02")
        });
        
        const newMinterBalance = await minter.getBalance();
        const contractBalance = await contract.provider.getBalance(contract.address);

        expect(contractBalance.eq(ethers.utils.parseEther("0.011"))).to.be.true;
        expect(newMinterBalance.gt(currentMinterBalance)).to.be.true;
    });

    it('should not be able to buy NFT that is not on sale', async () => {
        const [, minter, buyer] = await ethers.getSigners();

        await contract.connect(minter).mintNFTs(2, {
            value: ethers.utils.parseEther("0.02")
        });

        await contract.connect(minter).setForSale(0, ethers.utils.parseEther("0.1"));
        const buyerBalance = await buyer.getBalance();
        const buyNFTPromise = contract.connect(buyer).buyNFT(1, {
            value: ethers.utils.parseEther("0.1")
        });
        const buyerBalanceIfTokenPurchased = buyerBalance.sub(ethers.utils.parseEther("0.1"));
        const currentBuyerBalance = await buyer.getBalance();

        expect(buyNFTPromise).to.eventually.be.rejectedWith('This token is not for sale');
        // At least the balance is greater after it's deducted with the gas fee
        expect(currentBuyerBalance.gt(buyerBalanceIfTokenPurchased)).to.be.true;
    });

    it('should not be able to buy NFT that price is wrong', async () => {
        const [, minter, buyer] = await ethers.getSigners();

        await contract.connect(minter).mintNFTs(2, {
            value: ethers.utils.parseEther("0.02")
        });

        await contract.connect(minter).setForSale(0, ethers.utils.parseEther("0.1"));
        const buyNFTPromise = contract.connect(buyer).buyNFT(1, {
            value: ethers.utils.parseEther("0.4")
        });

        expect(buyNFTPromise).to.eventually.be.rejectedWith('Incorrect amount');
    });
});