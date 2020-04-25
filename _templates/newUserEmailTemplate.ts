import { User, AppMetadata, UserMetadata } from 'auth0';

export const newUserEmailTemplate = (user: User<AppMetadata, UserMetadata>) => `<div style="width: 100%">
  <p>
    A new user is requesting access to admin.findaneighbor.org.
  </p>
  <strong style="text-align: center;">Name: ${user.name}</strong>
  <br>
  <em style="text-align: center;">Email: ${user.email}</em>
  <br>
  <img style="width: 200px" src="${user.picture || ''}" alt="user's picture">
  <br>
  <p>
    <strong>Other Identifying Information</strong>
    <br>
    First Name: ${user.given_name || ''}
    <br>
    Last Name: ${user.family_name || ''}
    <br>
    Nickname: ${user.nickname || ''}
    <br>
  </p>
  <p>Log in to <a href="https://admin.findaneighbor.org">the dashboard</a> with your administrator account to approve or deny this user's access to admin.findaneighbor.org.</p>
  <p style="color: red;">Be sure you definitely recognize the user's email address before approving!</p>
</div>`
