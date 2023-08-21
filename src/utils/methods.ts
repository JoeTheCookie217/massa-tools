export const printAddress = (address: string): string =>
	address.slice(0, 6) + '...' + address.slice(-4);
