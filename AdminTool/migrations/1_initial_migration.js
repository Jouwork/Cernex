const rolexToken = artifacts.require("RolexToken");

module.exports = function (deployer, network, accounts) {
    
    deployer.deploy(rolexToken, "Cernex-Rolex", "Cernex--Rolex");
}
