# GnT Player Agent Homepage — 20-Expert Panel Review

**Date:** 2026-04-05
**Reviewed by:** 20 simulated domain experts (Claude Opus 4.6)
**Target:** `docs/index.html` (GitHub Pages) and `src/web/chat-ui.ts` (localhost)

---

## 1. CONVERSION COPYWRITER

**Evaluating:** Taglines, CTAs, emotional hooks, word economy

**What works:**
- "How do you really feel about the people in your community?" is a strong emotional opener that creates tension
- The comparison cards (Skill Rating vs Give 'n Take) are a powerful before/after visual argument
- "Your private diary. Nobody sees it but you." is simple and resonant

**What doesn't work:**
- The tagline is THREE lines crammed into one `<p>`. That's not a tagline, it's a paragraph. Visitors have 3-5 seconds.
- "Start Conversation with your Private Give 'n Take Agent" is too long and wordy for a CTA button. Needs to be punchy and action-oriented.
- "Every person in your community reduced to one number" -- strong line but "community" is vague. "Club" is more specific.
- "Let's change that." in the comparison arrow is weak. Doesn't create urgency.
- The right comparison card label says "Give 'n Take" which is a brand name, not a value proposition. Users don't know what that means yet.

**IMPLEMENT NOW:**
1. Break tagline into clear hierarchy: one punchy headline + one supporting line
2. Shorten CTA button text to something like "Meet Your Agent"
3. Change right card label from "GIVE 'N TAKE" to "YOUR SOCIAL DIARY" -- mirrors the diary concept
4. Change comparison arrow text from "Let's change that." to something with more tension

**NICE-TO-HAVE:**
- A/B test "diary" vs "private agent" language
- Add social proof number if available ("500+ players at NEPC")

---

## 2. PRODUCT DESIGNER (Apple/Stripe caliber)

**Evaluating:** Visual hierarchy, layout, flow, whitespace

**What works:**
- Dark theme is clean and premium
- Comparison cards have good contrast between old-world (gray/dull) and new-world (green glow)
- The three-panel layout (chat + feed + graph) is sophisticated
- Mini-graph animation in the comparison card is a nice touch

**What doesn't work:**
- No visual hierarchy in the header. Everything is the same weight.
- The tagline text at 23px is too large for what should be supporting copy; it competes with the comparison cards which are the actual hero
- Badge row adds visual noise before the user understands the product. Tech badges mean nothing until after the "aha."
- The mode toggle (Chat/GUI) is premature -- users haven't understood the product yet, why are we showing them view options?
- Start button has no breathing room. It's crammed between the mode toggle and the hidden persona list.

**IMPLEMENT NOW:**
1. Add proper spacing: more padding above comparison cards, more breathing room around CTA
2. Move badges BELOW the start button or reduce their visual prominence before demo
3. Reduce tagline font-size -- let the comparison cards be the hero
4. Add a subtle section separator between the comparison cards and the CTA area

**NICE-TO-HAVE:**
- Animate comparison cards on scroll/entry
- Add a "Built on Sui" small watermark rather than tech badges in hero

---

## 3. PRIVACY/TRUST UX EXPERT

**Evaluating:** Does the privacy promise land? Trust signals?

**What works:**
- Lock icon in multiple places reinforces privacy
- "Your wallet. Your key. Your data." is a strong trust line
- The comparison card lock line "Your private diary. Nobody sees it but you." is clear
- Settings panel has granular privacy controls (what coordinator sees)
- Privacy proof in results (ACCESS DENIED to wrong wallet) is a powerful demo moment

**What doesn't work:**
- "Seal Encryption (testnet-ready)" badge is an anti-trust signal. "Testnet-ready" screams "not actually working."
- The privacy promise in the tagline is buried in a wall of text
- No explanation of HOW privacy works before the user has to trust it with their feelings
- "Mike D. -- avoid / reason stays private" in the comparison card is good but could be stronger

**IMPLEMENT NOW:**
1. Add a one-line privacy explanation near the CTA: "Encrypted on Sui blockchain. Not even we can read it."
2. Change "testnet-ready" to just show the tech cleanly without the qualifier (it's a demo page)

**NICE-TO-HAVE:**
- Add a "How your privacy works" expandable section
- Show the Sui Explorer link more prominently

---

## 4. BEHAVIORAL PSYCHOLOGIST

**Evaluating:** What emotions does "diary" trigger? Social dynamics?

**What works:**
- "Diary" triggers intimacy, privacy, personal ownership -- perfect associations
- The "avoid" example with Mike D. taps into a real pain point everyone has but nobody talks about
- The question "How do you really feel about the people in your community?" creates psychological tension that demands resolution
- The progression from skill rating (impersonal) to diary (personal) mirrors a real emotional journey

**What doesn't work:**
- "Diary" has a slight feminine/juvenile connotation for some demographics. For competitive male pickleball players (a key demo), "diary" might create mild resistance.
- The page lacks social proof / herd behavior triggers. No indication others use this.
- Starting with a question is psychologically strong but needs to resolve quickly.

**IMPLEMENT NOW:**
1. No changes needed to "diary" language -- the associations are correct and powerful
2. Consider adding a subtle "players at NEPC are already using this" or similar

**NICE-TO-HAVE:**
- Test "playbook" as alternative to "diary" for competitive segment
- Add testimonial-style quotes from demo scenarios

---

## 5. WEB3/CRYPTO NATIVE

**Evaluating:** Do badges/tech signals make sense? Credibility?

**What works:**
- Badge row with Sui, Seal, MemWal, Gemini shows real tech stack awareness
- Explorer link for wallet verification is authentic web3
- Messaging SDK integration shows Sui ecosystem depth
- Privacy proof (wallet-based access control) is core web3 value prop

**What doesn't work:**
- "LLM (Gemini)" badge is odd. Web3 natives don't care about the LLM brand. They care about the on-chain guarantees.
- "MemWal" is not a widely known term. Needs context.
- No link to smart contract source code or audit
- "Testnet" is fine for a demo but should be explicit about mainnet timeline

**IMPLEMENT NOW:**
1. Change "LLM (Gemini)" to just "AI Agent" -- the LLM backend is an implementation detail
2. Add "View Source" link or GitHub badge for contract credibility

**NICE-TO-HAVE:**
- Link to Move source code
- Add gas cost transparency

---

## 6. SEED-STAGE INVESTOR

**Evaluating:** What makes them lean in or tune out?

**What works:**
- The comparison cards are a killer investor visual. Shows the insight clearly.
- Privacy + AI + blockchain for a real use case (not speculation) is compelling
- The roadmap overlay shows thoughtful phased go-to-market
- "Krista" reference in roadmap adds authenticity (named coordinator, not abstract)

**What doesn't work:**
- No market size signal on the homepage
- No indication this is a B2B2C play (sells to clubs, free for players)
- The page title says "Private AI Matchmaking on Sui" which is feature-speak, not market-speak
- Missing: one line about who is behind this / traction

**IMPLEMENT NOW:**
1. Update page title to be more market-oriented
2. Add a subtle "Built for club operators" line somewhere to signal B2B

**NICE-TO-HAVE:**
- "NEPC proving ground" mention
- Traction metric if available

---

## 7. SPORTS/RECREATION COMMUNITY MANAGER

**Evaluating:** Does this resonate with club operators?

**What works:**
- The comparison cards nail the pain point: skill ratings alone don't capture social dynamics
- The roadmap (Phase 1: Krista's Agent) shows empathy for the coordinator role
- Settings panel with club-specific permissions is thoughtful

**What doesn't work:**
- "Blockchain" and "Sui" are scary words for club operators. They want results, not technology.
- No mention of reducing coordinator workload (the #1 thing they'd pay for)
- The page is player-facing, not operator-facing. Need both lenses.

**IMPLEMENT NOW:**
1. No structural changes -- this is correctly a player-facing demo. The operator pitch is a separate artifact.

**NICE-TO-HAVE:**
- Add a "For Club Operators" link/section

---

## 8. ACCESSIBILITY EXPERT

**Evaluating:** Contrast, screen readers, navigation, ARIA

**What works:**
- Font sizes are reasonable (11-23px range)
- Color coding includes text labels (not color-only)

**What doesn't work:**
- Many interactive elements lack ARIA labels (badges, toggle switches, comparison cards)
- Canvas elements (mini-graph, community graph) are completely inaccessible to screen readers
- Color contrast: var(--text2) (#94a3b8) on var(--bg) (#0a0e1a) = ratio ~4.0:1, barely meets AA for large text, FAILS for small text
- No skip navigation link
- Mode toggle buttons don't indicate current state to screen readers
- Settings toggle switches have no aria-checked attribute
- No focus indicators visible on many interactive elements

**IMPLEMENT NOW:**
1. Add `aria-label` to the start button and key interactive elements
2. Add `alt` text / `aria-label` to canvas elements
3. Improve color contrast on secondary text (--text2) -- bump to #a0aec0 or lighter
4. Add `role="switch"` and `aria-checked` to toggle switches in settings

**NICE-TO-HAVE:**
- Skip navigation link
- Full keyboard navigation audit
- Canvas fallback text

---

## 9. BRAND STRATEGIST

**Evaluating:** "Diary" vs "Give 'n Take" -- complement or compete?

**What works:**
- "Give 'n Take" as the company/platform name works alongside "diary" as the product metaphor
- "Your Social Diary" could become a strong sub-brand for the player-facing experience
- The lock icon as a visual identity element is consistent and memorable

**What doesn't work:**
- Right now "Give 'n Take" and "diary" sit next to each other without clear hierarchy
- The comparison card says "Give 'n Take" as a label but the diary concept is introduced in the signal rows below it. Confusing.
- Page title uses "Give 'n Take Agent" which is clunky

**IMPLEMENT NOW:**
1. Change right comparison card label from "GIVE 'N TAKE" to "YOUR SOCIAL DIARY"
2. Keep "Give 'n Take" in the page title but pair it with the diary concept

**NICE-TO-HAVE:**
- Develop "diary" as a consistent product metaphor throughout

---

## 10. DEMO/SALES ENGINEER

**Evaluating:** Does the demo flow sell? Is the aha moment clear?

**What works:**
- The comparison cards ARE the aha moment and they appear first -- good
- The demo conversation is personalized (uses player data, references real partners)
- Finish flow with pipeline steps (Extract > Encrypt > Store > Match) shows the product working
- Privacy proof (ACCESS DENIED) is a memorable demo climax

**What doesn't work:**
- The start button launches into a conversation without enough context. User might not understand what they're about to do.
- Mode toggle (Chat vs GUI) adds decision friction before the demo starts
- The "Done" button is unclear -- "Done with what?"

**IMPLEMENT NOW:**
1. Add a one-line instruction above or on the start button: what will happen when they click
2. Default to GUI mode and remove mode toggle from pre-demo view (keep it accessible after demo starts)

**NICE-TO-HAVE:**
- Guided walkthrough overlay for first-time visitors
- "Watch a demo" video alternative

---

## 11. MOBILE UX EXPERT

**Evaluating:** Responsive, touch targets, thumb zones

**What works:**
- Media queries exist for 1100px and 750px breakpoints
- Graph panel hides on tablet, everything stacks on mobile

**What doesn't work:**
- Comparison cards will be very cramped on mobile (flex row with 24px gap)
- Badge row wraps but individual badges at 15px font with 5px padding are small touch targets (need 44px minimum)
- Start button at 12px padding is too small for mobile thumb targets
- No mobile-specific media query for comparison cards (they need to stack vertically)

**IMPLEMENT NOW:**
1. Add media query to stack comparison cards vertically on mobile (<750px)
2. Increase touch target sizes on mobile for badges and buttons
3. Hide the comparison arrow on mobile and use vertical flow instead

**NICE-TO-HAVE:**
- Swipe gestures for panels
- Bottom-sheet pattern for settings on mobile

---

## 12. DATA VISUALIZATION EXPERT

**Evaluating:** Comparison cards, graph canvas, visual storytelling

**What works:**
- Mini-graph in comparison card is living, breathing data -- very effective
- Comparison cards use color semantics well (green=good, red=avoid, gray=old world)
- Community graph with force-directed layout is engaging

**What doesn't work:**
- The old-world card is too visually dominant (huge 56px number). Should feel purposefully dull/limited.
- The graph in the new-world card is too small to read node labels at 8px
- No data legend for the community graph

**IMPLEMENT NOW:**
1. Reduce old-world rating number size slightly -- it should feel limiting, not commanding attention

**NICE-TO-HAVE:**
- Add a color legend to the community graph
- Animate the comparison cards sequentially

---

## 13. NARRATIVE DESIGNER

**Evaluating:** Demo conversation arc, pacing, emotional payoff

**What works:**
- Conversation starts with validation, moves to positive anchoring, then social preferences -- good therapeutic arc
- The agent references specific player data (names, session counts) creating believability
- The "avoid" question at turn 5 is perfectly placed -- trust is established by then

**What doesn't work:**
- The conversation feels like an interview, not a conversation. Agent asks all the questions.
- Extended conversation (turns 9+) lacks variety -- cycles through the same patterns
- The finish/results sequence is the climax but feels disconnected from the conversation

**IMPLEMENT NOW:**
1. No structural changes -- the narrative arc is solid for a demo

**NICE-TO-HAVE:**
- Add agent personality/warmth ("I love hearing this" type micro-reactions)
- Make results reference specific things the user said

---

## 14. GROWTH/VIRAL EXPERT

**Evaluating:** Shareability, first impression, hook

**What works:**
- The comparison cards are highly shareable as a concept
- The emotional hook (how do you REALLY feel) is provocative

**What doesn't work:**
- No share functionality
- No open graph / social media meta tags for link previews
- The page URL is generic (no memorable slug)
- Missing: "Try it yourself" social CTA after results

**IMPLEMENT NOW:**
1. Add Open Graph meta tags (og:title, og:description, og:image) for social sharing
2. Add a "Share" or "Try it yourself" CTA after the demo results

**NICE-TO-HAVE:**
- Generate a shareable result card image
- Add Twitter/X card meta tags

---

## 15. COMPETITIVE ANALYST

**Evaluating:** How does this compare to sports tech / social matching alternatives?

**What works:**
- No direct competitor owns "private social preferences for sports matching" -- this is novel
- The blockchain privacy guarantee is a genuine differentiator vs. any centralized alternative
- The comparison card literally shows what competitors offer (just a rating) vs. what this offers

**What doesn't work:**
- No explicit competitor callout or "why not just use..." section
- The value prop could be sharper in positioning against rating-only systems

**IMPLEMENT NOW:**
1. The old-world card label "COMPETITIVE SKILL RATING" implicitly positions against the status quo. This is effective. No changes needed.

**NICE-TO-HAVE:**
- Subtle "Every other platform gives you this" above old-world card

---

## 16. PICKLEBALL PLAYER (casual, 3.5 level)

**Evaluating:** Would they understand and want this?

**What works:**
- "How do you really feel about the people in your community?" -- YES. Every 3.5 player has strong opinions about who they want to play with.
- The comparison cards nail it: "I'm more than a 3.5!" is a universal feeling
- Sarah M., Tom K., Mike D. examples are relatable

**What doesn't work:**
- "Sui blockchain," "Seal Encryption," "MemWal" -- I have no idea what these are and they make me nervous
- "Agent" sounds techy. "Your private matchmaking assistant" would land better.
- I don't understand why I need a blockchain for this. Where's the "so what?"

**IMPLEMENT NOW:**
1. Add a plain-English line explaining WHY blockchain matters: "Your preferences are encrypted so nobody -- not even the club -- can see who you avoid."
2. Soften tech jargon in the badge row for non-crypto audiences

**NICE-TO-HAVE:**
- "What's an agent?" tooltip or expandable
- Pickleball-specific imagery

---

## 17. CLUB OWNER/OPERATOR

**Evaluating:** B2B lens, would they pay for this?

**What works:**
- If my coordinator could spend less time on group composition, I'd pay for this
- The roadmap shows this starts with the coordinator (Phase 1), not the players -- smart
- Privacy guarantees mean fewer complaints about favoritism

**What doesn't work:**
- This page is player-facing. I need to see the operator value prop.
- No pricing signal
- No "how does this integrate with my existing system" mention

**IMPLEMENT NOW:**
1. No changes -- this is correctly scoped as a player/investor demo

---

## 18. SUI FOUNDATION GRANTS REVIEWER

**Evaluating:** Technical credibility, ecosystem fit

**What works:**
- Uses real Sui ecosystem: Messaging SDK, Seal encryption, Walrus storage, Sui Testnet
- Move smart contracts are referenced with real architecture (6 modules, ~2,300 lines)
- Badge row shows genuine ecosystem integration, not superficial "built on Sui"
- Privacy model (wallet-based access control) is native to Sui's object model

**What doesn't work:**
- No link to source code or GitHub repo from the demo page
- No mention of Sui-specific technical innovations (object model for player agents, etc.)
- The demo doesn't show a real on-chain transaction in the static version

**IMPLEMENT NOW:**
1. Add a small "View on GitHub" link near the badges or in the footer
2. Make the page title / meta description mention Sui more prominently for discoverability

**NICE-TO-HAVE:**
- Show a real testnet transaction hash in the demo flow
- Link to ARCHITECTURE.md or technical docs

---

## 19. DARK PATTERN ETHICIST

**Evaluating:** Ensure ethical, not manipulative

**What works:**
- Privacy controls are granular and clear (Minimal/Standard/Open)
- "Community contributor" opt-in has clear explanation of what is/isn't shared
- The "avoid" feature explicitly states "reason stays private"
- No fake urgency, no countdown timers, no deceptive UI

**What doesn't work:**
- The "Community contributor" radio is pre-selected (opted in by default). This should default to "Private only" and let users opt in.
- Nothing seriously concerning. The page is honest.

**IMPLEMENT NOW:**
1. Change default community setting from "Community contributor" to "Private only" -- privacy-first default is more ethical and builds more trust

**NICE-TO-HAVE:**
- Add a data deletion / export option in settings

---

## 20. TECHNICAL WRITER

**Evaluating:** Clarity, jargon, onboarding friction

**What works:**
- Comparison cards communicate the core concept without jargon
- Settings descriptions are clear ("Your agent only matches you where you authorize it")
- Pipeline steps in finish flow are descriptive

**What doesn't work:**
- "Sui Testnet," "Seal Encryption," "MemWal" are unexplained jargon
- Page title "Your Give 'n Take Agent -- Private AI Matchmaking on Sui" is dense
- "Start Conversation with your Private Give 'n Take Agent" has too many modifiers
- No onboarding tooltip or first-use guidance

**IMPLEMENT NOW:**
1. Simplify the page title
2. Simplify the start button text
3. Add brief hover tooltips to tech badges

**NICE-TO-HAVE:**
- Onboarding overlay for first-time visitors
- Glossary of terms

---

## CONSOLIDATED IMPLEMENT NOW LIST

### Priority 1: Copy & Messaging (biggest impact on first impression)
1. **Restructure tagline** into clear headline + subline hierarchy
2. **Shorten CTA button** from "Start Conversation with your Private Give 'n Take Agent" to "Meet Your Private Agent"
3. **Change right comparison card label** from "GIVE 'N TAKE" to "YOUR SOCIAL DIARY"
4. **Strengthen comparison arrow** text from "Let's change that." to something with more tension
5. **Simplify page title** to be shorter and more evocative
6. **Add plain-English privacy line** near CTA explaining WHY blockchain matters
7. **Add OG meta tags** for social sharing

### Priority 2: Visual Design & Layout
8. **Add proper spacing/breathing room** around CTA area
9. **Move badges below CTA** or reduce visual weight pre-demo
10. **Reduce tagline font size** to let comparison cards be hero
11. **Stack comparison cards vertically on mobile** (<750px)
12. **Hide comparison arrow on mobile**
13. **Reduce old-world rating number** size slightly

### Priority 3: Accessibility & Trust
14. **Add ARIA labels** to key interactive elements
15. **Add canvas alt text**
16. **Improve text2 contrast** for small text
17. **Change community default** to "Private only" (privacy-first)
18. **Clean up badge labels** -- "AI Agent" instead of "LLM (Gemini)"

### Priority 4: Ecosystem & Discoverability
19. **Add GitHub link** in footer
20. **Add share CTA** after demo results

---

## WHAT WAS IMPLEMENTED

All Priority 1-4 items above were implemented in both `docs/index.html` and `src/web/chat-ui.ts`. Key changes:

1. Tagline restructured: clear headline "How do you really feel about the people you play with?" + subline about the private agent
2. CTA shortened to "Meet Your Private Agent"
3. Right card label changed to "YOUR SOCIAL DIARY"
4. Arrow text changed to "What if you could?"
5. Page title simplified to "Your Private Social Diary | Give 'n Take on Sui"
6. Added privacy explainer line below CTA
7. Added OG meta tags
8. Better spacing around CTA section
9. Badges visually de-emphasized (smaller, moved after CTA)
10. Tagline reduced to 17px
11. Mobile responsive: cards stack vertically, arrow changes to down-arrow
12. Old-world number reduced from 56px to 48px
13. ARIA labels on start button, canvas, mode toggle
14. Text2 contrast improved to #a0aec0
15. Community default changed to Private only
16. Badge label changed from "LLM (Gemini)" to "AI Agent"
17. Added GitHub link in footer area
18. Added "Start a new conversation" share encouragement after results
