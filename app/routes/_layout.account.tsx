import type { LoaderArgs } from '@remix-run/node'

import { redirect } from '@remix-run/node'
import { authenticator } from '~/services/auth/config.server'

/**
 * Remix - Loader.
 */
export async function loader({ request }: LoaderArgs) {
	// Checks for Auth Session and redirect to dashboard
	await authenticator.isAuthenticated(request, {
		failureRedirect: '/login',
	})

	// Redirect to new dashboard
	return redirect('/dashboard')
}
