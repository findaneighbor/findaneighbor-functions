import { NowRequest } from '@now/node'
import { JWT } from 'jose'
import { getSecret } from './getSecret'

const { audience, issuer } = process.env.NODE_ENV === 'production'
  ? { audience: 'findaneighbor', issuer: 'https://findaneighbor.auth0.com/' }
  : { audience: 'findaneighbor-dev', issuer: 'https://findaneighbor-dev.auth0.com/' }

export const auth0rizeRequest = async (req: NowRequest, adminOnly?: boolean): Promise<boolean> => {
  const token = req.headers.authorization?.split?.(' ')?.[1]

  if (!token) {
    return false
  }

  const secret = await getSecret(token)
    .catch(err => err instanceof Error ? err : new Error(JSON.stringify(err)))

  if (secret instanceof Error) {
    return false
  }

  const authorization: {
    'https://hasura.io/jwt/claims'?: {
      'x-hasura-default-role': string
    }
  } = JWT.verify(token, secret, { audience, issuer })

  return adminOnly
    ? authorization?.['https://hasura.io/jwt/claims']?.['x-hasura-default-role'] === 'admin'
    : !!authorization
}
