# EZY Customer Digital Presence Tracker

## UI / UX Design System

**Version:** 1.1
**Product:** Internal Sales Intelligence Platform
**Design Language:** EZY Digital
**Framework:** Next.js + React
**Styling:** Tailwind CSS
**Primary Audience:** Internal Sales / Marketing / Management

---

# 1. Design Direction

The application should feel like an **EZY Digital internal product**, not a generic SaaS dashboard.

Visual character:

* Modern
* Sharp
* Professional
* Minimal
* Data-oriented
* Editorial
* High information density
* Premium but practical

The interface should communicate:

> **Digital agency intelligence tool — not generic CRM software.**

Avoid:

* AI dashboard aesthetics
* Excessive gradients
* Glassmorphism
* Excessive rounded cards
* Huge decorative illustrations
* Neon colors
* Purple AI gradients
* Excessive shadows
* Over-animated UI
* Generic Bootstrap-style layouts

The interface should prioritize:

```text
Information clarity
+
Visual hierarchy
+
Fast scanning
+
EZY brand character
```

---

# 2. Brand Colors

Use only the following core EZY colors:

```text
Orange
#FF7800

Blue
#1A75FF

Deep Navy
#002236

Dark
#1C1B18

Warm Ivory
#FCFBF0

White
#FFFFFF
```

---

# 3. Color Roles

## Primary Background

```text
#FCFBF0
```

Use for the application canvas.

---

## Surface

```text
#FFFFFF
```

Use for:

* cards;
* tables;
* forms;
* modals;
* dropdowns;
* elevated content.

---

## Primary Text

```text
#1C1B18
```

Use for:

* headings;
* body text;
* labels;
* navigation where appropriate.

---

## Dark Surface

```text
#002236
```

Use for:

* sidebar;
* dark headers;
* selected dark sections;
* high contrast components.

---

## Primary Accent

```text
#FF7800
```

Use for:

* primary CTA;
* selected navigation;
* important actions;
* opportunity highlights;
* active interaction;
* progress indicators.

---

## Secondary Accent

```text
#1A75FF
```

Use for:

* information;
* secondary actions;
* links;
* website-related data;
* informational indicators;
* charts.

---

# 4. Typography

## IMPORTANT

The application uses **two fonts only**.

### Primary UI / Text Font

```text
Overused Grotesk
```

Use Overused Grotesk for:

* headings;
* navigation;
* buttons;
* labels;
* descriptions;
* body text;
* tables;
* badges;
* forms;
* tooltips;
* empty states;
* all general UI text.

---

### Numeric Font

```text
Space Mono
```

Use Space Mono **ONLY for numbers and numeric data**.

Examples:

```text
1,284
812
327
93.4%
30 days
7 days
200
404
500
```

Space Mono should NOT be used for:

* headings;
* navigation;
* body copy;
* buttons containing normal text;
* descriptions;
* labels.

---

# 5. Font Implementation

Create explicit font variables.

```css
--font-display: "Overused Grotesk";
--font-body: "Overused Grotesk";
--font-mono: "Space Mono";
```

Tailwind configuration should expose:

```text
font-sans
→ Overused Grotesk

font-mono
→ Space Mono
```

However:

> `font-mono` must only be applied intentionally to numeric/data elements.

Do not globally set the entire application to monospace.

---

# 6. Typography Hierarchy

## Page Heading

```text
Overused Grotesk
32px
600
```

Example:

```text
Digital Presence Overview
```

---

## Section Heading

```text
Overused Grotesk
20–22px
600
```

---

## Card Heading

```text
Overused Grotesk
15–16px
600
```

---

## Body

```text
Overused Grotesk
14px
400
```

---

## Small UI

```text
Overused Grotesk
12–13px
500
```

---

## KPI Number

```text
Space Mono
32px
500–600
```

Example:

```text
1,284
```

---

## Small Numeric Data

```text
Space Mono
12–14px
```

Examples:

```text
28 Sep 2026
30 days
8 posts
200 OK
```

---

# 7. Numeric Styling Principle

Numbers should visually feel different from text.

Example:

```text
TOTAL CUSTOMERS

1,284
```

Where:

```text
TOTAL CUSTOMERS
→ Overused Grotesk

1,284
→ Space Mono
```

This creates a clear EZY editorial/data aesthetic.

---

# 8. Application Layout

Desktop-first.

