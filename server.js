import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import http from 'http';
import { z } from 'zod';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = 'llama-3.3-70b-versatile';

async function ask(system, user, temp = 0.5) {
  const res = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
    temperature: temp,
    max_tokens: 2000,
  });
  return res.choices[0].message.content.trim();
}

const server = new McpServer({ name: 'launch-kit', version: '1.0.0' });

server.registerTool('write_product_hunt_post', {
  description: 'Write a complete Product Hunt launch post — tagline, description, maker comment, and first comment strategy.',
  inputSchema: z.object({
    product_name: z.string().describe('Your product name'),
    product_description: z.string().describe('What it does in 1-2 sentences'),
    target_user: z.string().describe('Who it is for and what problem it solves'),
    key_features: z.string().describe('3-5 main features or capabilities'),
    your_story: z.string().optional().describe('Why you built this — the founder story'),
    pricing: z.string().optional().describe('Pricing model, e.g., "free tier + $29/month pro"'),
  }),
}, async ({ product_name, product_description, target_user, key_features, your_story, pricing }) => {
  const story = your_story ? `\nFounder story: ${your_story}` : '';
  const price = pricing ? `\nPricing: ${pricing}` : '';
  const text = await ask(
    `You are a Product Hunt launch expert who has helped dozens of products get #1 Product of the Day. You know that PH success comes from: (1) a killer tagline that's specific and benefit-driven, (2) a description that hooks readers in the first sentence and builds with concrete value props, (3) an authentic maker comment that thanks the community and invites real feedback, (4) strategic first comment that drives engagement. No marketing-speak. No "game-changing" or "revolutionary". Be direct about what it does and who it helps.`,
    `Create a complete Product Hunt launch kit for:
Product: ${product_name}
Description: ${product_description}
Target user: ${target_user}
Key features: ${key_features}${story}${price}

Provide:
## Tagline (under 60 chars, specific and benefit-driven, no buzzwords)
[3 options ranked by strength]

## Short Description (under 260 chars for PH listing)
[2 options]

## Maker Comment (200-400 words: authentic intro, what problem it solves, key features, invite feedback, link to special offer if any)

## First Comment Strategy (what to post as first comment in the discussion to drive engagement)

## Launch Day Checklist (10 specific actions to take on launch day)`
  );
  return { content: [{ type: 'text', text }] };
});

server.registerTool('write_landing_page_copy', {
  description: 'Write complete landing page copy — hero, benefits, features, social proof, FAQ, and CTA sections.',
  inputSchema: z.object({
    product_name: z.string(),
    product_description: z.string().describe('What it does and the main outcome it delivers'),
    target_customer: z.string().describe('Specific customer type: e.g., "freelance designers who miss deadlines"'),
    main_pain: z.string().describe('The #1 pain point your product solves'),
    key_features: z.string().describe('3-5 main features'),
    social_proof: z.string().optional().describe('Testimonials, user counts, or results you have'),
    cta_action: z.string().optional().default('Start Free Trial').describe('CTA button text'),
    pricing: z.string().optional(),
  }),
}, async ({ product_name, product_description, target_customer, main_pain, key_features, social_proof, cta_action, pricing }) => {
  const proof = social_proof ? `\nSocial proof: ${social_proof}` : '';
  const price = pricing ? `\nPricing: ${pricing}` : '';
  const text = await ask(
    `You are a direct-response copywriter who specializes in SaaS landing pages. You write copy that converts because it speaks directly to the reader's pain, makes a specific promise, and removes objections. You know that hero sections win or lose in 5 seconds. You write bullets that focus on outcomes not features. You use social proof strategically. Your CTAs are specific ("Start analyzing competitors free" not "Get started").`,
    `Write complete landing page copy for:
Product: ${product_name} — ${product_description}
Target customer: ${target_customer}
Primary pain: ${main_pain}
Features: ${key_features}${proof}${price}
CTA: ${cta_action}

Sections to write:
## HERO
H1 (outcome-focused, speaks to pain, under 10 words)
Subheadline (expand on H1, 15-25 words, specific)
CTA button text + supporting text

## PROBLEM SECTION (2-3 sentences about the pain before your product)

## BENEFITS (3 benefit statements: outcome-focused, not feature-focused)

## FEATURES (3-4 features with name, icon description, and 1-sentence explanation)

## SOCIAL PROOF (write placeholder testimonials if none provided, or format provided ones)

## FAQ (4-5 questions with answers, address main objections)

## FINAL CTA SECTION (headline + button + risk-reversal statement)`
  );
  return { content: [{ type: 'text', text }] };
});

