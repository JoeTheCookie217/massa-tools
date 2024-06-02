import { baseCallData } from '$lib/services/serialize';
import { Args, MassaUnits, type ICallData, ArrayTypes } from '@massalabs/massa-web3';

export const buildReceive = (multisigAddress: string, value: bigint): ICallData => {
	return {
		...baseCallData,
		targetAddress: multisigAddress,
		targetFunction: 'receiveCoins',
		parameter: new Args(),
		coins: value
	};
};

export const buildSubmit = (
	multisigAddress: string,
	to: string,
	method: string,
	value: bigint,
	data: Uint8Array
): ICallData => {
	return {
		...baseCallData,
		targetAddress: multisigAddress,
		targetFunction: 'submit',
		parameter: new Args().addString(to).addString(method).addU64(value).addUint8Array(data)
	};
};

export const buildApprove = (multisigAddress: string, txId: number): ICallData => {
	return {
		...baseCallData,
		targetAddress: multisigAddress,
		targetFunction: 'approve',
		parameter: new Args().addU64(BigInt(txId))
	};
};

export const buildRevoke = (multisigAddress: string, txId: number): ICallData => {
	return {
		...baseCallData,
		targetAddress: multisigAddress,
		targetFunction: 'revoke',
		parameter: new Args().addU64(BigInt(txId))
	};
};

export const buildExecute = (multisigAddress: string, txId: number): ICallData => {
	return {
		...baseCallData,
		targetAddress: multisigAddress,
		targetFunction: 'execute',
		parameter: new Args().addU64(BigInt(txId))
	};
};
