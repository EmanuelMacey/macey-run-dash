import * as React from 'npm:react@18.3.1'
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  customerName?: string
  driverName?: string
  tipAmount?: number
  orderNumber?: string | number
  orderTotal?: number
}

const Email = ({
  customerName,
  driverName,
  tipAmount,
  orderNumber,
  orderTotal,
}: Props) => {
  const safeTip = (tipAmount ?? 0).toLocaleString()
  const safeTotal = (orderTotal ?? 0).toLocaleString()
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Your ${safeTip} GYD tip was sent to your driver 💚</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={brandBar}>
            <Text style={brandText}>MaceyRunners</Text>
          </Section>

          <Heading style={h1}>Thank you for tipping! 💚</Heading>
          <Text style={text}>
            {customerName ? `Hi ${customerName},` : 'Hi there,'}
          </Text>
          <Text style={text}>
            Your tip has been added and sent directly to {driverName || 'your driver'}.
            100% of every tip goes to the rider — no platform cut.
          </Text>

          <Section style={card}>
            <Text style={cardLabel}>Tip amount</Text>
            <Text style={cardAmount}>${safeTip} GYD</Text>
            <Hr style={divider} />
            {orderNumber !== undefined && (
              <Text style={rowText}>
                <strong>Order:</strong> #{String(orderNumber)}
              </Text>
            )}
            {orderTotal !== undefined && (
              <Text style={rowText}>
                <strong>New order total:</strong> ${safeTotal} GYD
              </Text>
            )}
            <Text style={rowText}>
              <strong>Status:</strong> Paid
            </Text>
          </Section>

          <Text style={text}>
            Thanks for supporting our drivers and helping us guarantee fast,
            reliable delivery across Guyana.
          </Text>

          <Hr style={divider} />
          <Text style={footer}>
            MaceyRunners · 464 East Ruimveldt, Georgetown, Guyana
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: Email,
  subject: (data: Props) =>
    `Your $${(data?.tipAmount ?? 0).toLocaleString()} GYD tip was sent 💚`,
  displayName: 'Tip Confirmation',
  previewData: {
    customerName: 'Emanuel',
    driverName: 'James',
    tipAmount: 500,
    orderNumber: 1284,
    orderTotal: 1800,
  },
} satisfies TemplateEntry

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
  color: '#0f172a',
}
const container = { padding: '24px 24px 32px', maxWidth: '560px', margin: '0 auto' }
const brandBar = {
  background: 'linear-gradient(135deg, #1e3a8a 0%, #f97316 100%)',
  borderRadius: '14px',
  padding: '14px 18px',
  marginBottom: '20px',
}
const brandText = {
  color: '#ffffff',
  fontWeight: 800,
  fontSize: '18px',
  margin: 0,
  letterSpacing: '0.3px',
}
const h1 = { fontSize: '24px', margin: '8px 0 12px', color: '#0f172a' }
const text = { fontSize: '15px', lineHeight: '24px', color: '#334155' }
const card = {
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '14px',
  padding: '18px',
  margin: '18px 0',
}
const cardLabel = {
  fontSize: '12px',
  color: '#64748b',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  margin: 0,
}
const cardAmount = {
  fontSize: '30px',
  fontWeight: 800,
  color: '#1e3a8a',
  margin: '4px 0 8px',
}
const rowText = { fontSize: '14px', color: '#334155', margin: '4px 0' }
const divider = { borderColor: '#e2e8f0', margin: '14px 0' }
const footer = { fontSize: '12px', color: '#94a3b8', textAlign: 'center' as const }
