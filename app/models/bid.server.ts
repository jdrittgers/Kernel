import type { Bid, BidRequest, User } from '@prisma/client'
import { db } from '~/utils/db.server'

/**
 * Mutations.
 */
export async function createBid({
	price,
	deliveryDate,
	shippingCost,
	notes,
	bidRequestId,
	retailerId,
}: Pick<Bid, 'price' | 'deliveryDate' | 'shippingCost' | 'notes'> & {
	bidRequestId: BidRequest['id']
	retailerId: User['id']
}) {
	return db.bid.create({
		data: {
			price,
			deliveryDate,
			shippingCost,
			notes,
			bidRequest: {
				connect: { id: bidRequestId },
			},
			retailer: {
				connect: { id: retailerId },
			},
		},
	})
}

export async function updateBid({
	id,
	price,
	deliveryDate,
	shippingCost,
	notes,
}: {
	id: Bid['id']
	price?: Bid['price']
	deliveryDate?: Bid['deliveryDate']
	shippingCost?: Bid['shippingCost']
	notes?: Bid['notes']
}) {
	return db.bid.update({
		where: { id },
		data: {
			...(price !== undefined && { price }),
			...(deliveryDate && { deliveryDate }),
			...(shippingCost !== undefined && { shippingCost }),
			...(notes && { notes }),
		},
	})
}

export async function deleteBid(id: Bid['id']) {
	return db.bid.delete({ where: { id } })
}

/**
 * Queries.
 */
export async function getBidById(id: Bid['id']) {
	return db.bid.findUnique({
		where: { id },
		include: {
			retailer: true,
			bidRequest: {
				include: {
					farmer: true,
				},
			},
		},
	})
}

export async function getBidsByRetailerId(retailerId: User['id']) {
	return db.bid.findMany({
		where: {
			retailerId,
		},
		include: {
			bidRequest: {
				include: {
					farmer: true,
				},
			},
		},
		orderBy: {
			createdAt: 'desc',
		},
	})
}

export async function getBidsByBidRequestId(bidRequestId: BidRequest['id']) {
	return db.bid.findMany({
		where: {
			bidRequestId,
		},
		include: {
			retailer: true,
		},
		orderBy: {
			price: 'asc', // Sort by lowest price first
		},
	})
}
