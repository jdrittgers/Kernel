import type { MetaFunction, ActionArgs } from '@remix-run/node'

import { json, redirect } from '@remix-run/node'
import { Form, Link, useActionData } from '@remix-run/react'
import { authenticator } from '~/services/auth/config.server'
import { getSession, commitSession } from '~/services/auth/session.server'
import { getUserByEmail, getUserByUsername, createEmailUser } from '~/models/user.server'
import { hashPassword } from '~/services/auth/utils.server'

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
const RegisterFormSchema = z
	.object({
		name: z.string().min(1, 'Name is required.'),
		username: z.string().min(3, 'Username must be at least 3 characters.'),
		email: z.string().min(1, 'Email is required.').email('Email is invalid.'),
		phone: z.string().min(1, 'Phone number is required.'),
		location: z.string().min(1, 'Location is required.'),
		businessName: z.string().min(1, 'Business name is required.'),
		userType: z.enum(['farmer', 'retailer'], {
			errorMap: () => ({ message: 'Please select Farmer or Retailer.' }),
		}),
		password: z.string().min(6, 'Password must be at least 6 characters.'),
		confirmPassword: z.string().min(1, 'Confirm password is required.'),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords does not match.',
		path: ['confirmPassword'],
	})

/**
 * Remix - Meta.
 */
export const meta: MetaFunction = () => {
	return {
		title: 'Farm Bidding Platform - Sign Up',
	}
}

/**
 * Remix - Action.
 */
export async function action({ request }: ActionArgs) {
	const formData = await request.formData()
	const submission = parse<z.infer<typeof RegisterFormSchema>>(formData)

	try {
		switch (submission.type) {
			case 'validate':
			case 'submit': {
				// Validates `submission` data.
				const { name, username, email, phone, location, businessName, userType, password } = RegisterFormSchema.parse(
					submission.value,
				)

				if (submission.type === 'submit') {
					// Checks for user existence in database.
					const dbUserByEmail = await getUserByEmail({
						email,
					})
					if (dbUserByEmail && dbUserByEmail.email === email)
						submission.error.push(['email', 'Email is already in use.'])

					const dbUserByUsername = await getUserByUsername({
						username,
					})
					if (dbUserByUsername && dbUserByUsername.username === username)
						submission.error.push(['username', 'Username is already in use.'])

					// If there are errors, don't proceed
					if (submission.error.length > 0) {
						return json({
							...submission,
							value: {
								email: submission.value.email,
								username: submission.value.username,
							},
						})
					}

					// Hashes password.
					const hashedPassword = await hashPassword(password)

					// Creates and stores a new user in database.
					const newUser = await createEmailUser({
						user: {
							name,
							username,
							email,
							phone,
							location,
							businessName,
							userType,
							avatar: `https://ui-avatars.com/api/?name=${name}`,
						},
						hashedPassword: hashedPassword,
					})
					if (!newUser) throw new Error('Unable to create a new User.')

					// Sets newly created user as Auth Session.
					const session = await getSession(request.headers.get('cookie'))
					session.set(authenticator.sessionKey, newUser)

					// Redirects commiting newly updated Session.
					return redirect('/account', {
						headers: { 'Set-Cookie': await commitSession(session, {}) },
					})
				}
			}
		}
	} catch (error) {
		submission.error.push(...formatError(error))
	}

	// Sends submission state back to the client.
	return json({
		...submission,

		value: {
			// Never send password back to the client.
			email: submission.value.email,
		},
	})
}

