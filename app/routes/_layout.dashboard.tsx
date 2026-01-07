import type { MetaFunction, LoaderArgs } from '@remix-run/node'
import type { AuthSession } from '~/services/auth/session.server'

import { json } from '@remix-run/node'
import { useLoaderData, Link } from '@remix-run/react'
import { authenticator } from '~/services/auth/config.server'
import { getBidRequestsByFarmerId, getAllOpenBidRequests } from '~/models/bidRequest.server'
import { getBidsByRetailerId } from '~/models/bid.server'
import { getProductRecommendationsByRetailerId } from '~/models/productRecommendation.server'

/**
 * Remix - Meta.
 */
export const meta: MetaFunction = () => {
	return {
		title: 'Farm Bidding Platform - Dashboard',
	}
}

/**
 * Remix - Loader.
 */
type LoaderData = {
	user: Awaited<AuthSession>
	bidRequests: Awaited<ReturnType<typeof getBidRequestsByFarmerId>> | Awaited<ReturnType<typeof getAllOpenBidRequests>>
	myBids?: Awaited<ReturnType<typeof getBidsByRetailerId>>
	myRecommendations?: Awaited<ReturnType<typeof getProductRecommendationsByRetailerId>>
}

export async function loader({ request }: LoaderArgs) {
	// Checks for Auth Session.
	const user = await authenticator.isAuthenticated(request, {
		failureRedirect: '/login',
	})

	// Load data based on user type
	if (user.userType === 'farmer') {
		const bidRequests = await getBidRequestsByFarmerId(user.id)
		return json<LoaderData>({
			user,
			bidRequests,
		})
	} else {
		// Retailer
		const bidRequests = await getAllOpenBidRequests()
		const myBids = await getBidsByRetailerId(user.id)
		const myRecommendations = await getProductRecommendationsByRetailerId(user.id)
		return json<LoaderData>({
			user,
			bidRequests,
			myBids,
			myRecommendations,
		})
	}
}

