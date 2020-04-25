import { NowRequest, NowResponse } from '@now/node'
import fourohfour from './404'
import { auth0Manager } from '../_services/auth0Management'
import { sendEmail } from '../_services/email'
import { newUserEmailTemplate } from '../_templates/newUserEmailTemplate'

const { HASURA_GRAPHQL_ADMIN_SECRET, NODE_ENV } = process.env

const administrator = NODE_ENV === 'production' ? 'dkratz@eastswamp.org' : 'bstewardcodes@gmail.com'

export default async (req: NowRequest, res: NowResponse) => {
  if (
    req.method !== 'POST' ||
    req.body?.table?.name !== 'user' ||
    req.body?.event?.op === 'DELETE' ||
    !req.body?.event?.data?.new
  ) {
    return fourohfour(req, res)
  }

  if (req.headers['x-hasura-admin-secret'] !== HASURA_GRAPHQL_ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const newSignup = req.body.event.op === 'INSERT'
  const oldEmail = req.body.event.data.old?.email
  const user = req.body.event.data.new

  const fullUser = await auth0Manager.getUser({ id: user.id })

  if (
    (user.email && fullUser.email_verified && user.email === fullUser.email) &&
    (newSignup || !oldEmail)
  ) {
    const result = await sendEmail({
      to: administrator,
      subject: 'Admin Approval Requested',
      html: newUserEmailTemplate(fullUser)
    }).catch(err => err instanceof Error ? err : new Error(JSON.stringify(err)))

    if (result instanceof Error) {
      return res.status(500).json({ message: 'Error sending email', error: result })
    }

    return res.status(200).json({ message: 'approval successfully requested' })
  }

  if (!user.email || !fullUser.email_verified) {
    return res.status(200).json({ message: 'email still unverified' })
  }

  res.status(200).json({ message: 'no-op', info: req.body, user: fullUser })
}
