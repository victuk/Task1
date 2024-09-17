// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.17;
import "./UniswapV2Interface.sol";
import "./ERC20Interface.sol";

contract UseSwap {

    address public uniswapRouter;
    address public owner;
    uint public swapCount;
    uint public swapCoun2;

    constructor(address _uniswapRouter) {
        uniswapRouter = _uniswapRouter;
        owner = msg.sender;
    }

    function mySwapExactTokensForETH(
        uint amountOut,
        uint amountInMax,
        address[] calldata path,
        address to,
        uint deadline
    ) external {

        IERC20(path[0]).transferFrom(msg.sender, address(this), amountInMax);

  
        IERC20(path[0]).approve(address(uniswapRouter), amountInMax);

        IUniswapV2Router(uniswapRouter).swapTokensForExactETH(
            amountOut,
            amountInMax,
            path,
            address(this),
            deadline
        );

        swapCount += 1;
    }


    function swapExactETHForTokens(
        uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline
    ) external {

        IUniswapV2Router(uniswapRouter).swapExactETHForTokens{
            value: msg.value
        }(
            amountOutMin,
            path,
            to,
            

        swapCount2 += 1;
    }

    receive() external payable {}
}