export default function DashboardRoute() {
	const { user, bidRequests, myBids, myRecommendations } = useLoaderData<typeof loader>()

	// Farmer Dashboard
	if (user.userType === 'farmer') {
		return (
			<div className="mx-auto w-full max-w-6xl p-6">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
						Farmer Dashboard
					</h1>
					<p className="mt-2 text-gray-600 dark:text-gray-400">
						Welcome back, {user.name}!
					</p>
				</div>

				{/* Quick Actions */}
				<div className="mb-8 flex gap-4">
					<Link
						to="/bid-requests/new"
						className="flex h-12 items-center justify-center rounded-xl bg-green-600 px-8 text-base
						font-bold text-white shadow-md transition hover:scale-105 active:scale-100">
						+ Create Bid Request
					</Link>
					<Link
						to="/recommendations"
						className="flex h-12 items-center justify-center rounded-xl bg-blue-600 px-8 text-base
						font-bold text-white shadow-md transition hover:scale-105 active:scale-100">
						View Product Recommendations
					</Link>
				</div>

				{/* Bid Requests List */}
				<div>
					<h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
						My Bid Requests
					</h2>

					{bidRequests.length === 0 ? (
						<div className="rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
							<p className="text-gray-500 dark:text-gray-400">
								No bid requests yet. Create your first one to get started!
							</p>
						</div>
					) : (
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							{bidRequests.map((bidRequest) => (
								<Link
									key={bidRequest.id}
									to={`/bid-requests/${bidRequest.id}`}
									className="rounded-xl border-2 border-gray-300 bg-white p-6 shadow-sm
									transition hover:scale-105 hover:shadow-md dark:bg-gray-800 dark:border-gray-700">
									<div className="mb-2 flex items-center justify-between">
										<h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
											{bidRequest.productName}
										</h3>
										<span
											className={`rounded-full px-3 py-1 text-xs font-bold ${
												bidRequest.status === 'open'
													? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
													: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
											}`}>
											{bidRequest.status}
										</span>
									</div>
									<p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
										{bidRequest.quantity} {bidRequest.unit}
									</p>
									<p className="mb-4 text-sm text-gray-500 dark:text-gray-500">
										{bidRequest.description}
									</p>
									<div className="flex items-center justify-between">
										<span className="text-sm font-semibold text-violet-600 dark:text-violet-400">
											{bidRequest.bids.length} {bidRequest.bids.length === 1 ? 'bid' : 'bids'}
										</span>
										<span className="text-xs text-gray-400">
											{new Date(bidRequest.createdAt).toLocaleDateString()}
										</span>
									</div>
								</Link>
							))}
						</div>
					)}
				</div>
			</div>
		)
	}

	// Retailer Dashboard
	return (
		<div className="mx-auto w-full max-w-6xl p-6">
			{/* Header */}
			<div className="mb-8">
				<h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
					Retailer Dashboard
				</h1>
				<p className="mt-2 text-gray-600 dark:text-gray-400">
					Welcome back, {user.name}!
				</p>
			</div>

			{/* Quick Actions */}
			<div className="mb-8 flex gap-4">
				<Link
					to="/recommendations/new"
					className="flex h-12 items-center justify-center rounded-xl bg-blue-600 px-8 text-base
					font-bold text-white shadow-md transition hover:scale-105 active:scale-100">
					+ Submit Product Recommendation
				</Link>
			</div>

			{/* Tabs for Retailer Content */}
			<div className="mb-8">
				<div className="border-b border-gray-300 dark:border-gray-700">
					<div className="flex gap-4">
						<button className="border-b-2 border-violet-600 px-4 py-2 font-semibold text-violet-600">
							Available Bid Requests
						</button>
					</div>
				</div>
			</div>

			{/* Available Bid Requests */}
			<div className="mb-12">
				{bidRequests.length === 0 ? (
					<div className="rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
						<p className="text-gray-500 dark:text-gray-400">
							No bid requests available at the moment.
						</p>
					</div>
				) : (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{bidRequests.map((bidRequest) => (
							<Link
								key={bidRequest.id}
								to={`/bid-requests/${bidRequest.id}`}
								className="rounded-xl border-2 border-gray-300 bg-white p-6 shadow-sm
								transition hover:scale-105 hover:shadow-md dark:bg-gray-800 dark:border-gray-700">
								<div className="mb-2">
									<h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
										{bidRequest.productName}
									</h3>
									<p className="text-sm text-gray-500 dark:text-gray-500">
										by {bidRequest.farmer.businessName}
									</p>
								</div>
								<p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
									{bidRequest.quantity} {bidRequest.unit}
								</p>
								<p className="mb-4 text-sm text-gray-500 dark:text-gray-500">
									{bidRequest.description}
								</p>
								<div className="flex items-center justify-between">
									<span className="text-sm font-semibold text-green-600 dark:text-green-400">
										{bidRequest.bids.length} {bidRequest.bids.length === 1 ? 'bid' : 'bids'} submitted
									</span>
									<span className="text-xs text-gray-400">
										{new Date(bidRequest.createdAt).toLocaleDateString()}
									</span>
								</div>
							</Link>
						))}
					</div>
				)}
			</div>

			{/* My Bids */}
			<div className="mb-12">
				<h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
					My Submitted Bids
				</h2>
				{myBids && myBids.length === 0 ? (
					<div className="rounded-xl border-2 border-dashed border-gray-300 p-8 text-center">
						<p className="text-gray-500 dark:text-gray-400">
							You haven't submitted any bids yet.
						</p>
					</div>
				) : (
					<div className="grid gap-4 md:grid-cols-2">
						{myBids?.map((bid) => (
							<div
								key={bid.id}
								className="rounded-xl border-2 border-gray-300 bg-white p-6 dark:bg-gray-800 dark:border-gray-700">
								<h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-gray-100">
									{bid.bidRequest.productName}
								</h3>
								<div className="mb-2 space-y-1">
									<p className="text-sm text-gray-600 dark:text-gray-400">
										<span className="font-semibold">Price:</span> ${bid.price.toFixed(2)}
									</p>
									<p className="text-sm text-gray-600 dark:text-gray-400">
										<span className="font-semibold">Delivery:</span> {bid.deliveryDate}
									</p>
									{bid.shippingCost && (
										<p className="text-sm text-gray-600 dark:text-gray-400">
											<span className="font-semibold">Shipping:</span> ${bid.shippingCost.toFixed(2)}
										</p>
									)}
								</div>
								<p className="text-xs text-gray-400">
									Submitted {new Date(bid.createdAt).toLocaleDateString()}
								</p>
							</div>
						))}
					</div>
				)}
			</div>

			{/* My Product Recommendations */}
			<div>
				<h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
					My Product Recommendations
				</h2>
				{myRecommendations && myRecommendations.length === 0 ? (
					<div className="rounded-xl border-2 border-dashed border-gray-300 p-8 text-center">
						<p className="text-gray-500 dark:text-gray-400">
							You haven't submitted any product recommendations yet.
						</p>
					</div>
				) : (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{myRecommendations?.map((rec) => (
							<div
								key={rec.id}
								className="rounded-xl border-2 border-gray-300 bg-white p-6 dark:bg-gray-800 dark:border-gray-700">
								<div className="mb-2 flex items-center justify-between">
									<span
										className={`rounded-full px-3 py-1 text-xs font-bold ${
											rec.productType === 'chemical'
												? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100'
												: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100'
										}`}>
										{rec.productType}
									</span>
								</div>
								<h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-gray-100">
									{rec.productName}
								</h3>
								<p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
									{rec.description}
								</p>
								<p className="mb-1 text-sm font-semibold text-green-600 dark:text-green-400">
									${rec.price.toFixed(2)} {rec.unit}
								</p>
								<p className="text-xs text-gray-400">
									{new Date(rec.createdAt).toLocaleDateString()}
								</p>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	)
}
