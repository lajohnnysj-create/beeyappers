import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { LegalShell } from "@/app/legal-shell";

export const metadata: Metadata = {
  title: "Privacy Policy | Bleviq",
  description:
    "How Bleviq (a product of MRLA Media LLC) collects, uses, and protects information.",
};

export default async function PrivacyPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <LegalShell signedIn={!!user} title="Privacy Policy" updated="June 16, 2026">
      <p>
        This Privacy Policy explains how Bleviq, a product of{" "}
        <strong>MRLA Media LLC</strong> (&ldquo;Bleviq,&rdquo; &ldquo;we,&rdquo;
        &ldquo;us,&rdquo; or &ldquo;our&rdquo;), collects, uses, and protects
        information. Bleviq is a service that lets businesses train an AI chat
        assistant on their website and embed it as a chat widget.
      </p>

      <h2>Who this policy covers</h2>
      <p>This policy describes our practices for two groups of people:</p>
      <ul>
        <li>
          <strong>Customers</strong> &mdash; people who create a Bleviq account
          and run a chat widget on their own website.
        </li>
        <li>
          <strong>End users</strong> &mdash; visitors who interact with a chat
          widget that a customer has placed on their site. When you chat with a
          widget, your messages are processed by Bleviq on behalf of the
          customer who operates that site.
        </li>
      </ul>

      <h2>Information we collect</h2>
      <ul>
        <li>
          <strong>Account information.</strong> When you sign up, we collect
          your email address. If you sign in with Google, we also receive your
          name and profile picture. Passwords for email sign-ups are handled and
          stored in hashed form by our authentication provider; we never see
          them in plain text.
        </li>
        <li>
          <strong>Content you provide to train the assistant.</strong> The
          website address you submit, the page content we read from that public
          website, and any FAQs or documents you add to the assistant&rsquo;s
          knowledge.
        </li>
        <li>
          <strong>Conversations.</strong> Messages exchanged between a
          customer&rsquo;s site visitors and the widget, which we store so the
          assistant can work and so customers can review how it&rsquo;s
          performing.
        </li>
        <li>
          <strong>Usage and technical data.</strong> Basic request information
          such as timestamps and a one-way hashed version of the visitor&rsquo;s
          IP address, which we use for rate limiting and abuse prevention. We do
          not store raw IP addresses for this purpose.
        </li>
        <li>
          <strong>Billing information.</strong> Payments are processed by
          Stripe. We store your Stripe customer and subscription identifiers and
          your plan status. We do not collect or store your full card number.
        </li>
        <li>
          <strong>Cookies.</strong> We use essential cookies to keep you signed
          in. We do not use advertising cookies.
        </li>
      </ul>

      <h2>How we use information</h2>
      <ul>
        <li>To provide, operate, and maintain the service.</li>
        <li>To authenticate you and secure your account.</li>
        <li>
          To read the content you submit and generate answers for your widget.
        </li>
        <li>To enforce usage limits and prevent abuse and fraud.</li>
        <li>To process payments and manage subscriptions.</li>
        <li>To provide support and respond to your requests.</li>
        <li>To comply with legal obligations.</li>
      </ul>

      <h2>Google user data</h2>
      <p>
        When you choose &ldquo;Continue with Google,&rdquo; we receive basic
        profile information from your Google Account &mdash; your name, email
        address, and profile picture. We use this information solely to create
        and authenticate your Bleviq account and to identify you within the
        service. We do not use it for advertising, and we do not request access
        to Gmail, Drive, or any other Google service.
      </p>
      <p>
        Bleviq&rsquo;s use and transfer of information received from Google APIs
        adheres to the{" "}
        <a
          href="https://developers.google.com/terms/api-services-user-data-policy"
          target="_blank"
          rel="noopener noreferrer"
        >
          Google API Services User Data Policy
        </a>
        , including the Limited Use requirements.
      </p>

      <h2>How information is shared</h2>
      <p>
        We do not sell personal information. We share information with service
        providers who process it on our behalf to run Bleviq:
      </p>
      <ul>
        <li>
          <strong>Supabase</strong> &mdash; database, authentication, and data
          storage.
        </li>
        <li>
          <strong>Vercel</strong> &mdash; application hosting and delivery.
        </li>
        <li>
          <strong>OpenAI</strong> &mdash; to turn your content into a searchable
          index and to generate the assistant&rsquo;s replies. Relevant content
          and visitor questions are sent to OpenAI&rsquo;s API to produce
          answers.
        </li>
        <li>
          <strong>Stripe</strong> &mdash; payment processing and subscription
          management.
        </li>
        <li>
          <strong>Google</strong> &mdash; sign-in, when you choose it.
        </li>
      </ul>
      <p>
        We may also disclose information if required by law, to enforce our
        agreements, to protect the rights and safety of Bleviq or others, or in
        connection with a merger, acquisition, or sale of assets.
      </p>

      <h2>Your content and AI-generated answers</h2>
      <p>
        The assistant generates answers based on the content a customer trains
        it on. Customers are responsible for the content they provide and for
        what their assistant tells visitors. Automated answers may be incomplete
        or incorrect and should not be relied on as professional advice.
      </p>

      <h2>Data retention</h2>
      <p>
        We keep account information and trained content for as long as your
        account is active. Visitor conversations are retained to operate the
        service and are automatically deleted about 90 days after a
        conversation&rsquo;s last activity.
      </p>
      <p>
        You can delete content you have added at any time. You can also
        permanently delete your entire account from your account settings, which
        cancels any active subscription and removes your account, trained
        content, conversations, and associated data. You may also request
        deletion by contacting us.
      </p>
      <p>
        After deletion, we may retain limited records as required for legal,
        accounting, tax, or security purposes. Payment and transaction records
        are held by our payment processor, Stripe, in line with its own
        retention obligations.
      </p>

      <h2>Security</h2>
      <p>
        We protect information with measures including encryption in transit,
        access controls, database row-level security, and hashed credentials. No
        method of transmission or storage is completely secure, so we cannot
        guarantee absolute security.
      </p>

      <h2>International users</h2>
      <p>
        Bleviq is operated from the United States, and information is processed
        and stored in the United States. By using the service, you understand
        your information may be processed there.
      </p>

      <h2>Children&rsquo;s privacy</h2>
      <p>
        Bleviq is not directed to children under 13, and we do not knowingly
        collect personal information from them. If you believe a child has
        provided us information, please contact us and we will delete it.
      </p>

      <h2>Your rights and choices</h2>
      <p>
        Depending on where you live, you may have the right to access, correct,
        or delete your personal information, or to object to or restrict certain
        processing. California residents have rights under the CCPA/CPRA,
        including the right to know what we collect and to request deletion, and
        the right not to be discriminated against for exercising those rights.
        To make a request, email us at the address below.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We may update this policy from time to time. When we do, we will revise
        the &ldquo;Last updated&rdquo; date above. Material changes will be made
        clear through the service.
      </p>

      <h2>Contact us</h2>
      <p>
        Questions about this policy or your information? Email{" "}
        <a href="mailto:johnnyla@mrla-media.com">johnnyla@mrla-media.com</a>. Bleviq is
        operated by MRLA Media LLC, Los Angeles, California, USA.
      </p>
    </LegalShell>
  );
}
