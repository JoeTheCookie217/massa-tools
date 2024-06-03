import { ChainId } from '@dusalabs/sdk';
import { CHAIN_ID as MassaChainId } from '@massalabs/massa-web3';

export const MULTISIG_DEPLOYER: { [chainId in ChainId]: string } = {
	[ChainId.MAINNET]: '',
	[ChainId.BUILDNET]: ''
};
export const ERC20_DEPLOYER: { [chainId in ChainId]: string } = {
	[ChainId.MAINNET]: '',
	[ChainId.BUILDNET]: ''
};

if (!import.meta.env.VITE_CHAIN_ID || !import.meta.env.VITE_CHAIN_URL)
	throw new Error('Missing chain configuration');
export const CHAIN_ID = import.meta.env.VITE_CHAIN_ID as any as ChainId;
export const CHAIN_URL = import.meta.env.VITE_CHAIN_URL as string;
export const CHAIN_NAME = Number(CHAIN_ID) === Number(ChainId.BUILDNET) ? 'buildnet' : 'mainnet';
export const MASSA_CHAIN_ID =
	Number(CHAIN_ID) === Number(ChainId.BUILDNET) ? MassaChainId.BuildNet : MassaChainId.MainNet;

// max number of datastore entries to fetch in a single request
export const MAX_PER_REQUEST = 1000;

export const FEATURE_FLAGS = {
	CREATE_TOKEN: false,
	CREATE_MULTISIG: false
};
