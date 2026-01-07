import type { MetaFunction, ActionArgs, LoaderArgs } from '@remix-run/node'

import { json, redirect } from '@remix-run/node'
import { Form, useLoaderData, useActionData } from '@remix-run/react'
import { authenticator } from '~/services/auth/config.server'
import { getBidRequestById, updateBidRequestStatus } from '~/models/bidRequest.server'
import { createBid } from '~/models/bid.server'

import { z } from 'zod'
import { formatError, validate } from '@conform-to/zod'
import {
	conform,
	parse,
	useFieldset,
	useForm,
	hasError,
} from '@conform-to/react'

/**
 * Zod - Schema for Bid Submission.
 */
const BidSubmissionSchema = z.object({
	price: z.string().min(1, 'Price is required.').transform(Number),
	deliveryDate: z.string().min(1, 'Delivery date is required.'),
	shippingCost: z.string().optional().transform((val) => val ? Number(val) : undefined),
	notes: z.string().optional(),
})

/**
 * Remix - Meta.
 */
export const meta: MetaFunction = () => {
	return {
		title: 'Farm Bidding Platform - Bid Request Details',
	}
}

/**
 * Remix - Loader.
 */
type LoaderData = {
	bidRequest: NonNullable<Awaited<ReturnType<typeof getBidRequestById>>>
	user: Awaited<ReturnType<typeof authenticator.isAuthenticated>>
}

export async function loader({ request, params }: LoaderArgs) {
	const user = await authenticator.isAuthenticated(request, {
		failureRedirect: '/login',
	})

	const bidRequestId = params.id
	if (!bidRequestId) {
		throw new Response('Bid Request ID is required', { status: 400 })
	}

	const bidRequest = await getBidRequestById(bidRequestId)
	if (!bidRequest) {
		throw new Response('Bid Request not found', { status: 404 })
	}

	return json<LoaderData>({
		bidRequest,
		user,
	})
}

/**
 * Remix - Action.
 */
export async function action({ request, params }: ActionArgs) {
	const user = await authenticator.isAuthenticated(request, {
		failureRedirect: '/login',
	})

	const bidRequestId = params.id
	if (!bidRequestId) {
		throw new Response('Bid Request ID is required', { status: 400 })
	}

	const formData = await request.formData()
	const action = formData.get('_action')

	// Handle closing bid request (farmers only)
	if (action === 'close_request') {
		const bidRequest = await getBidRequestById(bidRequestId)
		if (bidRequest?.farmerId !== user.id) {
			throw new Response('Unauthorized', { status: 403 })
		}
		await updateBidRequestStatus({ id: bidRequestId, status: 'closed' })
		return redirect(`/bid-requests/${bidRequestId}`)
	}

	// Handle bid submission (retailers only)
	if (user.userType !== 'retailer') {
		throw new Response('Only retailers can submit bids', { status: 403 })
	}

	const submission = parse<z.infer<typeof BidSubmissionSchema>>(formData)

	try {
		switch (submission.type) {
			case 'validate':
			case 'submit': {
				const { price, deliveryDate, shippingCost, notes } =
					BidSubmissionSchema.parse(submission.value)

				if (submission.type === 'submit') {
					await createBid({
						price,
						deliveryDate,
						shippingCost,
						notes,
						bidRequestId,
						retailerId: user.id,
					})

					return redirect(`/bid-requests/${bidRequestId}`)
				}
			}
		}
	} catch (error) {
		submission.error.push(...formatError(error))
	}

	return json(submission)
}

