import { NowRequest, NowResponse } from '@now/node'
import fourohfour from './404'
import { auth0rizeRequest } from '../_services/auth0rize'
import { auth0Manager } from '../_services/auth0Management'

export default async (req: NowRequest, res: NowResponse) => {
  if (req.method !== 'POST') {
    return fourohfour(req, res)
  }

  const userId = req.body.userId

  if (!userId) {
    return res.status(400).json({ message: 'malformed request: userId is required in body' })
  }

  const isAuthorized = await auth0rizeRequest(req)
    .catch(err => err instanceof Error ? err : new Error(JSON.stringify(err)))

  if (!isAuthorized || isAuthorized instanceof Error) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const result = await auth0Manager.sendEmailVerification({ user_id: userId })
    .catch(err => err instanceof Error ? err : new Error(JSON.stringify(err)))

  if (result instanceof Error) {
    return res.status(500).json({ message: 'unable to send verification email' })
  }

  return res.status(200).json({ success: true })
}
