import { NowRequest, NowResponse } from '@now/node'
import { sendEmail } from '../_services/email'
import fourohfour from './404'
import { auth0rizeRequest } from '../_services/auth0rize'

const { EMAIL_GATEKEEPER, NODE_ENV } = process.env

export default async (req: NowRequest, res: NowResponse) => {
  if (req.method !== 'POST') {
    return fourohfour(req, res)
  }

  if (req.headers['email-gatekeeper'] !== EMAIL_GATEKEEPER && !(await auth0rizeRequest(req).catch(e => false))) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const {
    to,
    subject,
    html,
    text
  }: {
    to: string
    subject: string
    html?: string
    text?: string
  } = req.body

  const sent = await sendEmail({
    to,
    subject,
    html,
    text
  })
    .catch(err => err instanceof Error ? err : new Error(JSON.stringify(err)))

  if (sent instanceof Error) {
    if (NODE_ENV === 'production') {
      console.error(sent)

      return res.status(500).json({ error: 'Unable to send email' })
    }

    return res.status(500).json({ error: sent })
  }

  NODE_ENV === 'production' ? res.status(200).json({ success: true }) : res.status(200).json({ sent })
}
