# Landing Page Improvement - Implementation Plan

## KB Board Reference
- **Board Key**: `fbced7ba`
- **Board Title**: Landing Page Improvement
- **View Board**: `kb board view fbced7ba`
- **Spec**: [.specs/landing-page-improvement/specification.md](../.specs/landing-page-improvement/specification.md)

---

## Overview

Redesign the Home page to communicate Kanbin's value proposition clearly to developers with a no-BS mindset. Transform the current minimal landing page into a comprehensive, developer-focused experience with clear benefits, multiple entry points, and technical transparency.

**Primary Goals:**
- Communicate value in under 3 seconds
- Show practical usage examples (CLI, API, UI)
- Provide instant gratification (create board with one click)
- Build technical credibility through transparency

---

## Dependencies

### Existing
- React 18+ (already in project)
- React Router (already in project)
- Existing CSS variables in `index.css`
- Current API client in `src/api/client.ts`

### New (None for MVP1)
- No new npm packages required
- Using emoji for icons (no icon library needed)
- Inline styles or extended CSS (no CSS framework)

---

## File Structure

### Files to Modify
- `frontend/src/pages/Home.tsx` - Main landing page component
- `frontend/src/index.css` - Add landing page specific styles
- `frontend/src/App.css` - Update if needed for layout

### Files to Create (None)
- All changes will be in existing files to keep it simple for MVP1

---

## Implementation Phases

### Phase 1: Content Structure & Hero Redesign
**Status**: [ ] Not Started

#### Step 1.1: Update hero headline and subheadline
- **KB Task**: 4d2b6579
- **Status**: [ ] Not Started
- **Description**: Replace "Instant Kanban Boards" with "Ephemeral Kanban boards for humans and AI agents"
- **Files**: `frontend/src/pages/Home.tsx`
- **Changes**:
  - Update `<h1>` with new headline
  - Update `<p>` subheadline to emphasize no signup, auto-expiry, agent-friendly

#### Step 1.2: Keep existing create-board form
- **KB Task**: 06dfe85f
- **Status**: [ ] Not Started
- **Description**: Verify existing form functionality remains intact
- **Files**: `frontend/src/pages/Home.tsx`
- **Changes**: None (validation step)

#### Step 1.3: Add secondary CTA (Try CLI/View Demo)
- **KB Task**: 22e9422a
- **Status**: [ ] Not Started
- **Description**: Add links below primary CTA for CLI and demo board
- **Files**: `frontend/src/pages/Home.tsx`
- **Changes**:
  - Add "View Demo Board" link to a pre-created demo
  - Add "Try the CLI" link to installation docs

#### Step 1.4: Create basic CSS layout with sections
- **KB Task**: ba90595f
- **Status**: [ ] Not Started
- **Description**: Define section structure and base styles
- **Files**: `frontend/src/index.css`
- **Changes**:
  - Add `.landing-section` class
  - Add `.landing-hero`, `.landing-features`, etc.
  - Define spacing and max-width constraints

**Deliverable**: Hero section with improved copy and CTAs

---

### Phase 2: Features & Use Cases Sections
**Status**: [ ] Not Started

#### Step 2.1: Create FeatureGrid with 6 key features
- **KB Task**: 4bf55f9a
- **Status**: [ ] Not Started
- **Description**: Add feature grid section with 6 key MVP1 features
- **Files**: `frontend/src/pages/Home.tsx`
- **Changes**:
  - Create features array with: Zero Friction, Auto-Expiring, Agent-First, Key-Based, Lightweight, Open by Default
  - Map to feature cards with title and description

#### Step 2.2: Add emoji icons for features
- **KB Task**: 94fb8a27
- **Status**: [ ] Not Started
- **Description**: Add emoji icons to each feature
- **Files**: `frontend/src/pages/Home.tsx`
- **Changes**:
  - ⚡ Zero Friction
  - ⏰ Auto-Expiring
  - 🤖 Agent-First
  - 🔑 Key-Based Sharing
  - 🎯 Lightweight
  - 🔓 Open by Default

#### Step 2.3: Create UseCases section
- **KB Task**: f1f1382b
- **Status**: [ ] Not Started
- **Description**: Add "Built For" section with target use cases
- **Files**: `frontend/src/pages/Home.tsx`
- **Changes**:
  - List 4-5 use cases
  - Add anti-pattern callout

#### Step 2.4: Style sections for responsive layout
- **KB Task**: bf8df746
- **Status**: [ ] Not Started
- **Description**: Add responsive grid styles
- **Files**: `frontend/src/index.css`
- **Changes**:
  - Feature grid: 1 column mobile, 2 columns tablet, 3 columns desktop
  - Use CSS Grid with gap
  - Feature card styles

**Deliverable**: Features grid and use cases visible on page

---

### Phase 3: Quick Start & Technical Details
**Status**: [ ] Not Started

#### Step 3.1: Create QuickStart section (3 paths)
- **KB Task**: e70bcc6d
- **Status**: [ ] Not Started
- **Description**: Add "Get Started in 30 Seconds" section
- **Files**: `frontend/src/pages/Home.tsx`
- **Changes**:
  - Web UI path
  - CLI path with install command
  - API path with cURL example

