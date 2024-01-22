import { erc20Deployer, multisigDeployer } from '$lib/utils/config';
import { Token, parseUnits } from '@dusalabs/sdk';
import {
	Args,
	MassaUnits,
	type ICallData,
	ArrayTypes,
	type ISerializable,
	type IDeserializedResult
} from '@massalabs/massa-web3';

export const baseCallData: Pick<ICallData, 'fee' | 'coins' | 'maxGas'> = {
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
		functionName: 'increaseAllowance',
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
		functionName: 'mint',
		parameter: new Args().addString(recipientAddress).addU256(amount)
	};
};

export const buildBurn = (amount: bigint, tokenAddress: string): ICallData => {
	return {
		...baseCallData,
		targetAddress: tokenAddress,
		functionName: 'burn',
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
		functionName: 'decreaseAllowance',
		parameter: new Args().addString(spenderAddress).addU256(amount)
	};
};

// STAKING

export const buildDeposit = (depositAmount: bigint, stakingAddress: string): ICallData => {
	return {
		...baseCallData,
		targetAddress: stakingAddress,
		functionName: 'deposit',
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
		functionName: 'withdraw',
		parameter: new Args().addU256(amount)
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
	return {
		...baseCallData,
		targetAddress: erc20Deployer,
		functionName: 'deploy',
		parameter: new Args()
			.addString(name)
			.addString(symbol)
			.addU8(decimals)
			.addU256(supply)
			.addBool(mintable)
			.addBool(burnable),
		coins: 35n * MassaUnits.oneMassa
	};
};

export const buildDeployMultisig = (owners: string[], required: number): ICallData => {
	return {
		...baseCallData,
		targetAddress: multisigDeployer,
		functionName: 'deploy',
		parameter: new Args().addArray(owners, ArrayTypes.STRING).addI32(required),
		maxGas: 1_000_000_000n,
		coins: 35n * MassaUnits.oneMassa
	};
};

// SERIALIZABLE

export class Transaction implements ISerializable<Transaction> {
	constructor(
		public to: string = '',
		public method: string = '',
		public value: bigint = 0n,
		public data: Uint8Array = new Uint8Array(0),
		public executed: boolean = false
	) {}

	serialize(): Uint8Array {
		const args = new Args()
			.addString(this.to)
			.addString(this.method)
			.addU64(this.value)
			.addUint8Array(this.data)
			.addBool(this.executed);
		return Uint8Array.from(args.serialize());
	}

	deserialize(data: Uint8Array, offset: number): IDeserializedResult<Transaction> {
		const args = new Args(data, offset);
		this.to = args.nextString();
		this.method = args.nextString();
		this.value = args.nextU64();
		this.data = args.nextUint8Array();
		this.executed = args.nextBool();
		return {
			instance: this,
			offset: args.getOffset()
		};
	}
}
