# Bello Automotive Services — Website

Static site (plain HTML/CSS/JS, no build step) for Bello Automotive Services,
modeled on the same showcase format as the DC Custom Guitars site: hero,
gallery of real work, services, intake/quote form, contact.

**Live:** https://bronder.github.io/bello-automotive/ — deploys automatically
on every push to `main` via [.github/workflows/deploy.yml](.github/workflows/deploy.yml).

## Pages

| Page | Purpose |
|------|---------|
| `index.html` | Home — hero, recent work, services teaser, about teaser, CTA |
| `gallery.html` | Photo gallery of paint work with category filters + lightbox |
| `services.html` | Service cards (placeholders) + 5-step process |
| `quote.html` | **Paint Quote Request** — working intake form (from Kris's screenshots) |
| `contact.html` | Contact info + map placeholder |

The quote form is fully client-side: it builds a plain-text request and offers
**Email to shop** (mailto to `krisfrombelloauto@gmail.com`), **Copy**, and
**Download (.txt)**. Photos are attached to the email/text separately, same as
the original intake flow. Form fields mirror the original:
Customer Info → Paint Job Details → Parts Being Painted (dynamic rows) →
Photos/Notes → Send.

## Images

Web-optimized copies of Kris's photos live in `images/` (originals are in
`~/Downloads/Kris`):

| File | Original | Shot |
|------|----------|------|
| `chameleon-fairing-set.jpg` (+ `hero-chameleon.jpg` crop) | IMG_7539 | Purple/green color-shift full fairing set |
| `chameleon-lid-detail.jpg` | IMG_7540 | Saddlebag lid close-up, EVO logo |
| `chameleon-set-detail.jpg` | IMG_7541 | Color-shift set, second angle |
| `harley-graphic-lid.jpg` | IMG_7548 (black screenshot bars cropped) | Blue/gray HD lid, geometric graphics |
| `candy-copper-tank.jpg` | IMG_7401 | Candy copper tank & fender, silver-leaf |
| `honda-candy-restore.jpg` | IMG_7053 | Vintage Honda tank restore |
| `tour-pak-graphic.jpg` | IMG_7839 | White/red scalloped tour-pak lid |
| `honeycomb-fender.jpg` | 08e6ff1a…JPEG | Gunmetal honeycomb fender, red tip |
| `silver-red-tank-set.jpg` | 0b5feae3…JPEG | Silver/red tank set on shelf |
| `number-one-tank.jpg` | 274b9738…JPEG | Number-one tank, star field |

## TODO / Placeholders to confirm with the shop

Search the HTML for `PLACEHOLDER` comments. Summary:

- **Contact info** — phone number, shop address, hours, social links
  (`(555) 012-3456` and "Address coming soon" are dummies; email
  `krisfrombelloauto@gmail.com` is real, taken from the intake form)
- **About section** (index) — shop story, owner bio, years in business
- **Services** — final service list, descriptions, pricing approach
- **Process steps** — confirm the 5 steps match how the shop actually works
- **Domain name** — quote form's generated text says "Sent from bellautoservices.com"; update when the real domain is known
- **Gallery captions** — bike models / paint systems used per job
- **Footer blurb**

## Running locally

Any static server works:

```sh
cd bello-automotive && python -m http.server 8080
# or: npx serve .
```
