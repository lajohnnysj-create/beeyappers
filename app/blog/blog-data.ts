// Single source of truth for the Bleviq blog. Articles are typed data (a small
// block model) rendered by app/blog/[slug]/page.tsx, mirroring the Use Cases
// pattern. No MDX. All content here is original.

export type Span = string | { text: string; href: string };

export type Block =
  | { type: "p"; text: string }
  | { type: "plinks"; spans: Span[] } // a paragraph that contains inline links
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "callout"; text: string }
  | { type: "quote"; text: string };

export type CategoryKey =
  | "guides"
  | "comparisons"
  | "customer-service"
  | "growth";

export type Category = {
  key: CategoryKey;
  label: string;
  blurb: string;
};

export const CATEGORIES: Category[] = [
  {
    key: "guides",
    label: "Guides",
    blurb: "Step-by-step help for setting up and training your chatbot.",
  },
  {
    key: "comparisons",
    label: "Comparisons",
    blurb: "Figure out which approach fits your site and your team.",
  },
  {
    key: "customer-service",
    label: "Customer Service",
    blurb: "Answer more questions, faster, without growing your team.",
  },
  {
    key: "growth",
    label: "Growth",
    blurb: "Turn the traffic you already have into leads and customers.",
  },
];

export function categoryLabel(key: CategoryKey): string {
  return CATEGORIES.find((c) => c.key === key)?.label ?? "Article";
}

export type Post = {
  slug: string;
  title: string;
  category: CategoryKey;
  author: string;
  date: string; // ISO yyyy-mm-dd
  readingTime: number; // minutes
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  body: Block[];
};

const AUTHOR = "The Bleviq Team";

