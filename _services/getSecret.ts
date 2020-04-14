import JwksClient from 'jwks-rsa'
import { JWT } from 'jose'

const client = JwksClient({
  jwksUri: 'https://findaneighbor.auth0.com/.well-known/jwks.json'
})

export const getSecret: (token: string) => Promise<string> = (token: string) => {
  const { kid = '' }: { kid?: string } = JWT.decode(token, { complete: true }).header

  return new Promise<string>((resolve, reject) => {
    client.getSigningKey(kid, (err, key) => {
      if (err) {
        return reject(err)
      }

      resolve(key.getPublicKey())
    })
  })
}
