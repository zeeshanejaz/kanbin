# Landing Page Improvement Specification

## User Story
As a developer or AI agent evaluating Kanbin, I want a landing page that immediately communicates what the tool is, why it exists, and how to use it — with zero fluff and maximum clarity.

## Task Description
Redesign the Home page (landing page) to align with MVP1 goals, showcase Kanbin's unique value proposition, and provide multiple clear entry points (create board, try CLI, view demo board).

---

## Purpose and Goals

### Primary Goal
Transform the current minimal landing page into a developer-focused page that:
1. Communicates the core value proposition in **under 3 seconds**
2. Shows practical usage examples (CLI, API, UI)
3. Provides instant gratification (create board with one click)
4. Builds technical credibility through transparency

### Secondary Goals
- Increase board creation conversion rate
- Educate users about CLI/API-first design
- Set clear expectations about ephemeral nature
- Reduce "what is this?" confusion

---

## Research: Developer Landing Page Best Practices

### No-BS Developer Mindset Principles
1. **Immediate clarity** - What is it, why does it exist, in one sentence
2. **Show, don't tell** - Real code examples, not marketing copy
3. **Respect their time** - No walls of text, scannable content
4. **Prove it works** - Demo board, live examples
5. **Technical honesty** - Show limits, stack, what happens to data
6. **Multiple entry points** - Let them choose their path (UI/CLI/API)

### Proven Patterns
- **Hero**: One-liner + visual demo or code snippet
- **Quick Start**: 3-step "getting started" with actual commands
- **Feature Grid**: 4-6 key features with icons
- **Use Cases**: "Perfect for X, not for Y"
- **Technical Details**: Stack, limits, architecture transparency
- **Social Proof**: GitHub link, star count (if notable)

---

## Key Requirements

### 1. Hero Section (Above the Fold)
**Must Have:**
- **Headline**: One-sentence description of what Kanbin is
  - Current: "Instant Kanban Boards" ❌ (too generic)
  - Proposed: "Ephemeral Kanban boards for humans and AI agents" ✅
- **Subheadline**: Core benefit in 10-15 words
  - Emphasize: No signup, instant creation, auto-expiry, agent-friendly
- **Primary CTA**: Create board input + button (keep current UX)
- **Secondary CTA**: "Try the CLI" or "View Demo Board"
- **Visual Element**: Optional code snippet or board preview

### 2. Quick Start Section
**Must Have:**
- **Title**: "Get Started in 30 Seconds"
- **Three Paths**:
  1. **Web UI**: "Create a board above and share the key"
  2. **CLI**: Show command: `kb board create "Sprint Planning"`
  3. **API**: Show cURL example
- **Installation snippet** for CLI (one-liner if possible)

### 3. Key Features Grid
**Must Have (4-6 features):**
1. ⚡ **Zero Friction** - No signup, no login, just create
2. ⏰ **Auto-Expiring** - Boards deleted after 7 days (MVP1)
3. 🤖 **Agent-First** - CLI and API are first-class citizens
4. 🔑 **Key-Based Sharing** - Share the board key, that's it
5. 🎯 **Lightweight** - 100 tasks max, minimal surface area
6. 🔓 **Open by Default** - Anyone with the key can view/edit

**Each feature:**
- Icon (emoji or simple SVG)
- Title (2-4 words)
- Description (one sentence, <20 words)

### 4. Use Cases Section
**Must Have:**
- **Title**: "Built For"
- **List (4-5 items):**
  - AI agents running autonomous coding tasks
  - Solo devs needing a quick scratchpad board
  - Weekend hackers and side projects
  - Short-lived sprints (hours to days)
  - Pair programming sessions
- **Anti-pattern callout**: "Not for long-term project management"

### 5. Technical Transparency Section
**Must Have:**
- **Title**: "What You Should Know"
- **Details:**
  - Stack: Go backend, React frontend, PostgreSQL
  - Limits: 100 tasks per board, 7-day expiry
  - Data: Boards are public to anyone with the key
  - Deletion: Automatic after 7 days, no recovery
  - Cost: Free for MVP1 (anonymous boards)
- **Tone**: Honest, matter-of-fact, no fine print

### 6. Footer / Links
**Must Have:**
- Link to GitHub repo (if public)
- Link to CLI installation docs
- Link to API docs
- Link to project synopsis or about page

---

## User Interactions and Workflows

### Primary Flow: Create Board via Web
1. User lands on home page
2. Reads headline/subheadline (3-5 seconds)
3. Enters board name in input field
4. Clicks "Create Board"
5. Redirects to `/b/{key}` (existing behavior)

### Secondary Flow: Try CLI
1. User clicks "Try the CLI" link
2. Modal or section expands showing:
   - Install command (e.g., `go install ...`)
   - Create command (e.g., `kb board create "Test"`)
   - View command (e.g., `kb board view {key}`)
3. User copies command to clipboard

### Tertiary Flow: View Demo Board
1. User clicks "View Demo Board" link
2. Navigates to a pre-created demo board with example tasks
3. Can interact with demo board (optional: read-only or full access)

---

## Technical Requirements

### Component Structure
```
frontend/src/pages/Home.tsx (main component)
frontend/src/components/
  ├── Hero.tsx (headline + CTA)
  ├── QuickStart.tsx (3-path getting started)
  ├── FeatureGrid.tsx (key features)
  ├── UseCases.tsx (built for section)
  └── TechnicalDetails.tsx (transparency section)
```

**Alternative (simpler):** Keep everything in `Home.tsx` with clear section divs.

### Styling Approach
- **Option A**: Extend `App.css` with landing page styles
- **Option B**: Create `Home.module.css` or `landing.css`
- **Recommendation**: Use CSS variables for consistency, mobile-first responsive design

