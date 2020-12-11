import { NowRequest, NowResponse } from '@now/node'
import fourohfour from './404'
import { gql } from '../_services/graphql'

const { HASURA_GRAPHQL_ADMIN_SECRET } = process.env

export default async (req: NowRequest, res: NowResponse) => {
  if (
    req.method !== 'POST' ||
    req.body?.table?.name !== 'match' ||
    req.body?.event?.op !== 'UPDATE' ||
    !req.body?.event?.data?.new ||
    !req.body?.event?.data?.old
  ) {
    return fourohfour(req, res)
  }

  if (req.headers['x-hasura-admin-secret'] !== HASURA_GRAPHQL_ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const {
    id,
    request_need_id,
    requester_accepted,
    offerer_accepted,
    rejected,
    success
  } = req.body.event.data.new
  const {
    requester_accepted: oldRequesterAccepted,
    offerer_accepted: oldOfferAccepted,
    rejected: oldRejected,
    success: oldSuccess
  } = req.body.event.data.old

  const { request_need_by_pk: requestNeed } = await gql(`
    query ($id: Int!) {
      request_need_by_pk (id: $id) {
        id
        description
        need_type {
          label
        }
        status
      }
    }
  `, { id: request_need_id }).catch((err: any) => ({
    request_need_by_pk: err instanceof Error ? err : new Error(JSON.stringify(err))
  }))

  if (requestNeed instanceof Error) {
    console.error(requestNeed)

    return res.status(500).json({
      error: requestNeed,
      message: 'Error getting request need data'
    })
  }

  if (!oldRejected && rejected) {
    const updates = await gql(`
      mutation rejectMatch ($id: Int!, $requestNeedId: Int!, $status: String) {
        update_request_need_by_pk (pk_columns: { id: $requestNeedId }, _set: { status: $status }) {
          id
        }
        update_match_by_pk(pk_columns: { id: $id }, _set: { request_need_id: null, rejected_request_need_id: $requestNeedId }) {
          id
        }
      }
    `, { id, requestNeedId: request_need_id, status: 'requested' })
      .catch((err: any) => err instanceof Error ? err : new Error(JSON.stringify(err)))

    if (updates instanceof Error) {
      console.error(updates)

      return res.status(500).json({
        error: updates,
        message: 'Error updating request need status'
      })
    }

    return res.status(200).json({ success: true })
  }

  if (!oldSuccess && success) {
    const updated = await gql(`
      mutation ($id: Int!, $status: String) {
        update_request_need_by_pk (pk_columns: { id: $id }, _set: { status: $status }) {
          id
        }
      }
    `, { id: request_need_id, status: 'completed' })
      .catch((err: any) => err instanceof Error ? err : new Error(JSON.stringify(err)))

    if (updated instanceof Error) {
      console.error(updated)

      return res.status(500).json({
        error: updated,
        message: 'Error updating request need status'
      })
    }

    return res.status(200).json({ success: true })
  }

  if (
    requestNeed.status === 'pending' &&
    (!oldOfferAccepted || !oldRequesterAccepted) &&
    requester_accepted &&
    offerer_accepted
  ) {
    const updated = await gql(`
      mutation ($id: Int!, $status: String) {
        update_request_need_by_pk (pk_columns: { id: $id }, _set: { status: $status }) {
          id
        }
      }
    `, { id: request_need_id, status: 'matched' })
      .catch((err: any) => err instanceof Error ? err : new Error(JSON.stringify(err)))

    if (updated instanceof Error) {
      console.error(updated)

      return res.status(500).json({
        error: updated,
        message: 'Error updating request need status'
      })
    }

    return res.status(200).json({ success: true })
  }

  res.status(200).json({ success: true })
}
