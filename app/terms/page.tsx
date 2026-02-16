import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Use - Average Dad Athletics',
  description: 'Terms of Use for Average Dad Athletics',
}

export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Use</h1>
        <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
          <p className="text-sm text-gray-500 mb-6">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing and using the Average Dad Athletics website ("the Site"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Use License</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Permission is granted to temporarily access the materials on Average Dad Athletics' website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to decompile or reverse engineer any software contained on the website</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              You agree not to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
              <li>Share your account credentials with any third party</li>
              <li>Use another user's account without permission</li>
              <li>Create multiple accounts to circumvent restrictions or bans</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Products and Services</h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">4.1 Product Information</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We strive to provide accurate product descriptions and images. However, we do not warrant that product descriptions or other content on the Site is accurate, complete, reliable, current, or error-free.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">4.2 Pricing</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              All prices are in USD unless otherwise stated. We reserve the right to change prices at any time without notice. We are not responsible for pricing errors and reserve the right to cancel orders placed at incorrect prices.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">4.3 Payment</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Payment is processed securely through Stripe. By making a purchase, you agree to provide current, complete, and accurate purchase and account information. You agree to promptly update your account and payment information, including email address and payment method, so we can complete your transactions and contact you as needed.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">4.4 Shipping and Fulfillment</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Products are fulfilled by Printful. Shipping times and costs are provided at checkout. We are not responsible for delays caused by shipping carriers or customs.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">4.5 Returns and Refunds</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Returns and refunds are handled in accordance with our return policy. Please contact us for return authorization. Refunds will be processed to the original payment method.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. User Content</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You retain ownership of any content you post, upload, or submit to the Site (including forum posts, workout submissions, and comments). By posting content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and distribute your content for the purpose of operating and promoting the Site.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              You agree not to post content that:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
              <li>Is illegal, harmful, threatening, abusive, or discriminatory</li>
              <li>Infringes on any intellectual property rights</li>
              <li>Contains spam, malware, or viruses</li>
              <li>Violates any applicable laws or regulations</li>
              <li>Is false, misleading, or defamatory</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-4">
              We reserve the right to remove any content that violates these terms without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Prohibited Uses</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You may not use the Site:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
              <li>In any way that violates any applicable law or regulation</li>
              <li>To transmit, or procure the sending of, any advertising or promotional material without our prior written consent</li>
              <li>To impersonate or attempt to impersonate the company, a company employee, another user, or any other person or entity</li>
              <li>In any way that infringes upon the rights of others, or in any way is illegal, threatening, fraudulent, or harmful</li>
              <li>To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the Site</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Intellectual Property</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              The Site and its original content, features, and functionality are owned by Average Dad Athletics and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Disclaimer</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              The information on this website is provided on an "as is" basis. To the fullest extent permitted by law, Average Dad Athletics:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
              <li>Excludes all representations, warranties, and conditions relating to our website and the use of this website</li>
              <li>Excludes all liability for any indirect or consequential loss or damage</li>
              <li>Does not provide medical or fitness advice - consult with a healthcare professional before beginning any exercise program</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              In no event shall Average Dad Athletics, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the Site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Indemnification</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You agree to defend, indemnify, and hold harmless Average Dad Athletics and its licensee and licensors, and their employees, contractors, agents, officers and directors, from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses (including but not limited to attorney's fees).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Termination</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may terminate or suspend your account and bar access to the Site immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Governing Law</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              These Terms shall be interpreted and governed by the laws of the United States, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Changes to Terms</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Contact Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any questions about these Terms of Use, please contact us at:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700">
                <strong>Average Dad Athletics</strong><br />
                Email: legal@averagedadathletics.com<br />
                Website: averagedadathletics.com
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
