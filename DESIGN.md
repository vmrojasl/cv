---
name: Victor Manuel Rojas Leal, Executive Profile
description: Bilingual eight-screen executive story for science ventures and technology transfer, charted from Bogotá.
colors:
  pantone-302c: "#003B5C"
  navy-ink: "#00263c"
  satin-deep-black: "#1B1E23"
  dark-elf: "#3B3E42"
  neutral-600: "#5E6064"
  neutral-500: "#848588"
  neutral-400: "#ABACAE"
  neutral-300: "#D4D5D6"
  ballad-blue: "#BFCDD9"
  olivestone: "#707326"
  trail-sand: "#BFA995"
  sand-on-navy: "#d9c8b8"
  paper: "#f5f6f7"
  white: "#ffffff"
  line: "rgba(27,30,35,.16)"
  line-light: "rgba(255,255,255,.2)"
typography:
  display:
    fontFamily: "\"Georgia Pro\", Georgia, \"Times New Roman\", serif"
    fontSize: "clamp(44px, min(6.6vw, 10.5vh), 96px)"
    fontWeight: 500
    lineHeight: 0.92
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "\"Georgia Pro\", Georgia, \"Times New Roman\", serif"
    fontSize: "clamp(40px, min(5.8vw, 9.5vh), 92px)"
    fontWeight: 500
    lineHeight: 0.92
    letterSpacing: "-0.035em"
  title:
    fontFamily: "\"Georgia Pro\", Georgia, \"Times New Roman\", serif"
    fontSize: "clamp(26px, min(2.3vw, 4.4vh), 40px)"
    fontWeight: 500
    lineHeight: 0.98
    letterSpacing: "-0.03em"
  body:
    fontFamily: "\"Palatino Linotype\", \"Book Antiqua\", Palatino, serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.55
  body-card:
    fontFamily: "\"Palatino Linotype\", \"Book Antiqua\", Palatino, serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  interface:
    fontFamily: "Aptos, \"Segoe UI\", Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 800
    lineHeight: 1.2
  label:
    fontFamily: "Aptos, \"Segoe UI\", Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.12em"
rounded:
  none: "0"
  circle: "50%"
spacing:
  gutter: "clamp(20px, 5vw, 80px)"
  header: "76px"
  header-tablet: "70px"
  max-width: "1440px"
  touch-min: "44px"
  caption-clearance: "150px"
components:
  button-primary:
    backgroundColor: "{colors.pantone-302c}"
    textColor: "{colors.white}"
    typography: "{typography.interface}"
    rounded: "{rounded.none}"
    padding: "0 24px"
    height: "52px"
  button-primary-hover:
    backgroundColor: "{colors.trail-sand}"
    textColor: "{colors.satin-deep-black}"
  button-on-navy:
    backgroundColor: "{colors.trail-sand}"
    textColor: "{colors.satin-deep-black}"
    typography: "{typography.interface}"
    rounded: "{rounded.none}"
    padding: "0 24px"
    height: "52px"
  button-on-navy-hover:
    backgroundColor: "{colors.white}"
    textColor: "{colors.satin-deep-black}"
  button-on-sand-hover:
    backgroundColor: "{colors.satin-deep-black}"
    textColor: "{colors.white}"
  case-tag:
    textColor: "{colors.sand-on-navy}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "8px 11px"
  editorial-case:
    backgroundColor: "{colors.white}"
    textColor: "{colors.satin-deep-black}"
    rounded: "{rounded.none}"
    padding: "clamp(24px, 5vh, 48px) clamp(22px, 2.6vw, 40px)"
  editorial-case-dark:
    backgroundColor: "{colors.satin-deep-black}"
    textColor: "{colors.white}"
  editorial-case-cobalt:
    backgroundColor: "{colors.ballad-blue}"
    textColor: "{colors.satin-deep-black}"
  editorial-case-sand:
    backgroundColor: "{colors.sand-on-navy}"
    textColor: "{colors.satin-deep-black}"
  site-header:
    backgroundColor: "{colors.pantone-302c}"
    textColor: "{colors.white}"
    height: "{spacing.header}"
  profile-link:
    textColor: "{colors.white}"
    rounded: "{rounded.none}"
    size: "44px"
  profile-link-primary:
    backgroundColor: "{colors.trail-sand}"
    textColor: "{colors.satin-deep-black}"
---

# Design System: Victor Manuel Rojas Leal, Executive Profile

