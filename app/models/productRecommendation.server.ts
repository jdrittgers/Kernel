import type { ProductRecommendation, User } from '@prisma/client'
import { db } from '~/utils/db.server'

/**
 * Mutations.
 */
export async function createProductRecommendation({
	productType,
	productName,
	description,
	price,
	unit,
	deliveryDate,
	retailerId,
}: Pick<
	ProductRecommendation,
	'productType' | 'productName' | 'description' | 'price' | 'unit' | 'deliveryDate'
> & {
	retailerId: User['id']
}) {
	return db.productRecommendation.create({
		data: {
			productType,
			productName,
			description,
			price,
			unit,
			deliveryDate,
			retailer: {
				connect: { id: retailerId },
			},
		},
	})
}

export async function updateProductRecommendation({
	id,
	productType,
	productName,
	description,
	price,
	unit,
	deliveryDate,
}: {
	id: ProductRecommendation['id']
	productType?: ProductRecommendation['productType']
	productName?: ProductRecommendation['productName']
	description?: ProductRecommendation['description']
	price?: ProductRecommendation['price']
	unit?: ProductRecommendation['unit']
	deliveryDate?: ProductRecommendation['deliveryDate']
}) {
	return db.productRecommendation.update({
		where: { id },
		data: {
			...(productType && { productType }),
			...(productName && { productName }),
			...(description && { description }),
			...(price !== undefined && { price }),
			...(unit && { unit }),
			...(deliveryDate && { deliveryDate }),
		},
	})
}

export async function deleteProductRecommendation(
	id: ProductRecommendation['id'],
) {
	return db.productRecommendation.delete({ where: { id } })
}

/**
 * Queries.
 */
export async function getProductRecommendationById(
	id: ProductRecommendation['id'],
) {
	return db.productRecommendation.findUnique({
		where: { id },
		include: {
			retailer: true,
		},
	})
}

export async function getProductRecommendationsByRetailerId(
	retailerId: User['id'],
) {
	return db.productRecommendation.findMany({
		where: {
			retailerId,
		},
		orderBy: {
			createdAt: 'desc',
		},
	})
}

export async function getAllProductRecommendations() {
	return db.productRecommendation.findMany({
		include: {
			retailer: true,
		},
		orderBy: {
			createdAt: 'desc',
		},
	})
}

export async function getProductRecommendationsByType(
	productType: ProductRecommendation['productType'],
) {
	return db.productRecommendation.findMany({
		where: {
			productType,
		},
		include: {
			retailer: true,
		},
		orderBy: {
			createdAt: 'desc',
		},
	})
}
