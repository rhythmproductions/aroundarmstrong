# Around Armstrong

The weekly show about what's going on around Armstrong and Spallumcheen. New episode every Friday.

This is the show's website, aroundarmstrong.ca. Plain HTML and CSS, no build step. Netlify deploys the repo root.

## Updating

- **New episode:** in `index.html`, find the `Update this Facebook post URL every Friday` comment in the Latest episode section and change the `data-href` on the `fb-post` div to the new post's URL.
- **Mailing list:** the sign-up form posts to Buttondown (username `AroundArmstrong`). The submission form's checkbox is handled by `netlify/functions/submission-created.js`, which needs `BUTTONDOWN_API_KEY` set in Netlify's environment variables.
- **Short links:** `/follow`, `/card`, `/board` and `/chamber` redirect to the Facebook page (see `netlify.toml`).
- **Copy:** edit `index.html`. Bios and tagline match the social accounts; keep them in sync.
- **Colours and type:** `styles.css`. Green `#1F5F3A`, cream `#F2EAD3`, Anton for headings, Barlow Semi Condensed for body.
- **Logo files:** `assets/`. The pin SVGs are recolourable.

Produced by Rhythm Productions.
