import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { ethers, network } from "hardhat";
import { expandTo18Decimals, expandTo6Decimals } from "./utilities/utilities";
import { BigNumber } from "ethers";
import { expect } from "chai";
import chai from "chai";
import { sign } from "crypto";
import { Token1, Token1__factory } from "../typechain";
import { Vesting3 } from "../typechain/Vesting3";
import { Vesting3__factory } from "../typechain/factories/Vesting3__factory";

describe("Vesting",()=>{
    let owner : SignerWithAddress;
    let signers : SignerWithAddress[];
    let vesting :Vesting3;
    let token : Token1;

    beforeEach(async()=>{
         signers = await ethers.getSigners();
         owner = await signers[0];
         token = await new Token1__factory(owner).deploy("Token1","TKC1",100000);
         vesting = await new Vesting3__factory(owner).deploy(token.address,2629743);
         await vesting.connect(owner).addMutlipleUsers([signers[1].address,signers[2].address],[expandTo18Decimals(1000),expandTo18Decimals(1000)]);
         await network.provider.send("evm_increaseTime",[36816400]);
         await network.provider.send("evm_mine") // this one will have 02:00 PM as its timestamp
         await token.connect(owner).transfer(vesting.address,expandTo18Decimals(100000));
    })

    describe("Vesting TestCases",async()=>{
        it("add multiple users",async()=>{
            await vesting.connect(owner).addMutlipleUsers([signers[1].address,signers[2].address],[expandTo18Decimals(1000),expandTo18Decimals(1000)]);
            console.log("User info for first user  :"+ await vesting.userInfo(signers[1].address));    
        })

        it("Checking claimable amount",async()=>{
            console.log(await vesting.connect(owner).claimableAmount(signers[1].address));
            await network.provider.send("evm_increaseTime",[60]);
            await network.provider.send("evm_mine") // this one will have 02:00 PM as its timestamp
            console.log(await vesting.connect(owner).claimableAmount(signers[1].address));   
        })

        it.only("Claiming reward",async()=>{
            await vesting.connect(signers[1]).claim(signers[1].address);
            console.log("User info:    "+await vesting.userInfo(signers[1].address));
            await network.provider.send("evm_increaseTime",[262974]);
            await network.provider.send("evm_mine") // this one will have 02:00 PM as its timestamp
            await vesting.connect(signers[1]).claim(signers[1].address);
            console.log("User info after 60 secs:    "+await vesting.userInfo(signers[1].address));

        })
    })


})