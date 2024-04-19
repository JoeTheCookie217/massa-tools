import type { ChainId } from '@dusalabs/sdk';

const KEY = 'recent-addresses';

export type Address = {
	address: string;
	chainId: ChainId;
	label?: string;
	type: 'address' | 'token' | 'multisig';
};

const compareAddresses = (a: Address, b: Address): boolean =>
	a.address === b.address && a.chainId === b.chainId;
const setRecentAddresses = (addresses: Address[]): void => {
	localStorage.setItem(KEY, JSON.stringify(addresses));
};

export const getRecentAddresses = (): Address[] => {
	const addresses = localStorage.getItem(KEY);
	if (!addresses) return [];
	return JSON.parse(addresses);
};

export const addRecentAddress = (address: Address): void => {
	const addresses = getRecentAddresses();
	if (addresses.some((_address) => compareAddresses(_address, address))) return;
	addresses.push(address);
	setRecentAddresses(addresses);
};

export const removeRecentAddress = (address: Address): void => {
	const addresses = getRecentAddresses();
	const index = addresses.findIndex((_address) => compareAddresses(_address, address));
	if (index === -1) return;
	addresses.splice(index, 1);
	setRecentAddresses(addresses);
};

export const clearRecentAddresses = (): void => {
	localStorage.removeItem(KEY);
};
