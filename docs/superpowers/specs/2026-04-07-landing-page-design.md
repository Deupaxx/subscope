# SubScope Landing Page — Design Spec
**Date:** 2026-04-07  
**Status:** Approved for implementation

---

## Context

SubScope is a free, open-source Substack analytics tool. Substack offers no native analytics for competitive research or self-auditing. SubScope solves this: paste any handle and get top posts (by hearts/restacks), notes engagement, posting frequency, and audience size. Two audiences: writers auditing their own performance, and readers/researchers understanding any writer on the platform. The tool shows data without editorializing.

---

## Design Direction

**Palette:** Warm Creator  
- Background: `#fdf8f3` (warm cream)  
- Text primary: `#1c1917` (stone-900)  
- Text secondary: `#78716c` (stone-500)  
- Text muted: `#a8a29e` (stone-400)  
- Border: `#ede8e0`  
- Card background: `#ffffff`  
- Accent orange: `#e97316`  
- Accent orange light: `#fff7ed` bg / `#fed7aa` border / `#ea580c` text  
- Support section bg: `#1c1917`  

**Typography:**  
- Headlines: `Playfair Display` (serif, 700/900, italic for accent phrases)  
- Body / UI: `DM Sans` (400/500/600/700)  
- Load via `next/font/google`

---

## Page Structure

```
Navbar
Hero
─────────────── divider
Section 1: Who it's for
─────────────── divider
Section 2: Support (dark bg)
Footer
```

The existing analytics results UI (search output) remains below the hero search box on the same page — it streams in after submission, same as today.

---

## Components

### 1. Navbar

Full-width, sticky top. `background: #fdf8f3`, `border-bottom: 1px solid #ede8e0`.

**Left:** Logo — `SubScope` in Playfair Display italic, bold, followed by an orange `✦` star glyph.

**Right links (DM Sans, small, `#78716c`):**
- "How it works" → smooth-scrolls to Section 1
- "GitHub" → links to repo (external)
- "☕ Buy me a coffee" → pill button, `background: #fff7ed`, `color: #ea580c`, `border: 1px solid #fed7aa` → placeholder `#` link for now (deupaxx will add BMC link later)

---

### 2. Hero

Centered, generous top padding. `background: #fdf8f3`.

**Badge:** Small all-caps label — `SUBSTACK ANALYTICS` — in orange-tinted pill (`#fff7ed` bg, `#ea580c` text, `#fed7aa` border).

**Headline (Playfair Display, 900 weight, ~3rem, tight leading):**
```
Substack has
no analytics.
Now it does.
```
"Now it does." in italic orange (`color: #e97316; font-style: italic`).

**Subtext (DM Sans, `#78716c`, ~1rem):**
> Paste any handle and instantly see what's working — top posts, notes engagement, posting frequency, and audience size.

**Search box:** Max-width ~480px, centered. White background, `border: 1.5px solid #d6cfc6`, `border-radius: 8px`. Input on left (placeholder: `@handle or substack URL`), dark pill button on right (`background: #1c1917`, text `Analyze →`).

**Below search:** Small muted text — `No login · No tracking · Free forever` — `#a8a29e`, DM Sans.

---

### 3. Section 1 — Who it's for

`id="how-it-works"` (for nav smooth scroll). Light padding, `background: #fdf8f3`.

**Section tag:** `WHO IT'S FOR` — uppercase, orange, small, DM Sans 700.

**Section headline (Playfair Display):**
```
Two ways to use SubScope
```
"SubScope" in italic.

**Lead text (DM Sans, `#78716c`):**
> Whether you're a writer or a curious reader, the data tells a story.

**Two-column card grid:**

| Writers card | Researchers card |
|---|---|
| ✍️ emoji | 🔍 emoji |
| **For Writers** | **For Researchers** |
| "Audit your own performance and understand what actually resonates." | "Understand any writer on the platform — who's building something real vs. coasting." |
| → Which posts got the most hearts | → Compare engagement to audience size |
| → How consistent your output is | → See publishing frequency over 6 months |
| → Your best notes by engagement | → Spot the notes that actually land |

Cards: `background: #fff`, `border: 1px solid #ede8e0`, `border-radius: 10px`. Bullet arrows `→` in orange. Headline in Playfair Display.

---

### 4. Section 2 — Support (dark)

Full-width, `background: #1c1917`. Centered text.

**Headline (Playfair Display, white):**
```
Built by a creator,
for creators.
```
"for creators." in italic orange (`#e97316`).

**Body (DM Sans, `#a8a29e`):**
> SubScope is free and open source. If it's saved you time or helped you understand your audience, a coffee goes a long way.

**CTA button:** `☕ Buy me a coffee` — `background: #e97316`, white text, DM Sans 700, `border-radius: 6px`. Link placeholder `#` for now.

**Below button (muted):** `or star it on GitHub — both mean a lot` — `#57534e`, DM Sans small.

---

### 5. Footer

`background: #fdf8f3`, `border-top: 1px solid #ede8e0`. Flex row, space-between.

- **Left:** `SubScope` in Playfair Display italic, `#78716c`
- **Right:** `Open source · Made with ♥ · @deupaxx` — DM Sans, small, `#a8a29e`

---

## File Changes

| File | Change |
|---|---|
| `src/app/layout.tsx` | Add Playfair Display + DM Sans via `next/font/google` |
| `src/app/page.tsx` | Add Navbar, Hero (replace current hero), Section 1, Section 2, Footer above and below existing results UI |
| `src/app/globals.css` | No changes needed (Tailwind v4 inline) |

The existing analytics results (profile card, posts list, notes list) stay on the same page — they appear below the hero search box after submission, unchanged functionally.

---

## Out of scope

- Dark mode
- Animations beyond CSS transitions on nav hover states
- Mobile responsiveness (not explicitly requested — keep layout sensible but don't optimize for mobile yet)
- Actual Buy Me a Coffee URL (deupaxx will add later — use `#` placeholder)
