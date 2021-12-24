const chaiAsPromised = require('chai-as-promised');
const chai = require('chai');
const { ethers } = require('hardhat');
const { deploy } = require('./utils');

chai.use(chaiAsPromised);
const { expect } = chai;

describe('Withdraw', () => {
    let contract;
    beforeEach(async () => {
        contract = await deploy();
    });

    it('should successfully withdraw balance', async () => {
        const [owner, buyer1] = await ethers.getSigners();
        const currentBalance = await owner.getBalance();

        await contract.connect(buyer1).mintNFTs(2, {
            value: ethers.utils.parseEther("0.02"),
        });

        await contract.connect(owner).withdraw();

        const balanceAfterWithdraw = await owner.getBalance();
        const contractBalance = await contract.provider.getBalance(contract.address);

        expect(currentBalance.eq(balanceAfterWithdraw)).to.be.false;
        expect(contractBalance.toNumber()).to.equal(0);
    });

    it('should not be able to withdraw balance if balance is 0', async () => {
        const [owner] = await ethers.getSigners();
        
        const withdrawPromise = contract.connect(owner).withdraw();
        expect(withdrawPromise).to.eventually.be.rejectedWith('No ether left to withdraw');
        
    });
});