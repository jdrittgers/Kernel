import type { BidRequest, User } from '@prisma/client'
import { db } from '~/utils/db.server'

/**
 * Mutations.
 */
export async function createBidRequest({
	productName,
	description,
	quantity,
	unit,
	farmerId,
}: Pick<BidRequest, 'productName' | 'description' | 'quantity' | 'unit'> & {
	farmerId: User['id']
}) {
	return db.bidRequest.create({
		data: {
			productName,
			description,
			quantity,
			unit,
			farmer: {
				connect: { id: farmerId },
			},
		},
	})
}

export async function updateBidRequestStatus({
	id,
	status,
}: {
	id: BidRequest['id']
	status: BidRequest['status']
}) {
	return db.bidRequest.update({
		where: { id },
		data: { status },
	})
}

export async function deleteBidRequest(id: BidRequest['id']) {
	return db.bidRequest.delete({ where: { id } })
}

/**
 * Queries.
 */
export async function getBidRequestById(id: BidRequest['id']) {
	return db.bidRequest.findUnique({
		where: { id },
		include: {
			farmer: true,
			bids: {
				include: {
					retailer: true,
				},
				orderBy: {
					createdAt: 'desc',
				},
			},
		},
	})
}

export async function getAllOpenBidRequests() {
	return db.bidRequest.findMany({
		where: {
			status: 'open',
		},
		include: {
			farmer: true,
			bids: true,
		},
		orderBy: {
			createdAt: 'desc',
		},
	})
}

export async function getBidRequestsByFarmerId(farmerId: User['id']) {
	return db.bidRequest.findMany({
		where: {
			farmerId,
		},
		include: {
			bids: {
				include: {
					retailer: true,
				},
			},
		},
		orderBy: {
			createdAt: 'desc',
		},
	})
}
