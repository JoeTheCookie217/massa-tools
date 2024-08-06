import { ERC20_DEPLOYER, MULTISIG_DEPLOYER } from '$lib/utils/config';
import { Token, parseUnits } from '@dusalabs/sdk';
import { Args, MassaUnits, type ICallData, ArrayTypes } from '@massalabs/massa-web3';

export const baseCallData: Pick<ICallData, 'fee' | 'coins' | 'maxGas'> = {
	coins: 0n,
	maxGas: 100_000_000n,
	fee: MassaUnits.oneMassa / 100n // 0.01 MAS
};

// TOKEN

export const buildTransfer = (amount: bigint, tokenAddress: string, to: string): ICallData => {
	return {
		...baseCallData,
		targetAddress: tokenAddress,
		targetFunction: 'transfer',
		parameter: new Args().addString(to).addU256(amount)
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
		targetFunction: 'increaseAllowance',
		parameter: new Args().addString(spenderAddress).addU256(amount)
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
		targetFunction: 'mint',
		parameter: new Args().addString(recipientAddress).addU256(amount)
	};
};

export const buildBurn = (amount: bigint, tokenAddress: string): ICallData => {
	return {
		...baseCallData,
		targetAddress: tokenAddress,
		targetFunction: 'burn',
		parameter: new Args().addU256(amount)
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
		targetFunction: 'decreaseAllowance',
		parameter: new Args().addString(spenderAddress).addU256(amount)
	};
};

// WMAS

export const buildWrap = (amount: bigint, wmasAddress: string): ICallData => {
	return {
		...baseCallData,
		targetAddress: wmasAddress,
		targetFunction: 'deposit',
		parameter: new Args(),
		coins: amount
	};
};

export const buildUnwrap = (amount: bigint, to: string, wmasAddress: string): ICallData => {
	return {
		...baseCallData,
		targetAddress: wmasAddress,
		targetFunction: 'withdraw',
		parameter: new Args().addU64(amount).addString(to)
	};
};

// STAKING

export const buildDeposit = (depositAmount: bigint, stakingAddress: string): ICallData => {
	return {
		...baseCallData,
		targetAddress: stakingAddress,
		targetFunction: 'deposit',
		parameter: new Args().addU256(depositAmount)
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
		targetFunction: 'withdraw',
		parameter: new Args().addU256(amount)
	};
};

export const buildHarvest = (stakingAddress: string): ICallData => {
	return {
		...baseCallData,
		targetAddress: stakingAddress,
		targetFunction: 'harvest',
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
	return {
		...baseCallData,
		targetAddress: ERC20_DEPLOYER,
		targetFunction: 'deploy',
		parameter: new Args()
			.addString(name)
			.addString(symbol)
			.addU8(decimals)
			.addU256(supply)
			.addBool(mintable)
			.addBool(burnable),
		maxGas: 1_000_000_000n,
		coins: 35n * MassaUnits.oneMassa
	};
};

export const buildDeployMultisig = (
	owners: string[],
	required: number,
	upgradeDelay: number,
	executionDelay: number
): ICallData => {
	return {
		...baseCallData,
		targetAddress: MULTISIG_DEPLOYER,
		targetFunction: 'deploy',
		parameter: new Args()
			.addArray(owners, ArrayTypes.STRING)
			.addI32(required)
			.addU64(BigInt(upgradeDelay))
			.addU64(BigInt(executionDelay)),
		maxGas: 1_000_000_000n,
		coins: 35n * MassaUnits.oneMassa
	};
};