#### Step 3.2: Add code snippets with styling
- **KB Task**: 729ff2fe
- **Status**: [ ] Not Started
- **Description**: Style code blocks for CLI and API examples
- **Files**: `frontend/src/index.css`
- **Changes**:
  - `.code-block` styles
  - Monospace font, dark background
  - Syntax-like formatting

#### Step 3.3: Create TechnicalDetails section
- **KB Task**: ace9efd7
- **Status**: [ ] Not Started
- **Description**: Add "What You Should Know" transparency section
- **Files**: `frontend/src/pages/Home.tsx`
- **Changes**:
  - Stack info
  - Limits (100 tasks, 7 days)
  - Data visibility note
  - Deletion policy

#### Step 3.4: Add copy-to-clipboard for CLI commands
- **KB Task**: f9be41e4
- **Status**: [ ] Not Started
- **Description**: Add copy button for code snippets
- **Files**: `frontend/src/pages/Home.tsx`
- **Changes**:
  - Copy button component
  - Use navigator.clipboard API
  - Show "Copied!" feedback

**Deliverable**: Complete quick start and technical transparency sections

---

### Phase 4: Polish & Accessibility
**Status**: [ ] Not Started

#### Step 4.1: Refine responsive breakpoints
- **KB Task**: 1e9d55a8
- **Status**: [ ] Not Started
- **Description**: Test and adjust breakpoints for mobile, tablet, desktop
- **Files**: `frontend/src/index.css`
- **Changes**:
  - Mobile: < 640px
  - Tablet: 640px - 1024px
  - Desktop: > 1024px

#### Step 4.2: Add semantic HTML and ARIA labels
- **KB Task**: 82e78cb7
- **Status**: [ ] Not Started
- **Description**: Ensure proper HTML5 semantics
- **Files**: `frontend/src/pages/Home.tsx`
- **Changes**:
  - Use `<section>`, `<article>`, `<nav>`
  - Add `aria-label` to sections
  - Proper heading hierarchy (h1, h2, h3)

#### Step 4.3: Test keyboard navigation
- **KB Task**: 2ab9f241
- **Status**: [ ] Not Started
- **Description**: Verify all interactive elements are keyboard accessible
- **Files**: Manual testing
- **Changes**:
  - Tab through all CTAs and links
  - Enter key activates buttons
  - Focus visible

#### Step 4.4: Optimize CSS spacing and hierarchy
- **KB Task**: d65379fb
- **Status**: [ ] Not Started
- **Description**: Fine-tune spacing, typography, visual hierarchy
- **Files**: `frontend/src/index.css`
- **Changes**:
  - Consistent section padding
  - Clear visual hierarchy
  - Generous whitespace

**Deliverable**: Fully polished, accessible landing page

---

### Phase 5: Testing & Validation
**Status**: [ ] Not Started

#### Step 5.1: Manual testing checklist
- **KB Task**: 15e65450
- **Status**: [ ] Not Started
- **Description**: Execute manual testing checklist from spec
- **Testing**:
  - Landing page loads in <1s
  - Hero visible without scrolling
  - Create board flow works
  - All sections readable
  - Mobile layout works

#### Step 5.2: Accessibility audit
- **KB Task**: 1948dc30
- **Status**: [ ] Not Started
- **Description**: Run accessibility checks
- **Testing**:
  - Color contrast (WCAG AA)
  - Keyboard navigation
  - Screen reader test
  - Form labels and errors

#### Step 5.3: Cross-browser testing
- **KB Task**: 94984447
- **Status**: [ ] Not Started
- **Description**: Test on multiple browsers
- **Testing**:
  - Chrome
  - Firefox
  - Safari
  - Edge

#### Step 5.4: Validate content accuracy
- **KB Task**: 94b13609
- **Status**: [ ] Not Started
- **Description**: Verify all content matches MVP1 capabilities
- **Testing**:
  - Feature descriptions accurate
  - Technical details correct
  - No undelivered promises
  - Install commands work

**Deliverable**: Tested and validated landing page ready for deployment

---

## Testing Strategy

### Unit Tests (Optional for MVP1)
- Form submission
- Copy-to-clipboard functionality

### Integration Tests
- Create board flow end-to-end
- Navigation to demo board

### Manual Testing
- Visual regression on mobile/tablet/desktop
- Accessibility with keyboard and screen reader
- Cross-browser compatibility

---

## Success Criteria

✅ **Complete when:**
1. All 20 KB tasks marked as DONE
2. Landing page loads in <1 second
3. Developer can understand what Kanbin is within 5 seconds
4. All manual testing items pass
5. Accessibility audit passes (WCAG AA)
6. Content is accurate and matches MVP1
7. Create board flow works identically to before
8. No linting or build errors

---

## Notes

- Keep existing functionality intact (form, error handling, navigation)
- Use existing CSS variables from `index.css`
- No new dependencies for MVP1
- Progressive enhancement approach (works without JS for form)
- Mobile-first responsive design
