import LegalLayout from '@/components/legal/LegalLayout'

export const metadata = { title: 'Terms & Conditions — Vastoq' }

export default function TermsPage() {
  return (
    <LegalLayout title="Terms & Conditions" lastUpdated="30 June 2026">
      <p>
        These Terms &amp; Conditions ("Terms") govern your use of Vastoq ("Vastoq", "we", "us", "our"),
        a rental and local-services marketplace operated by <strong>Anvaya Solution</strong>
        (GSTIN: 18CXBPG4145EIZS), Dhemaji, Assam, India. By accessing or using Vastoq, you agree to
        be bound by these Terms. If you do not agree, please do not use the platform.
      </p>

      <h2>1. What Vastoq Is</h2>
      <p>
        Vastoq is a marketplace that connects:
      </p>
      <ul>
        <li>Property owners listing rentals (flats, PGs, rooms, houses) with tenants looking to rent</li>
        <li>Local skilled workers (electricians, plumbers, carpenters, etc.) with people who need their services</li>
        <li>Furniture rental providers with renters</li>
      </ul>
      <p>
        <strong>Vastoq is not a party to any rental agreement, employment arrangement, or service
        contract formed between users.</strong> We provide the platform, contact-unlock mechanism, and
        payment processing — the actual rental, hiring, or service agreement is strictly between the
        two users involved. We do not inspect properties, verify worker skill quality, or guarantee
        the accuracy of any listing or profile beyond the identity checks described in our Privacy
        Policy.
      </p>

      <h2>2. Accounts</h2>
      <p>
        You must provide accurate information when creating an account (via phone number or Google
        sign-in). You are responsible for all activity under your account. You must be at least 18
        years old to use Vastoq.
      </p>

      <h2>3. Listings &amp; Worker Profiles</h2>
      <ul>
        <li>Property owners must only list properties they own or are authorised to rent out.</li>
        <li>Listings must not be posted by brokers/agents pretending to be the property owner. Listings
          found to be broker-posted may be flagged or removed.</li>
        <li>Workers must provide accurate skill, category, and service-area information. Aadhaar
          verification, where completed, confirms identity only — it is not a certification of skill
          or work quality.</li>
        <li>We reserve the right to remove any listing or profile that is fraudulent, misleading,
          duplicated, or violates these Terms, at our sole discretion and without prior notice.</li>
      </ul>

      <h2>4. Contact Unlocks &amp; Paid Features</h2>
      <p>
        Tenants pay a small fee to unlock an owner's or worker's contact details and (for listings)
        approximate location. Owners may pay to "boost" a listing for increased visibility for a
        fixed duration. All paid features are processed via Razorpay; see our{' '}
        <a href="/refund-policy">Refund &amp; Cancellation Policy</a> for details on refund
        eligibility.
      </p>
      <p>
        Unlocking a contact does not guarantee the listing is still available, the worker is
        currently free to take a job, or that any transaction will be completed. Vastoq is not
        responsible for no-shows, unavailability, or disputes arising after a contact is unlocked.
      </p>

      <h2>5. Prohibited Conduct</h2>
      <ul>
        <li>Posting fake, duplicate, or intentionally misleading listings or worker profiles</li>
        <li>Circumventing the unlock/payment system to obtain contact details without payment</li>
        <li>Harassing, threatening, or defrauding other users</li>
        <li>Uploading someone else's Aadhaar or identity documents without authorisation</li>
        <li>Using the platform for any unlawful purpose</li>
      </ul>
      <p>
        Violation of these rules may result in account suspension or termination, removal of
        listings/profiles, and — where applicable — reporting to law enforcement.
      </p>

      <h2>6. Payments</h2>
      <p>
        All payments on Vastoq are processed by Razorpay, a third-party PCI-DSS compliant payment
        gateway. We do not store your card or UPI credentials. By making a payment, you also agree to
        Razorpay's applicable terms.
      </p>

      <h2>7. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, Vastoq and Anvaya Solution shall not be liable for
        any indirect, incidental, or consequential damages arising from your use of the platform,
        including but not limited to disputes between users, inaccurate listings, or losses incurred
        from off-platform transactions.
      </p>

      <h2>8. Changes to These Terms</h2>
      <p>
        We may update these Terms from time to time. Continued use of Vastoq after changes are posted
        constitutes acceptance of the revised Terms.
      </p>

      <h2>9. Governing Law</h2>
      <p>
        These Terms are governed by the laws of India. Any disputes shall be subject to the
        jurisdiction of the courts at Dhemaji, Assam.
      </p>

      <h2>10. Contact</h2>
      <p>
        For questions about these Terms, reach us at{' '}
        <a href="mailto:admin@anvayasoltuion.com">admin@anvayasoltuion.com</a> or see our{' '}
        <a href="/contact">Contact &amp; Grievance Redressal</a> page.
      </p>
    </LegalLayout>
  )
}
