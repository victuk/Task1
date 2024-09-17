const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
// const { describe } = require("mocha");
const {ethers} = require("hardhat");

describe("Multisig", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.

  async function deployTokenContract() {
    const [owner] = await ethers.getSigners();
    const Erc20 = await ethers.getContractFactory("Web3CXI");
    const token = await Erc20.deploy();

    return {
      token
    }
  }

  async function deployMultisigContract() {

    const {token} = await loadFixture(deployTokenContract);

    const [contractDeployer, account1, account2, account3, account4, account5, account6] = await ethers.getSigners();
    const MultiSig = await ethers.getContractFactory("Multisig");
    const multiSig = await MultiSig.deploy(2, [account1, account2, account3, account4]);

    const amount = ethers.parseUnits("10000", 18);

    await token.transfer(multiSig, amount);

    console.log(await token.balanceOf(multiSig));

    return {
      token,
      multiSig,
      contractDeployer,
      account1,
      account2,
      account3,
      account4,
      account5,
      account6
    }
  }
  
  describe("Test to update quorum", () => {

    it("Create a new quarum proposal", async function() {
      const {multiSig} = await loadFixture(deployMultisigContract);
      await multiSig.updateQuorum(4);
      const tx = await multiSig.getQuorumTransaction(1);
      expect(tx.isCompleted).to.equal(false);
      expect(tx.transactionSigners.length).to.equal(1);
    });
  
    it("Approve quorum", async function() {
      const {multiSig,account1} = await loadFixture(deployMultisigContract);
  
      await multiSig.updateQuorum(4);

      await multiSig.connect(account1).approveQuorumChange(1);
  
      const tx = await multiSig.getQuorumTransaction(1);
  
      expect(tx.transactionSigners.length).to.equal(2);
  
    });

    it("More approvals to make the transaction request to be accpeted", async () => {

      const {multiSig, account1, account2} = await loadFixture(deployMultisigContract);
  
      await multiSig.updateQuorum(4);

      await multiSig.connect(account1).approveQuorumChange(1);
  
      
      const tx = await multiSig.getQuorumTransaction(1);
      
      expect(tx.isCompleted).to.equal(true);

      const newQuorumNumber = await multiSig.quorum();
      
      expect(newQuorumNumber).to.equal(4);
      
      

    });


    it("Should fail if you try to approve an already completed transaction", async () => {

      const {multiSig, account1, account2} = await loadFixture(deployMultisigContract);
  
      await multiSig.updateQuorum(4);

      await multiSig.connect(account1).approveQuorumChange(1);
  
      
      const tx = await multiSig.getQuorumTransaction(1);
      
      expect(tx.isCompleted).to.equal(true);
      
      expect(multiSig.connect(account2).approveQuorumChange(1)).to.be.revertedWith('transaction already completed');
      

    });

    it("Should fail if we try to get an invalid transaction ID", async () => {
      const {multiSig, account2} = await loadFixture(deployMultisigContract);
      await expect(multiSig.connect(account2).approveQuorumChange(20)).to.be.revertedWith("invalid tx id");
    });

    it("Should fail because the signer is not a valid signer", async () => {
      const {multiSig, account5} = await loadFixture(deployMultisigContract);
      await multiSig.updateQuorum(4);
      await expect(multiSig.connect(account5).approveQuorumChange(1)).to.be.revertedWith("not a valid signer");
    });

  });

  describe("Transfer", () => {
    it("Should be able to create the transfer", async () => {
      const {multiSig, contractDeployer, token} = await loadFixture(deployMultisigContract);
      await multiSig.transfer(1000, contractDeployer, token);
      const txCount = await multiSig.txCount();
      expect(txCount).to.equal(1);
    });
  });


});
