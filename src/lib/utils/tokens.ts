import { CHAIN_ID, FEATURE_FLAGS, USDC, USDT, DAI, WMAS, WETH, WETH_B } from './config';
import { Token } from './types';
import charlie from '../assets/img/charlie.png';
import Massa_Brand_Red from '../assets/img/Massa_Brand_Red.svg';
import Massa_Brand_White from '../assets/img/Massa_Brand_White.svg';
import { ChainId } from '@dusalabs/sdk';

const equals = WMAS.equals;

export const MASSA: Token = new Token(
	CHAIN_ID,
	WMAS.address + '_',
	WMAS.decimals,
	Massa_Brand_Red,
	'MAS',
	'Massa'
);

export const PUR: Token = new Token(
	CHAIN_ID,
	'AS133eqPPaPttJ6hJnk3sfoG5cjFFqBDi1VGxdo2wzWkq8AfZnan',
	18,
	charlie,
	'PUR',
	'Purrfect Universe'
);

export const tokens: Token[] = [
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	{
		...WMAS,
		logoURI: Massa_Brand_White,
		equals
	},
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	{
		...USDC,
		logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
		equals
	},
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	{
		...DAI,
		logoURI:
			'https://s3.coinmarketcap.com/static-gravity/image/47f58ac1aa854d448df91ea0e6fbfe6f.png',
		equals
	},
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	{
		...WETH,
		logoURI: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png?1595348880',
		equals
	},
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	{
		...WETH_B,
		logoURI: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png?1595348880',
		equals
	},
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	{
		...USDT,
		logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png',
		equals
	},
	MASSA
];
// eslint-enable @typescript-eslint/ban-ts-comment

const IS_BUILDNET = Number(CHAIN_ID) === Number(ChainId.BUILDNET);
!IS_BUILDNET && tokens.push(PUR);
