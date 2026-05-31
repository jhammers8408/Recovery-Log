import React from 'react'

export default function TermsOfService({ onBack }) {
  const lastUpdated = 'May 31, 2026'

  return (
    <div className="screen">
      <button onClick={onBack} style={{ background: 'transparent', border: '1px solid #1e2a3a', color: '#888', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', marginBottom: '24px', fontSize: '14px' }}>
        ← Back
      </button>

      <p style={{ color: '#f0f6ff', fontSize: '22px', fontWeight: '600', margin: '0 0 4px' }}>Terms of Service</p>
      <p style={{ color: '#4a6080', fontSize: '13px', margin: '0 0 24px' }}>Last updated: {lastUpdated}</p>

      {[
        {
          title: '1. Acceptance of Terms',
          content: `By accessing or using RecoveryLog ("the Service"), operated by Jacob Hammers, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Service. We reserve the right to update these Terms at any time.`
        },
        {
          title: '2. Description of Service',
          content: `RecoveryLog is a personal health and fitness tracking application that allows users to log recovery data, receive AI-generated insights, track nutrition, and access curated product recommendations. The Service is intended for informational purposes only.`
        },
        {
          title: '3. MEDICAL DISCLAIMER — PLEASE READ CAREFULLY',
          content: `RECOVERYLOG IS NOT A MEDICAL DEVICE AND DOES NOT PROVIDE MEDICAL ADVICE.

The Service and its content are for informational and educational purposes only. Nothing in the Service constitutes:
- Medical advice, diagnosis, or treatment
- A substitute for professional medical advice
- A recommendation to start, stop, or change any medical treatment

ALWAYS SEEK THE ADVICE OF YOUR PHYSICIAN OR OTHER QUALIFIED HEALTHCARE PROVIDER WITH ANY QUESTIONS ABOUT YOUR HEALTH OR MEDICAL CONDITIONS. NEVER DISREGARD PROFESSIONAL MEDICAL ADVICE OR DELAY SEEKING IT BECAUSE OF SOMETHING YOU HAVE READ IN THIS APP.

If you experience a medical emergency, call 911 or your local emergency services immediately.`
        },
        {
          title: '4. User Accounts',
          content: `To use the Service, you must create an account. You are responsible for:

- Maintaining the confidentiality of your account credentials
- All activity that occurs under your account
- Providing accurate and complete information
- Notifying us immediately of any unauthorized access

You must be at least 13 years old to use the Service. By creating an account, you represent that you meet this requirement.`
        },
        {
          title: '5. Subscriptions and Payments',
          content: `RecoveryLog offers both free and paid subscription tiers.

Pro Subscription: $4.99/month, billed monthly. Includes AI-powered insights, unlimited experiments, and additional features.

Free Trial: Where offered, free trials automatically convert to paid subscriptions unless cancelled before the trial ends.

Cancellation: You may cancel your subscription at any time through your account settings. Cancellation takes effect at the end of the current billing period. No refunds are provided for partial billing periods.

Payments are processed by Stripe. By subscribing, you agree to Stripe's terms of service.`
        },
        {
          title: '6. Refund Policy',
          content: `All sales are final. We do not offer refunds for subscription fees. If you believe you were charged in error, contact us at recoverylogapp@gmail.com within 7 days of the charge.`
        },
        {
          title: '7. Amazon Affiliate Disclosure',
          content: `RecoveryLog participates in the Amazon Services LLC Associates Program. Product links in the app are affiliate links. When you purchase through these links, we earn a commission at no additional cost to you. We only recommend products we believe may be beneficial to athletes.`
        },
        {
          title: '8. User Content',
          content: `You retain ownership of all data you input into the Service. By using the Service, you grant us a limited license to store and process your data to provide the Service. We will not sell or share your personal health data with third parties for marketing purposes.`
        },
        {
          title: '9. Prohibited Conduct',
          content: `You agree not to:

- Use the Service for any unlawful purpose
- Attempt to gain unauthorized access to any part of the Service
- Reverse engineer or attempt to extract source code
- Use the Service to transmit harmful or malicious content
- Impersonate any person or entity
- Violate any applicable laws or regulations`
        },
        {
          title: '10. Intellectual Property',
          content: `The Service and its original content, features, and functionality are owned by Jacob Hammers and are protected by intellectual property laws. You may not copy, modify, distribute, or create derivative works without our express written permission.`
        },
        {
          title: '11. LIMITATION OF LIABILITY',
          content: `TO THE MAXIMUM EXTENT PERMITTED BY LAW, JACOB HAMMERS SHALL NOT BE LIABLE FOR:

- ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES
- LOSS OF PROFITS, DATA, OR GOODWILL
- PERSONAL INJURY OR PROPERTY DAMAGE
- ANY DAMAGES RESULTING FROM RELIANCE ON INFORMATION PROVIDED BY THE SERVICE
- ANY HEALTH OUTCOMES RESULTING FROM USE OF THE SERVICE

OUR TOTAL LIABILITY TO YOU SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE 12 MONTHS PRECEDING THE CLAIM.

SOME JURISDICTIONS DO NOT ALLOW LIMITATION OF LIABILITY, SO THESE LIMITATIONS MAY NOT APPLY TO YOU.`
        },
        {
          title: '12. DISCLAIMER OF WARRANTIES',
          content: `THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.

WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF HARMFUL COMPONENTS.`
        },
        {
          title: '13. Indemnification',
          content: `You agree to indemnify and hold harmless Jacob Hammers from any claims, damages, losses, or expenses (including attorney fees) arising from your use of the Service, violation of these Terms, or violation of any third-party rights.`
        },
        {
          title: '14. Governing Law',
          content: `These Terms are governed by the laws of the State of Tennessee, United States, without regard to conflict of law principles. Any disputes shall be resolved in the courts located in Tennessee.`
        },
        {
          title: '15. Dispute Resolution',
          content: `Before filing a formal legal claim, you agree to attempt to resolve disputes informally by contacting us at recoverylogapp@gmail.com. We will try to resolve disputes within 30 days.

For unresolved disputes, you agree to binding arbitration under the American Arbitration Association rules, on an individual basis. You waive the right to participate in class action lawsuits.`
        },
        {
          title: '16. Termination',
          content: `We reserve the right to terminate or suspend your account at any time for violation of these Terms. You may terminate your account at any time by contacting us. Upon termination, your right to use the Service ceases immediately.`
        },
        {
          title: '17. Contact',
          content: `For questions about these Terms, contact:

Jacob Hammers
RecoveryLog
Email: recoverylogapp@gmail.com
Website: https://recovery-log-gamma.vercel.app`
        },
      ].map((section, i) => (
        <div key={i} style={{ marginBottom: '24px' }}>
          <p style={{ color: '#f0f6ff', fontSize: '15px', fontWeight: '600', margin: '0 0 8px' }}>{section.title}</p>
          <p style={{ color: '#8aa0b8', fontSize: '13px', lineHeight: '1.8', margin: '0', whiteSpace: 'pre-line' }}>{section.content}</p>
        </div>
      ))}

      <div style={{ background: '#0d1520', borderRadius: '14px', padding: '16px', border: '0.5px solid #f59e0b30', marginTop: '16px' }}>
        <p style={{ color: '#f59e0b', fontSize: '13px', fontWeight: '600', margin: '0 0 6px' }}>Legal Disclaimer</p>
        <p style={{ color: '#8aa0b8', fontSize: '12px', lineHeight: '1.6', margin: '0' }}>These Terms were prepared as a template. Jacob Hammers recommends consulting a qualified attorney to review this document before publishing your app.</p>
      </div>
    </div>
  )
}
