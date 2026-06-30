// Content for the Use Cases pages. Each entry is original Bleviq copy written
// for that industry: its own hero, the questions that industry's visitors
// actually ask, industry-framed benefits, and an industry FAQ. The page
// template (app/use-cases/[slug]/page.tsx) renders these.

export type UseCase = {
  slug: string;
  name: string; // dropdown + card label, e.g. "Dental Practices"
  icon: string; // key in app/use-cases/icons.tsx
  accent: string; // hex used for decorative icon tiles
  eyebrow: string; // hero pill, e.g. "For dental practices"
  audience: string; // plural noun for the questions heading, e.g. "patients"
  helps: string; // phrase for the benefits heading, e.g. "your practice"
  h1: string;
  metaTitle: string;
  metaDescription: string;
  subhead: string;
  intro: string;
  questions: string[];
  benefits: { title: string; body: string }[];
  faqs: { q: string; a: string }[];
  disclaimer?: string; // optional compliance/limitation notice (e.g. healthcare)
};

export const USE_CASES: UseCase[] = [
  {
    slug: "customer-support",
    name: "Customer Support",
    icon: "headset",
    accent: "#4f46e5",
    eyebrow: "For customer support",
    audience: "customers",
    helps: "your team",
    h1: "AI chatbot for customer support",
    metaTitle: "AI Chatbot for Customer Support | Bleviq",
    metaDescription:
      "Answer support questions 24/7 with an AI chatbot trained on your own website. Deflect repetitive tickets, capture leads, and get every chat emailed to your team. Free to start.",
    subhead:
      "Deflect the repetitive questions and let your team focus on the hard ones. Bleviq learns your help content and answers customers instantly, day or night.",
    intro:
      "Most support tickets are the same handful of questions. Bleviq answers them straight from your existing pages, so customers get help in seconds and your inbox gets quieter.",
    questions: [
      "How do I reset my password?",
      "What is your refund policy?",
      "How do I track my order?",
      "How do I cancel or change my plan?",
      "Do you offer support on weekends?",
      "How do I contact a real person?",
    ],
    benefits: [
      {
        title: "Answer the FAQ flood",
        body: "The repeat questions get handled instantly, so your team only sees tickets that truly need a human.",
      },
      {
        title: "Help around the clock",
        body: "Customers in any timezone get an answer at 2am without you staffing a night shift.",
      },
      {
        title: "Spot rising issues",
        body: "Every conversation lands in your inbox, so you can catch trends and fix your docs early.",
      },
      {
        title: "No retraining busywork",
        body: "Update a help article and the chatbot reflects it on its next crawl. There is no knowledge base to maintain by hand.",
      },
    ],
    faqs: [
      {
        q: "Where does the chatbot get its answers?",
        a: "From your own website and help content. Bleviq crawls your pages and answers from what it finds, so replies match your real policies.",
      },
      {
        q: "What happens with questions it cannot answer?",
        a: "When something is not covered on your site, it says so plainly instead of guessing, and you can add the missing detail to your pages.",
      },
      {
        q: "Will it replace my support team?",
        a: "No. It handles the repetitive questions so your team can focus on complex cases. It is a first line, not a replacement.",
      },
      {
        q: "How do I see what customers asked?",
        a: "Each conversation is emailed to you after it ends, so you have a record without logging into a dashboard.",
      },
      {
        q: "How long does setup take?",
        a: "A few minutes. Enter your URL, pick your colors, and paste one snippet into your site.",
      },
    ],
  },
  {
    slug: "lead-generation",
    name: "Lead Generation",
    icon: "funnel",
    accent: "#7c3aed",
    eyebrow: "For lead generation",
    audience: "visitors",
    helps: "you capture leads",
    h1: "AI chatbot for lead generation",
    metaTitle: "AI Chatbot for Lead Generation | Bleviq",
    metaDescription:
      "Turn website visitors into leads with an AI chatbot that answers questions and collects contact details automatically. Trained on your site. Free to start.",
    subhead:
      "Your visitors are already interested. Bleviq answers their questions and captures their name and email while the intent is hot.",
    intro:
      "A visitor with a question is a lead waiting to happen. Bleviq answers them in the moment and quietly collects their details so you can follow up.",
    questions: [
      "Can someone call me about this?",
      "Do you offer a free trial or demo?",
      "How much does it cost for my situation?",
      "Can you send me more information?",
      "Do you work with businesses like mine?",
      "What are the next steps?",
    ],
    benefits: [
      {
        title: "Capture intent in the moment",
        body: "When a visitor shows interest, the chatbot collects their name and email so the lead does not slip away.",
      },
      {
        title: "Qualify before you call",
        body: "The conversation tells you what they wanted, so your follow-up is warm and specific.",
      },
      {
        title: "Work every hour",
        body: "Leads come in overnight and on weekends, captured automatically while you are away.",
      },
      {
        title: "Straight to your inbox",
        body: "Every captured lead and the full chat is emailed to you, ready to act on.",
      },
    ],
    faqs: [
      {
        q: "How does it collect leads?",
        a: "During a conversation it naturally asks for a name and email when a visitor wants follow-up, then sends the details to your inbox.",
      },
      {
        q: "Is it pushy with visitors?",
        a: "No. It answers first and only asks for contact details when there is genuine interest, so it feels helpful rather than salesy.",
      },
      {
        q: "Where do the leads go?",
        a: "To your registered email, along with the conversation context, so you know exactly what they were after.",
      },
      {
        q: "Can it route people to a call?",
        a: "It can point visitors to your booking link or contact page and capture their details for you to reach out.",
      },
      {
        q: "Do I need a CRM to use it?",
        a: "No. Leads arrive by email, so you can start without any extra tools.",
      },
    ],
  },
  {
    slug: "ecommerce",
    name: "Ecommerce",
    icon: "cart",
    accent: "#0d9488",
    eyebrow: "For online stores",
    audience: "shoppers",
    helps: "your store",
    h1: "AI chatbot for ecommerce",
    metaTitle: "AI Chatbot for Ecommerce Stores | Bleviq",
    metaDescription:
      "Help shoppers find the right product and answer shipping, sizing, and returns questions 24/7 with an AI chatbot trained on your store. Free to start.",
    subhead:
      "Shoppers with questions abandon carts. Bleviq answers sizing, shipping, and returns instantly so they buy with confidence.",
    intro:
      "Every unanswered question is a lost sale. Bleviq pulls from your product and policy pages to answer shoppers the moment they hesitate.",
    questions: [
      "Do you ship to my country?",
      "What is your return policy?",
      "How do I find my size?",
      "How long does delivery take?",
      "Do you offer discounts or bundles?",
      "Is this product right for me?",
    ],
    benefits: [
      {
        title: "Rescue abandoning carts",
        body: "Answer the last-minute shipping or sizing question that would otherwise lose the sale.",
      },
      {
        title: "Guide product choices",
        body: "Point shoppers to the right item based on what is described across your store.",
      },
      {
        title: "Cut the where-is-my-order emails",
        body: "Shipping and returns questions get answered from your policy pages, not your inbox.",
      },
      {
        title: "Sell while you sleep",
        body: "Shoppers browsing at midnight get instant help, with no staff required.",
      },
    ],
    faqs: [
      {
        q: "Does it know my products?",
        a: "Yes. Bleviq crawls your store, so it can answer about products, shipping, and policies using your own pages.",
      },
      {
        q: "Does it work with Shopify, Wix, and others?",
        a: "Yes. It is a single snippet that works on Shopify, Wix, Squarespace, WooCommerce, and most platforms.",
      },
      {
        q: "Can it track orders?",
        a: "It can explain how tracking works and point shoppers to your tracking or account page. It does not pull live order data.",
      },
      {
        q: "Will it match my store's look?",
        a: "Yes. You can set the colors so the widget feels native to your storefront.",
      },
      {
        q: "What about busy sale periods?",
        a: "It handles many conversations at once, so it scales with your traffic during launches and sales.",
      },
    ],
  },
  {
    slug: "dental-practices",
    name: "Dental Practices",
    icon: "tooth",
    accent: "#0284c7",
    eyebrow: "For dental practices",
    audience: "patients",
    helps: "your practice",
    h1: "AI chatbot for dentists",
    disclaimer:
      "Bleviq is not HIPAA compliant and is not intended to collect, store, or process protected health information (PHI). Use it for general questions like services, hours, and insurance, and route anything involving patient health details to your secure, compliant systems.",
    metaTitle: "AI Chatbot for Dentists & Dental Practices | Bleviq",
    metaDescription:
      "Answer patient questions about insurance, hours, and new appointments 24/7 with an AI chatbot trained on your practice website. Free to start.",
    subhead:
      "Patients call to ask the same few things. Bleviq answers insurance, hours, and new-patient questions on your site so your front desk can breathe.",
    intro:
      "Front desks field the same questions all day. Bleviq answers them from your practice website, and captures details when someone wants to book.",
    questions: [
      "Are you accepting new patients?",
      "Do you take my insurance?",
      "What are your office hours?",
      "Do you see dental emergencies?",
      "How much is a cleaning or check-up?",
      "Where are you located?",
    ],
    benefits: [
      {
        title: "Lighten the front desk",
        body: "The routine insurance and hours questions get answered automatically, freeing your team for patients in the chair.",
      },
      {
        title: "Capture new patients",
        body: "When someone wants to book, the chatbot collects their details and points them to your scheduling page.",
      },
      {
        title: "Answer after hours",
        body: "Patients researching at night get answers instead of a voicemail, so you do not lose them to the next practice.",
      },
      {
        title: "Speak every patient's language",
        body: "It replies in the visitor's language, which helps in diverse neighborhoods.",
      },
    ],
    faqs: [
      {
        q: "Can it answer insurance questions?",
        a: "It answers based on what your website says about accepted plans. Keep that page current and the chatbot stays accurate.",
      },
      {
        q: "Does it book appointments?",
        a: "It collects the patient's details and directs them to your booking link or phone number. It does not manage your calendar directly.",
      },
      {
        q: "Is patient information handled carefully?",
        a: "The chatbot is for general questions, not medical records, and Bleviq is not HIPAA compliant. Conversations are emailed to you, so do not collect protected health information or sensitive health details through chat; route those to your secure systems.",
      },
      {
        q: "Will it work on my practice website?",
        a: "Yes. It is one snippet that works on Webflow, WordPress, Squarespace, and most practice sites.",
      },
      {
        q: "How quickly can we launch?",
        a: "Usually within minutes of entering your site URL and pasting the snippet.",
      },
    ],
  },
  {
    slug: "healthcare",
    name: "Healthcare & Clinics",
    icon: "heart",
    accent: "#0891b2",
    eyebrow: "For clinics & healthcare",
    audience: "patients",
    helps: "your clinic",
    h1: "AI chatbot for healthcare clinics",
    disclaimer:
      "Bleviq is not HIPAA compliant and is not intended to collect, store, or process protected health information (PHI). Use it for general questions like services, hours, and directions, and route anything involving patient health details to your secure, compliant systems.",
    metaTitle: "AI Chatbot for Healthcare & Clinics | Bleviq",
    metaDescription:
      "Answer patient questions about services, hours, and appointments 24/7 with an AI chatbot trained on your clinic website. Free to start.",
    subhead:
      "Patients want quick answers about services and hours. Bleviq handles the routine questions so your staff can focus on care.",
    intro:
      "Clinics get the same calls all day: hours, services, directions, and booking. Bleviq answers them from your site and captures details when a patient wants to come in.",
    questions: [
      "What services do you offer?",
      "What are your opening hours?",
      "Do I need a referral?",
      "Where are you located and is there parking?",
      "How do I book an appointment?",
      "Do you offer telehealth visits?",
    ],
    benefits: [
      {
        title: "Reduce phone volume",
        body: "Common questions are answered online, so your front desk spends less time on the phone.",
      },
      {
        title: "Help patients any time",
        body: "After-hours visitors get answers instead of waiting until morning.",
      },
      {
        title: "Guide to the right service",
        body: "It explains what you offer and points patients to the right next step.",
      },
      {
        title: "Multilingual by default",
        body: "It replies in each patient's language automatically.",
      },
    ],
    faqs: [
      {
        q: "Is this suitable for medical advice?",
        a: "No. Bleviq answers general questions about your clinic, like services and hours. It should not be used for diagnosis or medical advice.",
      },
      {
        q: "Does it handle sensitive health data?",
        a: "It is built for general inquiries, and Bleviq is not HIPAA compliant. Do not use it to collect medical histories, protected health information, or sensitive health details; route those to your secure systems.",
      },
      {
        q: "Can it help with bookings?",
        a: "It collects contact details and directs patients to your booking page or phone line.",
      },
      {
        q: "Where do conversations go?",
        a: "They are emailed to you after each chat so you can follow up.",
      },
      {
        q: "How is it set up?",
        a: "Enter your clinic website, choose your colors, and add one snippet. It is live in minutes.",
      },
    ],
  },
  {
    slug: "real-estate",
    name: "Real Estate",
    icon: "home",
    accent: "#b45309",
    eyebrow: "For real estate",
    audience: "buyers",
    helps: "you close",
    h1: "AI chatbot for real estate",
    metaTitle: "AI Chatbot for Real Estate | Bleviq",
    metaDescription:
      "Answer buyer and renter questions about listings, viewings, and neighborhoods 24/7 and capture leads with an AI chatbot trained on your site. Free to start.",
    subhead:
      "Buyers browse listings at all hours. Bleviq answers their questions and captures their details so you never miss a lead.",
    intro:
      "Property searches happen late at night and on weekends. Bleviq answers questions about your listings and areas, and grabs contact details from serious buyers and renters.",
    questions: [
      "What is the application process?",
      "Can I schedule a viewing?",
      "What is the monthly payment or rent?",
      "What are the schools and amenities nearby?",
      "What areas do you cover?",
      "Are pets allowed?",
    ],
    benefits: [
      {
        title: "Never miss a hot lead",
        body: "When a buyer is interested, the chatbot captures their details so you can follow up fast.",
      },
      {
        title: "Answer listing questions",
        body: "Pricing, features, and area questions get answered from your site instantly.",
      },
      {
        title: "Work nights and weekends",
        body: "Most property searching happens off-hours. Your chatbot is there when you cannot be.",
      },
      {
        title: "Qualify before you call",
        body: "You learn what the buyer wanted before you pick up the phone.",
      },
    ],
    faqs: [
      {
        q: "Can it answer about specific listings?",
        a: "Yes, based on what is published on your site. As listings update, the chatbot reflects them after its next crawl.",
      },
      {
        q: "Does it schedule viewings?",
        a: "It collects the lead's details and points them to your booking or contact page to arrange a viewing.",
      },
      {
        q: "How do I get the leads?",
        a: "Each conversation and captured lead is emailed to you with the context.",
      },
      {
        q: "Will it work on my agent or IDX site?",
        a: "Yes. It is one snippet that works on most real estate websites and builders.",
      },
      {
        q: "Can it speak to international buyers?",
        a: "Yes. It detects and replies in the visitor's language automatically.",
      },
    ],
  },
  {
    slug: "home-services",
    name: "Home Services",
    icon: "wrench",
    accent: "#ea580c",
    eyebrow: "For home services",
    audience: "customers",
    helps: "your business",
    h1: "AI chatbot for home service businesses",
    metaTitle: "AI Chatbot for Home Services (HVAC, Plumbing, Contractors) | Bleviq",
    metaDescription:
      "Answer service-area, pricing, and booking questions 24/7 and capture job leads with an AI chatbot trained on your website. Free to start.",
    subhead:
      "When something breaks, customers want answers now. Bleviq handles service-area and pricing questions and captures the job while you are on site.",
    intro:
      "You are on a job, not at the phone. Bleviq answers the common questions and captures new job requests so leads do not go to the next contractor.",
    questions: [
      "Do you service my area?",
      "Do you offer same-day or emergency service?",
      "How much do you charge for a call-out?",
      "Do you offer free estimates?",
      "Are you licensed and insured?",
      "What hours are you available?",
    ],
    benefits: [
      {
        title: "Capture jobs on the spot",
        body: "When you are on a call-out, the chatbot still books interest and collects details for you.",
      },
      {
        title: "Answer the usual questions",
        body: "Service area, pricing, and what you offer get answered without a phone call.",
      },
      {
        title: "Be there after hours",
        body: "Emergencies and evening searches get a response instead of a missed call.",
      },
      {
        title: "Fewer tire-kickers",
        body: "The chat tells you what the customer needs, so your callbacks are worth the time.",
      },
    ],
    faqs: [
      {
        q: "Can it tell customers if I cover their area?",
        a: "Yes, based on the service areas listed on your site. Keep that page current and it stays accurate.",
      },
      {
        q: "Does it book jobs?",
        a: "It captures the request and customer details and points them to your booking or phone line for scheduling.",
      },
      {
        q: "Where do the leads arrive?",
        a: "In your inbox, with the conversation, so you can call back when you are off the ladder.",
      },
      {
        q: "Will it work on my site?",
        a: "Yes. One snippet works on WordPress, Wix, GoDaddy, and most contractor websites.",
      },
      {
        q: "How fast is setup?",
        a: "A few minutes. Enter your URL, set your colors, and paste the snippet.",
      },
    ],
  },
  {
    slug: "restaurants",
    name: "Restaurants & Hospitality",
    icon: "utensils",
    accent: "#dc2626",
    eyebrow: "For restaurants & hospitality",
    audience: "guests",
    helps: "your venue",
    h1: "AI chatbot for restaurants",
    metaTitle: "AI Chatbot for Restaurants & Hospitality | Bleviq",
    metaDescription:
      "Answer guest questions about hours, menu, reservations, and dietary options 24/7 with an AI chatbot trained on your website. Free to start.",
    subhead:
      "Guests want hours, menu, and booking info fast. Bleviq answers from your site so your team can focus on the floor.",
    intro:
      "Diners check hours, menus, and reservations before they visit. Bleviq answers those instantly so the phone rings less and bookings come easier.",
    questions: [
      "What are your opening hours?",
      "Do you take reservations?",
      "Do you have vegan or gluten-free options?",
      "Where are you located and is there parking?",
      "Can you cater a private event?",
      "Is there a kids' menu?",
    ],
    benefits: [
      {
        title: "Fewer phone interruptions",
        body: "Hours, menu, and booking questions get answered online during the dinner rush.",
      },
      {
        title: "Help guests book",
        body: "Point diners to your reservation link and capture private-event inquiries.",
      },
      {
        title: "Answer dietary questions",
        body: "Vegan, gluten-free, and allergy questions get answered from your menu pages.",
      },
      {
        title: "Welcome every language",
        body: "Tourists and locals get answers in their own language.",
      },
    ],
    faqs: [
      {
        q: "Can it answer menu questions?",
        a: "Yes, from the menu on your website. Keep it updated and the chatbot stays accurate about dishes and options.",
      },
      {
        q: "Does it take reservations?",
        a: "It points guests to your booking system and captures private-event or catering inquiries for you.",
      },
      {
        q: "Is it good for tourists?",
        a: "Yes. It detects and replies in the guest's language automatically.",
      },
      {
        q: "Where do inquiries go?",
        a: "Catering and event inquiries, plus every chat, are emailed to you.",
      },
      {
        q: "How do I add it to my site?",
        a: "Paste one snippet. It works on Squarespace, Wix, WordPress, and most restaurant sites.",
      },
    ],
  },
  {
    slug: "saas-startups",
    name: "SaaS & Startups",
    icon: "layers",
    accent: "#2563eb",
    eyebrow: "For SaaS & startups",
    audience: "users",
    helps: "your team",
    h1: "AI chatbot for SaaS and startups",
    metaTitle: "AI Chatbot for SaaS & Startups | Bleviq",
    metaDescription:
      "Answer product, pricing, and onboarding questions 24/7 and capture trial signups with an AI chatbot trained on your docs and site. Free to start.",
    subhead:
      "Prospects and users have questions about features, pricing, and setup. Bleviq answers from your docs and site so your small team is not the bottleneck.",
    intro:
      "Early-stage teams cannot staff support around the clock. Bleviq answers product and pricing questions from your own pages and docs, and captures signups.",
    questions: [
      "What does your product do?",
      "How much does it cost?",
      "Do you have an API or integrations?",
      "Is there a free trial?",
      "How do I get started?",
      "How is this different from your competitors?",
    ],
    benefits: [
      {
        title: "Deflect early support",
        body: "Common product and setup questions get answered from your docs, so your team ships instead of replying.",
      },
      {
        title: "Convert more trials",
        body: "Answer pre-signup questions instantly and capture interested visitors.",
      },
      {
        title: "Onboard from your docs",
        body: "It walks users through setup using your existing documentation.",
      },
      {
        title: "Scale with traffic",
        body: "Handle a launch spike without scrambling to staff a support queue.",
      },
    ],
    faqs: [
      {
        q: "Can it answer from our docs?",
        a: "Yes. Bleviq crawls your site and documentation and answers from that content.",
      },
      {
        q: "Does it stay current as we ship?",
        a: "It reflects your latest pages after each crawl, so updates to your docs flow through.",
      },
      {
        q: "Can it capture signups or leads?",
        a: "Yes. It collects contact details from interested visitors and emails them to you.",
      },
      {
        q: "Where can we embed it?",
        a: "It is a snippet for your public site. Add it wherever your visitors land for the widest coverage.",
      },
      {
        q: "How long to set up?",
        a: "Minutes. Add your URL, customize, and embed one snippet.",
      },
    ],
  },
  {
    slug: "agencies",
    name: "Agencies",
    icon: "megaphone",
    accent: "#db2777",
    eyebrow: "For agencies",
    audience: "visitors",
    helps: "you and your clients",
    h1: "AI chatbot for agencies",
    metaTitle: "AI Chatbot for Agencies | Bleviq",
    metaDescription:
      "Add an AI chatbot to your agency site and your clients' sites to answer questions and capture leads 24/7. Trained on each site. Free to start.",
    subhead:
      "Offer your clients a chatbot that answers their visitors and captures leads, set up in minutes on any site you build.",
    intro:
      "Whether it is your own site or a client's, Bleviq trains on the site's content and starts answering visitors and capturing leads. It is an easy add-on to what you already deliver.",
    questions: [
      "What services do you offer?",
      "Can I see your portfolio or case studies?",
      "How much do your projects cost?",
      "What is your turnaround time?",
      "Can we book a discovery call?",
      "Do you work with businesses in my industry?",
    ],
    benefits: [
      {
        title: "A new client deliverable",
        body: "Offer a trained chatbot as part of every site you build, live in minutes.",
      },
      {
        title: "Capture leads for clients",
        body: "Each site collects visitor details and emails them to the right inbox.",
      },
      {
        title: "Set and forget",
        body: "It learns from each site's content, so there is no knowledge base to maintain per client.",
      },
      {
        title: "Match every brand",
        body: "Color the widget to each client's identity in seconds.",
      },
    ],
    faqs: [
      {
        q: "Will my clients see Bleviq's branding?",
        a: "No. On a paid plan the 'Powered by Bleviq' badge is removed, so the widget looks like a native part of your client's site.",
      },
      {
        q: "Does it match each client's branding?",
        a: "Yes. Set the colors per site so it fits each brand.",
      },
      {
        q: "Who receives the leads?",
        a: "Conversations and leads are emailed to the address you set for each site.",
      },
      {
        q: "What platforms does it support?",
        a: "Most of them, including Webflow, WordPress, Shopify, and Squarespace, via one snippet.",
      },
      {
        q: "Is it quick to deploy?",
        a: "Yes. Enter the site URL, customize, and paste the snippet. Minutes per site.",
      },
    ],
  },
  {
    slug: "education",
    name: "Education & Online Courses",
    icon: "graduation",
    accent: "#059669",
    eyebrow: "For education & courses",
    audience: "students",
    helps: "your school",
    h1: "AI chatbot for education and online courses",
    metaTitle: "AI Chatbot for Education & Online Courses | Bleviq",
    metaDescription:
      "Answer student and prospect questions about courses, enrollment, and schedules 24/7 with an AI chatbot trained on your website. Free to start.",
    subhead:
      "Students and parents ask about courses, enrollment, and schedules. Bleviq answers from your site so your team is not buried in the same questions.",
    intro:
      "Prospective students research at all hours. Bleviq answers questions about your programs and enrollment from your own pages, and captures interested learners.",
    questions: [
      "What courses or programs do you offer?",
      "How much is tuition or enrollment?",
      "When does the next intake start?",
      "Is the course online or in person?",
      "Do you offer certificates?",
      "What are the requirements to join?",
    ],
    benefits: [
      {
        title: "Answer enrollment questions",
        body: "Tuition, schedules, and requirements get answered instantly from your site.",
      },
      {
        title: "Capture interested students",
        body: "When someone wants to enroll or learn more, it collects their details.",
      },
      {
        title: "Support learners any time",
        body: "Students in any timezone get answers without waiting for office hours.",
      },
      {
        title: "Speak every language",
        body: "International students get replies in their own language.",
      },
    ],
    faqs: [
      {
        q: "Can it answer about specific courses?",
        a: "Yes, from your course and program pages. Keep them current and the chatbot stays accurate.",
      },
      {
        q: "Does it handle enrollment?",
        a: "It collects interested students' details and points them to your enrollment or contact page.",
      },
      {
        q: "Is it good for international students?",
        a: "Yes. It detects and replies in each visitor's language.",
      },
      {
        q: "Where do inquiries go?",
        a: "They are emailed to you after each conversation.",
      },
      {
        q: "How is it set up?",
        a: "Enter your site, choose colors, and paste one snippet. Live in minutes.",
      },
    ],
  },
  {
    slug: "small-business",
    name: "Local & Small Business",
    icon: "store",
    accent: "#d97706",
    eyebrow: "For local & small business",
    audience: "customers",
    helps: "your business",
    h1: "AI chatbot for small business",
    metaTitle: "AI Chatbot for Small & Local Business | Bleviq",
    metaDescription:
      "Answer customer questions about hours, services, and pricing 24/7 and capture leads with a no-code AI chatbot trained on your website. Free to start.",
    subhead:
      "You wear every hat. Let Bleviq answer the routine questions on your site so you can get back to running the business.",
    intro:
      "Small teams cannot watch the website all day. Bleviq answers the common questions from your own pages and captures leads while you work.",
    questions: [
      "What are your hours?",
      "Where are you located?",
      "What services do you offer?",
      "How much do you charge?",
      "How can I get in touch?",
      "Do you offer free quotes?",
    ],
    benefits: [
      {
        title: "An extra set of hands",
        body: "The routine questions get answered automatically, so you do not have to drop everything to reply.",
      },
      {
        title: "Capture every lead",
        body: "Interested visitors leave their details, even when you are busy or closed.",
      },
      {
        title: "No code, no hassle",
        body: "Paste one snippet on your site, with no developer needed.",
      },
      {
        title: "Look professional",
        body: "A polished, on-brand chat widget that makes a small business feel buttoned-up.",
      },
    ],
    faqs: [
      {
        q: "Do I need any technical skills?",
        a: "No. Enter your website, pick your colors, and paste one snippet. No code required.",
      },
      {
        q: "What does it answer?",
        a: "Whatever is on your site: hours, services, pricing, location, and more.",
      },
      {
        q: "How do I get the leads?",
        a: "Conversations and captured leads are emailed to you.",
      },
      {
        q: "Will it work on my website builder?",
        a: "Almost certainly. It works on WordPress, Wix, Squarespace, GoDaddy, and most builders.",
      },
      {
        q: "Is it really free to start?",
        a: "Yes. You can start free and upgrade later as your traffic grows.",
      },
    ],
  },
];

export function getUseCase(slug: string): UseCase | undefined {
  return USE_CASES.find((u) => u.slug === slug);
}