export default function BidRequestDetailRoute() {
	const { bidRequest, user } = useLoaderData<typeof loader>()
	const state = useActionData<typeof action>()

	const form = useForm<z.infer<typeof BidSubmissionSchema>>({
		mode: 'server-validation',
		initialReport: 'onBlur',
		state,
		onValidate({ formData }) {
			return validate(formData, BidSubmissionSchema)
		},
		onSubmit(event, { submission }) {
			if (submission.type === 'validate' && hasError(submission.error)) {
				event.preventDefault()
			}
		},
	})

	const { price, deliveryDate, shippingCost, notes } = useFieldset(
		form.ref,
		form.config,
	)

	const isFarmer = user?.userType === 'farmer'
	const isOwner = user?.id === bidRequest.farmer.id

	return (
		<div className="mx-auto w-full max-w-6xl p-6">
			{/* Header */}
			<div className="mb-8">
				<div className="flex items-start justify-between">
					<div>
						<h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
							{bidRequest.productName}
						</h1>
						<p className="mt-2 text-gray-600 dark:text-gray-400">
							Posted by {bidRequest.farmer.businessName} • {new Date(bidRequest.createdAt).toLocaleDateString()}
						</p>
					</div>
					<span
						className={`rounded-full px-4 py-2 text-sm font-bold ${
							bidRequest.status === 'open'
								? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
								: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
						}`}>
						{bidRequest.status}
					</span>
				</div>
			</div>

			<div className="grid gap-6 lg:grid-cols-3">
				{/* Left Column - Bid Request Details */}
				<div className="lg:col-span-2">
					{/* Request Details Card */}
					<div className="mb-6 rounded-xl border-2 border-gray-300 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
						<h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
							Request Details
						</h2>
						<div className="space-y-3">
							<div>
								<span className="font-semibold text-gray-700 dark:text-gray-300">Quantity:</span>
								<span className="ml-2 text-gray-900 dark:text-gray-100">
									{bidRequest.quantity} {bidRequest.unit}
								</span>
							</div>
							{bidRequest.description && (
								<div>
									<span className="font-semibold text-gray-700 dark:text-gray-300">Description:</span>
									<p className="mt-1 text-gray-900 dark:text-gray-100">
										{bidRequest.description}
									</p>
								</div>
							)}
						</div>

						{/* Close Request Button (for farmers only) */}
						{isOwner && bidRequest.status === 'open' && (
							<Form method="post" className="mt-6">
								<button
									name="_action"
									value="close_request"
									className="flex h-10 items-center rounded-xl bg-red-500 px-6 font-bold text-white transition hover:scale-105">
									Close Bid Request
								</button>
							</Form>
						)}
					</div>

					{/* Bids List */}
					<div className="rounded-xl border-2 border-gray-300 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
						<h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
							Submitted Bids ({bidRequest.bids.length})
						</h2>

						{bidRequest.bids.length === 0 ? (
							<p className="text-center text-gray-500 dark:text-gray-400">
								No bids submitted yet.
							</p>
						) : (
							<div className="space-y-4">
								{bidRequest.bids.map((bid) => (
									<div
										key={bid.id}
										className="rounded-lg border border-gray-300 p-4 dark:border-gray-600">
										<div className="flex items-start justify-between">
											<div>
												<h3 className="font-bold text-gray-900 dark:text-gray-100">
													{bid.retailer.businessName}
												</h3>
												<p className="text-sm text-gray-500 dark:text-gray-400">
													{bid.retailer.location}
												</p>
											</div>
											<div className="text-right">
												<p className="text-2xl font-bold text-green-600 dark:text-green-400">
													${bid.price.toFixed(2)}
												</p>
												<p className="text-xs text-gray-500">total price</p>
											</div>
										</div>
										<div className="mt-3 space-y-1 text-sm">
											<p className="text-gray-700 dark:text-gray-300">
												<span className="font-semibold">Delivery:</span> {bid.deliveryDate}
											</p>
											{bid.shippingCost !== null && (
												<p className="text-gray-700 dark:text-gray-300">
													<span className="font-semibold">Shipping:</span> ${bid.shippingCost.toFixed(2)}
												</p>
											)}
											{bid.notes && (
												<p className="text-gray-700 dark:text-gray-300">
													<span className="font-semibold">Notes:</span> {bid.notes}
												</p>
											)}
										</div>
										<p className="mt-2 text-xs text-gray-400">
											Submitted {new Date(bid.createdAt).toLocaleDateString()}
										</p>
									</div>
								))}
							</div>
						)}
					</div>
				</div>

				{/* Right Column - Bid Submission Form (for retailers) */}
				{!isFarmer && bidRequest.status === 'open' && (
					<div className="lg:col-span-1">
						<div className="sticky top-6 rounded-xl border-2 border-gray-300 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
							<h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100">
								Submit Your Bid
							</h2>

							<Form method="post" {...form.props}>
								<fieldset className="space-y-4">
									{form.error && (
										<div className="rounded-lg bg-red-500 p-3 text-sm font-bold text-white">
											{form.error}
										</div>
									)}

									{/* Price */}
									<label className="block font-semibold text-gray-800 dark:text-gray-100">
										<div className="mb-1">Total Price ($)</div>
										<input
											{...conform.input(price.config)}
											type="number"
											step="0.01"
											placeholder="0.00"
											className="flex h-12 w-full rounded-xl border-2 border-gray-500 bg-transparent px-4 text-base font-semibold text-black transition dark:text-white"
										/>
										<div className="text-violet-500">{price.error}</div>
									</label>

									{/* Delivery Date */}
									<label className="block font-semibold text-gray-800 dark:text-gray-100">
										<div className="mb-1">Delivery Date</div>
										<input
											{...conform.input(deliveryDate.config)}
											type="date"
											className="flex h-12 w-full rounded-xl border-2 border-gray-500 bg-transparent px-4 text-base font-semibold text-black transition dark:text-white"
										/>
										<div className="text-violet-500">{deliveryDate.error}</div>
									</label>

									{/* Shipping Cost */}
									<label className="block font-semibold text-gray-800 dark:text-gray-100">
										<div className="mb-1">Shipping Cost (Optional)</div>
										<input
											{...conform.input(shippingCost.config)}
											type="number"
											step="0.01"
											placeholder="0.00"
											className="flex h-12 w-full rounded-xl border-2 border-gray-500 bg-transparent px-4 text-base font-semibold text-black transition dark:text-white"
										/>
										<div className="text-violet-500">{shippingCost.error}</div>
									</label>

									{/* Notes */}
									<label className="block font-semibold text-gray-800 dark:text-gray-100">
										<div className="mb-1">Notes (Optional)</div>
										<textarea
											{...conform.textarea(notes.config)}
											rows={3}
											placeholder="Additional details..."
											className="flex w-full rounded-xl border-2 border-gray-500 bg-transparent px-4 py-3 text-base font-semibold text-black transition dark:text-white"
										/>
										<div className="text-violet-500">{notes.error}</div>
									</label>

									<button
										type="submit"
										className="flex h-12 w-full items-center justify-center rounded-xl bg-violet-600 text-base font-bold text-white shadow-md transition hover:scale-105 active:scale-100">
										Submit Bid
									</button>
								</fieldset>
							</Form>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
