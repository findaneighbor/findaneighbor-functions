import { ManagementClient } from 'auth0'

const { AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, NODE_ENV } = process.env

const domain = NODE_ENV === 'production' ? 'findaneighbor.auth0.com' : 'findaneighbor-dev.auth0.com'

export const auth0Manager = new ManagementClient({
  domain,
  clientId: AUTH0_CLIENT_ID,
  clientSecret: AUTH0_CLIENT_SECRET
})