export const POSTS: Post[] = [
  {
    slug: "what-is-a-rag-chatbot",
    title: "What is a RAG chatbot, and why it answers better than a scripted bot",
    category: "guides",
    author: AUTHOR,
    date: "2026-06-15",
    readingTime: 8,
    excerpt:
      "RAG chatbots read your real content before they answer, so they sound like your business instead of a generic FAQ tree. Here is how that works in plain terms.",
    metaTitle: "What Is a RAG Chatbot? A Plain-English Guide | Bleviq",
    metaDescription:
      "A RAG chatbot retrieves your real website content before answering, so it stays accurate and on-brand. Learn how retrieval-augmented generation works and why it beats scripted bots.",
    body: [
      {
        type: "p",
        text: "RAG stands for retrieval-augmented generation. It sounds technical, but the idea is simple: before the chatbot writes an answer, it looks up the most relevant pieces of your own content, then writes its reply based on what it found. The retrieval step is what keeps the answer grounded in your business instead of in whatever the model happened to learn during training.",
      },
      {
        type: "h2",
        text: "The problem RAG solves",
      },
      {
        type: "p",
        text: "A plain language model is confident and fluent, but it does not know your return policy, your hours, or the name of your flagship product. Ask it a specific question about your business and it will either guess or politely refuse. Neither is useful on a website where a visitor wants a real answer right now.",
      },
      {
        type: "p",
        text: "A scripted bot has the opposite problem. It only knows the exact questions someone programmed into it. Step outside that script and it falls back to 'I did not understand that,' which is the fastest way to lose a visitor's trust.",
      },
      {
        type: "h2",
        text: "How retrieval changes the answer",
      },
      {
        type: "p",
        text: "RAG sits in between. When a visitor asks a question, the system searches your indexed content for the passages most likely to contain the answer, hands those passages to the model, and asks it to respond using that material. The model still writes naturally, but it is answering from your words, not from memory.",
      },
      {
        type: "ul",
        items: [
          "The visitor asks a question in their own words.",
          "The system finds the most relevant chunks of your content.",
          "The model writes a natural answer grounded in those chunks.",
          "If nothing relevant is found, a good system says so instead of inventing an answer.",
        ],
      },
      {
        type: "callout",
        text: "The short version: a scripted bot knows only what it was told to say. A RAG chatbot can answer anything your content covers, in language that sounds like you.",
      },
      {
        type: "h2",
        text: "Why this matters for accuracy",
      },
      {
        type: "p",
        text: "Because the answer is built from retrieved passages, you can usually trace where it came from. That makes a RAG chatbot far less likely to make things up, and it means the bot improves the moment you improve your content. Add a clear shipping page and the bot can suddenly answer shipping questions well, no retraining of the underlying model required.",
      },
      {
        type: "plinks",
        spans: [
          "This is exactly how Bleviq works. You point it at your site, it reads and indexes your pages, and it answers visitors from that material. If you want to see the setup, our ",
          { text: "guide to adding a chatbot without code", href: "/blog/add-ai-chatbot-without-code" },
          " walks through it, and the ",
          { text: "use cases", href: "/use-cases" },
          " pages show what it looks like for different kinds of businesses.",
        ],
      },
      {
        type: "h2",
        text: "When a scripted bot is still fine",
      },
      {
        type: "p",
        text: "If your visitors only ever ask two or three predictable questions, a simple scripted flow can be enough. But most sites field a long tail of specific questions, and that is where retrieval earns its keep. For a deeper comparison, it helps to look at the two side by side.",
      },
      {
        type: "plinks",
        spans: [
          "We cover that in ",
          { text: "scripted bots vs AI chatbots", href: "/blog/scripted-bots-vs-ai-chatbots" },
          ".",
        ],
      },
    ],
  },

  {
    slug: "add-ai-chatbot-without-code",
    title: "How to add an AI chatbot to your website without code",
    category: "guides",
    author: AUTHOR,
    date: "2026-06-10",
    readingTime: 6,
    excerpt:
      "You do not need a developer to put a working AI chatbot on your site. Here is the no-code path, from training to a single embed line.",
    metaTitle: "How to Add an AI Chatbot to Your Website (No Code) | Bleviq",
    metaDescription:
      "Add an AI chatbot to any website without writing code. Train it on your pages, customize it, and embed it with one line. A clear step-by-step walkthrough.",
    body: [
      {
        type: "p",
        text: "Adding a chatbot used to mean a developer, an API key, and a weekend. It does not anymore. With a modern tool you can have a working assistant on your site in an afternoon, and the only thing you paste into your website is a single line of code.",
      },
      {
        type: "h2",
        text: "Step 1: Point it at your website",
      },
      {
        type: "p",
        text: "The first step is training, which sounds harder than it is. You give the tool your website address and it reads your public pages, your services, your about page, your FAQ, and turns them into something the chatbot can search. You are not writing answers by hand. You are letting it learn from content you already wrote.",
      },
      {
        type: "h2",
        text: "Step 2: Fill the gaps",
      },
      {
        type: "p",
        text: "Sometimes the answer a visitor wants is not written down anywhere on your site. Maybe your hours live in your head, or your refund window was only ever in an email. Add those as short notes or FAQ entries so the bot has them. Think of this as teaching it the handful of things your website forgot to mention.",
      },
      {
        type: "h2",
        text: "Step 3: Make it look like you",
      },
      {
        type: "ul",
        items: [
          "Set the accent color to match your brand.",
          "Write a friendly first greeting in your own voice.",
          "Choose where the chat bubble sits on the page.",
        ],
      },
      {
        type: "h2",
        text: "Step 4: Drop in one line",
      },
      {
        type: "p",
        text: "The final step is the embed. You copy a single script tag and paste it into your site, the same way you would add an analytics snippet. Most website builders have a spot for this in their settings, so even that step is usually no-code.",
      },
      {
        type: "callout",
        text: "If you can paste a tracking pixel, you can install a chatbot. That is genuinely the whole technical requirement.",
      },
      {
        type: "plinks",
        spans: [
          "Before you publish, it helps to walk through a quick ",
          { text: "setup checklist", href: "/blog/chatbot-setup-checklist" },
          " so the first visitor gets a good experience. And if you are curious what is happening under the hood when it answers, see ",
          { text: "what a RAG chatbot is", href: "/blog/what-is-a-rag-chatbot" },
          ".",
        ],
      },
      {
        type: "p",
        text: "That is the no-code path start to finish: train on your pages, add the few things your site does not say, style it, and embed. You can start free and have it answering real visitors the same day.",
      },
    ],
  },

  {
    slug: "turn-visitors-into-leads",
    title: "Turn website visitors into leads with a chatbot that qualifies them",
    category: "growth",
    author: AUTHOR,
    date: "2026-06-03",
    readingTime: 7,
    excerpt:
      "Most visitors leave without ever telling you who they are. A chatbot can start the conversation, answer the real question, and capture the lead at the right moment.",
    metaTitle: "Turn Website Visitors Into Leads With an AI Chatbot | Bleviq",
    metaDescription:
      "A chatbot can answer a visitor's question and capture their details at the right moment, turning anonymous traffic into qualified leads. Here is how to set it up well.",
    body: [
      {
        type: "p",
        text: "Most of the people who visit your site never raise their hand. They read a page or two, do not find exactly what they need, and leave. You paid to get them there, and they left as a stranger. A chatbot's quiet superpower is that it gives those visitors a low-pressure way to start a conversation.",
      },
      {
        type: "h2",
        text: "Answer first, ask second",
      },
      {
        type: "p",
        text: "The mistake most lead forms make is asking for an email before giving any value. A chatbot can flip that. It answers the visitor's real question first, builds a little trust, and only then offers to follow up. By the time it asks for a name and email, the visitor actually wants the next step.",
      },
      {
        type: "quote",
        text: "People give you their details when they feel helped, not when they feel interrogated.",
      },
      {
        type: "h2",
        text: "Capture at the right moment",
      },
      {
        type: "p",
        text: "The right moment is usually when the visitor signals intent: they ask about pricing, availability, or how to get started. That is the cue to gently offer to connect them with a person or send more detail. A good chatbot recognizes those moments instead of popping a form on every page load.",
      },
      {
        type: "ul",
        items: [
          "A visitor asks about your services and gets a clear answer.",
          "They ask what it would cost for their situation.",
          "The bot offers to have someone follow up and collects their email.",
          "You wake up to a qualified lead with context attached.",
        ],
      },
      {
        type: "callout",
        text: "A captured lead with the question they asked is worth far more than a bare email address. You already know what they want.",
      },
      {
        type: "plinks",
        spans: [
          "This works best alongside fast, accurate answers, which is why it pairs naturally with reducing bounce. See ",
          { text: "how instant answers lower your bounce rate", href: "/blog/lower-bounce-rate-instant-answers" },
          ", and if lead capture is your main goal, the ",
          { text: "lead generation use case", href: "/use-cases/lead-generation" },
          " goes deeper.",
        ],
      },
      {
        type: "p",
        text: "You are not trying to trick anyone into a form. You are making it easy for an interested visitor to take the next step at the exact moment they want to, instead of hunting for a contact page and giving up.",
      },
    ],
  },

  {
    slug: "scripted-bots-vs-ai-chatbots",
    title: "Scripted bots vs AI chatbots: which one your site actually needs",
    category: "comparisons",
    author: AUTHOR,
    date: "2026-05-27",
    readingTime: 7,
    excerpt:
      "Button-based bots and AI chatbots solve different problems. Here is how to tell which one fits your site, and when a simple flow is genuinely enough.",
    metaTitle: "Scripted Bots vs AI Chatbots: Which Do You Need? | Bleviq",
    metaDescription:
      "Scripted bots follow fixed menus; AI chatbots answer freely from your content. Compare the two honestly and decide which fits your website and your visitors.",
    body: [
      {
        type: "p",
        text: "Not every chatbot is the same, and the marketing rarely makes the difference clear. The honest split is between scripted bots, which follow a fixed set of buttons and rules, and AI chatbots, which understand a question and answer from your content. Each is good at a different job.",
      },
      {
        type: "h2",
        text: "What a scripted bot does well",
      },
      {
        type: "p",
        text: "A scripted bot is predictable. You decide every path, so it never says anything surprising. That is genuinely valuable for narrow tasks: routing someone to the right department, collecting a few fixed fields, or walking through a known checklist. If your visitors only need one of three things, buttons can be cleaner than a chat box.",
      },
      {
        type: "h2",
        text: "Where scripted bots fall apart",
      },
      {
        type: "p",
        text: "The trouble starts the moment a visitor asks something off-script. Real people do not phrase questions the way your menu expects. They ask about the thing you did not anticipate, and a scripted bot can only shrug. Every dead end is a small erosion of trust.",
      },
      {
        type: "h2",
        text: "What an AI chatbot does differently",
      },
      {
        type: "p",
        text: "An AI chatbot reads the question in plain language and answers from your actual content, so it handles the long tail of phrasings and topics a script never could. The trade-off is that it needs good source material and a little oversight, because it is generating answers rather than reading from a fixed list.",
      },
      {
        type: "ul",
        items: [
          "Choose a scripted bot for a few fixed, repetitive tasks.",
          "Choose an AI chatbot when visitors ask varied, specific questions.",
          "Many sites do best letting an AI chatbot handle questions and a simple flow handle routing.",
        ],
      },
      {
        type: "plinks",
        spans: [
          "If you want to understand the technology behind the AI side, read ",
          { text: "what a RAG chatbot is", href: "/blog/what-is-a-rag-chatbot" },
          ". And if your real question is AI chatbot versus a human on live chat, we compare those in ",
          { text: "AI chatbot vs live chat", href: "/blog/ai-chatbot-vs-live-chat" },
          ".",
        ],
      },
      {
        type: "callout",
        text: "Rule of thumb: if you can list every question your visitors will ever ask, a script is fine. If you cannot, you want an AI chatbot.",
      },
    ],
  },

  {
    slug: "train-chatbot-on-your-website",
    title: "How to train a chatbot on your own website content",
    category: "guides",
    author: AUTHOR,
    date: "2026-05-20",
    readingTime: 6,
    excerpt:
      "A chatbot is only as good as what it learns from. Here is how training on your website works, and how to get clean, accurate answers from day one.",
    metaTitle: "How to Train a Chatbot on Your Website Content | Bleviq",
    metaDescription:
      "Training a chatbot on your website means indexing your real pages so it answers from your content. Learn how it works and how to get accurate answers.",
    body: [
      {
        type: "p",
        text: "When people say they 'trained' a chatbot on their website, they usually do not mean retraining an AI model. They mean indexing: the tool reads your pages, breaks them into searchable pieces, and stores them so the bot can pull the right passage when a question comes in. Understanding that distinction makes the whole process less mysterious.",
      },
      {
        type: "h2",
        text: "What gets indexed",
      },
      {
        type: "p",
        text: "Typically your public pages: services, about, FAQ, pricing, contact details, and any help or documentation pages. The cleaner and more complete those pages are, the better the answers. The bot cannot tell a visitor something your site never says.",
      },
      {
        type: "h2",
        text: "Getting good answers from the start",
      },
      {
        type: "ul",
        items: [
          "Make sure your key facts actually live on a page, not just in your head.",
          "Use plain headings so the important sections are easy to find.",
          "Add an FAQ for the questions visitors ask that are not covered elsewhere.",
          "Re-train after you publish meaningful changes so the bot stays current.",
        ],
      },
      {
        type: "callout",
        text: "Improving your chatbot is mostly improving your content. That is good news, because better content helps your human visitors too.",
      },
      {
        type: "h2",
        text: "When a page is missing",
      },
      {
        type: "p",
        text: "If visitors keep asking something your site does not cover, you have two options: add it to a page, or add it as a short FAQ note for the bot. Both work. The first also helps your search ranking and your human readers, so it is usually the better long-term move.",
      },
      {
        type: "plinks",
        spans: [
          "Once your content is in shape, putting the bot live is quick. Our ",
          { text: "no-code setup guide", href: "/blog/add-ai-chatbot-without-code" },
          " covers the embed step, and the ",
          { text: "setup checklist", href: "/blog/chatbot-setup-checklist" },
          " makes sure nothing is missed before launch.",
        ],
      },
    ],
  },

  {
    slug: "reduce-support-ticket-volume",
    title: "How an AI chatbot cuts your support ticket volume",
    category: "customer-service",
    author: AUTHOR,
    date: "2026-05-13",
    readingTime: 6,
    excerpt:
      "A large share of support tickets are the same handful of questions asked over and over. A chatbot can handle those instantly and leave your team the hard ones.",
    metaTitle: "How an AI Chatbot Reduces Support Ticket Volume | Bleviq",
    metaDescription:
      "Most support tickets are repeat questions. An AI chatbot answers those instantly so your team can focus on the complex cases. Here is how to deflect tickets well.",
    body: [
      {
        type: "p",
        text: "If you look at a week of support tickets, a pattern jumps out fast: a big chunk of them are the same questions. Where is my order, what are your hours, do you offer this, how do I cancel. Each one is quick to answer and easy to automate, and together they eat a surprising amount of your team's day.",
      },
      {
        type: "h2",
        text: "Deflection done right",
      },
      {
        type: "p",
        text: "Deflection has a bad reputation because it is often done badly: a wall of help articles, or a bot that loops without ever solving anything. Done right, it means a visitor gets a direct, correct answer in seconds and never needs to open a ticket at all. The goal is a resolved question, not an avoided one.",
      },
      {
        type: "quote",
        text: "The best support ticket is the one that never had to be created, because the answer was already one message away.",
      },
      {
        type: "h2",
        text: "What to automate, and what not to",
      },
      {
        type: "ul",
        items: [
          "Automate the repeat, factual questions your content already answers.",
          "Let the bot hand off cleanly when a question needs a human.",
          "Keep account-specific or sensitive issues with your team.",
        ],
      },
      {
        type: "p",
        text: "A good chatbot knows its limits. When it cannot answer, it should offer to pass the visitor to a person rather than guess. That handoff is what makes customers comfortable using it for the easy stuff.",
      },
      {
        type: "plinks",
        spans: [
          "The same setup also means coverage outside business hours, which we cover in ",
          { text: "answering questions 24/7", href: "/blog/answer-customer-questions-24-7" },
          ". For a support-focused rollout, the ",
          { text: "customer support use case", href: "/use-cases/customer-support" },
          " has more detail.",
        ],
      },
      {
        type: "callout",
        text: "Aim to deflect the boring questions so your team has time for the ones that actually need a human. That is a better job for them and a faster answer for the customer.",
      },
    ],
  },

  {
    slug: "ai-chatbot-vs-live-chat",
    title: "AI chatbot vs live chat: when to use each, and when to use both",
    category: "comparisons",
    author: AUTHOR,
    date: "2026-05-06",
    readingTime: 7,
    excerpt:
      "Live chat and AI chatbots are not rivals. The strongest setups use a bot for instant answers and a human for the moments that need one.",
    metaTitle: "AI Chatbot vs Live Chat: When to Use Each | Bleviq",
    metaDescription:
      "AI chatbots give instant answers around the clock; live chat brings a human touch. Compare both and learn how to combine them for the best visitor experience.",
    body: [
      {
        type: "p",
        text: "It is tempting to frame this as a fight, but live chat and AI chatbots are good at different things, and the best customer experiences usually use both. The question is not which one wins. It is which one should answer first.",
      },
      {
        type: "h2",
        text: "What live chat is great at",
      },
      {
        type: "p",
        text: "A real person brings judgment, empathy, and the ability to handle messy, one-of-a-kind situations. For a frustrated customer, a high-value deal, or anything sensitive, nothing beats a human. The catch is that humans are not online at 2am, and they can only hold so many conversations at once.",
      },
      {
        type: "h2",
        text: "What an AI chatbot is great at",
      },
      {
        type: "p",
        text: "A chatbot answers instantly, never sleeps, and handles unlimited conversations at the same time. For the common, factual questions that make up most of your volume, it is faster than waiting for an agent and available whenever the visitor happens to show up.",
      },
      {
        type: "h2",
        text: "The combination most sites want",
      },
      {
        type: "ul",
        items: [
          "The chatbot answers first and resolves the routine questions instantly.",
          "When something needs a person, it hands off with the context already attached.",
          "Your team spends its time on conversations that actually need them.",
        ],
      },
      {
        type: "callout",
        text: "Let the bot take the volume and the hours your team cannot cover. Let your team take the moments that need a human. Nobody has to choose.",
      },
      {
        type: "plinks",
        spans: [
          "If you are deciding between an AI chatbot and a simpler button-based bot instead, see ",
          { text: "scripted bots vs AI chatbots", href: "/blog/scripted-bots-vs-ai-chatbots" },
          ". And for the round-the-clock angle specifically, read ",
          { text: "answering questions 24/7", href: "/blog/answer-customer-questions-24-7" },
          ".",
        ],
      },
    ],
  },

  {
    slug: "lower-bounce-rate-instant-answers",
    title: "Lower your bounce rate by giving visitors instant answers",
    category: "growth",
    author: AUTHOR,
    date: "2026-04-29",
    readingTime: 6,
    excerpt:
      "People leave when they cannot find what they came for. A chatbot answers the question that would have sent them to a competitor.",
    metaTitle: "Lower Your Bounce Rate With Instant Answers | Bleviq",
    metaDescription:
      "Visitors bounce when they cannot find an answer fast. A chatbot gives them an instant reply and a reason to stay. Here is how that improves engagement.",
    body: [
      {
        type: "p",
        text: "A high bounce rate is often just unanswered questions in disguise. Someone lands on your page, has a specific question, cannot find the answer in a few seconds, and leaves, frequently to a competitor who happened to make the answer easier to find. The visit was not wasted because your offer was wrong. It was wasted because the answer was buried.",
      },
      {
        type: "h2",
        text: "Why people leave",
      },
      {
        type: "p",
        text: "Visitors do not read websites top to bottom. They scan for the one thing they came for, and if it is not obvious, their patience runs out quickly. Your navigation might technically contain the answer three clicks deep, but three clicks is often two clicks too many.",
      },
      {
        type: "h2",
        text: "How a chatbot keeps them",
      },
      {
        type: "p",
        text: "A chat bubble turns 'go hunt for it' into 'just ask.' The visitor types the question in their own words and gets the answer without leaving the page they are on. That single interaction is often the difference between a bounce and a conversation.",
      },
      {
        type: "quote",
        text: "Every unanswered question on your site is a small exit sign. A chatbot quietly takes them down.",
      },
      {
        type: "ul",
        items: [
          "Answers arrive in seconds, on the page the visitor is already reading.",
          "No digging through menus or hunting for a contact form.",
          "An engaged visitor is a visitor you can still convert.",
        ],
      },
      {
        type: "plinks",
        spans: [
          "Keeping visitors on the page is the first step; the next is turning them into leads, which we cover in ",
          { text: "turning visitors into leads", href: "/blog/turn-visitors-into-leads" },
          ".",
        ],
      },
    ],
  },

  {
    slug: "ai-chatbots-for-online-stores",
    title: "AI chatbots for online stores: handling product and shipping questions",
    category: "growth",
    author: AUTHOR,
    date: "2026-04-22",
    readingTime: 7,
    excerpt:
      "Shoppers ask the same questions before they buy: sizing, materials, shipping, returns. A chatbot answers them in the moment, right where the decision happens.",
    metaTitle: "AI Chatbots for Online Stores: A Practical Guide | Bleviq",
    metaDescription:
      "Online shoppers hesitate over sizing, shipping, and returns. An AI chatbot answers those questions instantly so buyers do not bounce. Here is how to set it up.",
    body: [
      {
        type: "p",
        text: "Online shopping is full of small hesitations. Will this fit, what is it made of, how long is shipping, can I return it if I am wrong. Each unanswered hesitation is a chance for the shopper to close the tab. A chatbot answers those questions in the moment, right where the decision is being made.",
      },
      {
        type: "h2",
        text: "The questions that stall a purchase",
      },
      {
        type: "ul",
        items: [
          "Sizing and fit, especially for clothing and footwear.",
          "Materials, ingredients, or specifications.",
          "Shipping times, costs, and where you ship.",
          "Return and exchange policy.",
        ],
      },
      {
        type: "p",
        text: "None of these are hard to answer. They are just hard to find when they are scattered across product pages, a shipping page, and a returns policy three clicks away. A chatbot trained on all of that content pulls the right answer into one quick reply.",
      },
      {
        type: "callout",
        text: "Most abandoned carts are not price objections. They are unanswered questions the shopper gave up trying to find.",
      },
      {
        type: "h2",
        text: "Answer from your real policies",
      },
      {
        type: "p",
        text: "The key is that the bot answers from your actual shipping and returns content, not from generic guesses. When it says you offer free returns within thirty days, that should be because your returns page says so. Keep those pages accurate and the bot stays accurate with them.",
      },
      {
        type: "plinks",
        spans: [
          "For the retail angle in more depth, see the ",
          { text: "ecommerce use case", href: "/use-cases/ecommerce" },
          ". And to understand why the bot can answer from your pages rather than guessing, read ",
          { text: "what a RAG chatbot is", href: "/blog/what-is-a-rag-chatbot" },
          ".",
        ],
      },
    ],
  },

  {
    slug: "answer-customer-questions-24-7",
    title: "Answering customer questions 24/7 without hiring a night shift",
    category: "customer-service",
    author: AUTHOR,
    date: "2026-04-15",
    readingTime: 6,
    excerpt:
      "Your visitors do not all show up during business hours. A chatbot covers the nights, weekends, and time zones your team cannot.",
    metaTitle: "Answer Customer Questions 24/7 With an AI Chatbot | Bleviq",
    metaDescription:
      "Visitors arrive at all hours. An AI chatbot answers their questions around the clock without a night shift, so you never miss a late-night customer.",
    body: [
      {
        type: "p",
        text: "Your website does not keep business hours, but your team does. Someone lands on your site at 11pm with a question, finds no way to get it answered, and is gone by morning. Multiply that across nights, weekends, and time zones and it adds up to a lot of quiet, invisible lost interest.",
      },
      {
        type: "h2",
        text: "The after-hours gap",
      },
      {
        type: "p",
        text: "Hiring around the clock is expensive and rarely justified for the volume most sites get overnight. So the after-hours question usually goes unanswered, or sits in an inbox until someone gets in the next day, by which point the visitor has often moved on.",
      },
      {
        type: "h2",
        text: "What a chatbot covers",
      },
      {
        type: "p",
        text: "A chatbot fills exactly that gap. It answers the common questions instantly at any hour, and for anything it cannot handle, it can take a message or capture contact details so your team can follow up first thing. The visitor gets help now, and you get the lead instead of losing it.",
      },
      {
        type: "ul",
        items: [
          "Instant answers at midnight, on weekends, and across time zones.",
          "A clean way to capture questions it cannot answer for human follow-up.",
          "No overnight staffing cost to make it happen.",
        ],
      },
      {
        type: "plinks",
        spans: [
          "Round-the-clock coverage pairs naturally with cutting repetitive tickets, which we cover in ",
          { text: "reducing support ticket volume", href: "/blog/reduce-support-ticket-volume" },
          ".",
        ],
      },
      {
        type: "callout",
        text: "You do not need a night shift. You need the routine questions answered while your team sleeps, and a way to catch the rest.",
      },
    ],
  },

  {
    slug: "ai-chatbots-for-small-businesses",
    title: "AI chatbots for small businesses: a practical starter guide",
    category: "growth",
    author: AUTHOR,
    date: "2026-04-08",
    readingTime: 6,
    excerpt:
      "You do not need a big team or budget to use a chatbot well. Here is a grounded starting point for a small business that wants real results.",
    metaTitle: "AI Chatbots for Small Businesses: Starter Guide | Bleviq",
    metaDescription:
      "A practical guide to using an AI chatbot as a small business: what it helps with, what to expect, and how to start without a big budget or team.",
    body: [
      {
        type: "p",
        text: "A lot of chatbot advice is written for companies with a support department and a marketing team. Most businesses do not have either. The good news is that a chatbot is arguably more useful when you are small, because it covers the hours and questions you simply cannot get to yourself.",
      },
      {
        type: "h2",
        text: "Where it helps most when you are small",
      },
      {
        type: "ul",
        items: [
          "Answering the same handful of questions so you stop repeating yourself.",
          "Covering evenings and weekends when you are not at your desk.",
          "Catching interested visitors who would otherwise leave without a word.",
        ],
      },
      {
        type: "p",
        text: "You are not trying to replace yourself. You are trying to stop losing the easy questions and the after-hours visitors while you focus on the work only you can do.",
      },
      {
        type: "h2",
        text: "What to expect realistically",
      },
      {
        type: "p",
        text: "A chatbot will not close every sale or answer every odd question perfectly. What it will do reliably is handle the common stuff well and hand off the rest. Set that expectation and it becomes a genuinely useful member of the team rather than a disappointment.",
      },
      {
        type: "callout",
        text: "Start small: train it on the pages you have, watch the first real conversations, and add answers for the gaps you spot. It compounds quickly.",
      },
      {
        type: "plinks",
        spans: [
          "The fastest way in is the ",
          { text: "no-code setup guide", href: "/blog/add-ai-chatbot-without-code" },
          ", and the ",
          { text: "small business use case", href: "/use-cases/small-business" },
          " shows what it looks like in practice. You can start on a free plan and upgrade only if you outgrow it.",
        ],
      },
    ],
  },

  {
    slug: "chatbot-setup-checklist",
    title: "A simple chatbot setup checklist: from install to first conversation",
    category: "guides",
    author: AUTHOR,
    date: "2026-04-01",
    readingTime: 5,
    excerpt:
      "A short, practical checklist to run through before your chatbot meets a real visitor, so the first conversation goes well.",
    metaTitle: "Chatbot Setup Checklist: From Install to Live | Bleviq",
    metaDescription:
      "A practical checklist for launching your chatbot: train it, fill the gaps, style it, test it, and embed it. Make sure the first visitor has a great experience.",
    body: [
      {
        type: "p",
        text: "Putting a chatbot live takes minutes, but a few small checks beforehand make the difference between a polished first impression and an awkward one. Here is a short list to run through before a real visitor ever opens the chat.",
      },
      {
        type: "h2",
        text: "Before you embed",
      },
      {
        type: "ul",
        items: [
          "Train it on your current pages, not an old version of your site.",
          "Add FAQ notes for anything your pages do not clearly state.",
          "Set a greeting that sounds like you and sets the right expectation.",
          "Match the accent color and placement to your brand.",
        ],
      },
      {
        type: "h2",
        text: "Test like a visitor",
      },
      {
        type: "p",
        text: "Before launch, ask it the five questions your customers actually ask most. Then ask one it should not know the answer to, and confirm it says so gracefully instead of guessing. That second test matters as much as the first.",
      },
      {
        type: "callout",
        text: "A bot that admits 'I am not sure, let me connect you' earns more trust than one that confidently makes something up.",
      },
      {
        type: "h2",
        text: "After it is live",
      },
      {
        type: "p",
        text: "Check the early conversations. They are the best possible to-do list: every question it fumbled is a page or FAQ entry to improve. A little tuning in the first week pays off for months.",
      },
      {
        type: "plinks",
        spans: [
          "If you have not installed it yet, start with the ",
          { text: "no-code setup guide", href: "/blog/add-ai-chatbot-without-code" },
          ", and for cleaner answers, see ",
          { text: "how to train a chatbot on your website", href: "/blog/train-chatbot-on-your-website" },
          ".",
        ],
      },
    ],
  },
];

// Newest first.
export const POSTS_BY_DATE: Post[] = [...POSTS].sort((a, b) =>
  a.date < b.date ? 1 : a.date > b.date ? -1 : 0
);

export function getPost(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug);
}

export function postsInCategory(key: CategoryKey): Post[] {
  return POSTS_BY_DATE.filter((p) => p.category === key);
}

export function relatedPosts(post: Post, limit = 3): Post[] {
  const sameCat = POSTS_BY_DATE.filter(
    (p) => p.slug !== post.slug && p.category === post.category
  );
  const others = POSTS_BY_DATE.filter(
    (p) => p.slug !== post.slug && p.category !== post.category
  );
  return [...sameCat, ...others].slice(0, limit);
}

export function formatDate(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Each post's header/card image lives at /public/blog/<slug>.webp.
export function postImage(post: Post): string {
  return `/blog/${post.slug}.webp`;
}