```text
┌──────────────────────────────────────────────────┐
│                                                  │
│ Sidebar │ Top Navigation                         │
│         ├────────────────────────────────────────┤
│         │                                        │
│         │ Main Content                           │
│         │                                        │
│         │                                        │
│         │                                        │
└─────────┴────────────────────────────────────────┘
```

---

# 9. Sidebar

Width:

```text
240px
```

Collapsed:

```text
72px
```

Background:

```text
#002236
```

Sidebar should feel like a strong EZY brand element.

---

# 10. Sidebar Navigation

Structure:

```text
[ EZY LOGO ]

Dashboard

Customers

Opportunities

Scans

Imports

────────────────

Settings
```

The logo is intentionally not specified.

Implementation should use the logo asset provided by the user.

---

# 11. Sidebar Item

Height:

```text
40px
```

Padding:

```text
10px 12px
```

Radius:

```text
8px
```

Inactive:

```text
rgba(255,255,255,0.72)
```

Active:

```text
background: #FF7800
color: #FFFFFF
```

Hover:

```text
rgba(255,255,255,0.08)
```

Do not use glowing effects.

---

# 12. Main Background

```text
#FCFBF0
```

This should be the primary application canvas.

The warm ivory background is an important part of the EZY visual identity.

---

# 13. Top Bar

Height:

```text
64px
```

Structure:

```text
Page Title
                         Search
                         Notifications
                         User
```

Background:

```text
#FCFBF0
```

Bottom border:

```text
rgba(28,27,24,0.08)
```

Avoid heavy shadows.

---

# 14. Dashboard

Route:

```text
/dashboard
```

Header:

```text
Digital Presence Overview

Monitor website and Instagram presence across your customer database.
```

Right:

```text
[ Start Scan ]
```

Primary CTA:

```text
#FF7800
```

---

# 15. KPI Cards

Four main KPI cards:

```text
Total Customers
Website Active
Website Not Found
Instagram Active
```

Example:

```text
┌─────────────────────────┐
│ TOTAL CUSTOMERS         │
│                         │
│ 1,284                   │
│                         │
│ +12 this week           │
└─────────────────────────┘
```

Typography:

```text
TOTAL CUSTOMERS
→ Overused Grotesk

1,284
→ Space Mono

+12 this week
→ Overused Grotesk
```

---

# 16. KPI Number Treatment

Numbers should have strong visual presence but should not dominate the entire interface.

```text
font-family: Space Mono
font-size: 32px
font-weight: 500
letter-spacing: -0.02em
```

---

# 17. Opportunity Section

Primary business intelligence section:

```text
Website Opportunities
```

Description:

```text
Customers with no detected website and active Instagram presence.
```

Example:

```text
┌────────────────────────────────────────────────┐
│ WEBSITE OPPORTUNITIES                          │
│                                                │
│ 184                                            │
│                                                │
│ No Website + Active Instagram                  │
│                                                │
│ [ View Opportunities ]                         │
└────────────────────────────────────────────────┘
```

`184` uses:

```text
Space Mono
```

---

# 18. Digital Presence Matrix

Main dashboard component.

```text
DIGITAL PRESENCE

                    WEBSITE
              Active   Missing

INSTAGRAM
Active         812      184
Inactive       219       43
Not Found       31      102
```

This should be highly readable.

Numbers:

```text
Space Mono
```

Labels:

```text
Overused Grotesk
```

---

# 19. Opportunity Cards

Use minimal cards.

Example:

```text
┌──────────────────────────────────────┐
│ WEBSITE OPPORTUNITY                  │
│                                      │
│ 184                                  │
│                                      │
│ No website                           │
│ Instagram active                     │
│                                      │
│ View leads →                         │
└──────────────────────────────────────┘
```

Accent:

```text
#FF7800
```

---

# 20. Customer Table

Route:

```text
/customers
```

Header:

```text
Customers

1,284 customers in database
```

Action:

```text
[ Import ]
[ Scan ]
```

---

# 21. Table Columns

```text
Business
Category
Location
Website
Instagram
Last Post
Opportunity
Last Checked
```

Example:

| Business       | Category   | Website   | Instagram | Last Post | Opportunity |
| -------------- | ---------- | --------- | --------- | --------- | ----------- |
| ABC Restaurant | Restaurant | Not Found | Active    | 4 days    | Website     |
| XYZ Cafe       | Cafe       | Active    | Dormant   | 220 days  | Social      |
| Bali Villa     | Villa      | Not Found | Active    | 2 days    | Website     |

---

