export const ssr = false;

// @ts-ignore
BigInt.prototype.toJSON = function (): number {
	return Number(this);
};
