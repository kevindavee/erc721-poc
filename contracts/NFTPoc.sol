// SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "hardhat/console.sol";

contract NFTPoc is ERC721Enumerable, Ownable {
    using SafeMath for uint256;
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    event NFTPurchased(address _seller, address _buyer, uint256 _price);

    uint public constant MAX_SUPPLY=1000;
    uint public constant PRICE = 0.01 ether;
    uint public constant MAX_PER_MINT = 5;
    uint private constant FEE_IN_PERCENT = 5;

    string public baseTokenURI;

    mapping (uint => uint256) public tokenIdToPrice;

    constructor(string memory baseURI) ERC721("NFTPOC", "DNFT") {
        setBaseURI(baseURI);
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseTokenURI;
    }

    function setBaseURI(string memory _baseTokenURI) public onlyOwner {
        baseTokenURI = _baseTokenURI;
    }

    function tokenURI(uint256 _tokenId) public view virtual override returns (string memory) {
        require(_exists(_tokenId), "Token is not exist");

        string memory currentBaseURI = _baseURI();
        return bytes(currentBaseURI).length > 0 ? string(abi.encodePacked(currentBaseURI, Strings.toString(_tokenId), ".json")) : "";
    }

    function mintNFTs(uint _count) public payable {
        uint totalMinted = _tokenIds.current();
        require(
            totalMinted.add(_count) <= MAX_SUPPLY, "Not enough NFTs!"
        );
        require(
            _count > 0 && _count <= MAX_PER_MINT,
            "Cannot mint specified number of NFTs"
        );
        require(
            msg.value >= PRICE.mul(_count),
            "Not enough ether to purchase NFTs"
        );
        for (uint i = 0; i < _count; i++) {
            mintNFT();
        }
    }

    function mintNFT() private {
        uint newTokenID = _tokenIds.current();
        _safeMint(msg.sender, newTokenID);
        _tokenIds.increment();
    }

    function tokensOfOwner(address _owner) external view returns (uint[] memory) {
        uint tokenCount = balanceOf(_owner);
        uint[] memory tokensId = new uint256[](tokenCount);
        for (uint i = 0; i < tokenCount; i++) {
            tokensId[i] = tokenOfOwnerByIndex(_owner, i);
        }

        return tokensId;
    }

    function withdraw() public payable onlyOwner {
        uint balance = address(this).balance;
        require(balance > 0, "No ether left to withdraw");
        (bool success, ) = (msg.sender).call{value: balance}("");
        require(success, "Transfer failed");
    }

    function setForSale(uint _tokenId, uint256 _price) external {
        require(msg.sender == ownerOf(_tokenId), "Not owner of this token");
        require(_price > 0, "Price cannot be zero");
        tokenIdToPrice[_tokenId] = _price;
    }

    function tokenSalePrice(uint _tokenId) external view returns (uint256) {
        require(_exists(_tokenId), "Token is not exist");
        return tokenIdToPrice[_tokenId];
    }

    function disallowBuy(uint _tokenId) external {
        require(msg.sender == ownerOf(_tokenId), "Not owner of this token");
        tokenIdToPrice[_tokenId] = 0;
    }

    function buyNFT(uint _tokenId) external payable {
        uint256 price = tokenIdToPrice[_tokenId];
        require(price > 0, "This token is not for sale");
        require(msg.value == price, "Incorrect amount");

        address seller = ownerOf(_tokenId);
        _transfer(seller, msg.sender, _tokenId);
        tokenIdToPrice[_tokenId] = 0;

        uint256 payToSeller = msg.value / 100 * (100 - FEE_IN_PERCENT);

        payable(seller).transfer(payToSeller);

        emit NFTPurchased(seller, msg.sender, msg.value);
    }
}