# Bello Automotive LLC — Website

Static site (plain HTML/CSS/JS, no build step) for **Bello Automotive LLC**
(aka Bello Automotive & Motorcycle) in Webster, MA: hero, gallery of real work,
services, general quote intake form, contact with map.

**Positioning:** the shop is full-service — collision, custom paint, general
repairs, welding & fabrication, pinstriping, OEM/insurance repairs. Paint is
*one* service, featured but not the site's identity. The gallery is
paint-heavy only because that's the photography we have so far; Kris is
sending photos of all services.

**Live:** https://bronder.github.io/bello-automotive/ — deploys automatically
on every push to `main` via [.github/workflows/deploy.yml](.github/workflows/deploy.yml).

## Shop facts (confirmed by Kris, Sept 2026)

- **Name:** Bello Automotive LLC / Bello Automotive & Motorcycle
- **Address:** 27 Worcester Rd, Webster MA 01570
- **Phone:** (508) 461-6432 shop · (610) 906-2640 direct
- **Email:** krisfrombelloauto@gmail.com
- **Hours:** M–F 8–5, Sat 8–12, Sun closed
- **Socials:** [Facebook](https://www.facebook.com/p/Bello-Automotive-Service-Sales-Race-Welding-100063912104864/) · [Instagram @belloautomotive](https://www.instagram.com/belloautomotive/) · [YouTube @belloautomotive1522](https://www.youtube.com/@belloautomotive1522) (TikTok planned)
- **Reviews:** 5.0 on Google — 18 reviews, all five stars (place_id `ChIJ_6GhBfcf5IkRwy6npAn4iUk`); four written reviews featured on the homepage in a 2×2 grid (only four written reviews are public — the rest are stars-only)
- **History:** painting 18 years; shop in Philadelphia since 2008, Webster since 2019
- **Materials:** PPG-certified shop; House of Kolor for ~95% of custom work; PPG primers/sealers/bases/clears; 3M paper, FBS tape
- **Policies:** 50% deposit at drop-off, 50% at completion · cash/card/Venmo/Zelle · pre-pay = priority queue · parts or whole vehicles, shipped or dropped · R&I available for a fee · **lifetime paint warranty** (OEM procedures + approved materials) · no very rusty projects or "cheap/perfect-not-required" jobs · motorcycle summer special 10% June–Sept

## Pages

| Page | Purpose |
|------|---------|
| `index.html` | Home — hero + trust badges, recent work, services teaser, testimonials, about, CTA |
| `gallery.html` | Work gallery with category filters + lightbox |
| `services.html` | The 7 real services, 5-step process, "Good to know" policies |
| `quote.html` | **Quote Request** — general intake form (type-of-work select, works for paint/collision/welding/repair) |
| `contact.html` | Phones, email, hours, socials, Google Maps embed |

The quote form is fully client-side: it builds a plain-text request and offers
**Email to shop**, **Copy**, and **Download (.txt)**. Photos are attached to the
email/text separately, same as the original intake flow.

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

Welding & fabrication set (from the shop's Facebook photos, Sept 2026):

| File | Shot |
|------|------|
| `fab-tig-welding.jpg` | Kris TIG welding at the bench |
| `fab-stacked-dimes.jpg` | Stacked-dime TIG beads on stainless pipe |
| `fab-flange-weld.jpg` | Flange-to-pipe TIG fillet |
| `fab-cone-transition.jpg` | Hand-built cone transition |
| `fab-intake-piping.jpg` | Fabricated intake piping, tacked on the bench |
| `fab-honda-header.jpg` | Custom header/collector on a Honda VTEC build |
| `fab-turbo-kit.jpg` | Turbo with fabricated downpipe, heat-shielded |
| `fab-dual-exhaust.jpg` | Custom mandrel-bent dual exhaust |
| `fab-kawasaki-exhaust.jpg` | Custom exhaust mid-build, Kawasaki track bike |
| `fab-muffler-before-after.jpg` | Crushed stock can vs. hand-built carbon replacement |
| `fab-cast-elbow-repro.jpg` | Cracked cast elbow vs. fabricated aluminum replacement |

Captions are descriptive of what the photos show — Kris should confirm/adjust
(bike model, vehicle, metal type).

## Still open

- **Photos & videos** — fabrication set added Sept 2026; still waiting on
  collision/repair photos and video content; captions may need Kris's input
  (bike model, vehicle, materials)
- **Service detail** — Kris promised better details per service; expand the
  service cards when it arrives
- **Domain** — shop doesn't own one yet; when bought, add CNAME + Pages custom
  domain and update `js/quote.js` "Sent from" line
- **TikTok** — add link when the shop joins

## Running locally

Any static server works:

```sh
cd bello-automotive && python -m http.server 8080
# or: npx serve .
```
