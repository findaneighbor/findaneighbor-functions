export const offerCreatedNotification = ({ email, phone, zip, address, affiliations, motivation, background, name, text_permission, advocate, offer_needs }: { email: string, phone: string, zip: string, address: string, affiliations: string, motivation: string, background: string, name: string, text_permission: boolean, advocate: boolean, offer_needs: { description: string, need_type: { label: string } }[] }) => `
  <h3>A new Offer To Help was submitted:</h3>
  <p>
    ${name}
    <br>
    ${address}, ${zip}
    <br>
    ${email || ''}
    ${email && phone ? '<br>' : ''}
    ${phone || ''}
    ${phone ? `<br>Permission to text: ${text_permission ? 'Yes' : 'No'}` : ''}
    <br>
    <strong>Affiliations:</strong> ${affiliations}
    <br>
    <strong>Motivation:</strong> ${motivation}
    <br>
    <strong>Background:</strong> ${background}
    <br>
  </p>
  <p><em>Offering to be a neighborhood advocate:</em> ${advocate ? 'Yes' : 'No'}</p>
  <h3>
    Can Help With:
  </h3>
  ${offer_needs.map(need => `<p>
    <strong style="font-weight: 600">${need?.need_type?.label}</strong>
    <br>
    ${need.description}
  </p>`).join('')}
  <p style="text-align: center;">
    <a href="${process.env.NODE_ENV === 'production' ? 'https://admin.findaneighbor.org/dashboard' : 'http://localhost:1234/dashboard'}">
      Go To Dashboard
    </a>
  </p>
`
