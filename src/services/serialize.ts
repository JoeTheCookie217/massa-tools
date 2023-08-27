import { Token, parseUnits } from '@dusalabs/sdk';
import { Args, MassaUnits, type ICallData } from '@massalabs/massa-web3';

const baseCallData: Pick<ICallData, 'fee' | 'coins' | 'maxGas'> = {
	coins: 0n,
	maxGas: 100_000_000n,
	fee: 0n
};

// TOKEN

export const buildTransfer = (amount: bigint, tokenAddress: string, to: string): ICallData => {
	return {
		...baseCallData,
		targetAddress: tokenAddress,
		functionName: 'transfer',
		parameter: new Args().addString(to).addU64(amount)
	};
};

export const buildIncreaseAllowance = (
	amount: bigint,
	tokenAddress: string,
	spenderAddress: string
): ICallData => {
	return {
		...baseCallData,
		targetAddress: tokenAddress,
		functionName: 'increaseAllowance',
		parameter: new Args().addString(spenderAddress).addU64(amount)
	};
};

export const buildMint = (
	amount: bigint,
	tokenAddress: string,
	recipientAddress: string
): ICallData => {
	return {
		...baseCallData,
		targetAddress: tokenAddress,
		functionName: 'mint',
		parameter: new Args().addString(recipientAddress).addU64(amount)
	};
};

export const buildBurn = (amount: bigint, tokenAddress: string): ICallData => {
	return {
		...baseCallData,
		targetAddress: tokenAddress,
		functionName: 'burn',
		parameter: new Args().addU64(amount)
	};
};

export const buildDecreaseAllowance = (
	amount: bigint,
	tokenAddress: string,
	spenderAddress: string
): ICallData => {
	return {
		...baseCallData,
		targetAddress: tokenAddress,
		functionName: 'decreaseAllowance',
		parameter: new Args().addString(spenderAddress).addU64(amount)
	};
};

// STAKING

export const buildDeposit = (
	depositAmount: number,
	depositToken: Token,
	stakingAddress: string
): ICallData => {
	const amount = parseUnits(depositAmount.toString(), depositToken.decimals);
	return {
		...baseCallData,
		targetAddress: stakingAddress,
		functionName: 'deposit',
		parameter: new Args().addU64(amount)
	};
};

export const buildWithdraw = (
	withdrawAmount: number,
	withdrawToken: Token,
	stakingAddress: string
): ICallData => {
	const amount = parseUnits(withdrawAmount.toString(), withdrawToken.decimals);
	return {
		...baseCallData,
		targetAddress: stakingAddress,
		functionName: 'withdraw',
		parameter: new Args().addU64(amount)
	};
};

export const buildHarvest = (stakingAddress: string): ICallData => {
	return {
		...baseCallData,
		targetAddress: stakingAddress,
		functionName: 'harvest',
		parameter: new Args()
	};
};

// DEPLOY

export const buildDeployToken = (
	name: string,
	symbol: string,
	decimals: number,
	supply: bigint,
	mintable: boolean,
	burnable: boolean
): ICallData => {
	const deployerAddress = 'AS12evPxJYGrKxymqjG1nXUHW6Vxwy95Sm2uTn9rY5UvwJ6hAoM4i';
	return {
		...baseCallData,
		targetAddress: deployerAddress,
		functionName: 'deploy',
		parameter: new Args()
			.addString(name)
			.addString(symbol)
			.addU8(decimals)
			.addU64(supply)
			.addBool(mintable)
			.addBool(burnable),
		coins: 35n * MassaUnits.oneMassa
	};
};
