const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const {ethers} = require("hardhat");

describe("Multisig", async function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.

  async function deployERCCOntract() {
    const [owner] = await ethers.getSigners();
    const Erc20 = await ethers.getContractFactory("Web3CXI");
    const erc20 = await Erc20.deploy();

    return {
      erc20,
      owner
    }
  }

  async function deployMultisigContract() {

    const [contractDeployer, account1, account2, account3, account4, account5, account6] = await ethers.getSigners();
    const Multisig = await ethers.getContractFactory("Multisig");
    const multisig = await Multisig.deploy(2, [account1, account2, account3, account4, account5, account6]);

    return {
      multisig,
      contractDeployer,
      account1,
      account2,
      account3,
      account4,
      account5,
      account6
    }
  }
  

  it("Check if the first test works", async function() {
    const {multisig} = await loadFixture(deployMultisigContract);
    await multisig.updateQuorum(4);
    const tx = await multisig.getQuantumTransaction(1);
    expect(tx.isCompleted).to.equal(false);
  });



});
