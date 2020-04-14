import { NowRequest, NowResponse } from '@now/node'

export default async (req: NowRequest, res: NowResponse) => {
  res.status(404).json({ status: 404, message: 'Not Found' })
}
