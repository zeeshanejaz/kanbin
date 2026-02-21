# Kanbin — MVP Delivery Plan

This document outlines the planned delivery milestones for Kanbin, broken into focused MVP phases. Each MVP is independently shippable and builds on the previous one.

---

## MVP1 — Anonymous Boards (Core)

**Scope:** No accounts, no teams, no billing. Pure anonymous board usage.

**Includes:**
- Backend REST API
- Web frontend (read + write boards by key)
- CLI tool
- Board creation (anonymous, key-based)
- Full task CRUD (create, read, update title/description/status, delete)
- Board search by text
- Board deletion
- 100-task limit enforcement
- 7-day expiry (can be simulated or deferred to a background job)
- Board view by key (public, no auth)

**Excludes:** Signup, login, teams, billing, board persistence beyond key

---

## MVP2 — Teams & Signup (No Billing)

**Scope:** Email/password signup, team management, free-tier limits. No real billing.

**Includes:**
- User registration (email + password)
- Login / logout (CLI + UI)
- Team creation at signup
- Linking existing anonymous boards to a team via board key
- Team board management (view all team boards)
- User management (invite, remove team members)
- Free-tier limits (10 boards per team, 7-day expiry)
- Upgrade button visible with **"Coming Soon"** label
- Anonymous board limits remain as-is

**Excludes:** Real billing, paid tiers, paid-tier features

---

## MVP3 — Billing & Paid Tiers

**Scope:** Real subscription billing, tier upgrades/downgrades, paid-tier features.

**Includes:**
- Billing integration (dev-friendly subscription system, e.g. Stripe)
- Basic Team plan ($10/mo, 500 boards, 10-day deletion window)
- Premium Team plan (5000 boards, 30-day deletion window)
- Upgrade flow from UI
- Downgrade flow with explicit policy communication (no board loss)
- `pending_deletion` state and recovery UI
- Eager deletion option
- Boards not degraded on downgrade (existing boards grandfathered)
- New board creation restricted after downgrade if over new limit

**Excludes:** Enterprise SSO, custom swim lanes

---

## MVP4 — Enterprise SSO & Custom Swim Lanes

**Scope:** Enterprise identity integration and flexible board configuration for power users and larger teams.

**Includes:**
- Enterprise SSO via SAML 2.0 / OIDC (e.g. Okta, Azure AD, Google Workspace)
- Custom swim lanes per board (create, rename, reorder, delete lanes)
- Default lane set remains as a starting template; any lane can be renamed or replaced
- Tasks moved to a deleted lane are placed in a holding state with a prompt to reassign
- SSO available as an add-on or higher-tier feature (pricing TBD)

**Excludes:** Role-based access control within a team (all members remain equal), audit logs
