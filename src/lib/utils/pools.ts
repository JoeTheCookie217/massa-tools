import { ChainId } from '@dusalabs/sdk';
import { PUR, tokens } from './tokens';
import { Token } from './types';
import { CHAIN_ID } from './config';

const IS_BUILDNET = Number(CHAIN_ID) === Number(ChainId.BUILDNET);

export interface Pool {
	token0: Token;
	token1: Token;
	binStep: number;
}
export interface PoolWithAddress extends Pool {
	address: string;
}

export const pools: PoolWithAddress[] = [
	{
		//  WMAS - USDC
		token0: tokens[0],
		token1: tokens[1],
		binStep: 20,
		address: 'AS12Q5NyCQUtEBTnnqqBwcGyYb18szbbKv5GArcdk9tm2HitTupHw'
	},
	{
		// WETH - WMAS
		token0: tokens[3],
		token1: tokens[0],
		binStep: 15,
		address: 'AS1Ba1T2mMpHvLEhTvsNkSDqm4djno2ezVojGrtLf1wRd8ThfZD3'
	},
	{
		// DAI - USDC
		token0: tokens[2],
		token1: tokens[1],
		binStep: 1,
		address: 'AS12QDpZFi8szHCfyNsvB3JWT9dmHbvDx9uSjMLQ8rHVPN67rrG9n'
	},
	{
		// USDT - USDC
		token0: tokens[5],
		token1: tokens[1],
		binStep: 1,
		address: 'AS1F2SAbhvknGLQKzfjaizKiZhEEd6mS1HLpZqPc2atzKE4VTNv9'
	},
	{
		// WETH.b - WETH.e
		token0: tokens[4],
		token1: tokens[3],
		binStep: 1,
		address: 'AS1vQsWBLPdJFdAu75Cgh2eAqYp2rvcaurRjSfHjcfirxboLT3mG'
	}
];

!IS_BUILDNET &&
	pools.splice(3, 0, {
		token0: PUR,
		token1: tokens[0],
		binStep: 100,
		address: 'AS127CXxgeuu6A8UitxJwdnZ3SoXJFzTzEiKTZtaxzmEXXeoE1Wxc'
	});
