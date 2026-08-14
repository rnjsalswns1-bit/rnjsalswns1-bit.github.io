---
name: Shadow Leveling System
colors:
  surface: '#131317'
  surface-dim: '#131317'
  surface-bright: '#39393d'
  surface-container-lowest: '#0e0e12'
  surface-container-low: '#1b1b1f'
  surface-container: '#1f1f23'
  surface-container-high: '#2a292e'
  surface-container-highest: '#353439'
  on-surface: '#e4e1e7'
  on-surface-variant: '#ccc3d8'
  inverse-surface: '#e4e1e7'
  inverse-on-surface: '#303034'
  outline: '#958da1'
  outline-variant: '#4a4455'
  surface-tint: '#d2bbff'
  primary: '#d2bbff'
  on-primary: '#3f008e'
  primary-container: '#7c3aed'
  on-primary-container: '#ede0ff'
  inverse-primary: '#732ee4'
  secondary: '#adc6ff'
  on-secondary: '#002e6a'
  secondary-container: '#0566d9'
  on-secondary-container: '#e6ecff'
  tertiary: '#f9bd22'
  on-tertiary: '#402d00'
  tertiary-container: '#836100'
  on-tertiary-container: '#ffe2ab'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#eaddff'
  primary-fixed-dim: '#d2bbff'
  on-primary-fixed: '#25005a'
  on-primary-fixed-variant: '#5a00c6'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#ffdf9f'
  tertiary-fixed-dim: '#f9bd22'
  on-tertiary-fixed: '#261a00'
  on-tertiary-fixed-variant: '#5c4300'
  background: '#131317'
  on-background: '#e4e1e7'
  surface-variant: '#353439'
  abyss-black: '#0B0B0F'
  dungeon-gray: '#181A20'
  shadow-slate: '#23262F'
  hunter-surface: '#2C313D'
  epic-purple: '#7C3AED'
  exp-blue: '#3B82F6'
  health-red: '#EF4444'
  legendary-gold: '#FFD700'
  mythic-pink: '#FF4D6D'
  success-green: '#22C55E'
typography:
  boss-display:
    fontFamily: Oswald
    fontSize: 64px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  level-display:
    fontFamily: Oswald
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
  section-title:
    fontFamily: Oswald
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1.3'
  card-title:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  quest-title:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: '1.5'
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.05em
  level-display-mobile:
    fontFamily: Oswald
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.2'
  section-title-mobile:
    fontFamily: Oswald
    fontSize: 28px
    fontWeight: '500'
    lineHeight: '1.3'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style

The design system is built to transform the mundane nature of daily productivity into a high-stakes, immersive RPG experience. Inspired by "Solo Leveling" and modern dungeon-crawler aesthetics, the interface functions as a "Status Window" for the user?셲 life. 

The visual style is **High-Contrast / Bold** mixed with **Glassmorphism**, emphasizing depth and luminescence. The UI should evoke the feeling of a digital HUD appearing in a dark dungeon?봲harp, glowing, and authoritative. Every interaction is designed to make the user feel like the "Main Character" of their own growth, where completing a task is synonymous with slaying a monster.

**Design Principles:**
- **The Hunter's HUD:** Layouts should feel like a floating heads-up display.
- **Luminous Progression:** Growth (EXP, Level Ups) is always signaled with radiant, glowing effects.
- **Abyssal Depth:** Use deep blacks and dark grays to make the purple and gold accents "pop" with intensity.

## Colors

The palette is anchored in **Abyss Black**, creating a void-like canvas that allows for extreme contrast. **Epic Purple** is the primary brand color, used for critical actions, level-ups, and "hunter" energy. 

