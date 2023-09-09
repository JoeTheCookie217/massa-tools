import { baseCallData } from '$lib/services/serialize';
import { Token, parseUnits } from '@dusalabs/sdk';
import { Args, MassaUnits, type ICallData, ArrayTypes } from '@massalabs/massa-web3';

export const buildReceive = (multisigAddress: string, value: bigint): ICallData => {
	return {
		...baseCallData,
		targetAddress: multisigAddress,
		functionName: 'receive',
		parameter: new Args().addBool(false), // temp fix
		coins: value
	};
};

export const buildSubmit = (
	multisigAddress: string,
	to: string,
	value: bigint,
	data: Uint8Array
): ICallData => {
	return {
		...baseCallData,
		targetAddress: multisigAddress,
		functionName: 'submit',
		parameter: new Args().addString(to).addU64(value).addUint8Array(data)
	};
};

export const buildApprove = (multisigAddress: string, txId: number): ICallData => {
	return {
		...baseCallData,
		targetAddress: multisigAddress,
		functionName: 'approve',
		parameter: new Args().addU64(BigInt(txId))
	};
};

export const buildRevoke = (multisigAddress: string, txId: number): ICallData => {
	return {
		...baseCallData,
		targetAddress: multisigAddress,
		functionName: 'revoke',
		parameter: new Args().addU64(BigInt(txId))
	};
};

export const buildExecute = (multisigAddress: string, txId: number): ICallData => {
	return {
		...baseCallData,
		targetAddress: multisigAddress,
		functionName: 'execute',
		parameter: new Args().addU64(BigInt(txId))
	};
};
