import { Token, parseUnits } from '@dusalabs/sdk';
import { Args, type ICallData } from '@massalabs/massa-web3';

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
