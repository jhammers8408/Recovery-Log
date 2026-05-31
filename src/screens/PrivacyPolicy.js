import React from 'react'

export default function PrivacyPolicy({ onBack }) {
  const lastUpdated = 'May 31, 2026'

  return (
    <div className="screen">
      <button onClick={onBack} style={{ background: 'transparent', border: '1px solid #1e2a3a', color: '#888', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', marginBottom: '24px', fontSize: '14px' }}>
        ← Back
      </button>

      <p style={{ color: '#f0f6ff', fontSize: '22px', fontWeight: '600', margin: '0 0 4px' }}>Privacy Policy</p>
      <p style={{ color: '#4a6080', fontSize: '13px', margin: '0 0 24px' }}>Last updated: {lastUpdated}</p>

      {[
        {
          title: '1. Introduction',
          content: `RecoveryLog ("we," "our," or "us"), operated by Jacob Hammers, is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and web service (collectively, the "Service"). Please read this policy carefully. By using RecoveryLog, you agree to the practices described in this Privacy Policy.`
        },
        {
          title: '2. Information We Collect',
          content: `We collect the following types of information:

Account Information: Name, email address, and password when you register.

Health & Fitness Data: Sleep hours and quality, energy levels, soreness ratings, stress levels, motivation, hydration, body weight, height, nutrition logs, and performance metrics. This data is provided voluntarily by you.

Payment Information: We use Stripe to process payments. We do not store your credit card information. Stripe's privacy policy governs payment data.

Usage Data: How you interact with the app, features used, and time spent.

Device Information: Device type, operating system, and browser type.`
        },
        {
          title: '3. How We Use Your Information',
          content: `We use your information to:

- Provide, operate, and maintain the Service
- Generate personalized health and recovery insights
- Process payments and manage subscriptions
- Send transactional emails and notifications
- Improve and develop new features
- Comply with legal obligations

We do NOT sell your personal information or health data to third parties.`
        },
        {
          title: '4. Health Data Disclaimer',
          content: `IMPORTANT: RecoveryLog is NOT a medical application and does not provide medical advice. The information and insights provided are for informational and educational purposes only. Nothing in the Service constitutes medical advice, diagnosis, or treatment.

Always consult a qualified healthcare provider before making changes to your diet, exercise, or recovery routine. Never disregard professional medical advice because of something you read in this app.`
        },
        {
          title: '5. Data Storage and Security',
          content: `Your data is stored securely using Supabase, a SOC 2 compliant database provider. We implement industry-standard security measures including encryption in transit and at rest. However, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security of your data.`
        },
        {
          title: '6. Third-Party Services',
          content: `We use the following third-party services:

- Supabase — database and authentication
- Stripe — payment processing
- Amazon Associates — affiliate product recommendations
- Vercel — hosting
- Google — authentication (optional)
- Anthropic/Groq — AI-powered features

Each service has its own privacy policy governing their data practices.`
        },
        {
          title: '7. Amazon Associates Disclosure',
          content: `RecoveryLog is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means to earn fees by linking to Amazon.com. When you click on product links and make purchases, we may earn a commission at no additional cost to you.`
        },
        {
          title: '8. Your Rights',
          content: `Depending on your location, you may have the right to:

- Access the personal data we hold about you
- Request correction of inaccurate data
- Request deletion of your data
- Object to processing of your data
- Data portability
- Withdraw consent at any time

To exercise these rights, contact us at recoverylogapp@gmail.com.`
        },
        {
          title: '9. Data Retention',
          content: `We retain your data for as long as your account is active or as needed to provide the Service. You may request deletion of your account and associated data at any time by contacting us. We will respond within 30 days.`
        },
        {
          title: '10. Children\'s Privacy',
          content: `RecoveryLog is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.`
        },
        {
          title: '11. International Users',
          content: `RecoveryLog is operated from the United States. If you are located outside the United States, your information may be transferred to and processed in the United States. By using the Service, you consent to this transfer.

For EU/EEA users: We process your data based on your consent and our legitimate interests in providing the Service. You have rights under GDPR including access, rectification, erasure, and data portability.`
        },
        {
          title: '12. Changes to This Policy',
          content: `We may update this Privacy Policy from time to time. We will notify you of significant changes by email or through the app. Your continued use of the Service after changes constitutes acceptance of the updated policy.`
        },
        {
          title: '13. Contact Us',
          content: `If you have questions about this Privacy Policy or our data practices, contact us at:

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
        <p style={{ color: '#8aa0b8', fontSize: '12px', lineHeight: '1.6', margin: '0' }}>This Privacy Policy was prepared as a template. Jacob Hammers recommends consulting a qualified attorney to review this document before publishing your app.</p>
      </div>
    </div>
  )
}
