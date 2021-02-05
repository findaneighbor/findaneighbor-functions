import nodemailer from 'nodemailer'

const {
  EMAIL = '',
  EMAIL_CLIENT_ID = '',
  EMAIL_CLIENT_SECRET = '',
  EMAIL_REFRESH_TOKEN = ''
} = process.env

const smtpTransport = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  auth: {
    user: EMAIL,
    type: 'oauth2',
    clientId: EMAIL_CLIENT_ID,
    clientSecret: EMAIL_CLIENT_SECRET,
    refreshToken: EMAIL_REFRESH_TOKEN
  }
})

export const sendEmail = (mailOptions: { to?: string | string[], subject: string, html?: string, text?: string, bcc?: string | string[] }) => {
  return new Promise((resolve, reject) => {
    smtpTransport.sendMail({
      from: EMAIL,
      ...mailOptions
    }, (error, response) => {
      if (error || response.rejected[0]) return reject(error || response)
      return resolve(response)
    })
  })
}

export const sendText = (textOptions: { to: string | string[], subject: string, text: string }) => {
  return new Promise((resolve, reject) => {
    smtpTransport.sendMail({
      from: EMAIL,
      ...textOptions,
      subject: textOptions.subject
        ? textOptions.subject.substring(0, 140 - 6 - EMAIL.length - textOptions.text.length)
        : 'Automation'
    }, (error, response) => {
      if (error || response.rejected[0]) {
        return reject(error || response)
      }

      return resolve(response)
    })
  })
}
