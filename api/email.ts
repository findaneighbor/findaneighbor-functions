import { NowRequest, NowResponse } from '@now/node'
import { sendEmail } from '../services/email'

export default async (req: NowRequest, res: NowResponse) => {
  const {
    to,
    subject,
    html
  }: {
    to: string
    subject: string
    html: string
  } = req.body

  const sent = await sendEmail({
    to,
    subject,
    html
  })

  console.log(sent)

  res.json({ sent })
}