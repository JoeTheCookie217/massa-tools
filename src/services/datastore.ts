import { Args, bytesToU64 } from '@massalabs/massa-web3';
import { client as baseClient } from '../utils/client';

const maxGas = 100_000_000n;

export const fetchTokenBalance = (address: string, account: string): Promise<bigint> =>
	baseClient
		.smartContracts()
		.readSmartContract({
			targetAddress: address,
			targetFunction: 'balanceOf',
			parameter: new Args().addString(account).serialize(),
			maxGas
		})
		.then((e) => bytesToU64(e.returnValue))
		.catch(() => 0n);
