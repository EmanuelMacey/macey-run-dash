/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your MaceyRunners verification code</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Img src="https://macey-run-dash.lovable.app/favicon.png" width="40" height="40" alt="MaceyRunners" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '10px' }} />
          <Text style={headerText}>MaceyRunners</Text>
        </Section>
        <Section style={content}>
          <Heading style={h1}>Verification Code 🔐</Heading>
          <Text style={text}>Use the code below to confirm your identity:</Text>
          <Section style={codeContainer}>
            <Text style={codeStyle}>{token}</Text>
          </Section>
          <Text style={subtext}>This code will expire shortly. If you didn't request this, you can safely ignore this email.</Text>
        </Section>
        <Section style={footerSection}>
          <Text style={footerText}>MaceyRunners — Delivering with Purpose 🏃</Text>
          <Text style={footerText}>© {new Date().getFullYear()} MaceyRunners. All rights reserved.</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#f1f5f9', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }
const container = { maxWidth: '600px', margin: '0 auto', background: '#f1f5f9' }
const header = { background: 'linear-gradient(135deg, #1e3a5f, #2563eb)', padding: '24px 32px', textAlign: 'center' as const, borderRadius: '12px 12px 0 0' }
const headerText = { color: '#ffffff', fontSize: '22px', fontWeight: 'bold' as const, margin: '0', display: 'inline-block', verticalAlign: 'middle' }
const content = { padding: '32px', backgroundColor: '#ffffff' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#1e3a5f', margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#475569', lineHeight: '1.6', margin: '0 0 16px' }
const codeContainer = { textAlign: 'center' as const, margin: '24px 0', backgroundColor: '#f1f5f9', borderRadius: '12px', padding: '20px' }
const codeStyle = { fontFamily: 'Courier, monospace', fontSize: '32px', fontWeight: 'bold' as const, color: '#1e3a5f', margin: '0', letterSpacing: '6px' }
const subtext = { fontSize: '13px', color: '#94a3b8', lineHeight: '1.5', margin: '16px 0 0' }
const footerSection = { padding: '16px 32px', textAlign: 'center' as const }
const footerText = { fontSize: '12px', color: '#94a3b8', margin: '0 0 4px' }