# 22. Table Typography

Business:

```text
Overused Grotesk
font-weight: 500
```

Numeric/date:

```text
Space Mono
```

Status:

```text
Overused Grotesk
```

Example:

```text
Last Post
4 days ago
```

Where:

```text
Last Post
→ Overused Grotesk

4
→ Space Mono

days ago
→ Overused Grotesk
```

Do not force the entire string into Space Mono.

---

# 23. Status Badges

Compact.

Height:

```text
28px
```

Radius:

```text
6px
```

Use subtle background colors.

Example:

```text
● Active
```

The bullet can use the accent color while the text remains dark.

---

# 24. Website Status

### Active

```text
Blue accent
#1A75FF
```

### Not Found

```text
Orange accent
#FF7800
```

### Needs Review

```text
Deep Navy
#002236
```

### Inactive

Muted neutral.

---

# 25. Instagram Status

### Active

Use a subtle positive state.

### Cooling

```text
#FF7800
```

### Inactive

Muted neutral.

### Dormant

Dark/muted.

### Not Found

Light neutral.

### Needs Review

Deep Navy.

---

# 26. Do Not Use Instagram Brand Gradient

Do NOT use:

```text
purple
pink
orange
gradient
```

as an Instagram UI treatment.

The Instagram icon can be used if required, but the product interface itself remains EZY branded.

---

# 27. Filters

Filter bar:

```text
┌─────────────────────────────────────────────────────┐
│ Search customer...                                  │
│                                                     │
│ Website ▼   Instagram ▼   Category ▼   Location ▼ │
└─────────────────────────────────────────────────────┘
```

Background:

```text
#FFFFFF
```

Border:

```text
rgba(28,27,24,0.12)
```

---

# 28. Opportunity Filter

Primary quick filters:

```text
All

Website Opportunity

Website + Active Instagram

Social Opportunity

Needs Review
```

Selected:

```text
background: #FF7800
color: #FFFFFF
```

---

# 29. Search

Global search should support:

```text
Business name
Contact
Phone
Email
Domain
Instagram username
```

Search input should be visually quiet.

Avoid oversized search bars.

---

# 30. Customer Detail

Route:

```text
/customers/[id]
```

Header:

```text
ABC Restaurant

Restaurant · Canggu, Bali
```

Actions:

```text
[ Edit ]
[ Scan Now ]
```

---

# 31. Digital Presence Overview

Customer detail begins with a compact overview:

```text
┌──────────────────────────────────────────┐
│ DIGITAL PRESENCE                         │
│                                          │
│ Website        Instagram                │
│ NOT FOUND      ACTIVE                    │
│                                          │
│               Last post: 4 days ago     │
└──────────────────────────────────────────┘
```

---

# 32. Website Card

```text
WEBSITE

Status
Not Found

No website was discovered during the latest scan.

Last checked
01 Oct 2026

[ Search Again ]
```

Dates:

```text
Space Mono
```

Text:

```text
Overused Grotesk
```

---

# 33. Instagram Card

```text
INSTAGRAM

@abcrestaurant

ACTIVE

Last post
4 days ago

Posts / 30 days
8

Posts / 90 days
21

[ Open Instagram ]
[ Recheck ]
```

Numbers:

```text
Space Mono
```

---

# 34. Scan History

Timeline:

```text
01 OCT 2026
Website → Not Found
Instagram → Active

24 SEP 2026
Website → Not Found
Instagram → Active

17 SEP 2026
Website → Not Found
Instagram → Active
```

Date:

```text
Space Mono
```

Description:

```text
Overused Grotesk
```

---

# 35. Manual Verification UI

For uncertain results:

```text
NEEDS REVIEW

Possible Instagram profiles

@abc_restaurant
Score 87

@abcrestaurantbali
Score 64

[ Confirm ]
[ Reject ]
```

Scores:

```text
87
64
```

must use:

```text
Space Mono
```

---

# 36. Import Screen

Route:

```text
/imports
```

Design:

```text
Import Customers

Upload your customer database.

┌──────────────────────────────┐
│                              │
│   Drop CSV or XLSX here      │
│                              │
│   or                         │
│                              │
│   [ Choose File ]            │
│                              │
└──────────────────────────────┘
```

Keep it simple.

No unnecessary multi-step visual wizard.

---

# 37. Import Preview

After upload:

```text
Import Preview

1,284 records detected

Business Name
Contact
Phone
Email
Location
Category

[ Cancel ]
[ Import 1,284 Customers ]
```

