import * as React from 'npm:react@18.3.1'
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  driverName?: string
  tipAmount: number
  orderNumber: string | number
  customerName?: string
}

const Email = ({ driverName, tipAmount, orderNumber, customerName }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You earned a ${tipAmount} GYD tip on order #{String(orderNumber)} 💚</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={hero}>
          <Heading style={h1}>💚 You got a tip!</Heading>
          <Text style={amount}>${tipAmount.toLocaleString()} GYD</Text>
        </Section>

        <Section style={card}>
          <Text style={greeting}>
            {driverName ? `Hi ${driverName},` : 'Hi there,'}
          </Text>
          <Text style={paragraph}>
            Great news — {customerName ? <strong>{customerName}</strong> : 'a customer'} just
            added a tip to your delivery on{' '}
            <strong>order #{String(orderNumber)}</strong>.
          </Text>
          <Text style={paragraph}>
            100% of this tip goes to you and will appear in your driver earnings.
          </Text>
          <Text style={paragraph}>
            Thank you for delivering with care — this is what great service looks like. 🚀
          </Text>
        </Section>

        <Text style={footer}>MaceyRunners — Guyana's reliable delivery network.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Props) =>
    `💚 You earned a $${data.tipAmount} GYD tip on order #${data.orderNumber}`,
  displayName: 'Driver Tip Received',
  previewData: {
    driverName: 'Jamal',
    tipAmount: 500,
    orderNumber: 'A1B2C3D4',
    customerName: 'Sarah',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '24px', maxWidth: '560px', margin: '0 auto' }
const hero = {
  background: 'linear-gradient(135deg, #1e3a8a, #f97316)',
  borderRadius: '16px',
  padding: '28px 20px',
  textAlign: 'center' as const,
  color: '#ffffff',
}
const h1 = { color: '#ffffff', margin: '0 0 8px', fontSize: '22px' }
const amount = { color: '#ffffff', margin: 0, fontSize: '34px', fontWeight: 800 }
const card = {
  border: '1px solid #e5e7eb',
  borderRadius: '14px',
  padding: '20px',
  marginTop: '16px',
}
const greeting = { fontSize: '15px', fontWeight: 600, margin: '0 0 8px', color: '#111827' }
const paragraph = { fontSize: '14px', lineHeight: '22px', color: '#374151', margin: '8px 0' }
const footer = {
  textAlign: 'center' as const,
  fontSize: '12px',
  color: '#9ca3af',
  marginTop: '20px',
}
