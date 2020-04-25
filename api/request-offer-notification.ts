import { NowRequest, NowResponse } from '@now/node'
import fourohfour from './404'
import { auth0rizeRequest } from '../_services/auth0rize'

export default async (req: NowRequest, res: NowResponse) => {
  if (req.method !== 'POST') {
    return fourohfour(req, res)
  }

  const isAuthorized = await auth0rizeRequest(req, true)
    .catch(err => err instanceof Error ? err : new Error(JSON.stringify(err)))

  if (!isAuthorized || isAuthorized instanceof Error) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  res.status(200).json({ isAuthorized })
}
