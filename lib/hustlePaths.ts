// ─── Types ───────────────────────────────────────────────────────────────────

export type UserProfile = {
  hours_available: string | null
  income_timeline: string | null
  skills: string[] | null
  budget: string | null
  location: string | null
  tried_before: string | null
  preferences: string | null
  hates: string[] | null
}

type HustlePath = {
  name: string
  emoji: string
  description: string
  minHoursPerWeek: number
  firstIncome: 'fast' | 'medium' | 'slow' | 'longterm'
  budgetLevel: 0 | 1 | 2 | 3   // 0=€0, 1=<€100, 2=€100-500, 3=€500+
  relatedSkills: string[]
  workStyles: string[]           // 'Creative work' | 'Analytical work' | 'Working with people' | 'Working alone'
  requires: string[]             // from hates options
  incomeByTimeline: { '30days': string; '1-3months': string; '3-6months': string; longterm: string }
}

export type ScoredPath = HustlePath & {
  score: number
  matchPercent: number
  explanation: string
  incomeRange: string
}

// ─── Path definitions ─────────────────────────────────────────────────────────

const PATHS: HustlePath[] = [
  {
    name: 'Freelance Writing',
    emoji: '✍️',
    description: 'Write articles, blog posts, and web content for businesses and publications. One of the easiest ways to start earning online with zero upfront cost.',
    minHoursPerWeek: 5,
    firstIncome: 'fast',
    budgetLevel: 0,
    relatedSkills: ['Writing'],
    workStyles: ['Creative work', 'Working alone'],
    requires: ['Writing lots of text'],
    incomeByTimeline: { '30days': '€200–600/mo', '1-3months': '€500–1,500/mo', '3-6months': '€1,000–3,000/mo', longterm: '€3,000–8,000/mo' },
  },
  {
    name: 'Copywriting',
    emoji: '📝',
    description: 'Write persuasive sales pages, email sequences, and ads that make people buy. Higher rates than general writing because the output directly drives revenue.',
    minHoursPerWeek: 5,
    firstIncome: 'fast',
    budgetLevel: 0,
    relatedSkills: ['Writing', 'Marketing'],
    workStyles: ['Creative work', 'Working alone'],
    requires: ['Writing lots of text'],
    incomeByTimeline: { '30days': '€300–800/mo', '1-3months': '€800–2,500/mo', '3-6months': '€2,000–5,000/mo', longterm: '€5,000–15,000/mo' },
  },
  {
    name: 'Social Media Manager',
    emoji: '📱',
    description: 'Run Instagram, TikTok, and LinkedIn accounts for businesses that don\'t have time to do it themselves. Combine content creation with strategy and scheduling.',
    minHoursPerWeek: 10,
    firstIncome: 'fast',
    budgetLevel: 0,
    relatedSkills: ['Marketing', 'Design', 'Writing'],
    workStyles: ['Creative work', 'Working with people'],
    requires: ['Cold outreach', 'Repetitive tasks'],
    incomeByTimeline: { '30days': '€300–800/mo', '1-3months': '€800–2,000/mo', '3-6months': '€1,500–4,000/mo', longterm: '€3,000–8,000/mo' },
  },
  {
    name: 'Graphic Design',
    emoji: '🎨',
    description: 'Create logos, brand identities, social graphics, and marketing materials for businesses using tools like Figma or Canva.',
    minHoursPerWeek: 5,
    firstIncome: 'fast',
    budgetLevel: 1,
    relatedSkills: ['Design'],
    workStyles: ['Creative work', 'Working alone'],
    requires: [],
    incomeByTimeline: { '30days': '€200–600/mo', '1-3months': '€600–1,800/mo', '3-6months': '€1,500–4,000/mo', longterm: '€4,000–10,000/mo' },
  },
  {
    name: 'Video Editing',
    emoji: '🎬',
    description: 'Edit YouTube videos, short-form reels, and brand ads for creators and businesses. Demand is massive as video content dominates every platform.',
    minHoursPerWeek: 10,
    firstIncome: 'fast',
    budgetLevel: 1,
    relatedSkills: ['Design'],
    workStyles: ['Creative work', 'Working alone'],
    requires: ['Repetitive tasks'],
    incomeByTimeline: { '30days': '€200–600/mo', '1-3months': '€500–1,500/mo', '3-6months': '€1,200–3,000/mo', longterm: '€3,000–8,000/mo' },
  },
  {
    name: 'UX Design',
    emoji: '🖥️',
    description: 'Design how apps and websites feel to use — wireframes, prototypes, and user flows. High-value skill that bridges design and product thinking.',
    minHoursPerWeek: 10,
    firstIncome: 'medium',
    budgetLevel: 0,
    relatedSkills: ['Design', 'Coding'],
    workStyles: ['Creative work', 'Analytical work'],
    requires: ['Technical work'],
    incomeByTimeline: { '30days': '€0–500/mo', '1-3months': '€1,000–3,000/mo', '3-6months': '€2,000–6,000/mo', longterm: '€5,000–15,000/mo' },
  },
  {
    name: 'Web Development',
    emoji: '💻',
    description: 'Build websites and web apps for clients using code. Strong long-term income potential and one of the most in-demand freelance skills globally.',
    minHoursPerWeek: 10,
    firstIncome: 'medium',
    budgetLevel: 0,
    relatedSkills: ['Coding'],
    workStyles: ['Analytical work', 'Working alone'],
    requires: ['Technical work'],
    incomeByTimeline: { '30days': '€0–500/mo', '1-3months': '€1,000–3,000/mo', '3-6months': '€2,000–6,000/mo', longterm: '€5,000–15,000/mo' },
  },
  {
    name: 'No-Code App Building',
    emoji: '⚙️',
    description: 'Build web apps, automations, and internal tools using platforms like Bubble, Webflow, or Make — no traditional coding required.',
    minHoursPerWeek: 10,
    firstIncome: 'medium',
    budgetLevel: 1,
    relatedSkills: ['Coding', 'Design'],
    workStyles: ['Creative work', 'Analytical work'],
    requires: ['Technical work'],
    incomeByTimeline: { '30days': '€0–500/mo', '1-3months': '€500–2,000/mo', '3-6months': '€1,500–5,000/mo', longterm: '€4,000–15,000/mo' },
  },
  {
    name: 'SEO Consulting',
    emoji: '🔍',
    description: 'Help businesses rank higher on Google by optimizing their content, site structure, and backlink strategy. Recurring retainer work once you land clients.',
    minHoursPerWeek: 10,
    firstIncome: 'medium',
    budgetLevel: 0,
    relatedSkills: ['Marketing', 'Coding'],
    workStyles: ['Analytical work', 'Working alone'],
    requires: ['Technical work', 'Repetitive tasks'],
    incomeByTimeline: { '30days': '€0–500/mo', '1-3months': '€500–2,000/mo', '3-6months': '€1,500–4,000/mo', longterm: '€4,000–10,000/mo' },
  },
  {
    name: 'AI Automation Consulting',
    emoji: '🤖',
    description: 'Help businesses save time and money by building AI-powered workflows and automations using tools like ChatGPT, Make, and Zapier. The hottest niche right now.',
    minHoursPerWeek: 10,
    firstIncome: 'medium',
    budgetLevel: 0,
    relatedSkills: ['Coding', 'Marketing'],
    workStyles: ['Analytical work', 'Working with people'],
    requires: ['Technical work', 'Cold outreach'],
    incomeByTimeline: { '30days': '€0–500/mo', '1-3months': '€500–2,500/mo', '3-6months': '€2,000–6,000/mo', longterm: '€5,000–20,000/mo' },
  },
  {
    name: 'Virtual Assistant',
    emoji: '🗂️',
    description: 'Handle emails, scheduling, research, and admin tasks remotely for busy entrepreneurs and small business owners. Low barrier to entry with fast first income.',
    minHoursPerWeek: 20,
    firstIncome: 'fast',
    budgetLevel: 0,
    relatedSkills: [],
    workStyles: ['Working alone', 'Working with people'],
    requires: ['Repetitive tasks'],
    incomeByTimeline: { '30days': '€300–800/mo', '1-3months': '€600–1,500/mo', '3-6months': '€1,000–2,500/mo', longterm: '€2,000–5,000/mo' },
  },
  {
    name: 'Data Entry',
    emoji: '🖱️',
    description: 'Input, clean, and organize data for businesses on platforms like Upwork. Simple to start with no skills needed, though income ceiling is low.',
    minHoursPerWeek: 20,
    firstIncome: 'fast',
    budgetLevel: 0,
    relatedSkills: [],
    workStyles: ['Working alone'],
    requires: ['Repetitive tasks'],
    incomeByTimeline: { '30days': '€200–500/mo', '1-3months': '€300–700/mo', '3-6months': '€400–900/mo', longterm: '€600–1,500/mo' },
  },
  {
    name: 'Bookkeeping',
    emoji: '📊',
    description: 'Track income and expenses for small businesses using tools like QuickBooks or Xero. Steady recurring work once you have clients, no accounting degree needed.',
    minHoursPerWeek: 10,
    firstIncome: 'medium',
    budgetLevel: 0,
    relatedSkills: [],
    workStyles: ['Analytical work', 'Working alone'],
    requires: ['Repetitive tasks', 'Technical work'],
    incomeByTimeline: { '30days': '€0–500/mo', '1-3months': '€400–1,500/mo', '3-6months': '€800–2,500/mo', longterm: '€2,000–6,000/mo' },
  },
  {
    name: 'Tutoring',
    emoji: '🎓',
    description: 'Teach any subject one-on-one to students in your area. If you\'re strong in maths, science, or any academic subject, parents will pay well.',
    minHoursPerWeek: 2,
    firstIncome: 'fast',
    budgetLevel: 0,
    relatedSkills: ['Teaching'],
    workStyles: ['Working with people'],
    requires: [],
    incomeByTimeline: { '30days': '€200–600/mo', '1-3months': '€400–1,200/mo', '3-6months': '€800–2,000/mo', longterm: '€2,000–5,000/mo' },
  },
  {
    name: 'Online Tutoring',
    emoji: '🖥️',
    description: 'Teach students remotely via video call on platforms like Preply or Superprof. Reach students worldwide and set your own hours.',
    minHoursPerWeek: 2,
    firstIncome: 'fast',
    budgetLevel: 0,
    relatedSkills: ['Teaching', 'Languages'],
    workStyles: ['Working with people'],
    requires: ['Being on camera'],
    incomeByTimeline: { '30days': '€200–600/mo', '1-3months': '€400–1,200/mo', '3-6months': '€800–2,000/mo', longterm: '€2,000–5,000/mo' },
  },
  {
    name: 'Language Teaching',
    emoji: '🌍',
    description: 'Teach your native language to learners worldwide on platforms like iTalki or Preply. No formal teaching qualification needed — just fluency.',
    minHoursPerWeek: 2,
    firstIncome: 'fast',
    budgetLevel: 0,
    relatedSkills: ['Languages'],
    workStyles: ['Working with people'],
    requires: [],
    incomeByTimeline: { '30days': '€200–500/mo', '1-3months': '€400–1,200/mo', '3-6months': '€800–2,000/mo', longterm: '€2,000–5,000/mo' },
  },
  {
    name: 'Fitness Coaching',
    emoji: '💪',
    description: 'Coach clients on exercise and body transformation online or in person. Build custom programs, check form via video, and help people hit their goals.',
    minHoursPerWeek: 5,
    firstIncome: 'fast',
    budgetLevel: 0,
    relatedSkills: ['Fitness'],
    workStyles: ['Working with people', 'Creative work'],
    requires: ['Being on camera'],
    incomeByTimeline: { '30days': '€300–800/mo', '1-3months': '€600–1,800/mo', '3-6months': '€1,200–4,000/mo', longterm: '€3,000–10,000/mo' },
  },
  {
    name: 'Nutrition Coaching',
    emoji: '🥗',
    description: 'Help clients improve their diet, lose weight, or hit health goals through personalised meal plans and accountability check-ins.',
    minHoursPerWeek: 5,
    firstIncome: 'fast',
    budgetLevel: 0,
    relatedSkills: ['Fitness'],
    workStyles: ['Working with people'],
    requires: ['Being on camera'],
    incomeByTimeline: { '30days': '€200–600/mo', '1-3months': '€500–1,500/mo', '3-6months': '€1,000–3,000/mo', longterm: '€2,000–8,000/mo' },
  },
  {
    name: 'Career Coaching',
    emoji: '🧭',
    description: 'Help people land jobs, get promotions, or switch industries. CVs, interview prep, LinkedIn strategy — huge demand from anxious job seekers.',
    minHoursPerWeek: 5,
    firstIncome: 'medium',
    budgetLevel: 0,
    relatedSkills: [],
    workStyles: ['Working with people'],
    requires: ['Cold outreach'],
    incomeByTimeline: { '30days': '€0–400/mo', '1-3months': '€300–1,500/mo', '3-6months': '€800–3,000/mo', longterm: '€2,000–8,000/mo' },
  },
  {
    name: 'Business Consulting',
    emoji: '💼',
    description: 'Advise small businesses on strategy, operations, marketing, and growth. Best suited to people with real business or industry experience.',
    minHoursPerWeek: 10,
    firstIncome: 'medium',
    budgetLevel: 0,
    relatedSkills: ['Marketing', 'Sales'],
    workStyles: ['Analytical work', 'Working with people'],
    requires: ['Cold outreach', 'Managing people'],
    incomeByTimeline: { '30days': '€0–1,000/mo', '1-3months': '€500–3,000/mo', '3-6months': '€1,500–6,000/mo', longterm: '€4,000–20,000/mo' },
  },
  {
    name: 'YouTube Channel',
    emoji: '▶️',
    description: 'Build an audience by publishing videos on a niche topic and monetise through ads, sponsorships, and digital products. Slow to start but high long-term upside.',
    minHoursPerWeek: 10,
    firstIncome: 'longterm',
    budgetLevel: 2,
    relatedSkills: ['Marketing'],
    workStyles: ['Creative work', 'Working with people'],
    requires: ['Being on camera', 'Repetitive tasks'],
    incomeByTimeline: { '30days': '€0–50/mo', '1-3months': '€0–200/mo', '3-6months': '€100–1,000/mo', longterm: '€1,000–20,000/mo' },
  },
  {
    name: 'Podcast',
    emoji: '🎙️',
    description: 'Record audio episodes on a niche you know well and monetise through sponsorships, listener support, or a paid community. No camera needed.',
    minHoursPerWeek: 5,
    firstIncome: 'longterm',
    budgetLevel: 1,
    relatedSkills: ['Marketing'],
    workStyles: ['Creative work', 'Working with people'],
    requires: ['Repetitive tasks'],
    incomeByTimeline: { '30days': '€0/mo', '1-3months': '€0–200/mo', '3-6months': '€100–1,000/mo', longterm: '€500–10,000/mo' },
  },
  {
    name: 'Newsletter',
    emoji: '📧',
    description: 'Write a regular email newsletter on a topic you know well and monetise via sponsorships, paid subscriptions, or affiliate links. Low cost, compounding returns.',
    minHoursPerWeek: 5,
    firstIncome: 'slow',
    budgetLevel: 0,
    relatedSkills: ['Writing', 'Marketing'],
    workStyles: ['Creative work', 'Working alone'],
    requires: ['Writing lots of text', 'Repetitive tasks'],
    incomeByTimeline: { '30days': '€0–100/mo', '1-3months': '€0–500/mo', '3-6months': '€200–2,000/mo', longterm: '€1,000–10,000/mo' },
  },
  {
    name: 'Digital Products',
    emoji: '📦',
    description: 'Create and sell ebooks, templates, Notion dashboards, Lightroom presets, or mini-courses. Build once, sell forever with zero fulfilment cost.',
    minHoursPerWeek: 5,
    firstIncome: 'medium',
    budgetLevel: 0,
    relatedSkills: ['Writing', 'Design', 'Coding'],
    workStyles: ['Creative work', 'Working alone'],
    requires: ['Repetitive tasks'],
    incomeByTimeline: { '30days': '€0–300/mo', '1-3months': '€100–1,000/mo', '3-6months': '€400–3,000/mo', longterm: '€1,500–10,000/mo' },
  },
  {
    name: 'Print on Demand',
    emoji: '👕',
    description: 'Design T-shirts, mugs, and prints that are only manufactured when a customer orders — no inventory, no upfront stock cost.',
    minHoursPerWeek: 5,
    firstIncome: 'medium',
    budgetLevel: 0,
    relatedSkills: ['Design'],
    workStyles: ['Creative work', 'Working alone'],
    requires: ['Repetitive tasks'],
    incomeByTimeline: { '30days': '€0–200/mo', '1-3months': '€100–800/mo', '3-6months': '€300–2,000/mo', longterm: '€1,000–5,000/mo' },
  },
  {
    name: 'Etsy Shop',
    emoji: '🛍️',
    description: 'Sell handmade crafts, digital downloads, or vintage items on Etsy\'s marketplace. Built-in search traffic makes it easier to get found than a standalone store.',
    minHoursPerWeek: 10,
    firstIncome: 'medium',
    budgetLevel: 1,
    relatedSkills: ['Design'],
    workStyles: ['Creative work', 'Working alone'],
    requires: ['Repetitive tasks'],
    incomeByTimeline: { '30days': '€0–300/mo', '1-3months': '€200–1,000/mo', '3-6months': '€500–3,000/mo', longterm: '€1,500–8,000/mo' },
  },
  {
    name: 'Dropshipping',
    emoji: '📬',
    description: 'Sell products online without holding any inventory — suppliers ship directly to your customers. Requires strong marketing and product research skills.',
    minHoursPerWeek: 10,
    firstIncome: 'medium',
    budgetLevel: 1,
    relatedSkills: ['Marketing'],
    workStyles: ['Analytical work', 'Working alone'],
    requires: ['Repetitive tasks', 'Technical work'],
    incomeByTimeline: { '30days': '€0–500/mo', '1-3months': '€300–2,000/mo', '3-6months': '€800–5,000/mo', longterm: '€2,000–15,000/mo' },
  },
  {
    name: 'Amazon FBA',
    emoji: '📦',
    description: 'Source physical products and sell them through Amazon\'s warehouse and fulfilment network. High income potential but requires significant upfront capital.',
    minHoursPerWeek: 10,
    firstIncome: 'slow',
    budgetLevel: 3,
    relatedSkills: ['Marketing'],
    workStyles: ['Analytical work', 'Working alone'],
    requires: ['Repetitive tasks', 'Technical work'],
    incomeByTimeline: { '30days': '€0/mo', '1-3months': '€0–500/mo', '3-6months': '€500–3,000/mo', longterm: '€2,000–20,000/mo' },
  },
  {
    name: 'Stock Photography',
    emoji: '🖼️',
    description: 'Upload your photos to sites like Shutterstock or Getty and earn royalties each time someone licenses them. Passive income that compounds over time.',
    minHoursPerWeek: 5,
    firstIncome: 'slow',
    budgetLevel: 2,
    relatedSkills: ['Design'],
    workStyles: ['Creative work', 'Working alone'],
    requires: [],
    incomeByTimeline: { '30days': '€0–50/mo', '1-3months': '€50–200/mo', '3-6months': '€100–600/mo', longterm: '€300–2,000/mo' },
  },
  {
    name: 'Photography',
    emoji: '📷',
    description: 'Offer professional photography for events, portraits, brands, and real estate. Requires a decent camera but the hourly rate is one of the best for local services.',
    minHoursPerWeek: 5,
    firstIncome: 'fast',
    budgetLevel: 2,
    relatedSkills: ['Design'],
    workStyles: ['Creative work', 'Working alone'],
    requires: [],
    incomeByTimeline: { '30days': '€100–500/mo', '1-3months': '€400–1,500/mo', '3-6months': '€800–3,000/mo', longterm: '€2,000–8,000/mo' },
  },
  {
    name: 'Voiceover Work',
    emoji: '🎤',
    description: 'Record your voice for ads, audiobooks, explainer videos, and e-learning courses. A decent mic and a quiet room are all you need to get started.',
    minHoursPerWeek: 5,
    firstIncome: 'medium',
    budgetLevel: 1,
    relatedSkills: [],
    workStyles: ['Creative work', 'Working alone'],
    requires: ['Repetitive tasks'],
    incomeByTimeline: { '30days': '€0–300/mo', '1-3months': '€200–800/mo', '3-6months': '€500–2,000/mo', longterm: '€1,500–6,000/mo' },
  },
  {
    name: 'Translation Services',
    emoji: '🌐',
    description: 'Translate documents, websites, and content between languages. If you\'re fluent in two or more languages, this is a clean, reliable freelance income stream.',
    minHoursPerWeek: 5,
    firstIncome: 'fast',
    budgetLevel: 0,
    relatedSkills: ['Languages'],
    workStyles: ['Working alone'],
    requires: ['Repetitive tasks', 'Writing lots of text'],
    incomeByTimeline: { '30days': '€200–600/mo', '1-3months': '€500–1,500/mo', '3-6months': '€800–2,500/mo', longterm: '€2,000–6,000/mo' },
  },
  {
    name: 'Local Arbitrage',
    emoji: '🔄',
    description: 'Buy underpriced items at garage sales, charity shops, or Facebook Marketplace and flip them for profit on eBay or Vinted. Hustle-heavy but fast cash.',
    minHoursPerWeek: 10,
    firstIncome: 'fast',
    budgetLevel: 2,
    relatedSkills: [],
    workStyles: ['Analytical work', 'Working alone'],
    requires: ['Repetitive tasks'],
    incomeByTimeline: { '30days': '€200–800/mo', '1-3months': '€500–2,000/mo', '3-6months': '€800–3,000/mo', longterm: '€2,000–8,000/mo' },
  },
  {
    name: 'Vintage Reselling',
    emoji: '🏷️',
    description: 'Source vintage clothing and items from car boots and charity shops, then resell on Vinted, Depop, or eBay. Great for people who enjoy hunting for bargains.',
    minHoursPerWeek: 5,
    firstIncome: 'fast',
    budgetLevel: 1,
    relatedSkills: [],
    workStyles: ['Working alone'],
    requires: ['Repetitive tasks'],
    incomeByTimeline: { '30days': '€100–500/mo', '1-3months': '€300–1,000/mo', '3-6months': '€500–2,000/mo', longterm: '€1,000–5,000/mo' },
  },
  {
    name: 'Dog Walking',
    emoji: '🐕',
    description: 'Walk dogs for busy pet owners in your local area. One of the easiest ways to earn cash quickly with zero setup cost — just show up.',
    minHoursPerWeek: 5,
    firstIncome: 'fast',
    budgetLevel: 0,
    relatedSkills: [],
    workStyles: ['Working alone', 'Working with people'],
    requires: [],
    incomeByTimeline: { '30days': '€200–500/mo', '1-3months': '€400–1,000/mo', '3-6months': '€600–1,500/mo', longterm: '€1,200–3,000/mo' },
  },
  {
    name: 'Cleaning Service',
    emoji: '🧹',
    description: 'Offer home or office cleaning to local clients. Recurring weekly bookings mean predictable income, and word-of-mouth growth is fast in local areas.',
    minHoursPerWeek: 10,
    firstIncome: 'fast',
    budgetLevel: 1,
    relatedSkills: [],
    workStyles: ['Working alone'],
    requires: ['Repetitive tasks'],
    incomeByTimeline: { '30days': '€300–800/mo', '1-3months': '€600–1,500/mo', '3-6months': '€1,000–2,500/mo', longterm: '€2,000–6,000/mo' },
  },
  {
    name: 'Food Delivery',
    emoji: '🛵',
    description: 'Deliver food for platforms like Uber Eats or Deliveroo on your own schedule. Fastest possible start — you can earn your first money today.',
    minHoursPerWeek: 10,
    firstIncome: 'fast',
    budgetLevel: 0,
    relatedSkills: [],
    workStyles: ['Working alone'],
    requires: ['Repetitive tasks'],
    incomeByTimeline: { '30days': '€300–800/mo', '1-3months': '€400–1,000/mo', '3-6months': '€500–1,200/mo', longterm: '€800–2,000/mo' },
  },
  {
    name: 'Handyman Services',
    emoji: '🔧',
    description: 'Offer small repairs, furniture assembly, and odd jobs to local homeowners. High hourly rates and consistent demand from people who can\'t or won\'t DIY.',
    minHoursPerWeek: 10,
    firstIncome: 'fast',
    budgetLevel: 2,
    relatedSkills: [],
    workStyles: ['Working alone'],
    requires: ['Cold outreach'],
    incomeByTimeline: { '30days': '€300–1,000/mo', '1-3months': '€600–2,000/mo', '3-6months': '€1,000–3,000/mo', longterm: '€2,000–6,000/mo' },
  },
  {
    name: 'Gardening',
    emoji: '🌱',
    description: 'Mow lawns, plant borders, and maintain gardens for local homeowners. Seasonal but loyal clients — many will book you weekly throughout summer.',
    minHoursPerWeek: 5,
    firstIncome: 'fast',
    budgetLevel: 1,
    relatedSkills: [],
    workStyles: ['Working alone'],
    requires: [],
    incomeByTimeline: { '30days': '€200–600/mo', '1-3months': '€400–1,200/mo', '3-6months': '€600–1,800/mo', longterm: '€1,200–4,000/mo' },
  },
  {
    name: 'Personal Shopping',
    emoji: '🛒',
    description: 'Shop for groceries, gifts, or outfits for time-poor clients. Can be done locally or online, and loyal clients often refer friends quickly.',
    minHoursPerWeek: 10,
    firstIncome: 'fast',
    budgetLevel: 0,
    relatedSkills: [],
    workStyles: ['Working with people', 'Working alone'],
    requires: ['Cold outreach'],
    incomeByTimeline: { '30days': '€200–600/mo', '1-3months': '€400–1,200/mo', '3-6months': '€700–2,000/mo', longterm: '€1,500–5,000/mo' },
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseHoursMin(h: string | null): number {
  if (!h) return 5
  if (h.startsWith('2')) return 2
  if (h.startsWith('5')) return 5
  if (h.startsWith('10')) return 10
  return 20
}

function parseBudgetLevel(b: string | null): 0 | 1 | 2 | 3 {
  if (!b) return 0
  if (b.startsWith('€0')) return 0
  if (b.startsWith('Under')) return 1
  if (b.startsWith('€100')) return 2
  return 3
}

function parseTimeline(t: string | null): 'Within 30 days' | '1-3 months' | '3-6 months' | 'Building long term' {
  if (!t) return '3-6 months'
  if (t.includes('30')) return 'Within 30 days'
  if (t.includes('1')) return '1-3 months'
  if (t.includes('3-6')) return '3-6 months'
  return 'Building long term'
}

function timelineScore(firstIncome: HustlePath['firstIncome'], userTimeline: string | null): number {
  const tl = parseTimeline(userTimeline)
  const matrix: Record<HustlePath['firstIncome'], Record<string, number>> = {
    fast:     { 'Within 30 days': 20, '1-3 months': 20, '3-6 months': 15, 'Building long term': 10 },
    medium:   { 'Within 30 days': 5,  '1-3 months': 20, '3-6 months': 18, 'Building long term': 12 },
    slow:     { 'Within 30 days': 0,  '1-3 months': 8,  '3-6 months': 20, 'Building long term': 18 },
    longterm: { 'Within 30 days': 0,  '1-3 months': 2,  '3-6 months': 10, 'Building long term': 20 },
  }
  return matrix[firstIncome][tl] ?? 0
}

function skillsScore(path: HustlePath, userSkills: string[]): number {
  if (path.relatedSkills.length === 0) return 15
  const hasNone = userSkills.length === 0 || userSkills.includes('None of these')
  if (hasNone) return 5
  const matches = path.relatedSkills.filter(s => userSkills.includes(s)).length
  if (matches === 0) return 7
  return Math.min(20, 10 + matches * 6)
}

function getIncomeRange(path: HustlePath, timeline: string | null): string {
  const tl = parseTimeline(timeline)
  if (tl === 'Within 30 days') return path.incomeByTimeline['30days']
  if (tl === '1-3 months') return path.incomeByTimeline['1-3months']
  if (tl === '3-6 months') return path.incomeByTimeline['3-6months']
  return path.incomeByTimeline['longterm']
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function generateExplanation(path: HustlePath, profile: UserProfile): string {
  const userSkills = profile.skills ?? []
  const userHates = profile.hates ?? []
  const matchingSkills = path.relatedSkills.filter(s => userSkills.includes(s))
  const avoidedThings = path.requires.filter(r => userHates.includes(r))
  const noConflicts = avoidedThings.length === 0
  const userHours = parseHoursMin(profile.hours_available)
  const fitsHours = path.minHoursPerWeek <= userHours
  const zeroBudget = profile.budget?.startsWith('€0')
  const lowBudget = zeroBudget || profile.budget?.startsWith('Under')
  const fastNeeded = profile.income_timeline === 'Within 30 days' || profile.income_timeline === '1-3 months'
  const isFast = path.firstIncome === 'fast'
  const prefMatch = profile.preferences && path.workStyles.includes(profile.preferences)
  const location = profile.location ?? ''
  const hasLocation = location.length > 2

  // Build a pool of true statements, pick 2 that are different from each other
  const pool: string[] = []

  // Skills angle
  if (matchingSkills.length >= 2) {
    pool.push(`you already have ${matchingSkills[0].toLowerCase()} and ${matchingSkills[1].toLowerCase()} skills, so you're not starting from zero`)
  } else if (matchingSkills.length === 1) {
    pool.push(`your ${matchingSkills[0].toLowerCase()} background is directly useful here — you won't be learning from scratch`)
  } else if (path.relatedSkills.length === 0) {
    pool.push(`this path requires no pre-existing skills — everything is learnable in the first 2 weeks`)
  } else {
    pool.push(`the skills this path needs are learnable quickly — most people pick them up in their first few sessions`)
  }

  // Timeline angle
  if (isFast && fastNeeded) {
    pool.push(`it's one of the fastest-moving paths available — first payments are realistic within 30 days`)
  } else if (isFast && !fastNeeded) {
    pool.push(`it moves faster than most paths, so you'll likely hit income before your own deadline`)
  } else if (path.firstIncome === 'medium' && fastNeeded) {
    pool.push(`while not instant, this path is faster than most and can still hit your timeline with focused effort`)
  } else {
    pool.push(`the income curve is gradual but compounds — people who stick with it for 3+ months consistently see strong results`)
  }

  // Budget angle
  if (path.budgetLevel === 0 && zeroBudget) {
    pool.push(`it costs literally nothing to start — no tools, no subscriptions, no upfront investment`)
  } else if (path.budgetLevel === 0 && !zeroBudget) {
    pool.push(`you don't need to spend any of your budget to start — which gives you room to invest later once you're earning`)
  } else if (path.budgetLevel === 1 && !zeroBudget) {
    pool.push(`the startup costs are minimal — under €100 gets you everything you need`)
  }

  // Hours angle
  if (fitsHours && profile.hours_available) {
    pool.push(`it fits cleanly into ${profile.hours_available} per week — you won't feel overwhelmed in week one`)
  }

  // Work style angle
  if (prefMatch && profile.preferences) {
    const styleMap: Record<string, string> = {
      'Creative work': 'it leans heavily on creative thinking, which matches how you said you prefer to work',
      'Analytical work': 'it rewards analytical thinking — exactly the kind of work you said you prefer',
      'Working with people': 'it involves regular client interaction, which suits your preference for working with people',
      'Working alone': 'you can do this entirely independently — no team required, no calls if you don\'t want them',
    }
    pool.push(styleMap[profile.preferences] ?? `it suits your preference for ${profile.preferences.toLowerCase()}`)
  }

  // Conflict avoidance angle
  if (noConflicts && path.requires.length > 0) {
    pool.push(`it doesn't require any of the things you said you hate — you won't be forcing yourself to do work you dread`)
  }

  // Location angle (for paths that can benefit from local context)
  if (hasLocation && (path.name.includes('Local') || path.name.includes('Tutoring') || path.name.includes('Coaching'))) {
    pool.push(`being based in ${location} gives you a real local market to tap into before going remote`)
  }

  // "Tried before" angle
  if (profile.tried_before && profile.tried_before.length > 5) {
    if (profile.tried_before.toLowerCase().includes('dropshipping') || profile.tried_before.toLowerCase().includes('ecom')) {
      if (!path.name.toLowerCase().includes('drop') && !path.name.toLowerCase().includes('ecom')) {
        pool.push(`unlike what you've tried before, this path doesn't require managing inventory, suppliers, or ads`)
      }
    }
  }

  // Fallback
  if (pool.length === 0) {
    pool.push(`the overall match with your profile — hours, budget, and goals — is strong`)
    pool.push(`realistic income potential that fits your stated timeline`)
  }

  // Pick first 2 that are distinct enough
  const first = pool[0]
  const second = pool.find((p, i) => i > 0 && p.slice(0, 20) !== first.slice(0, 20)) ?? pool[1] ?? pool[0]

  return `${cap(first)}. ${cap(second)}.`
}

// ─── Main scoring function ────────────────────────────────────────────────────

export function scorePaths(profile: UserProfile): ScoredPath[] {
  const userSkills = profile.skills ?? []
  const userHates = profile.hates ?? []
  const userHoursMin = parseHoursMin(profile.hours_available)
  const userBudgetLevel = parseBudgetLevel(profile.budget)

  return PATHS.map(path => {
    let score = 0

    // 1. Hours fit (20 pts)
    if (path.minHoursPerWeek <= userHoursMin) score += 20
    else if (path.minHoursPerWeek <= userHoursMin * 1.5) score += 10
    else score += 0

    // 2. Timeline fit (20 pts)
    score += timelineScore(path.firstIncome, profile.income_timeline)

    // 3. Budget fit (20 pts) — hard blocker if can't afford
    if (path.budgetLevel <= userBudgetLevel) score += 20
    else if (path.budgetLevel === userBudgetLevel + 1) score += 8
    else score += 0

    // 4. Skills overlap (20 pts)
    score += skillsScore(path, userSkills)

    // 5. Work style fit (10 pts)
    if (profile.preferences && path.workStyles.includes(profile.preferences)) score += 10
    else score += 4

    // 6. Avoidance fit (10 pts)
    const requiredHates = path.requires.filter(r => userHates.includes(r)).length
    score += Math.max(0, 10 - requiredHates * 5)

    const matchPercent = Math.min(99, Math.max(30, score))
    const explanation = generateExplanation(path, profile)
    const incomeRange = getIncomeRange(path, profile.income_timeline)

    return { ...path, score, matchPercent, explanation, incomeRange }
  }).sort((a, b) => b.score - a.score)
}
