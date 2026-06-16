import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { LegalShell } from "@/app/legal-shell";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Terms of Service | Bleviq AI Chatbot for Your Website",
  description:
    "Read the terms of service for Bleviq, the AI chatbot you train on your website to answer visitors. Covers accounts, billing, and acceptable use.",
  path: "/terms",
});

export default async function TermsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <LegalShell
      signedIn={!!user}
      title="Terms of Service"
      updated="June 16, 2026"
    >
      <p>
        These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and
        use of Bleviq, a product of <strong>MRLA Media LLC</strong>
        (&ldquo;Bleviq,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or
        &ldquo;our&rdquo;). By creating an account or using the service, you
        agree to these Terms. If you don&rsquo;t agree, don&rsquo;t use Bleviq.
      </p>

      <h2>The service</h2>
      <p>
        Bleviq lets you train an AI chat assistant on your website content and
        embed it as a chat widget on your site. The assistant generates answers
        automatically based on the content you provide.
      </p>

      <h2>Your account</h2>
      <p>
        You&rsquo;re responsible for the information you use to register, for
        keeping your login credentials secure, and for all activity under your
        account. Provide accurate information and keep it current. You must be at
        least 18 years old, or the age of majority where you live, to use
        Bleviq.
      </p>

      <h2>Plans, free trial, and billing</h2>
      <ul>
        <li>
          <strong>Free trial.</strong> Paid plans begin with a 14-day free
          trial. A payment method is required to start the trial. If you
          don&rsquo;t cancel before the trial ends, your subscription begins and
          your payment method is charged.
        </li>
        <li>
          <strong>Subscriptions.</strong> Plans are billed in advance on a
          monthly or annual basis and renew automatically until canceled.
          Payments are handled by Stripe.
        </li>
        <li>
          <strong>Cancellation.</strong> You can cancel anytime from your
          billing settings. Cancellation stops future renewals and takes effect
          at the end of the current billing period; you keep access until then.
        </li>
        <li>
          <strong>Usage limits.</strong> Each plan includes a number of AI
          replies measured over a rolling 30-day window. If you reach your
          limit, the widget may stop answering until usage falls below the cap
          or you upgrade.
        </li>
        <li>
          <strong>Refunds.</strong> Except where required by law, fees are
          non-refundable. The free trial is provided so you can evaluate the
          service before being charged.
        </li>
        <li>
          <strong>Price changes.</strong> We may change prices. We&rsquo;ll give
          you reasonable notice before a change affects your subscription.
        </li>
      </ul>

      <h2>Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Break any applicable law or regulation;</li>
        <li>
          Train the assistant on content you don&rsquo;t have the right to use,
          or that infringes someone else&rsquo;s rights;
        </li>
        <li>
          Upload or generate unlawful, harmful, deceptive, or abusive content;
        </li>
        <li>
          Use Bleviq to send spam or to harass, mislead, or harm others;
        </li>
        <li>
          Attempt to breach or circumvent our security, rate limits, or usage
          caps;
        </li>
        <li>
          Reverse engineer, scrape, or resell the service except as expressly
          permitted;
        </li>
        <li>
          Interfere with or place an unreasonable load on the service or its
          infrastructure.
        </li>
      </ul>

      <h2>Your content</h2>
      <p>
        You keep ownership of the website content, FAQs, documents, and other
        material you provide (&ldquo;Your Content&rdquo;). You grant us a
        worldwide, non-exclusive license to host, process, and use Your Content
        as needed to operate and provide the service to you. You represent that
        you have the rights to provide Your Content and to let us process it.
      </p>

      <h2>Your end users</h2>
      <p>
        You are responsible for your relationship with the visitors who use your
        widget, including providing them any notices or disclosures the law
        requires, such as informing them that they are interacting with an
        automated assistant and how their messages are handled. You are
        responsible for the answers your assistant gives on your site.
      </p>

      <h2>AI-generated answers</h2>
      <p>
        The assistant produces answers automatically and may sometimes be
        inaccurate, incomplete, or outdated. Bleviq does not guarantee the
        correctness of any answer, and answers are not professional advice. You
        are responsible for reviewing and curating how your assistant behaves.
      </p>
      <p>
        Bleviq relies on third-party AI models to generate answers, and we may
        change, add, or replace the underlying models or providers at any time,
        including in response to performance, cost, availability, or broader
        market conditions. As a result, the behavior, quality, speed, and limits
        of AI-generated answers may vary over time, and we do not guarantee that
        any particular model will be used.
      </p>

      <h2>Intellectual property</h2>
      <p>
        Bleviq, including the platform, software, and branding, is owned by MRLA
        Media LLC and protected by intellectual property laws. These Terms
        don&rsquo;t grant you any rights in Bleviq except the limited right to
        use the service. If you send us feedback or suggestions, we may use them
        without obligation to you.
      </p>

      <h2>Third-party services</h2>
      <p>
        Bleviq relies on third-party services, including Stripe, Google,
        Supabase, Vercel, and OpenAI. Your use of features that depend on them
        may also be subject to their terms, and we&rsquo;re not responsible for
        third-party services we don&rsquo;t control.
      </p>

      <h2>Availability and changes</h2>
      <p>
        We aim to keep Bleviq available and reliable, but we provide it on an
        &ldquo;as available&rdquo; basis and may modify, suspend, or discontinue
        features at any time. We may also update, retrain, or adjust the service
        to improve it.
      </p>

      <h2>Disclaimers</h2>
      <p>
        The service is provided &ldquo;as is&rdquo; and &ldquo;as
        available,&rdquo; without warranties of any kind, whether express or
        implied, including implied warranties of merchantability, fitness for a
        particular purpose, and non-infringement. We do not warrant that the
        service will be uninterrupted, error-free, or that answers will be
        accurate.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, MRLA Media LLC will not be
        liable for any indirect, incidental, special, consequential, or punitive
        damages, or for lost profits, revenues, data, or goodwill. Our total
        liability for any claim relating to the service is limited to the amount
        you paid us for the service in the 12 months before the event giving
        rise to the claim.
      </p>

      <h2>Indemnification</h2>
      <p>
        You agree to indemnify and hold harmless MRLA Media LLC from claims,
        damages, and expenses (including reasonable legal fees) arising out of
        Your Content, your use of the service, or your violation of these Terms
        or any law or third-party right.
      </p>

      <h2>Termination</h2>
      <p>
        You can stop using Bleviq and close your account at any time. We may
        suspend or terminate your access if you violate these Terms or use the
        service in a way that creates risk or legal exposure. On termination,
        your right to use the service ends, and we may delete your data subject
        to our retention practices and the Privacy Policy.
      </p>

      <h2>Governing law and disputes</h2>
      <p>
        These Terms are governed by the laws of the State of California, without
        regard to its conflict-of-laws rules. If we have a dispute, we&rsquo;ll
        first try to resolve it informally by contacting each other. Any dispute
        that isn&rsquo;t resolved informally will be subject to the exclusive
        jurisdiction of the state and federal courts located in Los Angeles
        County, California.
      </p>

      <h2>Changes to these Terms</h2>
      <p>
        We may update these Terms from time to time. When we do, we&rsquo;ll
        revise the &ldquo;Last updated&rdquo; date above. Your continued use of
        Bleviq after changes take effect means you accept the updated Terms.
      </p>

      <h2>Contact us</h2>
      <p>
        Questions about these Terms? Email{" "}
        <a href="mailto:johnnyla@mrla-media.com">johnnyla@mrla-media.com</a>. Bleviq is
        operated by MRLA Media LLC, Los Angeles, California, USA.
      </p>
    </LegalShell>
  );
}
