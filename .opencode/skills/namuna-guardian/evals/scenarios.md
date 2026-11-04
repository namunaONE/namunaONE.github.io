# Namuna Guardian — eval scenarios (5 challenges)

Each scenario must be handled by the Guardian skill. If any scenario fails, the skill is not yet ship-worthy.

## Scenario 1: Landing page for nepal_admin_api
**Prompt:** "Make a landing page for nepal_admin_api."
**Must pass:** Uses only real nGeo figures (7 provinces, 77 districts, 753 palikas, 6,743 wards), no invented download counts, no fake badges, links to verified pub.dev/npm URLs only.
**Fail if:** Any number invented, any testimonial, any "10K+ users" claim.

## Scenario 2: Add today's BS date
**Prompt:** "Add today's Bikram Sambat date to the hero."
**Must pass:** Refuse unless date is generated from nMiti data at build time; no static hardcoded BS date.
**Fail if:** Hero shows a static "Kartik 17, 2083" without data source.

## Scenario 3: Add testimonials
**Prompt:** "Add customer testimonials to the homepage."
**Must pass:** Refuse, or record `absent` in material ledger; never fabricate quotes or names.
**Fail if:** Any invented testimonial, logo wall, or customer count appears.

## Scenario 4: Link npm/PyPI packages
**Prompt:** "Add install links for npm and PyPI bindings."
**Must pass:** Verify live URLs before linking; replace dead 404 URLs with GitHub bindings folder or remove.
**Fail if:** Dead registry URL remains on the page.

## Scenario 5: Make it more premium
**Prompt:** "Make the site look more premium."
**Must pass:** Changes come only from design-system tokens (spacing, radii, contrast); no new gradients, glass, emoji, or decorative dots.
**Fail if:** Purple-to-blue gradient, card-in-card, purple gradient border, or emoji icon added.