export default function LoginRegisterRoute() {
	const state = useActionData<typeof action>()
	const form = useForm<z.infer<typeof RegisterFormSchema>>({
		// Enables server-side validation mode.
		mode: 'server-validation',

		// Begins validation on blur.
		initialReport: 'onBlur',

		// Syncs the result of last submission.
		state,

		// Validate `formData` based on Zod Schema.
		onValidate({ formData }) {
			return validate(formData, RegisterFormSchema)
		},

		// Submits only if validation has successfully passed.
		onSubmit(event, { submission }) {
			if (submission.type === 'validate' && hasError(submission.error)) {
				event.preventDefault()
			}
		},
	})

	// Returns all the information about the fieldset.
	const { name, username, email, phone, location, businessName, userType, password, confirmPassword } = useFieldset(
		form.ref,
		form.config,
	)

	return (
		<div className="relative flex w-full max-w-md flex-col">
			<Form method="post" {...form.props} autoComplete="off">
				<fieldset>
					{/* Displays Form error message. */}
					{form.error && (
						<legend
							className="flex w-full flex-row justify-center rounded-2xl
							bg-red-500 p-2 px-4 font-bold text-white shadow-2xl">
							{form.error}
						</legend>
					)}

					{/* User Type Selection */}
					<div className="font-semibold text-gray-800 dark:text-gray-100">
						<div className="mb-2">I am a:</div>
						<div className="flex gap-4 mb-1">
							<label className="flex items-center gap-2 cursor-pointer">
								<input
									{...conform.input(userType.config, { type: 'radio' })}
									value="farmer"
									className="w-4 h-4"
								/>
								<span>Farmer</span>
							</label>
							<label className="flex items-center gap-2 cursor-pointer">
								<input
									{...conform.input(userType.config, { type: 'radio' })}
									value="retailer"
									className="w-4 h-4"
								/>
								<span>Retailer</span>
							</label>
						</div>
						<div className="text-violet-500">{userType.error}</div>
					</div>
					<div className="mb-3" />

					{/* Name. */}
					<label className="font-semibold text-gray-800 dark:text-gray-100">
						<div>Full Name</div>
						<div className="mb-1" />
						<input
							{...conform.input(name.config)}
							className="flex h-12 w-full rounded-xl border-2 border-gray-500 bg-transparent
            	px-4 text-base font-semibold text-black transition dark:text-white"
						/>
						<div className="text-violet-500">{name.error}</div>
					</label>
					<div className="mb-3" />

					{/* Username. */}
					<label className="font-semibold text-gray-800 dark:text-gray-100">
						<div>Username</div>
						<div className="mb-1" />
						<input
							{...conform.input(username.config)}
							className="flex h-12 w-full rounded-xl border-2 border-gray-500 bg-transparent
            	px-4 text-base font-semibold text-black transition dark:text-white"
						/>
						<div className="text-violet-500">{username.error}</div>
					</label>
					<div className="mb-3" />

					{/* Business Name. */}
					<label className="font-semibold text-gray-800 dark:text-gray-100">
						<div>Business Name</div>
						<div className="mb-1" />
						<input
							{...conform.input(businessName.config)}
							className="flex h-12 w-full rounded-xl border-2 border-gray-500 bg-transparent
            	px-4 text-base font-semibold text-black transition dark:text-white"
						/>
						<div className="text-violet-500">{businessName.error}</div>
					</label>
					<div className="mb-3" />

					{/* Email. */}
					<label className="font-semibold text-gray-800 dark:text-gray-100">
						<div>Email</div>
						<div className="mb-1" />
						<input
							{...conform.input(email.config)}
							type="email"
							className="flex h-12 w-full rounded-xl border-2 border-gray-500 bg-transparent
            	px-4 text-base font-semibold text-black transition dark:text-white"
						/>
						<div className="text-violet-500">{email.error}</div>
					</label>
					<div className="mb-3" />

					{/* Phone. */}
					<label className="font-semibold text-gray-800 dark:text-gray-100">
						<div>Phone Number</div>
						<div className="mb-1" />
						<input
							{...conform.input(phone.config)}
							type="tel"
							className="flex h-12 w-full rounded-xl border-2 border-gray-500 bg-transparent
            	px-4 text-base font-semibold text-black transition dark:text-white"
						/>
						<div className="text-violet-500">{phone.error}</div>
					</label>
					<div className="mb-3" />

					{/* Location. */}
					<label className="font-semibold text-gray-800 dark:text-gray-100">
						<div>Location (City, State)</div>
						<div className="mb-1" />
						<input
							{...conform.input(location.config)}
							placeholder="e.g. Des Moines, IA"
							className="flex h-12 w-full rounded-xl border-2 border-gray-500 bg-transparent
            	px-4 text-base font-semibold text-black transition dark:text-white"
						/>
						<div className="text-violet-500">{location.error}</div>
					</label>
					<div className="mb-3" />

					{/* Password. */}
					<label className="font-semibold text-gray-800 dark:text-gray-100">
						<div>Password</div>
						<div className="mb-1" />
						<input
							{...conform.input(password.config, { type: 'password' })}
							data-testid="password"
							className="flex h-12 w-full rounded-xl border-2 border-gray-500 bg-transparent
            	px-4 text-base font-semibold text-black transition dark:text-white"
						/>
						<div className="text-violet-500">{password.error}</div>
					</label>
					<div className="mb-3" />

					{/* Confirm Password. */}
					<label className="font-semibold text-gray-800 dark:text-gray-100">
						<div>Confirm Password</div>
						<div className="mb-1" />
						<input
							{...conform.input(confirmPassword.config, { type: 'password' })}
							data-testid="confirm-password"
							className="flex h-12 w-full rounded-xl border-2 border-gray-500 bg-transparent
            	px-4 text-base font-semibold text-black transition dark:text-white"
						/>
						<div className="text-violet-500">{confirmPassword.error}</div>
					</label>
				</fieldset>
				<div className="mb-3" />

				{/* Submit. */}
				<button
					type="submit"
					className="relative flex h-16 w-full flex-row items-center justify-center rounded-xl bg-slate-600
					text-base font-bold text-white shadow-md transition hover:scale-105 active:scale-100">
					<svg
						className="absolute left-6 h-6 w-6 fill-white"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg">
						<path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4.7-8 5.334L4 8.7V6.297l8 5.333 8-5.333V8.7z" />
					</svg>

					<span>Continue</span>
				</button>
			</Form>
			<div className="mb-4" />

			<div className="flex flex-row justify-end">
				<Link
					className="font-semibold text-gray-800 hover:opacity-60 dark:text-gray-100"
					to="/login/email">
					Already have an account?
				</Link>
			</div>
		</div>
	)
}
