---
name: Indonesia Intelligence
description: Calm, evidence-first Indonesian news intelligence for consequential family decisions.
colors:
  primary: "#1d4ed8"
  canvas: "#f6f8fb"
  surface: "#ffffff"
  ink: "#0f172a"
  text-secondary: "#475569"
  text-muted: "#526174"
  positive: "#047857"
  caution: "#a16207"
  negative: "#dc2626"
typography:
  display:
    fontFamily: "Geist Sans, sans-serif"
    fontSize: "clamp(34px, 5vw, 62px)"
    fontWeight: 700
    lineHeight: 1.02
  body:
    fontFamily: "Geist Sans, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Geist Mono, monospace"
    fontSize: "11px"
    fontWeight: 700
rounded:
  sm: "10px"
  md: "16px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "22px"
  control:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    height: "44px"
---

# Design System: Indonesia Intelligence

## Overview

**Creative North Star: "The Calm Situation Room"**

A restrained analytical workspace for reading imperfect evidence without panic. Editorial hierarchy and compact data panels support rapid scanning, while explicit caveats prevent a numerical signal from impersonating certainty.

**Key Characteristics:**
- Evidence and coverage qualification appear beside every decision signal.
- Dense information uses quiet surfaces, strong headings, and limited semantic color.
- Desktop charts become readable structured lists where mobile width cannot support them.

## Colors

The palette uses cool paper neutrals, a disciplined blue accent, and darker semantic colors that retain normal-text contrast.

**The Evidence Color Rule.** Green, amber, and red communicate measured states only; missing evidence uses neutral or blue, never green.

## Typography

Geist Sans carries editorial and operational copy; Geist Mono is reserved for scores, dates, labels, and compact evidence metadata.

**The One-Headline Rule.** Each route has one page-level heading; status and analytical sections follow beneath it.

## Layout

The content sits in a 1240px maximum-width frame. Desktop uses paired analytical panels and two-column highlights; breakpoints at 980px and 680px collapse content into a single reading path. Controls preserve a 44px minimum hit target. Long-form copy stays near 66–78 characters per line.

## Elevation & Depth

Surfaces are primarily separated by borders and tonal layering. Shadows are quiet and used only where a status or floating tooltip needs distinction.

## Shapes

Cards use 16px corners; controls and compact callouts use approximately 7–10px corners. Borders remain thin and low-contrast so information, not chrome, leads.

## Components

### Status panel
Pairs the decision label with data sufficiency, evidence counts, confidence, sentiment composition, and a visible limitation. Withhold the numerical index when critical coverage is insufficient.

### Charts and lists
Charts always have a screen-reader data equivalent. Missing days are gaps, not zero-valued observations. On small screens the topic chart becomes a structured list.

### Highlights
Source-linked stories use editorial numbering and topic/sentiment metadata. Selection prioritizes breadth across covered topics before filling remaining slots.

### Controls and navigation
Buttons, selects, and navigation links have visible focus treatment and minimum 44px targets. Async report changes announce loading, success, or error state.

## Do's and Don'ts

### Do:
- **Do** place uncertainty and missing coverage next to the headline verdict.
- **Do** use Indonesian for all reader-facing explanatory content.
- **Do** keep original source links available for verification.

### Don't:
- **Don't** call an uncovered topic stable or neutral.
- **Don't** treat headline sentiment as personal-safety advice or a relocation recommendation.
- **Don't** compress desktop charts into illegible mobile graphics.