server.registerTool('plan_launch_strategy', {
  description: 'Create a full product launch strategy: pre-launch, launch day, and post-launch with timeline and specific tactics.',
  inputSchema: z.object({
    product_name: z.string(),
    product_type: z.enum(['saas', 'app', 'tool', 'course', 'ebook', 'community', 'marketplace']),
    launch_platform: z.string().describe('Where you plan to launch: e.g., "Product Hunt, Twitter, newsletter"'),
    audience_size: z.string().describe('Your current audience: e.g., "0 followers", "500 email list", "2k Twitter followers"'),
    goal: z.string().describe('What success looks like: e.g., "100 signups on launch day", "5 paying customers"'),
    launch_date_days: z.number().int().min(7).max(60).optional().default(14).describe('Days until launch'),
  }),
}, async ({ product_name, product_type, launch_platform, audience_size, goal, launch_date_days }) => {
  const text = await ask(
    `You are a product launch strategist. You have planned launches that generated hundreds of signups on day 1. You tailor strategy to audience size — a founder with 0 followers needs a different plan than one with 10k. You focus on what actually moves the needle: warm email lists, personal outreach, specific communities, not generic "post on social media" advice.`,
    `Build a ${launch_date_days}-day launch strategy for:
Product: ${product_name} (${product_type})
Launch platforms: ${launch_platform}
Current audience: ${audience_size}
Goal: ${goal}

Provide:
## Pre-Launch Phase (days 1-${Math.floor(launch_date_days * 0.6)})
[Week-by-week actions: building the list, getting waitlist signups, warm-up posts, beta users]

## Launch Day Plan (hour-by-hour for key activities)
[Specific posts to make, DMs to send, communities to post in, timing]

## Post-Launch Week
[Follow-up strategy: testimonial collection, iteration, secondary launch waves]

## With 0 Audience Playbook (specific tactics for getting your first 50 users from scratch)

## Metrics to Track (what to measure each day and what to do if numbers are off)`
  );
  return { content: [{ type: 'text', text }] };
});

server.registerTool('write_launch_emails', {
  description: 'Write the launch email sequence — teaser, launch day, follow-up. For both your list and cold outreach.',
  inputSchema: z.object({
    product_name: z.string(),
    product_description: z.string(),
    launch_offer: z.string().optional().describe('Special launch offer: e.g., "50% off first 3 months", "lifetime deal for first 100"'),
    audience: z.string(),
  }),
}, async ({ product_name, product_description, launch_offer, audience }) => {
  const offer = launch_offer ? `\nLaunch offer: ${launch_offer}` : '';
  const text = await ask(
    `You are a launch email specialist. You write the 4 critical launch emails: teaser (builds anticipation), launch day (drives action), social proof follow-up (converts fence-sitters), last chance (urgency for any offer). Each email is short, personal, and has one job.`,
    `Write the launch email sequence for:
Product: ${product_name} — ${product_description}
Audience: ${audience}${offer}

EMAIL 1: TEASER (send 3-5 days before launch)
Subject: [intriguing, don't reveal the product]
Body: [100-150 words, build anticipation, hint at what's coming]

EMAIL 2: LAUNCH DAY
Subject: [clear, exciting, include product name]
Body: [150-200 words, what it is, who it's for, the offer, single CTA]

EMAIL 3: SOCIAL PROOF (send 2-3 days after launch)
Subject: [reference early user results or feedback]
Body: [150 words, share early reactions, address common questions]

EMAIL 4: LAST CHANCE (if there's a launch offer, end of campaign)
Subject: [urgency, specific deadline]
Body: [100-150 words, remind of offer, add one more reason to act now]`
  );
  return { content: [{ type: 'text', text }] };
});

const PORT = process.env.PORT;
if (PORT) {
  const httpServer = http.createServer(async (req, res) => {
    if (req.url === '/health') { res.writeHead(200); res.end('ok'); return; }
    if (req.url === '/' || req.url?.startsWith('/mcp')) {
      const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
      res.on('close', () => transport.close());
      await server.connect(transport);
      await transport.handleRequest(req, res); return;
    }
    res.writeHead(404); res.end();
  });
  httpServer.listen(Number(PORT), () => console.log('Listening on port ' + PORT));
} else {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
