import type { MetaFunction, ActionArgs, LoaderArgs } from '@remix-run/node'

import { json, redirect } from '@remix-run/node'
import { Form, useActionData } from '@remix-run/react'
import { authenticator } from '~/services/auth/config.server'
import { createProductRecommendation } from '~/models/productRecommendation.server'

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
const ProductRecommendationSchema = z.object({
	productType: z.enum(['chemical', 'seed'], {
		errorMap: () => ({ message: 'Please select Chemical or Seed.' }),
	}),
	productName: z.string().min(1, 'Product name is required.'),
	description: z.string().optional(),
	price: z.string().min(1, 'Price is required.').transform(Number),
	unit: z.string().min(1, 'Unit is required.'),
	deliveryDate: z.string().optional(),
})

/**
 * Remix - Meta.
 */
export const meta: MetaFunction = () => {
	return {
		title: 'Farm Bidding Platform - Submit Product Recommendation',
	}
}

/**
 * Remix - Loader.
 */
export async function loader({ request }: LoaderArgs) {
	const user = await authenticator.isAuthenticated(request, {
		failureRedirect: '/login',
	})

	if (user.userType !== 'retailer') {
		throw new Response('Only retailers can submit product recommendations', {
			status: 403,
		})
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

	if (user.userType !== 'retailer') {
		throw new Response('Only retailers can submit product recommendations', {
			status: 403,
		})
	}

	const formData = await request.formData()
	const submission = parse<z.infer<typeof ProductRecommendationSchema>>(formData)

	try {
		switch (submission.type) {
			case 'validate':
			case 'submit': {
				const { productType, productName, description, price, unit, deliveryDate } =
					ProductRecommendationSchema.parse(submission.value)

				if (submission.type === 'submit') {
					await createProductRecommendation({
						productType,
						productName,
						description,
						price,
						unit,
						deliveryDate,
						retailerId: user.id,
					})

					return redirect('/dashboard')
				}
			}
		}
	} catch (error) {
		submission.error.push(...formatError(error))
	}

	return json(submission)
}

export default function NewProductRecommendationRoute() {
	const state = useActionData<typeof action>()
	const form = useForm<z.infer<typeof ProductRecommendationSchema>>({
		mode: 'server-validation',
		initialReport: 'onBlur',
		state,
		onValidate({ formData }) {
			return validate(formData, ProductRecommendationSchema)
		},
		onSubmit(event, { submission }) {
			if (submission.type === 'validate' && hasError(submission.error)) {
				event.preventDefault()
			}
		},
	})

	const { productType, productName, description, price, unit, deliveryDate } =
		useFieldset(form.ref, form.config)

	return (
		<div className="mx-auto w-full max-w-2xl p-6">
			<div className="mb-8">
				<h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
					Submit Product Recommendation
				</h1>
				<p className="mt-2 text-gray-600 dark:text-gray-400">
					Recommend products to farmers on the platform
				</p>
			</div>

			<div className="rounded-xl border-2 border-gray-300 bg-white p-8 dark:border-gray-700 dark:bg-gray-800">
				<Form method="post" {...form.props}>
					<fieldset>
						{form.error && (
							<legend className="mb-4 flex w-full flex-row justify-center rounded-2xl bg-red-500 p-2 px-4 font-bold text-white shadow-2xl">
								{form.error}
							</legend>
						)}

						{/* Product Type Selection */}
						<div className="font-semibold text-gray-800 dark:text-gray-100">
							<div className="mb-2">Product Type</div>
							<div className="flex gap-6 mb-1">
								<label className="flex items-center gap-2 cursor-pointer">
									<input
										{...conform.input(productType.config, { type: 'radio' })}
										value="chemical"
										className="w-4 h-4"
									/>
									<span>Chemical</span>
								</label>
								<label className="flex items-center gap-2 cursor-pointer">
									<input
										{...conform.input(productType.config, { type: 'radio' })}
										value="seed"
										className="w-4 h-4"
									/>
									<span>Seed</span>
								</label>
							</div>
							<div className="text-violet-500">{productType.error}</div>
						</div>
						<div className="mb-4" />

						{/* Product Name */}
						<label className="font-semibold text-gray-800 dark:text-gray-100">
							<div>Product Name</div>
							<div className="mb-1" />
							<input
								{...conform.input(productName.config)}
								placeholder="e.g. RoundUp WeatherMax, DeKalb Corn Seed"
								className="flex h-12 w-full rounded-xl border-2 border-gray-500 bg-transparent px-4 text-base font-semibold text-black transition dark:text-white"
							/>
							<div className="text-violet-500">{productName.error}</div>
						</label>
						<div className="mb-4" />

						{/* Description */}
						<label className="font-semibold text-gray-800 dark:text-gray-100">
							<div>Description (Optional)</div>
							<div className="mb-1" />
							<textarea
								{...conform.textarea(description.config)}
								rows={3}
								placeholder="Product details, features, benefits..."
								className="flex w-full rounded-xl border-2 border-gray-500 bg-transparent px-4 py-3 text-base font-semibold text-black transition dark:text-white"
							/>
							<div className="text-violet-500">{description.error}</div>
						</label>
						<div className="mb-4" />

						{/* Price and Unit */}
						<div className="grid grid-cols-2 gap-4">
							<label className="font-semibold text-gray-800 dark:text-gray-100">
								<div>Price ($)</div>
								<div className="mb-1" />
								<input
									{...conform.input(price.config)}
									type="number"
									step="0.01"
									placeholder="0.00"
									className="flex h-12 w-full rounded-xl border-2 border-gray-500 bg-transparent px-4 text-base font-semibold text-black transition dark:text-white"
								/>
								<div className="text-violet-500">{price.error}</div>
							</label>

							<label className="font-semibold text-gray-800 dark:text-gray-100">
								<div>Unit</div>
								<div className="mb-1" />
								<input
									{...conform.input(unit.config)}
									placeholder="e.g. per gallon, per bag"
									className="flex h-12 w-full rounded-xl border-2 border-gray-500 bg-transparent px-4 text-base font-semibold text-black transition dark:text-white"
								/>
								<div className="text-violet-500">{unit.error}</div>
							</label>
						</div>
						<div className="mb-4" />

						{/* Delivery Date */}
						<label className="font-semibold text-gray-800 dark:text-gray-100">
							<div>Available Delivery Date (Optional)</div>
							<div className="mb-1" />
							<input
								{...conform.input(deliveryDate.config)}
								type="date"
								className="flex h-12 w-full rounded-xl border-2 border-gray-500 bg-transparent px-4 text-base font-semibold text-black transition dark:text-white"
							/>
							<div className="text-violet-500">{deliveryDate.error}</div>
						</label>
					</fieldset>
					<div className="mb-6" />

					{/* Submit Button */}
					<button
						type="submit"
						className="flex h-14 w-full items-center justify-center rounded-xl bg-blue-600 text-base font-bold text-white shadow-md transition hover:scale-105 active:scale-100">
						<span>Submit Recommendation</span>
					</button>
				</Form>
			</div>
		</div>
	)
}