Numeric values:

```text
Space Mono
```

---

# 38. Scan Screen

Route:

```text
/scans
```

Example:

```text
Website & Instagram Scan

Scanning customer database

████████████████░░░░ 78%

984 / 1,284

Successful     921
Needs Review    42
Failed          21
```

All numbers:

```text
Space Mono
```

---

# 39. Progress Bar

Primary progress:

```text
#FF7800
```

Track:

```text
rgba(28,27,24,0.08)
```

Do not animate aggressively.

Use a smooth subtle transition.

---

# 40. Opportunities Page

Route:

```text
/opportunities
```

Header:

```text
Sales Opportunities

Customers identified from digital presence data.
```

Tabs:

```text
Website
Website + Instagram
Social
Needs Review
```

---

# 41. Opportunity Table

Example:

```text
┌────────────────────────────────────────────────────────┐
│ BUSINESS       WEBSITE     INSTAGRAM    OPPORTUNITY   │
├────────────────────────────────────────────────────────┤
│ ABC Restaurant NOT FOUND  ACTIVE       WEBSITE       │
│ XYZ Cafe       NOT FOUND  ACTIVE       WEBSITE       │
│ Bali Spa       ACTIVE     INACTIVE     SOCIAL        │
└────────────────────────────────────────────────────────┘
```

---

# 42. Export CTA

Primary:

```text
[ Export XLSX ]
```

Color:

```text
#FF7800
```

Secondary:

```text
[ Export CSV ]
```

Color:

```text
#FFFFFF
border: #1C1B18
```

---

# 43. Empty States

Empty states should be editorial and minimal.

Example:

```text
No website opportunities found.

All customers currently have a detected website
or require further verification.

[ Run Scan ]
```

Do not use large illustrations.

---

# 44. Loading States

Use skeleton loaders.

Avoid full-page spinners.

Example:

```text
████████████
██████
████████████████
```

Skeleton color:

```text
rgba(28,27,24,0.06)
```

---

# 45. Modal

Modal:

```text
background: #FFFFFF
border-radius: 12px
```

Shadow should be subtle.

Maximum width:

```text
480–640px
```

depending on content.

---

# 46. Buttons

## Primary

```text
background: #FF7800
color: #FFFFFF
```

Example:

```text
Start Scan
```

---

## Secondary

```text
background: #FFFFFF
color: #1C1B18
border: 1px solid rgba(28,27,24,0.15)
```

---

## Dark

```text
background: #002236
color: #FFFFFF
```

---

## Link

```text
color: #1A75FF
```

No underline unless needed for accessibility.

---

# 47. Button Typography

Buttons use:

```text
Overused Grotesk
14px
500
```

Never use Space Mono for button labels.

Even:

```text
Export 1,284
```

should remain primarily Overused Grotesk, while the number can be wrapped with the numeric font if visually appropriate.

---

# 48. Border Radius

Use restrained radius.

```text
Small:
6px

Default:
8px

Card:
12px

Modal:
12px
```

Avoid:

```text
24px
32px
9999px
```

except for small pills/status badges.

---

# 49. Shadows

Default:

```text
none
```

Use borders first.

When elevation is required:

```text
0 4px 20px rgba(28,27,24,0.06)
```

Avoid large floating shadows.

---

# 50. Spacing

Base:

```text
4px
```

Preferred:

```text
8
12
16
20
24
32
40
48
64
```

Dashboard sections:

```text
32px
```

Cards:

```text
20–24px
```

---

# 51. Responsive Behavior

Desktop-first but fully responsive.

Breakpoints:

```text
Mobile
<640px

Tablet
640–1024px

Desktop
>1024px
```

On mobile:

Sidebar becomes:

```text
bottom navigation
```

or collapsible drawer.

Tables become:

```text
horizontal scroll
```

Do not destroy information density by turning every table into huge cards.

---

# 52. Data Density

This is an internal operational tool.

Therefore:

> Favor compact interfaces over excessive whitespace.

Recommended table row height:

```text
52–60px
```

Avoid giant 80–100px rows.

---

# 53. Icons

Use:

```text
Lucide React
```

Icons:

```text
16–18px
```

Avoid decorative icon boxes everywhere.

Icons should communicate function.

---

# 54. Charts

Charts should be minimal.

Use:

```text
Recharts
```

Potential dashboard charts:

### Website Status

```text
Active
Not Found
Inactive
Needs Review
```

