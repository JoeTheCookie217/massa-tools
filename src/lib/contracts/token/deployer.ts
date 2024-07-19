import {
	Address,
	Context,
	balance,
	createSC,
	fileToByteArray,
	generateEvent,
	transferCoins
} from '@massalabs/massa-as-sdk';
import { IERC20 } from '../interfaces/IERC20';
import { Args, stringToBytes } from '@massalabs/as-types';

const ONE_MASSA: u64 = 1 * 10 ** 9;

export function deploy(bs: StaticArray<u8>): StaticArray<u8> {
	const balanceBefore = balance();
	const coins = Context.transferredCoins();
	const caller = Context.caller();

	const args = new Args(bs);
	const name = args.nextString().unwrap();
	const symbol = args.nextString().unwrap();
	const decimals = args.nextU8().unwrap();
	const totalSupply = args.nextU256().unwrap();
	const mintable = args.nextBool().unwrap();
	const burnable = args.nextBool().unwrap();

	const erc20Wasm: StaticArray<u8> = fileToByteArray('build/ERC20.wasm');
	const erc20MintableWasm: StaticArray<u8> = fileToByteArray('build/ERC20Mintable.wasm');
	const erc20BurnableWasm: StaticArray<u8> = fileToByteArray('build/ERC20Burnable.wasm');
	const erc20MintableBurnableWasm: StaticArray<u8> = fileToByteArray(
		'build/ERC20MintableBurnable.wasm'
	);

	const tokenWasm =
		mintable && burnable
			? erc20MintableBurnableWasm
			: mintable
			? erc20MintableWasm
			: burnable
			? erc20BurnableWasm
			: erc20Wasm;
	const token = new IERC20(createSC(tokenWasm));
	transferCoins(token._origin, ONE_MASSA);
	token.init(name, symbol, decimals, totalSupply);

	// transfer initial supply and ownership to the caller
	token.transfer(caller, totalSupply);
	token.transferOwnership(caller);

	const balanceAfter = balance();
	assert(
		coins >= balanceBefore - balanceAfter,
		[coins.toString(), balanceBefore.toString(), balanceAfter.toString()].join()
	);

	transferCoins(caller, coins - (balanceBefore - balanceAfter));

	generateEvent([token._origin.toString()].join(' '));
	return stringToBytes(token._origin.toString());
}
