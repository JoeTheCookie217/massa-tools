import {
	ChainId,
	WMAS as _WMAS,
	USDC as _USDC,
	USDT as _USDT,
	DAI as _DAI,
	WETH as _WETH,
	WETH_B as _WETH_B,
	Token
} from '@dusalabs/sdk';
import { CHAIN_ID as MassaChainId } from '@massalabs/massa-web3';

const _MULTISIG_DEPLOYER: { [chainId in ChainId]: string } = {
	[ChainId.MAINNET]: '',
	[ChainId.BUILDNET]: 'AS12W4sj9ES8XAj426x3ugCyoT2QxDncBDJiADZoFnWuM34Wwh9YF'
};
const _ERC20_DEPLOYER: { [chainId in ChainId]: string } = {
	[ChainId.MAINNET]: '',
	[ChainId.BUILDNET]: 'AS1guX4XxHYaSWgykPYA7hB6CTYhXc4EfhE51ooXojF5UUnzjN6H'
};

if (!import.meta.env.VITE_CHAIN_ID || !import.meta.env.VITE_CHAIN_URL)
	throw new Error('Missing chain configuration');
export const CHAIN_ID = import.meta.env.VITE_CHAIN_ID as any as ChainId;
export const CHAIN_URL = import.meta.env.VITE_CHAIN_URL as string;
export const CHAIN_NAME = Number(CHAIN_ID) === Number(ChainId.BUILDNET) ? 'buildnet' : 'mainnet';
export const OTHER_CHAIN_NAME =
	Number(CHAIN_ID) === Number(ChainId.BUILDNET) ? 'mainnet' : 'buildnet';
export const OTHER_CHAIN_DOMAIN =
	'https://' +
	(Number(CHAIN_ID) === Number(ChainId.BUILDNET)
		? 'massa-tools.vercel.app'
		: 'massa-tools-buildnet.vercel.app');
export const MASSA_CHAIN_ID =
	Number(CHAIN_ID) === Number(ChainId.BUILDNET) ? MassaChainId.BuildNet : MassaChainId.MainNet;

// max number of datastore entries to fetch in a single request
export const MAX_PER_REQUEST = 1000;

export const FEATURE_FLAGS = {
	CREATE_TOKEN: false,
	CREATE_MULTISIG: false
};

const purDecimals = 18;
const purSymbol = 'PUR';
const purName = 'Purrfect Universe';
const _PUR: typeof _WMAS = {
	[ChainId.BUILDNET]: new Token(
		ChainId.BUILDNET,
		'AS12EWaHZ3AhJvPUBE74BM1x1NJAFdkM6Ryu12AqxyXNvrk64vgPQ',
		purDecimals,
		purSymbol,
		purName
	),
	[ChainId.MAINNET]: new Token(
		ChainId.MAINNET,
		'AS133eqPPaPttJ6hJnk3sfoG5cjFFqBDi1VGxdo2wzWkq8AfZnan',
		purDecimals,
		purSymbol,
		purName
	)
};

export const WMAS = _WMAS[CHAIN_ID];
export const USDC = _USDC[CHAIN_ID];
export const DAI = _DAI[CHAIN_ID];
export const WETH = _WETH[CHAIN_ID];
export const WETH_B = _WETH_B[CHAIN_ID];
export const USDT = _USDT[CHAIN_ID];
export const PUR = _PUR[CHAIN_ID];

export const MULTISIG_DEPLOYER = _MULTISIG_DEPLOYER[CHAIN_ID];
export const ERC20_DEPLOYER = _ERC20_DEPLOYER[CHAIN_ID];
