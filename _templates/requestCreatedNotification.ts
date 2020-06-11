export const requestCreatedNotification = ({ email, phone, zip, affiliations, address, name, text_permission, request_needs }: { email: string, phone: string, zip: string, affiliations: string, address: string, name: string, text_permission: boolean, request_needs: { description: string, need_type: { label: string } }[] }) => `
  <h3>A new Request For Help was submitted:</h3>
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
    Affiliations: ${affiliations}
  </p>
  <h3>
    Needs:
  </h3>
  ${request_needs.map(need => `<p>
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
