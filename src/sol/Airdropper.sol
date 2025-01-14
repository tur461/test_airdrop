// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/*
    Error Codes:
        - E0: Airdrop: No recipients provided
        - E1: Airdrop: Amount must be greater than zero
        - E2: Airdrop: Insufficient allowance
*/

contract Airdropper is Ownable {
    IERC20 public token;

    event AirdropExecuted(address indexed sender, address[] recipients, uint256 amount);

    constructor(address tokenAddress) Ownable(msg.sender) {
        token = IERC20(tokenAddress);
    }

    function airdrop_multi(
        address[] calldata recipients, 
        uint256 amount
    ) external onlyOwner {
        require(recipients.length > 0, "E0");
        require(amount > 0, "E1");

        uint256 totalAmount = amount * recipients.length;

        uint256 allowance = token.allowance(owner(), address(this));
        require(allowance >= totalAmount, "E2");

        for (uint256 i = 0; i < recipients.length; i++) {
            token.transferFrom(owner(), recipients[i], amount);
        }

        emit AirdropExecuted(msg.sender, recipients, amount);
    }
}