### Dependencies
- No new dependencies required for MVP1
- Optional: Use existing icon library if available, otherwise emojis

### State Management
- Keep existing state (`title`, `loading`, `error`)
- Add optional state for "demo board modal" or "CLI instructions modal" if interactive

---

## Design Constraints

### Visual Design
- **Color Scheme**: Match existing brand (check `index.css` for theme variables)
- **Typography**: Use existing font stack, clear hierarchy (H1, H2, body)
- **Spacing**: Generous whitespace, not cramped
- **Layout**: Single column on mobile, 2-column grid for features on desktop

### Content Constraints
- **Brevity**: No paragraph longer than 3 sentences
- **Scannability**: Use bullets, headers, code blocks
- **Tone**: Professional but casual, no marketing jargon
- **Accuracy**: All claims must match MVP1 actual features

### Technical Constraints
- Must work without JavaScript (progressive enhancement)
- Maintain existing create-board form functionality
- Fast initial load (<1s on 3G)
- Accessible (ARIA labels, keyboard navigation)

---

## Edge Cases and Error Handling

| Edge Case | Handling |
|-----------|----------|
| User submits empty board name | Keep existing validation (disable button) |
| API is down during creation | Show error message (existing behavior) |
| Demo board doesn't exist | Fallback to creating a new demo or show message |
| CLI install command fails | Provide alternative install methods |
| User has JavaScript disabled | Form still submits via standard POST |

---

## Testing and Validation Criteria

### Manual Testing
- [ ] Landing page loads in under 1 second
- [ ] Hero section is visible without scrolling (above fold)
- [ ] Create board flow works identically to current version
- [ ] All sections are readable and scannable
- [ ] Mobile layout doesn't break (responsive breakpoints)
- [ ] Copy-to-clipboard works for CLI commands (if implemented)
- [ ] Demo board link works (if implemented)

### Accessibility Testing
- [ ] Color contrast meets WCAG AA standards
- [ ] All interactive elements are keyboard-accessible
- [ ] Screen reader can navigate logical heading hierarchy
- [ ] Form has proper labels and error announcements

### Content Validation
- [ ] All feature descriptions match actual MVP1 capabilities
- [ ] Technical details are accurate (7-day expiry, 100 tasks)
- [ ] No marketing fluff or undelivered promises
- [ ] Install commands are copy-pasteable and correct

### Success Metrics (Post-Launch)
- Board creation rate increases or stays stable
- Bounce rate decreases (users engage with content)
- CLI install link clicks (if trackable)
- Qualitative feedback: "I immediately understood what this is"

---

## Implementation Phases

### Phase 1: Content Structure & Hero Redesign
**Tasks:**
1.1. Update hero headline and subheadline
1.2. Keep existing create-board form (input + button)
1.3. Add secondary CTA (Try CLI or View Demo)
1.4. Create basic CSS layout with sections

**Deliverable:** Hero section with improved copy and CTAs

---

### Phase 2: Features & Use Cases Sections
**Tasks:**
2.1. Create FeatureGrid component (or section) with 6 key features
2.2. Add emoji icons or simple SVGs for each feature
2.3. Create UseCases section ("Built For" list)
2.4. Style both sections for responsive layout

**Deliverable:** Features grid and use cases visible on page

---

### Phase 3: Quick Start & Technical Details
**Tasks:**
3.1. Create QuickStart section with 3 paths (Web, CLI, API)
3.2. Add code snippets with syntax highlighting (or monospace styling)
3.3. Create TechnicalDetails section with transparency info
3.4. Add copy-to-clipboard functionality for CLI commands (optional)

**Deliverable:** Complete quick start and technical transparency sections

---

### Phase 4: Polish & Accessibility
**Tasks:**
4.1. Refine responsive breakpoints for mobile/tablet/desktop
4.2. Add proper semantic HTML and ARIA labels
4.3. Test keyboard navigation and screen reader compatibility
4.4. Optimize CSS for consistent spacing and visual hierarchy
4.5. Add subtle animations (optional, e.g., fade-in on scroll)

**Deliverable:** Fully polished, accessible landing page

---

### Phase 5: Testing & Validation
**Tasks:**
5.1. Run manual testing checklist (see Testing section)
5.2. Perform accessibility audit (contrast, keyboard, screen reader)
5.3. Test on multiple browsers (Chrome, Firefox, Safari, Edge)
5.4. Validate content accuracy against MVP1 spec
5.5. Fix any issues identified in testing

**Deliverable:** Tested and validated landing page ready for deployment

---

## Open Questions
1. **Demo board**: Should we create a persistent demo board or generate one on-the-fly?
   - *Recommendation*: Create a persistent demo board with example tasks, recreate weekly
2. **CLI installation**: Which install method to prioritize in Quick Start?
   - *Recommendation*: Show `go install` first, link to full install docs
3. **GitHub link**: Is the repo public yet?
   - *Check*: If yes, include GitHub button in header; if no, omit
4. **Analytics**: Should we track CTA clicks?
   - *Recommendation*: Not for MVP1, add in MVP2 if needed

---

## Success Criteria

**MVP1 Landing Page is successful if:**
- ✅ A developer can understand what Kanbin is within 5 seconds
- ✅ Clear value proposition is communicated (ephemeral, no signup, agent-first)
- ✅ Multiple entry points are visible (Web, CLI, API)
- ✅ Technical transparency builds trust (limits, expiry, stack)
- ✅ Page is fast, accessible, and mobile-friendly
- ✅ No marketing fluff or undelivered promises
- ✅ Board creation flow remains functional and simple
