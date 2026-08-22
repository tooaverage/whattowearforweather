# Fake-door demand test: Burrard Inlet boat services

Two static sites, one demand test. We measure visits, form starts, submissions, and submissions with photos over a 4-week window. No prices published, no payments collected, no fake proof anywhere.

- `upholstery/` = **Burrard Boat Seats** (boat seat and cushion redo, mobile pickup)
- `mechanic/` = **Deep Cove Mobile Marine** (mobile marine mechanic, winterization at the dock)

Plain HTML and CSS, one small JS file per site for the form. No build step. Each folder deploys as its own site.

## Launch checklist (in order)

1. **Formspree.** Create two forms at formspree.io, then replace `REPLACE_UPHOLSTERY_FORM_ID` in `upholstery/index.html` and `REPLACE_MECHANIC_FORM_ID` in `mechanic/index.html` with the real form IDs. Photo uploads need a paid Formspree plan; on the free plan the form still works, photos are dropped, and the `photo_attached` event still fires (it tracks on file select, before submit). Set each form's notification email to the shared inbox.
2. **Plausible.** Add `burrardboatseats.ca` and `deepcovemobilemarine.ca` as sites in Plausible. The tracking script and the four custom events (`form_start`, `form_submit`, `photo_attached`, `waitlist_opt_in`) are already wired. In Plausible, add each event as a Goal so they show in the dashboard. If you test before the domains are live, temporarily change `data-domain` to the vercel.app hostname.
3. **Domains.** All six candidates were available on 2026-08-22 at $16.99 USD/yr via Vercel. The sites are built against `burrardboatseats.ca` and `deepcovemobilemarine.ca` (canonicals, sitemaps, emails). If you pick different domains, search-and-replace the domain in each site folder.
4. **Email.** Set up `hello@` on each domain via the registrar or Google Workspace, forwarding to the shared inbox. The reply-within-24h promise on the sites is real; keep it.
5. **Deploy.** Each folder is a self-contained static site. On Vercel: two projects, root directory `sites/upholstery` and `sites/mechanic`, no build command, output directory `.`.

## Auto-reply template (send personally, within 24h)

Subject: Re: your request

> Hi [name], thanks for reaching out. We're fully booked at the moment and not taking new work, but [vendor] does excellent work locally. Tell them Jaycee sent you: [contact]. We'll let you know when spots open up.

Vendors to refer: SeaTechnic (mechanical), True Stitch / TidyBoat / Canvasea (upholstery).

## Tracking and UTM

Every traffic source gets a UTM. Plausible picks these up automatically.

- Gas dock QR: `?utm_source=gasdock-qr`
- Deep Cove FB group: `?utm_source=fb-deepcove`
- Nextdoor: `?utm_source=nextdoor`
- Reddit: `?utm_source=reddit`
- Meta ads: `?utm_source=ads`

Weekly readout per site: visits, form_start, form_submit, photo rate (photo_attached / form_submit), waitlist_opt_in, split by source.

## Guardrails (do not relax these)

- No fabricated testimonials, reviews, ratings, team photos, or credentials. The offer is the test, never fake proof.
- Availability framing stays honest: "limited spots" is true because there are currently zero.
- Every real submission gets a genuine reply within 24 hours with a referral to a real vendor.
- No payment collection anywhere.

## Phase 2 (not now)

- Google Business Profile (needs real business verification)
- Published price ranges on the cost pages, once there's real quote data
