// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RolexToken is ERC721URIStorage, Ownable {
    // =====================================
    // Initial Statements
    // =====================================

    constructor(string memory _name, string memory _symbol) 
        ERC721(_name, _symbol) {}
    
    
    // NFT token counter
    uint256 COUNTER;
    

    // Pricing of NFT Tokens (price of the rolex nft)
    uint256 public price = 5000 wei;
    uint256 levelUpPrice = 2500 wei;

    struct ProductData {
        uint256 id;
        bytes32 privateKey;
        uint256 numPedido;
        string descripcion;
        string modelo;
        uint256 numeroSerie;
        uint256 fechaVenta;
        string tokenUri;
    }

    // Storage structure for keeping artworks
    ProductData [] public product_works;

    // Declaration of new ProductNFT event
    event NewProductData (address indexed _owner, uint256 _id, string _modelo, uint256 _numSerie);

    modifier onlyContractApprovedOrNFTOwner(uint256 tokenId) {
        require(owner() == _msgSender() || ownerOf(tokenId) == _msgSender() || getApproved(tokenId) == msg.sender || isApprovedForAll(ownerOf(tokenId), msg.sender), "Ownable: caller is not the owner of token or contract");
        _;
    }

    function _isApprovedOwnerOrContracOwner(address spender, uint256 tokenId) internal view returns (bool) {
        require(_exists(tokenId), "ERC721: operator query for nonexistent token");
        address ownerNFT = ERC721.ownerOf(tokenId);
        return (spender == ownerNFT || getApproved(tokenId) == spender || isApprovedForAll(ownerNFT, spender) || owner() == spender);
    }

    function transferFrom(address from, address to, uint256 tokenId) public onlyContractApprovedOrNFTOwner(tokenId) override (ERC721, IERC721)  {
        require(_isApprovedOwnerOrContracOwner(_msgSender(), tokenId), "ERC721: transfer caller is not owner nor approved");
        _transfer(from, to, tokenId);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory _data
    ) public onlyContractApprovedOrNFTOwner(tokenId) override (ERC721, IERC721) {
        require(_isApprovedOwnerOrContracOwner(_msgSender(), tokenId), "ERC721: transfer caller is not owner nor approved");
        _safeTransfer(from, to, tokenId, _data);
    }

    function destroyCertificate(
        uint256 tokenId
    ) public onlyContractApprovedOrNFTOwner(tokenId) {
        require(_exists(tokenId), "Not existing Token");
        require(_isApprovedOwnerOrContracOwner(_msgSender(), tokenId), "ERC721: transfer caller is not owner nor approved");
        _burn(tokenId);
        
    }

    function approve(address to, uint256 tokenId) public onlyContractApprovedOrNFTOwner(tokenId) override (ERC721, IERC721) {
        address owner = ERC721.ownerOf(tokenId);
        require(_exists(tokenId), "Not existing Token");
        require(to != owner, "ERC721: approval to current owner");

        require(
           _isApprovedOwnerOrContracOwner(_msgSender(), tokenId), "ERC721: transfer caller is not owner,  contract ownernor approved");

        _approve(to, tokenId);
    }
    
      //Visualize the balance of the smart contract (ethers)
    function infoSmartContract() public view returns(address, address) {
        address SC_address = address(this);
        return (SC_address, owner());
    } 

     // Obtain all created NFT tokens (product data)
    function getAllProductData() public view onlyOwner returns(ProductData[] memory){
        return product_works;
    }

     // Obtainin a user's NFT tokens for admin use
    function getOwnerProductData(address _owner) public view onlyOwner returns (ProductData [] memory){
        ProductData[] memory result = new ProductData[](balanceOf(_owner));
        uint256 counter_owner = 0;
        for(uint256 i = 0; i< product_works.length; i++){
            if(_exists(i)){
                if(ownerOf(i) == _owner){
                result[counter_owner] = product_works[i];
                counter_owner++;
                }
            }
            
        }
        return result;
    }

     function getOwnerProductData() public view returns (ProductData [] memory){
        ProductData[] memory result = new ProductData[](balanceOf(msg.sender));
        uint256 counter_owner = 0;
        for(uint256 i = 0; i< product_works.length; i++) {
             if(_exists(i)){
                if(ownerOf(i) == msg.sender){
                result[counter_owner] = product_works[i];
                counter_owner++;
                }
            }
        }
        return result;
    }

    //Creates private key from given data using kekkak hash
    function createPrivateKey(
        string memory _nombre, 
        string memory _apellido1, 
        string memory _apellido2, 
        string memory _email,  
        uint256 _numeroSerie, 
        address _ownerAddress) public view onlyOwner returns(bytes32) {


        
        return sha256(abi.encodePacked(_nombre, _apellido1, _apellido2, _email, _numeroSerie, _ownerAddress));
    }

    function _createHash(
        bytes32 privateKey,
        uint256 _numPedido,
        string memory _descripcion
        ) private pure returns (bytes32) {

            
            return keccak256(abi.encodePacked(privateKey, _numPedido, _descripcion));

    }

    function checkUserDataForProductData(
        string memory _nombre, 
        string memory _apellido1, 
        string memory _apellido2, 
        string memory _email,
        uint256 _numPedido, 
        string memory _descripcion,
        uint256 _numeroSerie) external view returns (bool) {

        ProductData memory result;

        for(uint256 i = 0; i < product_works.length; i++){
            if(_exists(i)) {
                if(product_works[i].numeroSerie == _numeroSerie){
                    result = product_works[i];
                }
            }
        }

        bytes32 privateKey =sha256(abi.encodePacked(_nombre, _apellido1, _apellido2, _email, _numeroSerie, msg.sender)); 

        bytes32 finalKey = _createHash(privateKey, _numPedido, _descripcion);

        return finalKey == result.privateKey ;
    }

    // NFT token price Update
    function updatePrice(uint256 _price) external onlyOwner {
        price = _price;
    }

    
    function withdraw() external payable onlyOwner {
        address payable _owner = payable(owner());
        _owner.transfer(address(this).balance); 
    }
    
    function createProductDataAllFields(
        string memory _nombre, 
        string memory _apellido1, 
        string memory _apellido2, 
        string memory _email,  
        uint256 _numPedido,
        string memory _descripcion,
        string memory _modelo,
        uint256 _numeroSerie,
        address _ownerAddress,
        string memory imageURI,
        uint fechaVenta
        ) public payable onlyOwner {

        require(msg.sender == owner(), "Only owner wallet allowed to mint NFT certificates");
        bytes32 privateKey = createPrivateKey(_nombre, _apellido1, _apellido2, _email, _numeroSerie, _ownerAddress);
        _createProductData(privateKey, _numPedido, _descripcion, _modelo, _numeroSerie,  imageURI, fechaVenta);
        safeTransferFrom(ownerOf(COUNTER-1), _ownerAddress, COUNTER-1);
        approve(owner(), COUNTER-1);
        emit NewProductData(_ownerAddress, COUNTER-1, product_works[COUNTER - 1].modelo, product_works[COUNTER - 1].numeroSerie);
    }

   function createProductData(
        bytes32 _privateKey,
        uint256 _numPedido,
        string memory _descripcion,
        string memory _modelo,
        uint256 _numeroSerie,
        address userAddress,
        string memory imageURI,
        uint fechaVenta
        ) public payable onlyOwner {

        require(msg.sender == owner(), "Only owner wallet allowed to mint NFT certificates");
        _createProductData(_privateKey, _numPedido, _descripcion, _modelo, _numeroSerie,  imageURI, fechaVenta);
        safeTransferFrom(ownerOf(COUNTER-1), userAddress, COUNTER-1);
        approve(owner(), COUNTER-1);
        emit NewProductData(userAddress, COUNTER-1, product_works[COUNTER - 1].modelo, product_works[COUNTER - 1].numeroSerie);
    }
    
     //NFT Token Creation(ProductData)
    function _createProductData(
        bytes32 _privateKey,
        uint256 _numPedido,
        string memory _descripcion,
        string memory _model,
        uint256 _serialNumber,
        string memory imageURI,
        uint fechaVenta
        ) internal onlyOwner {

            bytes32 finalKey =  _createHash(_privateKey, _numPedido, _descripcion);

        ProductData memory newProductData = ProductData(COUNTER, finalKey, _numPedido, _descripcion, _model, _serialNumber, fechaVenta, imageURI);
        product_works.push(newProductData);
        _safeMint(msg.sender, COUNTER);
        _setTokenURI(COUNTER, imageURI);
        COUNTER++;
    }


     function _createProductHash(
        bytes32 privateKey,
        uint256 _numPedido,
        string memory _descripcion,
        uint256 _numeroSerie) private pure returns (bytes32) {
            
            return keccak256(abi.encodePacked(privateKey, _numPedido, _numeroSerie, _descripcion));

    }
}