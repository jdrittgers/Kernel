import type { MetaFunction, ActionArgs, LoaderArgs } from '@remix-run/node'

import { json, redirect } from '@remix-run/node'
import { Form, useActionData } from '@remix-run/react'
import { authenticator } from '~/services/auth/config.server'
import { createBidRequest } from '~/models/bidRequest.server'

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
 * Zod - Schema.
 */
const BidRequestFormSchema = z.object({
	productName: z.string().min(1, 'Product name is required.'),
	description: z.string().optional(),
	quantity: z.string().min(1, 'Quantity is required.'),
	unit: z.string().min(1, 'Unit is required.'),
})

/**
 * Remix - Meta.
 */
export const meta: MetaFunction = () => {
	return {
		title: 'Farm Bidding Platform - Create Bid Request',
	}
}

/**
 * Remix - Loader.
 */
export async function loader({ request }: LoaderArgs) {
	// Checks for Auth Session and that user is a farmer
	const user = await authenticator.isAuthenticated(request, {
		failureRedirect: '/login',
	})

	if (user.userType !== 'farmer') {
		throw new Response('Only farmers can create bid requests', { status: 403 })
	}

	return json({})
}

/**
 * Remix - Action.
 */
export async function action({ request }: ActionArgs) {
	const user = await authenticator.isAuthenticated(request, {
		failureRedirect: '/login',
	})

	if (user.userType !== 'farmer') {
		throw new Response('Only farmers can create bid requests', { status: 403 })
	}

	const formData = await request.formData()
	const submission = parse<z.infer<typeof BidRequestFormSchema>>(formData)

	try {
		switch (submission.type) {
			case 'validate':
			case 'submit': {
				// Validates `submission` data.
				const { productName, description, quantity, unit } =
					BidRequestFormSchema.parse(submission.value)

				if (submission.type === 'submit') {
					// Creates and stores a new bid request in database.
					const newBidRequest = await createBidRequest({
						productName,
						description,
						quantity,
						unit,
						farmerId: user.id,
					})

					if (!newBidRequest)
						throw new Error('Unable to create a new Bid Request.')

					// Redirects to the new bid request page
					return redirect(`/bid-requests/${newBidRequest.id}`)
				}
			}
		}
	} catch (error) {
		submission.error.push(...formatError(error))
	}

	// Sends submission state back to the client.
	return json(submission)
}

export default function NewBidRequestRoute() {
	const state = useActionData<typeof action>()
	const form = useForm<z.infer<typeof BidRequestFormSchema>>({
		// Enables server-side validation mode.
		mode: 'server-validation',

		// Begins validation on blur.
		initialReport: 'onBlur',

		// Syncs the result of last submission.
		state,

		// Validate `formData` based on Zod Schema.
		onValidate({ formData }) {
			return validate(formData, BidRequestFormSchema)
		},

		// Submits only if validation has successfully passed.
		onSubmit(event, { submission }) {
			if (submission.type === 'validate' && hasError(submission.error)) {
				event.preventDefault()
			}
		},
	})

	// Returns all the information about the fieldset.
	const { productName, description, quantity, unit } = useFieldset(
		form.ref,
		form.config,
	)

	return (
		<div className="mx-auto w-full max-w-2xl p-6">
			<div className="mb-8">
				<h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
					Create Bid Request
				</h1>
				<p className="mt-2 text-gray-600 dark:text-gray-400">
					Request bids from retailers for your farming inputs
				</p>
			</div>

			<div className="rounded-xl border-2 border-gray-300 bg-white p-8 dark:border-gray-700 dark:bg-gray-800">
				<Form method="post" {...form.props}>
					<fieldset>
						{/* Displays Form error message. */}
						{form.error && (
							<legend className="mb-4 flex w-full flex-row justify-center rounded-2xl bg-red-500 p-2 px-4 font-bold text-white shadow-2xl">
								{form.error}
							</legend>
						)}

						{/* Product Name */}
						<label className="font-semibold text-gray-800 dark:text-gray-100">
							<div>Product Name</div>
							<div className="mb-1" />
							<input
								{...conform.input(productName.config)}
								placeholder="e.g. Corn Seed, Fertilizer, Herbicide"
								className="flex h-12 w-full rounded-xl border-2 border-gray-500 bg-transparent px-4 text-base font-semibold text-black transition dark:text-white"
							/>
							<div className="text-violet-500">{productName.error}</div>
						</label>
						<div className="mb-4" />

						{/* Quantity and Unit */}
						<div className="grid grid-cols-2 gap-4">
							<label className="font-semibold text-gray-800 dark:text-gray-100">
								<div>Quantity</div>
								<div className="mb-1" />
								<input
									{...conform.input(quantity.config)}
									placeholder="e.g. 1000"
									className="flex h-12 w-full rounded-xl border-2 border-gray-500 bg-transparent px-4 text-base font-semibold text-black transition dark:text-white"
								/>
								<div className="text-violet-500">{quantity.error}</div>
							</label>

							<label className="font-semibold text-gray-800 dark:text-gray-100">
								<div>Unit</div>
								<div className="mb-1" />
								<input
									{...conform.input(unit.config)}
									placeholder="e.g. bags, gallons, acres"
									className="flex h-12 w-full rounded-xl border-2 border-gray-500 bg-transparent px-4 text-base font-semibold text-black transition dark:text-white"
								/>
								<div className="text-violet-500">{unit.error}</div>
							</label>
						</div>
						<div className="mb-4" />

						{/* Description */}
						<label className="font-semibold text-gray-800 dark:text-gray-100">
							<div>Description (Optional)</div>
							<div className="mb-1" />
							<textarea
								{...conform.textarea(description.config)}
								rows={4}
								placeholder="Additional details, specifications, or requirements..."
								className="flex w-full rounded-xl border-2 border-gray-500 bg-transparent px-4 py-3 text-base font-semibold text-black transition dark:text-white"
							/>
							<div className="text-violet-500">{description.error}</div>
						</label>
					</fieldset>
					<div className="mb-6" />

					{/* Submit Button */}
					<button
						type="submit"
						className="flex h-14 w-full items-center justify-center rounded-xl bg-green-600 text-base font-bold text-white shadow-md transition hover:scale-105 active:scale-100">
						<span>Create Bid Request</span>
					</button>
				</Form>
			</div>
		</div>
	)
}
