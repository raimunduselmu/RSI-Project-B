import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

export const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
});

export interface MailInput {
  to: string;
  subject: string;
  html: string;
}

/**
 * Kirim email langsung. Pemanggil WAJIB mencatat ke notification_logs:
 * sukses → SENT, gagal → FAILED (akan di-retry jobs/retryEmail.ts, maks 3x).
 */
export async function sendMail({ to, subject, html }: MailInput) {
  await transporter.sendMail({ from: env.MAIL_FROM, to, subject, html });
}
