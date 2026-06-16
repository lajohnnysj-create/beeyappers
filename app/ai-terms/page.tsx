import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { LegalShell } from "@/app/legal-shell";

export const metadata: Metadata = {
  title: "AI Terms of Use | Bleviq",
  description:
    "Terms governing Bleviq's AI chat assistant: training, generated answers, and your responsibilities.",
};

export default async function AiTermsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <LegalShell
      signedIn={!!user}
      title="AI Terms of Use"
      updated="June 16, 2026"
    >
      <p>
        These AI Terms of Use (&ldquo;AI Terms&rdquo;) govern your use of the AI
        features of Bleviq, a product of <strong>MRLA Media LLC</strong>
        (&ldquo;Bleviq,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or
        &ldquo;our&rdquo;). They supplement, and are part of, our{" "}
        <a href="/terms">Terms of Service</a> and should be read together with
        our <a href="/privacy">Privacy Policy</a>. If anything here conflicts
        with the Terms of Service on an AI-specific matter, these AI Terms
        control.
      </p>
      <p>
        By creating, training, or interacting with a Bleviq assistant, you agree
        to these AI Terms. If you don&rsquo;t agree, don&rsquo;t use the AI
        features. By interacting with a Bleviq assistant, you also understand
        that the conversation is processed and stored so we can provide the
        service.
      </p>

      <h2>1. Definitions</h2>
      <ul>
        <li>
          <strong>AI Features</strong> means Bleviq&rsquo;s AI chat assistant and
          the related training, indexing, retrieval, and answer-generation
          functionality.
        </li>
        <li>
          <strong>Input</strong> means the content you provide to train or
          configure an assistant (such as website content, FAQs, and documents)
          and the messages your visitors send to the assistant.
        </li>
        <li>
          <strong>Output</strong> means the answers and other content the AI
          generates in response to Input.
        </li>
        <li>
          <strong>Providers</strong> means the third-party AI and infrastructure
          services we use to deliver the AI Features, such as OpenAI.
        </li>
      </ul>

      <h2>2. Agreement to these AI Terms</h2>
      <p>
        By using the AI Features, you represent that you have read, understood,
        and agree to these AI Terms, and that you are of legal age to do so. If
        you use the AI Features on behalf of a company or other organization, you
        represent that you have authority to bind that organization to these AI
        Terms.
      </p>

      <h2>3. Input and Output</h2>
      <ul>
        <li>
          You are responsible for your Input and represent that you have the
          rights necessary to provide it to us and to have it processed.
        </li>
        <li>
          You grant us a license to host and process your Input as needed to
          provide and maintain the AI Features for you.
        </li>
        <li>
          We do not use your Input to train our own AI models. To generate
          answers, your Input is processed by our Providers under their terms.
          Provider handling of data is governed by their policies, which you
          should review before submitting sensitive information.
        </li>
        <li>
          You may use Output for lawful purposes. You may not resell, license, or
          redistribute the AI Features, or Output, as your own product or service
          without our prior written consent.
        </li>
        <li>
          You are responsible for the answers your assistant gives to your
          visitors.
        </li>
      </ul>

      <h2>4. Acknowledgements</h2>
      <p>By using the AI Features, you understand and agree that:</p>
      <ul>
        <li>
          The assistant is artificial intelligence, not a human, even where it
          is given a name, avatar, or human-like tone. You must not present it to
          your visitors in a way that deceptively implies they are speaking with
          a real person, and you should disclose that it is automated where the
          law requires.
        </li>
        <li>
          Output may be inaccurate, incomplete, outdated, or misleading. It is
          not professional advice, and you and your visitors should not rely on
          it as medical, legal, financial, or other professional advice.
        </li>
        <li>
          We use Providers to deliver the AI Features. Providers process Input
          and Output, possibly in locations different from where your other data
          is stored, and by using the AI Features you consent to this.
        </li>
        <li>
          The specific AI models and Providers we use may change at any time, at
          our discretion, including in response to performance, cost,
          availability, or market conditions. This may affect the behavior,
          quality, speed, or limits of the Output, and we do not guarantee that
          any particular model or Provider will be used.
        </li>
        <li>
          If your Input contains personal or sensitive data, that data may be
          processed by Providers. We take reasonable measures to protect it, as
          described in our <a href="/privacy">Privacy Policy</a>.
        </li>
        <li>
          You are solely responsible for the assistant you create and for how it
          behaves on your site.
        </li>
      </ul>

      <h2>5. Use restrictions</h2>
      <p>You agree that you will not:</p>
      <ul>
        <li>
          Use the AI Features in violation of any applicable law, or in a way
          that infringes anyone&rsquo;s privacy or intellectual property rights;
        </li>
        <li>
          Train an assistant on content you don&rsquo;t have the right to use;
        </li>
        <li>
          Use the AI Features to impersonate a person or to deceive visitors
          about whether they are interacting with a human or with automation;
        </li>
        <li>
          Generate or distribute unlawful, harmful, deceptive, or abusive
          content through an assistant;
        </li>
        <li>
          Exceed or attempt to circumvent the usage limits of your plan,
          including the number of AI replies measured over a rolling 30-day
          window;
        </li>
        <li>
          Reverse engineer, scrape, copy, resell, or otherwise exploit the AI
          Features except as expressly permitted.
        </li>
      </ul>
      <p>
        We may, at our discretion, disable or remove any assistant or limit
        access to the AI Features if we believe you or your assistant violate
        these AI Terms or create risk or legal exposure.
      </p>

      <h2>6. Data from your visitors</h2>
      <p>
        You are responsible for the information and data you collect from your
        visitors through your assistant, and for what you do with it. You
        authorize us to access and process Input, Output, and that data as needed
        to provide and support the AI Features, to protect our service and other
        users, and to meet our legal obligations. We do not sell personal
        information. See our <a href="/privacy">Privacy Policy</a> for details.
      </p>
      <p>
        If you collect personal data from your visitors through an assistant, you
        are responsible for providing the notices and obtaining the consents the
        law requires, including informing visitors that they are interacting with
        an automated assistant and how their messages are handled.
      </p>

      <h2>7. Term and termination</h2>
      <p>
        You may use the AI Features while your account and, where applicable, your
        subscription are active. We may suspend or terminate your access to the
        AI Features if you materially breach these AI Terms or the Terms of
        Service.
      </p>

      <h2>8. No warranties</h2>
      <p>
        The AI Features are provided &ldquo;as is&rdquo; and &ldquo;as
        available,&rdquo; without warranties of any kind, whether express or
        implied, including implied warranties of merchantability, fitness for a
        particular purpose, and non-infringement. We do not warrant that Output
        will be accurate or that the AI Features will be uninterrupted or
        error-free.
      </p>

      <h2>9. Limitation of liability</h2>
      <p>
        The limitation of liability in our{" "}
        <a href="/terms">Terms of Service</a> applies to your use of the AI
        Features. To the fullest extent permitted by law, we are not liable for
        any indirect, incidental, special, consequential, or punitive damages
        arising from the AI Features or any Output.
      </p>

      <h2>10. Refunds</h2>
      <p>
        Except where required by law, fees are non-refundable, as described in
        our <a href="/terms">Terms of Service</a>.
      </p>

      <h2>11. Changes and contact</h2>
      <p>
        We may update these AI Terms from time to time. When we do, we will
        revise the &ldquo;Last updated&rdquo; date above, and your continued use
        of the AI Features means you accept the changes. Questions? Email{" "}
        <a href="mailto:johnnyla@mrla-media.com">johnnyla@mrla-media.com</a>.
        Bleviq is operated by MRLA Media LLC, Los Angeles, California, USA.
      </p>
    </LegalShell>
  );
}
