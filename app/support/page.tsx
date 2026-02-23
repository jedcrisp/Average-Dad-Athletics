export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Support</h1>
          <p className="text-xl text-gray-600 mb-8">
            We're here to help! Get in touch with us for any questions or concerns.
          </p>

          <div className="space-y-8">
            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-primary-100 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                    <a 
                      href="mailto:support@averagedadathletics.com" 
                      className="text-primary-600 hover:text-primary-700"
                    >
                      support@averagedadathletics.com
                    </a>
                    <p className="text-gray-600 text-sm mt-1">
                      We typically respond within 24-48 hours
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Frequently Asked Questions */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <div className="border-l-4 border-primary-500 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Order & Shipping</h3>
                  <p className="text-gray-600 text-sm">
                    Questions about your order? Check your order status or shipping information. 
                    You'll receive an email with tracking information once your order ships.
                  </p>
                </div>

                <div className="border-l-4 border-primary-500 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Returns & Refunds</h3>
                  <p className="text-gray-600 text-sm">
                    Need to return an item? Contact us at support@averagedadathletics.com with your order number 
                    and reason for return. We'll help you process your return or refund.
                  </p>
                </div>

                <div className="border-l-4 border-primary-500 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Account Issues</h3>
                  <p className="text-gray-600 text-sm">
                    Having trouble logging in or accessing your account? Contact us and we'll help you regain access.
                  </p>
                </div>

                <div className="border-l-4 border-primary-500 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Technical Support</h3>
                  <p className="text-gray-600 text-sm">
                    Experiencing technical issues with the website or app? Let us know what's happening 
                    and we'll work to resolve it quickly.
                  </p>
                </div>
              </div>
            </section>

            {/* Additional Resources */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Additional Resources</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <a
                  href="/privacy"
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">Privacy Policy</h3>
                  <p className="text-gray-600 text-sm">
                    Learn how we collect, use, and protect your personal information.
                  </p>
                </a>
                <a
                  href="/terms"
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">Terms of Service</h3>
                  <p className="text-gray-600 text-sm">
                    Read our terms and conditions for using our services.
                  </p>
                </a>
              </div>
            </section>

            {/* Contact Form CTA */}
            <section className="bg-primary-50 rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Still Need Help?</h2>
              <p className="text-gray-700 mb-4">
                Don't hesitate to reach out! Send us an email and we'll get back to you as soon as possible.
              </p>
              <a
                href="mailto:support@averagedadathletics.com"
                className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email Support
              </a>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
