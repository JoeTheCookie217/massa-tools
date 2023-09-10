const KEY = 'recent-multisigs';

const setRecentMultisigs = (addresses: string[]): void => {
	localStorage.setItem(KEY, JSON.stringify(addresses));
};

export const getRecentMultisigs = (): string[] => {
	const addresses = localStorage.getItem(KEY);
	if (!addresses) return [];
	return JSON.parse(addresses);
};

export const addRecentMultisig = (address: string): void => {
	const addresses = getRecentMultisigs();
	if (addresses.some((addr) => addr === address)) return;
	addresses.push(address);
	setRecentMultisigs(addresses);
};

export const removeRecentMultisig = (address: string): void => {
	const addresses = getRecentMultisigs();
	const index = addresses.findIndex((addr) => addr === address);
	if (index === -1) return;
	addresses.splice(index, 1);
	setRecentMultisigs(addresses);
};

export const clearRecentMultisigs = (): void => {
	localStorage.removeItem(KEY);
};
