// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";

contract Vesting is Ownable{
    using SafeMath for uint256;

    struct User {
       uint total;
       uint claimed;
       uint time;
    }
    IERC20 Token;
    uint256 public totalAmount;
    uint256 public vestingTime;
    uint public count;
    uint startTime;
    
    
    mapping(address=>User) public userInfo;

    constructor(IERC20 _token,uint _time){
        Token = _token;
        vestingTime  = _time;
        startTime = block.timestamp;
    }

    function addUser(address _user, uint _amount) internal{
        User storage user = userInfo[_user];
         user.total = _amount;
         
    }

    function addMutlipleUsers(address[]memory _users, uint[] memory _amounts) public onlyOwner{
        require(_users.length == _amounts.length,"Mismathced length");
        for(uint i=0;i<_users.length;i++){
            addUser(_users[i],_amounts[i]);
            count++;
            totalAmount+=_amounts[i];
        }
    }

    function claimableAmount(address _user) public view returns(uint256){
        
         require(userInfo[_user].total>userInfo[_user].claimed,"You have claimed all your rewards");
        if(userInfo[_user].time==0){ uint timeLapsed = block.timestamp.sub(startTime);
         uint vestingFactor = timeLapsed.div(60);
         uint claimable = userInfo[_user].total.div(vestingTime).mul(vestingFactor);
         return claimable; }
         else{
             uint timeLapsed = block.timestamp.sub(userInfo[_user].time);
         uint vestingFactor = timeLapsed.div(60);
         uint claimable = userInfo[_user].total.div(vestingTime).mul(vestingFactor);
         return claimable; 
         }
               
    }

    function claim(address _user) public {
        require(block.timestamp>startTime+60,"Lockperiod is not over");
        require(userInfo[_user].claimed<userInfo[_user].total,"You have claimed all your rewards");
        uint amount = claimableAmount(_user); 
        userInfo[_user].time = block.timestamp;
        userInfo[_user].claimed += amount;
        console.log("Amount claimed in 60 secs:   ",amount);
        Token.transfer(_user,amount);
    }

    function adminRelease(address _user, uint _amount) public onlyOwner{
        userInfo[_user].claimed+=_amount;
        Token.transfer(_user,_amount);
    }

    function setVestingTime(uint _time) public onlyOwner {
        require(_time!=0,"Zero Time!!");
        vestingTime = _time;
    }

    function contractBalance() public view returns(uint){
        return Token.balanceOf(address(this));
    }

    function sync() public {
        totalAmount = Token.balanceOf(address(this));
    }

}