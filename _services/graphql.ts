import { GraphQLClient } from 'graphql-request'

const { HASURA_GRAPHQL_ADMIN_SECRET = '', HASURA_SERVER_URL = '' } = process.env

const client = new GraphQLClient(HASURA_SERVER_URL, {
  headers: {
    'X-Hasura-Admin-Secret': HASURA_GRAPHQL_ADMIN_SECRET
  }
})

export const gql = (query: string, variables?: any) => client.request(query, variables)
