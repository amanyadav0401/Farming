import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers, network } from "hardhat";
import { MasterChef,
         MasterChef__factory,
         PantherToken, 
         PantherToken__factory, 
         Token1, 
         Token1__factory } from "../typechain"
import { BigNumber } from "ethers";
import { expandTo18Decimals, expandTo6Decimals } from "./utilities/utilities";
import chai from "chai";
import { expect } from "chai";
chai.use(require("chai-bignumber")(BigNumber));
import { sign } from "crypto";



describe("Masterchef",()=>{
    let owner: SignerWithAddress;
    let signers : SignerWithAddress[];
    let panther : PantherToken;
    let masterchef : MasterChef;
    let token : Token1;

    beforeEach(async()=>{
        signers = await ethers.getSigners();
        owner = await signers[0];
        panther = await new PantherToken__factory(owner).deploy();
        token = await new Token1__factory(owner).deploy("Token1","TKC1",expandTo18Decimals(100000));
        masterchef = await new MasterChef__factory(owner).deploy(panther.address,1,expandTo18Decimals(100));
    })

    describe("Masterchef Test Cases",async()=>{
              
        it("addPool", async()=>{
            await masterchef.connect(owner).add(
                100,
                token.address,
                3,
                3600,
                true
            ); 
            let poollength = await masterchef.poolLength();
            expect(poollength).to.be.eq(1);
            console.log("Pool successfully added, number of pools now: "+poollength);    
        })
    
        it("Deposit",async()=>{
            await masterchef.connect(owner).add(
                100,
                token.address,
                3,
                3600,
                true
            ); 
            await token.connect(owner).transfer(signers[1].address,expandTo18Decimals(1000));
            await token.connect(signers[1]).approve(masterchef.address,expandTo18Decimals(1000));
            await masterchef.connect(signers[1]).deposit(0,expandTo18Decimals(100),token.address); 
        })

        it("Deposit 2nd time and generating Panther token",async()=>{
            await masterchef.connect(owner).add(
                1000,
                token.address,
                3,
                10,
                true
            ); 
            await token.connect(owner).transfer(signers[1].address,expandTo18Decimals(1000));
            let zeroAdd = "0x0000000000000000000000000000000000000000";

            await token.connect(signers[1]).approve(masterchef.address,expandTo18Decimals(1000));
            await masterchef.connect(signers[1]).deposit(0,expandTo18Decimals(100),zeroAdd); 
            await panther.connect(owner).transferOwnership(masterchef.address);
            // await ethers.provider.send("evm_increaseTime", [10]);
            // await network.provider.send("evm_increaseTime", [10]);
            // await network.provider.send("evm_mine");
            let _date = new Date()
            let time = (_date.getTime()/1000);
            await ethers.provider.send("evm_mine", [time + 10]);
            await masterchef.connect(signers[1]).deposit(0,expandTo18Decimals(100),zeroAdd);
            // await masterchef.connect(signers[1]).deposit(0,0,zeroAdd);
            let pantherSupply = await panther.totalSupply();
            console.log("Panther supply: "+ pantherSupply);
            console.log("Panther balance for user: "+await panther.balanceOf(signers[1].address));
            // expect(pantherBalance).to.be.greaterThan(0);
            // console.log("Panther Balance:  ",await panther.balanceOf(masterchef.address));

         
        })
    
    })

    
})