import env from '#start/env'
import nodemailer, { type Transporter } from 'nodemailer'
import type { NotificationEvent, TeamInvite, TeamMember } from '@reqtap/shared'

class NotificationMailer {
  #transport?: Transporter

  get enabled() {
    return Boolean(env.get('SMTP_HOST') && env.get('SMTP_FROM'))
  }

  async sendEvent(event: NotificationEvent, members: TeamMember[]) {
    const recipients = members
      .filter((member) => !member.pending)
      .map((member) => member.email)

    if (!recipients.length) {
      return
    }

    await this.#send({
      to: recipients,
      subject: `[Reqtap] ${event.title}`,
      text: `${event.title}\n\n${event.body}`,
    })
  }

  async sendInvite(invite: TeamInvite) {
    const webUrl = (env.get('WEB_URL') ?? 'http://localhost:3001').replace(/\/$/, '')
    const url = `${webUrl}/auth/register?invite=${encodeURIComponent(invite.id)}&email=${encodeURIComponent(invite.email)}`

    await this.#send({
      to: [invite.email],
      subject: 'You were invited to Reqtap',
      text: [
        `You were invited to join a Reqtap workspace as ${invite.role}.`,
        '',
        `Create your account: ${url}`,
        invite.message ? `\nMessage:\n${invite.message}` : '',
      ]
        .filter(Boolean)
        .join('\n'),
    })
  }

  async sendPasswordReset(input: { email: string; token: string; name?: string }) {
    const webUrl = (env.get('WEB_URL') ?? 'http://localhost:3001').replace(/\/$/, '')
    const url = `${webUrl}/auth/reset-password?token=${encodeURIComponent(input.token)}`

    await this.#send({
      to: [input.email],
      subject: 'Reset your Reqtap password',
      text: [
        `Hi ${input.name ?? 'there'},`,
        '',
        'Use this link to reset your Reqtap password:',
        url,
        '',
        'This link expires in 1 hour.',
      ].join('\n'),
    })
  }

  async #send(message: { to: string[]; subject: string; text: string }) {
    if (!this.enabled) {
      return
    }

    const from = env.get('SMTP_FROM')
    if (!from) {
      return
    }

    try {
      await this.#getTransport().sendMail({
        from,
        to: message.to.join(', '),
        subject: message.subject,
        text: message.text,
      })
    } catch (error) {
      console.warn('[reqtap] Could not send notification email.', error)
    }
  }

  #getTransport() {
    if (!this.#transport) {
      const user = env.get('SMTP_USER')
      const pass = env.get('SMTP_PASS')

      this.#transport = nodemailer.createTransport({
        host: env.get('SMTP_HOST'),
        port: env.get('SMTP_PORT') ?? 587,
        secure: env.get('SMTP_SECURE') ?? false,
        auth: user && pass ? { user, pass } : undefined,
      })
    }

    return this.#transport
  }
}

export const notificationMailer = new NotificationMailer()
