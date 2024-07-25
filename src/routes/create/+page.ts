import { FEATURE_FLAGS } from '$lib/utils/config';
import { error } from '@sveltejs/kit';
import type { RouteParams } from './$types';

export async function load({ params }: { params: RouteParams }) {
	if (!FEATURE_FLAGS.CREATE_TOKEN) throw error(404, 'route invalid');
}
