const chaiAsPromised = require('chai-as-promised');
const chai = require('chai');
const { ethers } = require('hardhat');
const { deploy } = require('./utils');

chai.use(chaiAsPromised);
const { expect } = chai;

describe('Mint NFT', () => {
    let contract;
    beforeEach(async () => {
        contract = await deploy();
    });

    it('should successfully mint an NFT', async () => {
        const [, buyer1] = await ethers.getSigners();

        await contract.connect(buyer1).mintNFTs(2, {
            value: ethers.utils.parseEther("0.02")
        });

        const tokensOfOwner = await contract.tokensOfOwner(buyer1.address);
        expect(tokensOfOwner.map(to => to.toNumber())).to.deep.equal([0, 1]);
    });

    it('should not be able to mint NFT more than MAX_PER_MINT', async () => {
        const [, buyer1] = await ethers.getSigners();

        const mintNFTPromise = contract.connect(buyer1).mintNFTs(6, {
            value: ethers.utils.parseEther("0.06")
        });

        expect(mintNFTPromise).to.eventually.be.rejectedWith('Cannot mint specified number of NFTs');
    });

    it('should not be able to mint more than supply', async () => {
        const [, buyer1, buyer2, buyer3, buyer4, buyer5] = await ethers.getSigners();

        for (let i = 0; i < 1000; i+=25) {
            await Promise.all([
                contract.connect(buyer1).mintNFTs(5, {
                    value: ethers.utils.parseEther("0.05")
                }),
                contract.connect(buyer2).mintNFTs(5, {
                    value: ethers.utils.parseEther("0.05")
                }),
                contract.connect(buyer3).mintNFTs(5, {
                    value: ethers.utils.parseEther("0.05")
                }),
                contract.connect(buyer4).mintNFTs(5, {
                    value: ethers.utils.parseEther("0.05")
                }),
                contract.connect(buyer5).mintNFTs(5, {
                    value: ethers.utils.parseEther("0.05")
                }),
            ]);
        }

        const mintNFTPromise = contract.connect(buyer1).mintNFTs(1, {
            value: ethers.utils.parseEther("0.01")
        });

        expect(mintNFTPromise).to.eventually.be.rejectedWith('Not enough NFTs!');
    });

    it('should not be able to mintNFT if there is not enough ether', async () => {
        const [, buyer1] = await ethers.getSigners();

        const mintNFTPromise = contract.connect(buyer1).mintNFTs(1, {
            value: ethers.utils.parseEther("0.005")
        });

        expect(mintNFTPromise).to.eventually.be.rejectedWith('Not enough ether to purchase NFTs');
    });
});