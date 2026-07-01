import LegalLayout from '@/components/legal/LegalLayout'

export const metadata = { title: 'Refund & Cancellation Policy — Vastoq' }

export default function RefundPolicyPage() {
  return (
    <LegalLayout title="Refund & Cancellation Policy" lastUpdated="30 June 2026">
      <p>
        This policy applies to all paid features on Vastoq, operated by{' '}
        <strong>Anvaya Solution</strong> (GSTIN: 18CXBPG4145EIZS). All payments are processed
        securely via Razorpay.
      </p>

      <h2>1. Paid Features Covered</h2>
      <ul>
        <li><strong>Listing contact unlock</strong> — paid by tenants to view an owner's phone number
          and approximate location</li>
        <li><strong>Worker contact unlock</strong> — paid by users to view a worker's phone number</li>
        <li><strong>Listing boost</strong> — paid by property owners to feature a listing for a fixed
          duration</li>
      </ul>

      <h2>2. General Policy</h2>
      <p>
        Because unlock and boost features grant <strong>immediate digital access</strong> (a phone
        number is revealed instantly, or a listing is immediately marked as featured), these
        purchases are <strong>non-refundable once successfully delivered</strong>, except in the
        cases listed below.
      </p>

      <h2>3. When a Refund Applies</h2>
      <ul>
        <li><strong>Failed/duplicate payment:</strong> If money was deducted from your account but the
          unlock or boost was not applied to your account due to a technical error, contact us with
          your payment reference and we will verify and refund within 7 business days.</li>
        <li><strong>Double charge:</strong> If you were charged twice for the same unlock/boost due to
          a payment gateway glitch, the duplicate charge will be refunded in full.</li>
        <li><strong>Listing/worker profile removed for fraud before you could use it:</strong> If a
          listing or worker profile you unlocked is later found to be fraudulent and removed within
          24 hours of your unlock, you may request a refund or credit at our discretion.</li>
      </ul>

      <h2>4. When a Refund Does Not Apply</h2>
      <ul>
        <li>The owner/worker did not respond, was unavailable, or the deal did not go through after
          contact was unlocked — this is a matter between users and is not covered.</li>
        <li>You changed your mind after unlocking a contact or boosting a listing.</li>
        <li>The listing was accurate at the time of unlock but the property was rented out shortly
          after.</li>
      </ul>

      <h2>5. How to Request a Refund</h2>
      <p>
        Email <a href="mailto:admin@anvayasoltuion.com">admin@anvayasoltuion.com</a> within 7 days of
        the transaction with your registered phone number, the listing/worker ID, and the Razorpay
        payment ID (visible in your payment confirmation). We will review and respond within 7
        business days.
      </p>

      <h2>6. Refund Method &amp; Timeline</h2>
      <p>
        Approved refunds are issued to the original payment method via Razorpay and typically reflect
        in 5-10 business days, depending on your bank/UPI provider.
      </p>

      <h2>7. Contact</h2>
      <p>
        For any questions about this policy, see our <a href="/contact">Contact</a> page.
      </p>
    </LegalLayout>
  )
}
