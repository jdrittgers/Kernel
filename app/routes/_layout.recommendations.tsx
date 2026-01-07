import type { MetaFunction, LoaderArgs } from '@remix-run/node'

import { json } from '@remix-run/node'
import { useLoaderData, Link } from '@remix-run/react'
import { authenticator } from '~/services/auth/config.server'
import { getAllProductRecommendations } from '~/models/productRecommendation.server'

/**
 * Remix - Meta.
 */
export const meta: MetaFunction = () => {
	return {
		title: 'Farm Bidding Platform - Product Recommendations',
	}
}

/**
 * Remix - Loader.
 */
type LoaderData = {
	recommendations: Awaited<ReturnType<typeof getAllProductRecommendations>>
}

export async function loader({ request }: LoaderArgs) {
	await authenticator.isAuthenticated(request, {
		failureRedirect: '/login',
	})

	const recommendations = await getAllProductRecommendations()

	return json<LoaderData>({
		recommendations,
	})
}

export default function RecommendationsRoute() {
	const { recommendations } = useLoaderData<typeof loader>()

	// Group recommendations by type
	const chemicals = recommendations.filter((r) => r.productType === 'chemical')
	const seeds = recommendations.filter((r) => r.productType === 'seed')

	return (
		<div className="mx-auto w-full max-w-6xl p-6">
			<div className="mb-8">
				<h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
					Product Recommendations
				</h1>
				<p className="mt-2 text-gray-600 dark:text-gray-400">
					Browse recommended products from retailers
				</p>
			</div>

			{/* Chemicals Section */}
			<div className="mb-12">
				<div className="mb-4 flex items-center justify-between">
					<h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
						Chemicals
					</h2>
					<span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-bold text-purple-800 dark:bg-purple-900 dark:text-purple-100">
						{chemicals.length} products
					</span>
				</div>

				{chemicals.length === 0 ? (
					<div className="rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
						<p className="text-gray-500 dark:text-gray-400">
							No chemical recommendations yet.
						</p>
					</div>
				) : (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{chemicals.map((rec) => (
							<div
								key={rec.id}
								className="rounded-xl border-2 border-gray-300 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
								<div className="mb-3">
									<h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
										{rec.productName}
									</h3>
									<p className="text-sm text-gray-500 dark:text-gray-400">
										by {rec.retailer.businessName}
									</p>
								</div>

								{rec.description && (
									<p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
										{rec.description}
									</p>
								)}

								<div className="mb-3">
									<p className="text-2xl font-bold text-green-600 dark:text-green-400">
										${rec.price.toFixed(2)}
									</p>
									<p className="text-sm text-gray-500">{rec.unit}</p>
								</div>

								{rec.deliveryDate && (
									<p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
										<span className="font-semibold">Available:</span> {rec.deliveryDate}
									</p>
								)}

								<div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
									<div>
										<p className="text-xs text-gray-500">Contact</p>
										<p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
											{rec.retailer.phone}
										</p>
									</div>
									<p className="text-xs text-gray-400">
										{new Date(rec.createdAt).toLocaleDateString()}
									</p>
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Seeds Section */}
			<div>
				<div className="mb-4 flex items-center justify-between">
					<h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
						Seeds
					</h2>
					<span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-800 dark:bg-amber-900 dark:text-amber-100">
						{seeds.length} products
					</span>
				</div>

				{seeds.length === 0 ? (
					<div className="rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
						<p className="text-gray-500 dark:text-gray-400">
							No seed recommendations yet.
						</p>
					</div>
				) : (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{seeds.map((rec) => (
							<div
								key={rec.id}
								className="rounded-xl border-2 border-gray-300 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
								<div className="mb-3">
									<h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
										{rec.productName}
									</h3>
									<p className="text-sm text-gray-500 dark:text-gray-400">
										by {rec.retailer.businessName}
									</p>
								</div>

								{rec.description && (
									<p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
										{rec.description}
									</p>
								)}

								<div className="mb-3">
									<p className="text-2xl font-bold text-green-600 dark:text-green-400">
										${rec.price.toFixed(2)}
									</p>
									<p className="text-sm text-gray-500">{rec.unit}</p>
								</div>

								{rec.deliveryDate && (
									<p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
										<span className="font-semibold">Available:</span> {rec.deliveryDate}
									</p>
								)}

								<div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
									<div>
										<p className="text-xs text-gray-500">Contact</p>
										<p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
											{rec.retailer.phone}
										</p>
									</div>
									<p className="text-xs text-gray-400">
										{new Date(rec.createdAt).toLocaleDateString()}
									</p>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	)
}
