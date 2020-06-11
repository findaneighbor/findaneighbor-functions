import { NowRequest, NowResponse } from '@now/node'
import fourohfour from './404'
import { gql } from '../_services/graphql'
import { sendEmail } from '../_services/email'
import { offerCreatedNotification } from '../_templates/offerCreatedNotification'

const { HASURA_GRAPHQL_ADMIN_SECRET } = process.env

export default async (req: NowRequest, res: NowResponse) => {
  if (
    req.method !== 'POST' ||
    req.body?.table?.name !== 'offer_to_help' ||
    req.body?.event?.op !== 'INSERT' ||
    !req.body?.event?.data?.new
  ) {
    return fourohfour(req, res)
  }

  if (req.headers['x-hasura-admin-secret'] !== HASURA_GRAPHQL_ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { id } = req.body.event.data.new

  const { offer_to_help_by_pk: fullOffer } = await gql(`
    query ($id: Int!) {
      offer_to_help_by_pk (id: $id) {
        id
        email
        phone
        address
        zip
        name
        affiliations
        motivation
        background
        advocate
        text_permission
        offer_needs {
          description
          need_type {
            label
          }
        }
      }
    }
  `, { id }).catch((err: any) => err instanceof Error ? err : new Error(JSON.stringify(err)))

  if (fullOffer instanceof Error) {
    console.error(fullOffer)

    return res.status(500).json({
      error: fullOffer,
      message: 'Error getting full offer to help'
    })
  }

  const data: { notification_setting: { user: { email: string } }[] } | Error = await gql(`
    query {
      notification_setting(where: { offer_added: { _eq: true } }) {
        user {
          email
        }
      }
    }
  `).catch((err: any) => err instanceof Error ? err : new Error(JSON.stringify(err)))

  if (data instanceof Error || !Array.isArray(data?.notification_setting)) {
    console.error(data)

    return res.status(500).json({ error: data, message: 'Error getting notification emails' })
  }

  const emails = data.notification_setting.map(ns => ns?.user?.email).filter(Boolean)

  const sent = await sendEmail({
    bcc: emails,
    subject: 'New Offer to Help Submitted',
    html: offerCreatedNotification(fullOffer)
  }).catch(err => err instanceof Error ? err : new Error(JSON.stringify(err)))

  if (sent instanceof Error) {
    console.error(sent)

    res.status(500).json({ error: sent, message: 'Unable to send emails' })
  }

  res.status(200).json({ success: true })
}
