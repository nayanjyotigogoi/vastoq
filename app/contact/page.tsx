import LegalLayout from '@/components/legal/LegalLayout'

export const metadata = { title: 'Contact & Grievance Redressal — Vastoq' }

export default function ContactPage() {
  return (
    <LegalLayout title="Contact & Grievance Redressal" lastUpdated="30 June 2026">
      <p>
        Vastoq is operated by <strong>Anvaya Solution</strong>, a registered software services firm
        based in Dhemaji, Assam, India.
      </p>

      <h2>General Contact</h2>
      <ul>
        <li><strong>Business name:</strong> Anvaya Solution</li>
        <li><strong>GSTIN:</strong> 18CXBPG4145EIZS</li>
        <li><strong>Registered location:</strong> Dhemaji, Assam, India</li>
        <li><strong>Email:</strong> <a href="mailto:admin@anvayasoltuion.com">admin@anvayasoltuion.com</a></li>
      </ul>

      <h2>Grievance Redressal Officer</h2>
      <p>
        In accordance with the Information Technology (Intermediary Guidelines and Digital Media
        Ethics Code) Rules, 2021, the following Grievance Officer is designated to address complaints
        regarding listings, worker profiles, harassment, fraud, or any other issue arising from use of
        Vastoq:
      </p>
      <ul>
        <li><strong>Name:</strong> Nayanjyoti Gogoi</li>
        <li><strong>Email:</strong> <a href="mailto:admin@anvayasoltuion.com">admin@anvayasoltuion.com</a></li>
        <li><strong>Response time:</strong> Complaints are acknowledged within 24 hours and resolved
          within 15 days, as required by law.</li>
      </ul>

      <h2>Founding Team</h2>
      <ul>
        <li>Nayanjyoti Gogoi</li>
        <li>Panchal Prakrit Kharagharia</li>
      </ul>

      <h2>What to Include in Your Report</h2>
      <p>To help us resolve your issue quickly, please include:</p>
      <ul>
        <li>Your registered phone number or email</li>
        <li>The listing ID, worker profile ID, or relevant page link</li>
        <li>A clear description of the issue (e.g. fake listing, harassment, payment problem)</li>
        <li>Screenshots, if applicable</li>
      </ul>

      <h2>Other Pages</h2>
      <ul>
        <li><a href="/terms">Terms &amp; Conditions</a></li>
        <li><a href="/privacy">Privacy Policy</a></li>
        <li><a href="/refund-policy">Refund &amp; Cancellation Policy</a></li>
      </ul>
    </LegalLayout>
  )
}
