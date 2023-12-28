import { Args } from '@massalabs/massa-web3';

export const decodeFeeParameters = (bs: Uint8Array) => {
	const args = new Args(bs);
	return {
		binStep: args.nextU32(),
		baseFactor: args.nextU32(),
		filterPeriod: args.nextU32(),
		decayPeriod: args.nextU32(),
		reductionFactor: args.nextU32(),
		variableFeeControl: args.nextU32(),
		protocolShare: args.nextU32(),
		maxVolatilityAccumulated: args.nextU32(),
		volatilityAccumulated: args.nextU32(),
		volatilityReference: args.nextU32(),
		indexRef: args.nextU32(),
		time: args.nextU64()
	};
};

export const decodePairInformation = (bs: Uint8Array) => {
	const args = new Args(bs);
	return {
		activeId: args.nextU32(),
		reserveX: args.nextU256(),
		reserveY: args.nextU256(),
		feesX: args.nextU256(),
		feesY: args.nextU256(),
		oracleSampleLifetime: args.nextU32(),
		oracleSize: args.nextU32(),
		oracleActiveSize: args.nextU32(),
		oracleLastTimestamp: args.nextU32(),
		oracleId: args.nextU32()
	};
};