## Overview

**Creative North Star: "The Charted Dossier"**

An executive dossier read as a night chart. The story opens in a navy sky centred on Bogotá, where constellations draw out to the ecosystems the work reaches, then turns into eight numbered screens that alternate dark, light and one sand screen at the close. Serif display type carries the authority; Palatino carries the argument; a heavy small-caps-style sans carries the instruments (folios, labels, counters).

Density is low and deliberate: one idea per full-viewport screen, hairline rules instead of boxes, square-cornered surfaces, and circles reserved for celestial and navigational geometry (orbits, portrait arch, dots, round controls). Motion is cinematic but purposeful: masked word rises, soft-focus reveals, wipes on curtains and cards, all collapsing under reduced motion.

The system is shared by the profile (index.html), the holding pages (academy.html, portfolio.html) and the case story (stories/), each of which re-declares the same root tokens.

**Key Characteristics:**
- Eight full-screen story sections, numbered 01 to 08, each with an uppercase letter-spaced folio and a hairline lead-in.
- Tone per screen (`data-tone` dark / light / accent) drives folio, navigator and Next colours.
- Navy radial cosmos hero with a live constellation canvas anchored on Bogotá.
- Square surfaces, 1px hairlines, circles only for orbits, dots and round controls.
- Italic sand emphasis inside serif headlines.
- Bilingual EN/ES; all copy comes from locales/*.json, so layouts must tolerate Spanish expansion.

## Colors

A restrained corporate brand palette: deep Pantone navy and near-black grounds, cool blue-grey and warm sand accents, one olive reserved for the end of the method pipeline.

### Primary
- **Pantone 302C Navy** (pantone-302c): hero and featured-case grounds, header bar, primary button fill on light screens, emphasis and metrics on white screens, pipeline origin.
- **Night Navy** (navy-ink): outer stop of the hero radial gradient and dialog backdrop tint only.

### Secondary
- **Trail Sand** (trail-sand): the warm accent. Headline italics on dark grounds, current navigator dot, progress rail, primary action on navy, contact screen ground, selection colour.
- **Sand on Navy** (sand-on-navy): sand lightened for legibility as text on navy/black (folios, tags, links, counters) and the sand case card.

### Tertiary
- **Ballad Blue** (ballad-blue): cool secondary text on navy (hero lead, captions), brand mark, cobalt case card, orbit and constellation strokes.
- **Olivestone** (olivestone): pipeline end node, gradient terminus, focus ring on light grounds.

### Neutral
- **Satin Deep Black** (satin-deep-black): ink on light grounds; thesis and voices screen grounds; tooltips; ink of the current dot on the sand screen.
- **Dark Elf** (dark-elf): secondary text on cobalt/sand cards; navigator dots on the accent screen.
- **Neutral 600** (neutral-600): secondary editorial text and folios on light screens.
- **Neutral 500 / 400 / 300**: idle navigator dots (500), body text on black (300).
- **Paper** (paper) and **White** (white): light screen and dialog grounds.
- **Line / Line Light**: 1px hairlines on light / dark grounds.

### Named Rules
**The Tone Contract Rule.** Every screen declares a tone; folio, navigator dots and Next button take their colour from it (dark: sand-on-navy; light: neutral-600 / navy; accent: satin-deep-black). On the sand screen the current navigator dot is Satin Deep Black, never sand on sand.

**The Sand Is Scarce Rule.** Trail Sand marks one thing per view: the emphasis, the current position or the primary action. The contact screen is the only sand ground.

## Typography

**Display Font:** Georgia Pro (with Georgia, "Times New Roman", serif)
**Body Font:** Palatino Linotype (with "Book Antiqua", Palatino, serif)
**Label/Interface Font:** Aptos (with "Segoe UI", Arial, sans-serif)

**Character:** A classical serif voice for claims and a book serif for argument, set against a dense heavy sans for every instrument. All three are Windows/Office system fonts, not web fonts; no @font-face is loaded.

**Open item (font delivery):** on macOS, iOS and Android the stacks fall back (typically Georgia, Palatino or a generic serif, and Arial or the platform sans for Aptos), so metrics, widths and heavy-label weight differ from the Windows rendering. Fit-sensitive layouts (hero h1, deck-mode screens, label rows) must be checked on non-Windows devices until a licensed web-font decision is made.

### Hierarchy
- **Display** (500, var display-xl clamp up to 96px, 0.92): hero h1 only.
- **Headline** (500, display-l clamp up to 92px, 0.9 to 0.98, -0.035em): section h2s; smaller clamps for dense screens (case grid, thesis, method).
- **Title** (500, 22 to 40px clamps, about 1.0): card h3s, dialog result, validation card, pipeline stage names.
- **Body** (400 Palatino, 18px / 1.5 to 1.55, max 56 to 62ch): section leads and dialog body; 16px on phones.
- **Body (cards)** (16px / 1.45 to 1.5): case cards, method pipeline, validation card, operating lead.
- **Interface** (800 Aptos, 13 to 15px): buttons, text actions, case links.
- **Label** (800 Aptos, 12px, 0.06 to 0.16em, uppercase): folios, tags, captions, nav numerals, chain steps, tooltips.

### Named Rules
**The 12px Floor Rule.** No label, folio, tag, caption or tooltip is set below 12px. Card and pipeline body copy is 16px.

**The Italic Sand Rule.** Emphasis inside a serif headline is an `em` in italic; on dark grounds it is Trail Sand, on white it is Navy. It is an identity element, not a stylistic accident.

## Layout

- **Story shell:** eight `.screen` sections, each at least 100svh, content in a centred grid capped at 1440px with a fluid gutter (20 to 80px) and top padding that clears the fixed header (76px; 70px at 1100px and below).
- **Deck mode (1101px wide and 700px tall or more):** mandatory scroll snap with snap-stop on every screen; section dot navigator at the right edge; Next button bottom-right on every screen except the last.
- **Free scroll (1100px and below):** proximity snap; the section dot navigator is hidden; the floating Next button shows only on the first (hero) screen; the hero proof strip reserves 150px right padding so it never runs under Next.
- **Columns:** two-column asymmetrical splits (about 1.35 / 0.65) on desktop collapse to one column at 1100px; the case grid goes 4 to 2 to 1 columns (1100px, 760px); the method pipeline turns vertical at 900px.
- **Phone (760px and below):** 20px gutters, header status and brand subtitle removed, proof strip hidden, hero links move under the portrait with 56px right clearance for Next.
- **Cosmos anchor:** desktop places Bogotá in the open sky between the hero copy and the profile; tablet places it in the open sky between the profile links and the proof strip; phone places it near the bottom of the hero. It never sits over copy.
- Short-height desktop windows (800px or less) tighten screen padding rather than shrink type below its clamps.

## Elevation & Depth

Flat by default. Depth comes from tonal grounds (navy, black, white, paper, sand), the radial cosmos gradient, a frosted header (navy at 94% with an 18px blur) and parallax of decorative layers (orbits, giant numerals, quote mark). Shadows appear only as a response to lift.

### Shadow Vocabulary
- **Card lift** (`0 28px 50px -18px rgba(27,30,35,.35)`): editorial case on hover/focus, paired with an 8px rise. Pointer devices only.
- **Dialog** (`0 40px 100px -20px rgba(0,0,0,.45)`): the case dialog over a navy blurred backdrop.
- **Halo ring** (`0 0 0 8px #fff`): pipeline nodes knocking out the track line; not a depth device.

### Named Rules
**The Lift-On-Intent Rule.** Surfaces rest flat; a shadow appears only with hover, focus or a modal layer.

## Shapes

Square corners everywhere text lives: buttons, tags, cards, chain steps, the language switch, profile links and the dialog are all 0 radius with 1px borders. Circles (50%) are reserved for orbital and navigational geometry: hero orbits, the arched portrait over its sand disc, navigator dots, pipeline nodes, the Next button ring and the dialog close button. Rules are hairlines (1px, occasionally 2px for metric and pipeline gradients); the folio lead-in is a 28px hairline that draws in when its screen becomes active.

## Components

### Buttons
- **Shape:** square (0) with a 52px minimum height, 0 24px padding, 800-weight 14px Aptos.
- **Primary:** navy fill, white text on light screens; on the navy hero it inverts to sand fill with black text.
- **Hover:** a fill wipes up from the bottom (0.45s, expo-out): sand on light, white on the hero, black on the sand contact screen. Pointer devices only.
- **Text action:** inline link with an arrow icon; an underline grows from the left on hover and the arrow nudges up-right.

### Chips
- **Case tag:** sand-on-navy text, 1px sand hairline border, uppercase 12px label, no fill.
- **Chain step (thesis):** display-scale Georgia word (500, up to 46px, sentence case) in a 1px white outline, joined to its neighbour by a hairline connector; the lead step fills Trail Sand with black ink, the goal step takes a sand inset ring. Role tags (12px Aptos, sand-on-navy) hang under a step; a one-line caption sits under the chain.

### Cards / Containers
- **Editorial case:** square, white ground with a left hairline divider; dark, cobalt (Ballad Blue) and sand variants. A large serif index numeral at low opacity sits top-right; label row, serif title, 16px Palatino body, then an underlined "open" control.
- **Validation card:** hairline border over 4% white on the black voices screen.
- **Thesis convergence (02):** the five languages enter scattered, enlarged (1.22x), rotated and at 20% white; each lights sand as the sentence above names it, then all converge into one chain (1.1s ease-in-out, 90ms stagger). Reduced motion shows the formed chain. On desktop (>1100px) the chain never wraps; below it may wrap and its block takes the full measure; on phones it stacks vertically.
- **Model plate:** heads the chain it describes: a 12px uppercase "Transfer model 01 / 17" index (sand-on-navy, count in white) over the model name in italic Georgia, Trail Sand, up to 38px; the name fades up 8px on each change. Controls sit at the chain's right edge: two 44px outlined square steps around a 17-segment tick bar (3px, sand countdown fill, 5s cycle, hover/focus pauses).
- **Thesis resolve:** under a hairline, the conclusion h2 (up to 74px, "investment-grade" kept unbroken) with the capabilities line in 16px Palatino to its right; it lands 1.2s after the chain forms.

### Navigation
- **Header:** fixed frosted navy bar, brand mark (Ballad Blue square monogram), status counter, EN/ES switch (pressed state is white fill, navy text), menu toggle with two hairlines that cross.
- **Menu:** full-screen navy index; numbered serif links 01 to 08 with sand numerals, tools and a bordered CTA in a right column; stacked to one column on phones.
- **Section navigator:** right-edge dots (22px hit area), current dot filled sand (Satin Deep Black on the accent screen), black tooltip label on hover/focus. Desktop deck mode only.
- **Next button:** uppercase label plus a 38px round arrow ring, bottom-right; label hidden on phones.
- **Progress rail:** 3px sand fill on the right edge (2px on phones).

### Profile links
Row of 44px square icon links under the role line, hairline Ballad Blue borders; the primary link is solid sand. The name rides above the icon in a black tooltip on hover/focus and is the accessible name.

### Cosmos hero (signature)
Navy radial gradient (lighter navy at 70% / 30%, through Pantone 302C, to Night Navy) with drifting stars, a breathing Bogotá home star and timed constellations (Bogotá Region, Colombia, then each ecosystem linked back by an arc) in Ballad Blue strokes and sand labels. Dashed and solid orbit rings parallax with the pointer.

### Case dialog
Paper sheet up to 860px over a blurred navy backdrop; round close button that rotates on hover; uppercase navy index and label; serif headline and result line.

## Do's and Don'ts

### Do:
- **Do** keep every small uppercase label, folio, tag and tooltip at 12px or larger, and card / pipeline body at 16px.
- **Do** declare a tone on every new screen so folio, dots and Next inherit the right colour; use Satin Deep Black for the current dot on the sand screen.
- **Do** hide the section dot navigator below 1100px, show Next only on the hero there, and keep 150px clear on the right of the hero proof strip.
- **Do** keep the tablet constellation anchor in the open sky between the profile links and the proof strip, never over copy.
- **Do** keep the identity elements: uppercase letter-spaced folios and labels, 01 to 08 numbering, hairline rules, the navy radial cosmos gradient, a single portrait image, italic sand emphasis in headlines.
- **Do** keep square corners on text-bearing surfaces and reserve circles for orbits, dots, nodes and round controls.
- **Do** provide a reduced-motion path for every reveal, wipe and parallax.
- **Do** test fit with Spanish copy and on a non-Windows device before shipping layout changes.

### Don't:
- **Don't** "fix" the identity elements above into generic patterns (no removing folios or numbering, no swapping hairlines for boxed cards, no replacing the cosmos with a flat or photographic hero, no adding more portraits).
- **Don't** put sand text or sand dots on the sand screen.
- **Don't** let the Next button, dot navigator or constellation overlap copy at any width.
- **Don't** add rounded-rectangle cards or pills; the system has no intermediate radius.
- **Don't** add shadows to resting surfaces.
