/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Welcome to MaceyRunners — confirm your email to get started 🏃</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Img src="https://macey-run-dash.lovable.app/favicon.png" width="40" height="40" alt="MaceyRunners" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '10px' }} />
          <Text style={headerText}>MaceyRunners</Text>
        </Section>
        <Section style={content}>
          <Heading style={h1}>Welcome aboard! 🎉</Heading>
          <Text style={text}>
            Thanks for joining{' '}
            <Link href={siteUrl} style={link}><strong>MaceyRunners</strong></Link>
            — Guyana's fastest delivery and errand service!
          </Text>
          <Text style={text}>
            Please verify your email address (
            <Link href={`mailto:${recipient}`} style={link}>{recipient}</Link>
            ) so we can get you started:
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={confirmationUrl}>Verify My Email</Button>
          </Section>
          <Text style={subtext}>This link will expire shortly. If you didn't create an account, you can safely ignore this email.</Text>
        </Section>
        <Section style={footerSection}>
          <Text style={footerText}>MaceyRunners — Delivering with Purpose 🏃</Text>
          <Text style={footerText}>© {new Date().getFullYear()} MaceyRunners. All rights reserved.</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

const main = { backgroundColor: '#f1f5f9', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }
const container = { maxWidth: '600px', margin: '0 auto', background: '#f1f5f9' }
const header = { background: 'linear-gradient(135deg, #1e3a5f, #2563eb)', padding: '24px 32px', textAlign: 'center' as const, borderRadius: '12px 12px 0 0' }
const headerText = { color: '#ffffff', fontSize: '22px', fontWeight: 'bold' as const, margin: '0', display: 'inline-block', verticalAlign: 'middle' }
const content = { padding: '32px', backgroundColor: '#ffffff' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#1e3a5f', margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#475569', lineHeight: '1.6', margin: '0 0 16px' }
const link = { color: '#2563eb', textDecoration: 'underline' }
const buttonContainer = { textAlign: 'center' as const, margin: '24px 0' }
const button = { backgroundColor: '#2563eb', color: '#ffffff', fontSize: '16px', fontWeight: 'bold' as const, borderRadius: '24px', padding: '14px 32px', textDecoration: 'none', display: 'inline-block' }
const subtext = { fontSize: '13px', color: '#94a3b8', lineHeight: '1.5', margin: '16px 0 0' }
const footerSection = { padding: '16px 32px', textAlign: 'center' as const }
const footerText = { fontSize: '12px', color: '#94a3b8', margin: '0 0 4px' }
