import { bytesToU256, bytesToU64 } from '@massalabs/massa-web3';

export const printAddress = (address: string): string =>
	address.slice(0, 6) + '...' + address.slice(-4);

export const bytesToNumber = (bytes: Uint8Array): bigint => {
	try {
		return bytesToU256(bytes);
	} catch (e) {
		try {
			return bytesToU64(bytes);
		} catch (e) {
			return 0n;
		}
	}
};
