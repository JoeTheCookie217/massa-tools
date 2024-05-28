import { ChainId } from '@dusalabs/sdk';

export const MULTISIG_DEPLOYER: { [chainId in ChainId]: string } = {
	[ChainId.MAINNET]: '',
	[ChainId.BUILDNET]: ''
};
export const ERC20_DEPLOYER: { [chainId in ChainId]: string } = {
	[ChainId.MAINNET]: '',
	[ChainId.BUILDNET]: ''
};

// max number of datastore entries to fetch in a single request
export const MAX_PER_REQUEST = 1000;
