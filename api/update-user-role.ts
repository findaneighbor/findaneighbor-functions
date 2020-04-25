import { NowRequest, NowResponse } from '@now/node'
import fourohfour from './404'
import { auth0Manager } from '../_services/auth0Management'
import { gql } from '../_services/graphql'
import { sendEmail } from '../_services/email'
import { getRoleUpdatedNotification } from '../_templates/roleUpdatedNotification'

const { HASURA_GRAPHQL_ADMIN_SECRET } = process.env

export default async (req: NowRequest, res: NowResponse) => {
  if (
    req.method !== 'POST' ||
    req.body?.table?.name !== 'user' ||
    req.body?.event?.op !== 'UPDATE' ||
    !req.body?.event?.data?.new
  ) {
    return fourohfour(req, res)
  }

  if (req.headers['x-hasura-admin-secret'] !== HASURA_GRAPHQL_ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const user = req.body.event.data.new
  const newRole = user.role
  const oldRole = req.body.event.data.old?.role
  const userId = user.id
  const userEmail = user.email

  const { app_metadata = {} } = await auth0Manager.getUser({ id: userId }).catch(() => ({ app_metadata: {} }))

  if (app_metadata.role === newRole) {
    return res.status(204).json({ message: 'no change necessary' })
  }

  const result = await auth0Manager.updateAppMetadata({ id: userId }, { role: newRole })
    .catch(err => err instanceof Error ? err : new Error(JSON.stringify(err)))

  if (result instanceof Error) {
    if (result.name === 'Not Found') {
      const deletedUser = await gql(`
        mutation deleteUser ($id: String!) {
          delete_user(where: {id: {_eq: $id}}) {
            affected_rows
          }
        }
      `, { id: userId })
    } else if (newRole !== oldRole) {
      const revertRole = app_metadata.role && oldRole !== app_metadata.role
        ? app_metadata.role
        : oldRole || 'user'

      const revert = await gql(`
        mutation updateRole ($id: String!, $role: String) {
          update_user(where: { id: { _eq: $id } }, _set: { role: $role }) {
            affected_rows
          }
        }
      `, {
        id: userId,
        role: revertRole
      })
        .catch(err => err instanceof Error ? err : new Error(JSON.stringify(err)))

      if (revert instanceof Error) {
        const sent = await sendEmail({
          to: 'bstewardcodes@gmail.com',
          subject: 'Error: Find A Neighbor Roles',
          text: `check out the logs for webhook on ${new Date().toISOString()}.
            User: ${userId}
            Old role: ${oldRole}
            App metadata role: ${app_metadata.role}
            New role: ${newRole}`
        })
          .catch(err => err instanceof Error ? err : new Error(JSON.stringify(err)))

        return res.status(500).json({
          message: 'things went completely out of control',
          updateError: result,
          revertError: revert,
          emailError: sent instanceof Error ? sent : 'at least something went right'
        })
      }
    }

    return res.status(500).json({ message: 'unable to save role to app metadata', error: result })
  }

  const userAlerted = await sendEmail({
    to: userEmail,
    subject: 'Your Find A Neighbor Admin access was updated',
    html: getRoleUpdatedNotification(user)
  })
    .catch(err => err instanceof Error ? err : new Error(JSON.stringify(err)))

  if (userAlerted instanceof Error) {
    return res.status(500).json({ message: 'role updated, but user not alerted' })
  }

  return res.status(200).json({ success: true })
}
