import LegalLayout from '@/components/legal/LegalLayout'

export const metadata = { title: 'Privacy Policy — Vastoq' }

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="30 June 2026">
      <p>
        This Privacy Policy explains how Vastoq, operated by <strong>Anvaya Solution</strong>
        (GSTIN: 18CXBPG4145EIZS), Dhemaji, Assam, India, collects, uses, and protects your personal
        data, in line with India's Digital Personal Data Protection Act, 2023 (DPDP Act).
      </p>

      <h2>1. Information We Collect</h2>
      <h3>Account information</h3>
      <ul>
        <li>Name, phone number, email address</li>
        <li>Password (stored as a one-way hash — we never store it in plain text)</li>
        <li>Google account name/email/profile photo, if you sign in with Google</li>
      </ul>
      <h3>Listing &amp; profile information</h3>
      <ul>
        <li>Property details, photos, and approximate location (for owners)</li>
        <li>Skills, service areas, rates, and photos (for workers)</li>
        <li>Aadhaar front/back photo and Aadhaar number, only if you voluntarily submit them for
          worker verification</li>
      </ul>
      <h3>Payment information</h3>
      <p>
        Payments are processed by Razorpay. We receive and store only the transaction ID, amount, and
        status — we never receive or store your card number, CVV, or UPI PIN.
      </p>
      <h3>Usage data</h3>
      <ul>
        <li>Pages viewed, listings/profiles viewed and unlocked</li>
        <li>Approximate location (city/locality), derived from your device's GPS if you grant
          permission, used only to show relevant nearby listings/workers</li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <ul>
        <li>To operate the platform — showing listings, processing unlocks, enabling payments</li>
        <li>To verify worker identity via Aadhaar (reviewed manually by our team; never shared with
          third parties except as required by law)</li>
        <li>To prevent fraud and enforce our Terms &amp; Conditions</li>
        <li>To communicate with you about your account, transactions, or support requests</li>
      </ul>
      <p>We do not sell your personal data to third parties.</p>

      <h2>3. Aadhaar Data — Special Handling</h2>
      <p>
        Aadhaar documents submitted for worker verification are stored securely and used solely to
        confirm identity for the "Verified" badge. Access is restricted to platform administrators
        performing the review. You may request deletion of your Aadhaar documents at any time by
        contacting us (see Section 7) — this will reset your verification status to unverified.
      </p>

      <h2>4. Sharing of Information</h2>
      <p>When a contact is unlocked, the relevant phone number is shared with the user who paid to
        unlock it. Otherwise, we share data only with:</p>
      <ul>
        <li>Razorpay, for payment processing</li>
        <li>Google, for sign-in authentication (if you use Google login)</li>
        <li>Law enforcement, where legally required</li>
      </ul>

      <h2>5. Data Retention</h2>
      <p>
        We retain account and listing data for as long as your account is active. You may request
        account deletion at any time; we will remove personal data within a reasonable period, except
        where retention is required for legal, accounting, or fraud-prevention purposes.
      </p>

      <h2>6. Your Rights</h2>
      <p>Under the DPDP Act, you have the right to:</p>
      <ul>
        <li>Access the personal data we hold about you</li>
        <li>Request correction of inaccurate data</li>
        <li>Request deletion of your data, subject to legal retention requirements</li>
        <li>Withdraw consent for optional data collection (e.g. location access)</li>
      </ul>

      <h2>7. Contact / Grievance Officer</h2>
      <p>
        For privacy questions or to exercise your data rights, contact our Grievance Officer:
      </p>
      <ul>
        <li><strong>Grievance Officer:</strong> Nayanjyoti Gogoi</li>
        <li><strong>Email:</strong> <a href="mailto:admin@anvayasoltuion.com">admin@anvayasoltuion.com</a></li>
        <li><strong>Registered location:</strong> Dhemaji, Assam, India</li>
      </ul>

      <h2>8. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy periodically. Material changes will be reflected by
        updating the "Last updated" date above.
      </p>
    </LegalLayout>
  )
}
