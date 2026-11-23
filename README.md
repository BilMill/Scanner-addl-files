# PalmMystic Vercel — AI Palm Scanner Preview

Deploy files inside this folder to your existing PalmMystic GitHub repository, preserving `/api` and `index.html`. This version adds `/api/analyze`, an image analysis endpoint, without changing the existing Stripe checkout or verification endpoints.

## Environment variables
- `OPENAI_API_KEY`: server-side API key for the palm image analysis service. Set in **Vercel → Project → Settings → Environment Variables → Preview**. Never prefix with `NEXT_PUBLIC_` or expose in HTML.
- `STRIPE_SECRET_KEY`: existing Stripe **test** key, for Preview.
- `PUBLIC_SITE_URL`: optional, must match the preview domain for Stripe redirect URLs. If unset, checkout derives the URL from the incoming request.

Create a new Preview deployment after adding variables. Open the Preview URL, upload a JPG or PNG palm image (max 4MB), and click **Reveal My Reading**. The endpoint returns cautious descriptions of visible creases and entertainment-only palmistry themes. A clear, well-lit palm photo works best.

## Important limitations
- AI vision can misidentify lines and is not a validated palm-line detector. No factual future or medical predictions.
- Photos are transmitted to the AI API for analysis and are not intentionally stored by this app; provider data-handling policies still apply. Add a privacy notice and retention disclosure before launch.
- API calls cost money. Add authentication, rate limits, abuse prevention, and image validation before public release.
- The current report is a TXT download, not a PDF. Payment verification and report delivery need a production security review: a client-side unlock is not a robust entitlement system, and reading state is not persisted through Stripe redirects. Do not launch paid sales until this is addressed.
- Stripe checkout is independent; the scanner can be tested while checkout is being fixed.