A tiered rarity system is utilized to categorize tasks and achievements:
- **Common:** Gray (#9CA3AF) for everyday chores.
- **Rare:** Blue (#3B82F6) for weekly goals.
- **Epic:** Purple (#7C3AED) for significant milestones.
- **Legendary:** Gold (#FFD700) for major life achievements.
- **Mythic:** Pink (#FF4D6D) for seasonal or life-changing events.

Functional colors like **Health Red** and **Success Green** maintain their standard meanings but are rendered with high saturation to match the game aesthetic.

## Typography

This design system uses a dual-font strategy. **Oswald** is the Display font, chosen for its condensed, aggressive, and industrial feel. It is reserved for high-impact game elements like Levels, Boss names, and Section Titles.

**Inter** is the functional font, used for all UI labels, body text, and quest descriptions. Its neutrality ensures that even in a complex "game" environment, readability remains paramount. Large numeric displays should use Oswald to emphasize the "stats" aspect of the UI.

## Layout & Spacing

The layout follows a **Fixed Grid** model on mobile to maintain the "Status Window" aesthetic, centering content within safe margins. On larger screens, the design utilizes a **Fluid Grid** but constrains content to maximum widths to prevent the "game window" from feeling sparse.

**Spacing Rhythm:**
- A **4px base unit** governs all dimensions.
- **Quest Cards** use 16px internal padding.
- **Status Bars** and stat groups use 8px (sm) spacing to feel tightly packed and systematic.
- Breakpoints: Mobile (<600px), Tablet (600px-1024px), Desktop (>1024px).

## Elevation & Depth

Elevation is conveyed through **Tonal Layers** combined with **Glow Effects** rather than traditional shadows.

- **Level 0 (Background):** Abyss Black (#0B0B0F).
- **Level 1 (Cards/Containers):** Dungeon Gray (#181A20).
- **Level 2 (Active/Hover):** Shadow Slate (#23262F).
- **Interactive Depth:** Surfaces use 1px inner strokes (Ghost Borders) in Silver Fog at 10% opacity to define edges against the black background.

**Luminescence:**
- High-level items (Epic/Legendary) emit a **diffused outer glow** (Bloom) in their respective rarity color.
- **Level Up Glow:** A radial gradient centered on the character avatar or level number using Epic Purple with 45% opacity.

## Shapes

The design system utilizes **Rounded** shapes (0.5rem base) to maintain a modern software feel while avoiding the "childish" look of fully pill-shaped containers. 

- **Quest Cards:** 12px (rounded-lg) to feel like substantial containers.
- **Action Buttons:** 10px to differentiate from cards.
- **Status Bars:** 4px roundedness for a sharp, technical look.
- **Badges/Chips:** Full pill (999px) to clearly identify them as categorical tags.

## Components

### Primary Action Button
The "Strike" button of the UI. 
- **Style:** Solid Epic Purple (#7C3AED) background.
- **Effect:** Subtle 0px 0px 12px purple outer glow on hover/active states.
- **Typography:** Inter Bold, Uppercase.

### Quest Cards
- **Structure:** Dungeon Gray background, 1px Shadow Slate border. 
- **Visuals:** Features a rarity indicator (vertical stripe on the left edge) and clear rewards (EXP/Gold) in the bottom right corner.
- **Interaction:** On completion, the card should flash with a Success Green border before disappearing.

### Status Bars (HP/EXP)
- **Style:** Thick horizontal bars with a black background track.
- **Fill:** EXP uses a gradient of EXP Blue; HP uses Health Red.
- **Animation:** Progress fills should have a "shimmer" effect moving across the fill color.

### Status Window (Character Stats)
- **Style:** A grid-based layout using Shadow Slate cards.
- **Content:** Icon + Attribute Name (STR, INT, etc.) + Value. Values should be larger and in Oswald.

### Rarity Badges
- **Style:** Small pill-shaped tags with a low-opacity background of the rarity color and a high-opacity text color (e.g., Rare = 15% Blue background, 100% Blue text).

### Input Fields
- **Style:** Dark Dungeon Gray background with a focused state that changes the border color to Epic Purple. Placeholder text in Mist Gray.
