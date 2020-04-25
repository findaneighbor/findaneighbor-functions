export const getRoleUpdatedNotification = ({ email, name, role }: { email: string, name: string, role: string }) => {
  if (role === 'user') {
    return `
      <p>Hello ${name},</p>
      <p>Your access to admin.findaneighbor.org has been revoked.</p>
      <p>Please reply if you believe this is an error.</p>
      <br>
      <p>Sincerely,<p>
      <p>The Find A Neighbor Team</p>
    `
  }

  return `
    <p>Hello ${name},</p>
    <p>You have been granted ${role} privileges at <a href="https://admin.findaneighbor.org">admin.findaneighbor.org</a>. Welcome to the team!</p>
    <p>Let us know if you have any questions.</p>
    <br>
    <p>Sincerely,<p>
    <p>The Find A Neighbor Team</p>
  `
}