### Instagram Activity

```text
Active
Cooling
Inactive
Dormant
```

Charts should use EZY colors.

Do not introduce random chart colors.

---

# 55. Animation

Animation should be subtle.

Allowed:

```text
opacity
transform
progress
drawer
modal
hover
```

Duration:

```text
150–250ms
```

Avoid:

* bouncing;
* excessive spring animation;
* animated gradients;
* dashboard elements constantly moving.

---

# 56. Micro-interactions

Good:

```text
Button hover
Row hover
Filter selection
Copy domain
Confirm profile
Progress update
```

Bad:

```text
Cards flying into viewport
Constant animated counters
Glowing buttons
Excessive parallax
```

---

# 57. Accessibility

Requirements:

* WCAG AA contrast where practical.
* Keyboard navigation.
* Visible focus states.
* Buttons must have clear labels.
* Icons requiring interaction need accessible labels.
* Tables must maintain semantic structure.
* Color must not be the only indicator of status.

For example:

Do not rely solely on:

```text
green = active
```

Use:

```text
● Active
```

---

# 58. Dark Mode

**Not required for MVP.**

The primary experience should remain:

```text
Warm Ivory
+
White
+
Deep Navy
+
Orange
+
Blue
```

Do not add dark mode unless there is a business requirement.

---

# 59. Design Tokens

Recommended CSS variables:

```css
:root {
  --ezy-orange: #FF7800;
  --ezy-blue: #1A75FF;
  --ezy-navy: #002236;
  --ezy-dark: #1C1B18;
  --ezy-ivory: #FCFBF0;
  --ezy-white: #FFFFFF;

  --font-ui: "Overused Grotesk", sans-serif;
  --font-number: "Space Mono", monospace;
}
```

---

# 60. Component Naming

Use reusable React components.

```text
DashboardShell
Sidebar
TopBar
PageHeader

KpiCard
StatusBadge
OpportunityCard
DigitalPresenceMatrix

CustomerTable
CustomerRow
CustomerFilters
CustomerSearch

WebsiteCard
InstagramCard
ScanHistory

ImportDropzone
ImportPreview

ScanProgress
ScanStatus

OpportunityTable
ExportButton
```

---

# 61. Component Principle

Do not create one-off UI for every page.

For example:

```text
StatusBadge
```

should support:

```text
website-active
website-inactive
website-not-found
instagram-active
instagram-cooling
instagram-inactive
instagram-dormant
needs-review
scan-failed
```

This keeps the visual system consistent.

---

# 62. Visual Priority

Every page should follow:

```text
1. What am I looking at?
2. What matters?
3. What action can I take?
```

Example dashboard:

```text
Digital Presence Overview
        ↓
Website / Instagram Metrics
        ↓
Opportunity Segments
        ↓
Customer Data
        ↓
Action
```

---

# 63. UX Principle

The most important workflow is:

```text
Open Dashboard
↓
See Opportunities
↓
Filter
↓
Inspect Customer
↓
Verify if needed
↓
Export
```

The UI should optimize for this workflow.

---

# 64. Primary Business Scenario

A sales user opens:

```text
/opportunities
```

Then selects:

```text
Website:
Not Found

Instagram:
Active
```

System shows:

```text
184 customers
```

Sales can then:

```text
Review
↓
Export XLSX
↓
Contact prospects
```

This should require as few clicks as possible.

---

# 65. Visual Personality

The final interface should feel:

```text
EZY Digital
+
Editorial
+
Data Intelligence
+
Operational
```

Not:

```text
Generic CRM
+
AI dashboard
+
Startup template
```

---

# 66. Design Rule of Thumb

When deciding between two UI approaches:

Choose the one that is:

```text
Simpler
More readable
More data-dense
More EZY
Less decorative
```

---

# 67. Final Visual Formula

```text
OVERUSED GROTESK
        +
SPACE MONO
        +
WARM IVORY
        +
WHITE
        +
DEEP NAVY
        +
ORANGE
        +
BLUE
        +
MINIMAL UI
        +
HIGH DATA DENSITY
```

This becomes the visual foundation for the entire Customer Digital Presence Intelligence Tracker.

---

# 68. Logo

The EZY Digital logo will be provided separately by the user/development agent.

Implementation requirements:

* Do not recreate the logo.
* Do not use placeholder text as the final logo.
* Preserve the provided logo's aspect ratio.
* Support light/dark placement depending on the logo asset.
* Primary placement: sidebar top.
