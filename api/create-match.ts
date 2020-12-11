import { NowRequest, NowResponse } from '@now/node'
import fourohfour from './404'
import { gql } from '../_services/graphql'

const { HASURA_GRAPHQL_ADMIN_SECRET } = process.env

export default async (req: NowRequest, res: NowResponse) => {
  if (
    req.method !== 'POST' ||
    req.body?.table?.name !== 'match' ||
    req.body?.event?.op !== 'INSERT' ||
    !req.body?.event?.data?.new
  ) {
    return fourohfour(req, res)
  }

  if (req.headers['x-hasura-admin-secret'] !== HASURA_GRAPHQL_ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { request_need_id: id, requester_accepted, offerer_accepted, rejected } = req.body.event.data.new

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
  `, { id }).catch((err: any) => ({
    request_need_by_pk: err instanceof Error ? err : new Error(JSON.stringify(err))
  }))

  if (requestNeed instanceof Error) {
    console.error(requestNeed)

    return res.status(500).json({
      error: requestNeed,
      message: 'Error getting request need data'
    })
  }

  if (requestNeed.status === 'requested' && !rejected) {
    const newStatus = requester_accepted && offerer_accepted ? 'matched' : 'pending'

    const updated = await gql(`
      mutation ($id: Int!, $status: String) {
        update_request_need_by_pk (pk_columns: { id: $id }, _set: { status: $status }) {
          id
        }
      }
    `, { id, status: newStatus })
      .catch((err: any) => err instanceof Error ? err : new Error(JSON.stringify(err)))

    if (updated instanceof Error) {
      console.error(updated)

      return res.status(500).json({
        error: updated,
        message: 'Error updating request need status'
      })
    }
  }

  res.status(200).json({ success: true })
}
