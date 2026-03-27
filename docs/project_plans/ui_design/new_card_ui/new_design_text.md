1. OVERALL SCREEN STRUCTURE
Device Frame Assumption
Target: iPhone (modern, notch / Dynamic Island)

Aspect ratio: ~19.5:9

Safe area respected (top + bottom)

Root Layout
Screen
├── Top Bar (Recall Buttons)
├── Card Container (Centered)
├── Bottom Section (Progress + Decoration)
Background
Base color: very light blue-gray gradient

Gradient direction: top → bottom

Example:

Top: #F4F7FB

Bottom: #E9EEF6

Decorative Element (Bottom Wave)
Positioned: bottom 25% of screen

Style: soft flowing wave

Colors:

Primary: #4A90E2 (blue)

Secondary: lighter blue highlights

Opacity: ~20–35%

Slight blur applied

2. TOP BAR (RECALL BUTTONS)
Layout
Horizontal flex container

Justify: space-between

Padding:

Left: 20px

Right: 20px

Top: safe-area + 10px

Recall Button (Left & Right identical)
Container
Height: 36–40px

Padding: 12px horizontal

Border radius: 20px (pill)

Background: translucent white

rgba(255,255,255,0.6)

Border: 1px solid rgba(0,0,0,0.05)

Content
Icon: circular arrow

Text: “Recall”

Text Style
Font size: 14–15px

Weight: 500

Color: #5B7DB1 (soft blue)

Icon
Size: 16px

Color: same as text

3. CARD CONTAINER (CORE COMPONENT)
This is the most important part.

Card Wrapper
Position
Centered horizontally

Vertically slightly above center

Size
Width: ~85% of screen

Height: ~55% of screen

Card Background
Color: #F9FBFF (very light)

Border radius: 28px

Shadow:

Y offset: 10px

Blur: 30px

Color: rgba(0,0,0,0.08)

Inner Card (Layered effect)
There are TWO layers:

Outer Layer
Padding: 8px

Border radius: 28px

Background: slightly darker than inner

Inner Layer
Border radius: 22px

Background: white (#FFFFFF)

Inset shadow:

rgba(0,0,0,0.04)

4. CARD CONTENT STRUCTURE
Card
├── Top Left Icon (Audio)
├── Top Right Icon (Refresh)
├── Center Word
├── Divider
├── Skip Button
4.1 Top Left Icon (Audio)
Position: absolute

top: 16px

left: 16px

Style
Size: 40x40px

Background: white

Border radius: 50%

Shadow: soft drop

Icon
Speaker icon

Size: 18–20px

Color:

Default: #3A5FA0 (blue)

4.2 Top Right Icon (State Indicator)
This icon changes color depending on learning state.

Position:

top: 16px

right: 16px

Base Style
Same as audio button.

Color Logic (IMPORTANT)
State	Icon Color
Main (new word)	Blue (#3A5FA0)
Mastered	Green (#4E8F6A)
Practiced but not mastered	Red (#D64545)
5. CENTER WORD (CORE TEXT)
Position
Perfectly centered (both axis)

Slight upward shift (~10px for balance)

Typography
Font family: System (San Francisco / Inter fallback)

Font size: 34–40px

Weight: 600 (semi-bold)

Letter spacing: slightly tight (-0.5)

Color Logic (VERY IMPORTANT)
State	Text Color
Main (new)	#3A5FA0 (blue)
Mastered	#4E8F6A (green)
Practiced (not mastered)	#D64545 (red)
6. DIVIDER
Position: above Skip button

Height: 1px

Width: 100%

Color: rgba(0,0,0,0.05)

7. SKIP BUTTON
This uses:

SHAPE from first design

COLOR from second design

Container
Width: 60% of card

Height: 48px

Position: centered horizontally

Margin bottom: 16px

Style
Border radius: 24px

Background: blue gradient

Example gradient:

Top: #3F5FBF

Bottom: #2E4FA3

Shadow
Y offset: 6px

Blur: 12px

Color: rgba(0,0,0,0.15)

Text
“Skip”

Font size: 18px

Weight: 600

Color: white

8. BOTTOM SECTION
Pagination Dots
Count: 4 dots

Size: 6px each

Spacing: 6px

Active Dot
Color: #3F5FBF

Inactive
Color: #C5CEDA

Progress Bar
Width: 60% of screen

Height: 3px

Background: light gray (#DCE3EE)

Progress Fill
Color: #3F5FBF

Width: dynamic

9. STATE DEFINITIONS (CRITICAL FOR LOGIC)
9.1 MAIN DESIGN (First Exposure)
Word color: Blue

Right icon: Blue

Meaning:

First time seeing word

No history

9.2 MASTERED WORD
Word color: Green

Right icon: Green

Meaning:

User consistently answers correctly

Confidence high

9.3 PRACTICED (NOT MASTERED)
Word color: Red

Right icon: Red

Meaning:

Seen multiple times

Still making errors

10. INTERACTION BEHAVIOR
Tap Audio Icon
Plays pronunciation

Small scale animation (0.95 → 1)

Tap Refresh Icon
Triggers card flip OR reload state

Rotation animation (180° spin)

Tap Skip
Moves to next card

Progress updates

Pagination shifts

Swipe (Optional but recommended)
Left → next card

Right → previous

11. CARD FLIP (IMPORTANT FOR YOUR SYSTEM)
Even though not shown here, design implies flip:

Animation
Duration: 300ms

Axis: Y-axis

Perspective: slight 3D

12. SPACING SYSTEM (CONSISTENCY)
Use 8px grid:

8 / 16 / 24 / 32

Card padding: 16

Icon offset: 16

Button margin: 16

13. WHAT MAKES THIS DESIGN WORK (OBSERVATION)
I noticed something subtle in your images:

Everything is soft → no harsh edges

Shadows are diffused, not sharp

Colors are not saturated (slightly muted)

Center focus is VERY strong (word dominates)

This is why it feels clean and calm instead of noisy.
