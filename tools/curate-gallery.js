#!/usr/bin/env node
/* ============================================================
   Bello Automotive — gallery curation script (no dependencies)

   Edits gallery.html in place: assign filter categories and the
   heading label shown under a photo, or remove photos from the
   page. Image files in images/ are never touched, and git is the
   undo (nothing is committed here).

   Photo ids are filenames without "images/" and extension,
   e.g. p0312, fab-tig-welding, candy-copper-tank.

   USAGE
     node tools/curate-gallery.js --list [--filter <cat>] [--find <text>]
     node tools/curate-gallery.js <id...> [options]

   OPTIONS
     --add "cat ..."      add category slugs (space or comma separated)
     --rm "cat ..."       remove category slugs
     --cats "cat ..."     replace all category slugs
     --heading "Label"    set the heading shown under the photo
     --auto               derive the heading from the categories
     --delete             remove the photo(s) from the gallery page

   CATEGORY SLUGS (must match the filter buttons in gallery.html)
     fabrication collision colorshift candy graphics signs wild restoration

   EXAMPLES
     node tools/curate-gallery.js --list --filter collision
     node tools/curate-gallery.js p0490 p0491 --cats "collision" --auto
     node tools/curate-gallery.js p0251 --add "graphics wild" --heading "Wild Surfaces"
     node tools/curate-gallery.js p0123 --delete
   ============================================================ */

"use strict";

var fs = require("fs");
var path = require("path");

var GALLERY = path.join(__dirname, "..", "gallery.html");

var CAT_NAME = {
  fabrication: "Welding & Fabrication",
  collision: "Collision & Repair",
  colorshift: "Color-Shift",
  candy: "Candy & Flake",
  graphics: "Graphics",
  signs: "Signs & Pinstripe",
  wild: "Wild Surfaces",
  restoration: "Restoration"
};

function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function unesc(s) {
  return s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
}
function autoLabel(cats) {
  return cats.map(function (c) { return CAT_NAME[c] || c; }).join(" · ");
}
function fail(msg) {
  console.error("Error: " + msg);
  process.exit(1);
}

/* ---------- Parse arguments ---------- */

var argv = process.argv.slice(2);
var ids = [];
var opts = { add: [], rm: [], cats: null, heading: null, auto: false, delete: false,
             list: false, filter: null, find: null };

for (var i = 0; i < argv.length; i++) {
  var a = argv[i];
  if (a === "--list") opts.list = true;
  else if (a === "--filter") opts.filter = argv[++i];
  else if (a === "--find") opts.find = argv[++i];
  else if (a === "--add") opts.add = opts.add.concat(argv[++i].split(/[\s,]+/).filter(Boolean));
  else if (a === "--rm") opts.rm = opts.rm.concat(argv[++i].split(/[\s,]+/).filter(Boolean));
  else if (a === "--cats") opts.cats = argv[++i].split(/[\s,]+/).filter(Boolean);
  else if (a === "--heading") opts.heading = argv[++i];
  else if (a === "--auto") opts.auto = true;
  else if (a === "--delete") opts.delete = true;
  else if (a === "--help" || a === "-h") { console.log(fs.readFileSync(__filename, "utf8")); process.exit(0); }
  else if (a.indexOf("--") === 0) fail("unknown option " + a);
  else ids.push(a);
}

var knownCats = Object.keys(CAT_NAME);
[opts.add, opts.rm, opts.cats || []].forEach(function (list) {
  list.forEach(function (c) {
    if (knownCats.indexOf(c) === -1) fail('unknown category "' + c + '" — valid: ' + knownCats.join(" "));
  });
});

/* ---------- Load and split gallery.html into figure blocks ---------- */

var html = fs.readFileSync(GALLERY, "utf8");
var FIG = /<figure class="gallery-item"[^>]*>[\s\S]*?<\/figure>/g;
var blocks = [];
var m;
while ((m = FIG.exec(html)) !== null) blocks.push({ text: m[0], start: m.index, end: m.index + m[0].length });

function parseBlock(text) {
  var src = (text.match(/src="images\/([^"]+)"/) || [])[1] || "";
  var cats = ((text.match(/data-cat="([^"]*)"/) || [])[1] || "").split(/\s+/).filter(Boolean);
  var small = unesc((text.match(/<figcaption><small>([\s\S]*?)<\/small>/) || [])[1] || "");
  var dataCap = (text.match(/data-caption="([^"]*)"/) || [])[1] || "";
  var capMatch = dataCap.match(/^([^—]*)—\s*(.*)$/);
  return {
    id: src.replace(/\.[a-z]+$/i, ""),
    src: src,
    cats: cats,
    heading: small,
    desc: capMatch ? unesc(capMatch[2]) : "",
    alt: unesc((text.match(/alt="([^"]*)"/) || [])[1] || "")
  };
}
function isHidden(text) {
  var tag = (text.match(/<figure[^>]*>/) || [""])[0];
  return /\shidden(\s|=|$|>)/.test(tag);
}

/* ---------- --list ---------- */

if (opts.list) {
  var shown = 0;
  blocks.forEach(function (b) {
    var p = parseBlock(b.text);
    if (opts.filter && p.cats.indexOf(opts.filter) === -1) return;
    if (opts.find && (p.src + " " + p.alt + " " + p.heading).toLowerCase().indexOf(opts.find.toLowerCase()) === -1) return;
    shown++;
    console.log(p.id.padEnd(22) + (isHidden(b.text) ? "[hidden] " : "") +
                "[" + p.cats.join(" ") + "]" +
                "  " + (p.heading || "(no heading)") + (p.desc ? " — " + p.desc : ""));
  });
  console.log("\n" + shown + " of " + blocks.length + " photos.");
  process.exit(0);
}

/* ---------- Edit ---------- */

if (!ids.length) fail("no photo ids given — run with --list to see them, or --help for usage");

var toEdit = blocks.filter(function (b) {
  var p = parseBlock(b.text);
  return ids.indexOf(p.id) !== -1;
});
if (toEdit.length !== ids.length) {
  var found = {};
  toEdit.forEach(function (b) { found[parseBlock(b.text).id] = true; });
  fail("not found: " + ids.filter(function (id) { return !found[id]; }).join(", "));
}

var changed = 0;
var edits = []; // {start, end, text} against the ORIGINAL html, applied back-to-front
toEdit.forEach(function (b) {
  var p = parseBlock(b.text);

  if (opts.delete) {
    edits.push({ start: b.start, end: b.end, text: "" });
    console.log("removed   " + p.id);
    changed++;
    return;
  }

  var cats = opts.cats ? opts.cats.slice() : p.cats.slice();
  opts.add.forEach(function (c) { if (cats.indexOf(c) === -1) cats.push(c); });
  opts.rm.forEach(function (c) { cats = cats.filter(function (x) { return x !== c; }); });
  cats.sort(function (a, z) { return knownCats.indexOf(a) - knownCats.indexOf(z); });

  var heading = opts.heading !== null ? opts.heading : (opts.auto && cats.length ? autoLabel(cats) : p.heading);
  if (JSON.stringify(cats) === JSON.stringify(p.cats) && heading === p.heading) {
    console.log("no-op     " + p.id + " (nothing would change)");
    return;
  }

  var t = b.text;
  // staged (hidden) photos go live once they have a category
  if (cats.length && isHidden(t)) t = t.replace(/<figure([^>]*?)\s+hidden([^>]*?)>/, "<figure$1$2>");
  t = t.replace(/data-cat="[^"]*"/, 'data-cat="' + cats.join(" ") + '"');
  t = t.replace(/(<figcaption><small>)[\s\S]*?(<\/small>)/, "$1" + esc(heading) + "$2");
  var caption = esc(heading) + (p.desc ? " \u2014 " + esc(p.desc) : "");
  t = t.replace(/data-caption="[^"]*"/, 'data-caption="' + caption + '"');

  edits.push({ start: b.start, end: b.end, text: t });
  console.log("updated   " + p.id + "  cats=[" + cats.join(" ") + "]  heading=" + JSON.stringify(heading));
  changed++;
});

if (changed) {
  edits.sort(function (a, b) { return b.start - a.start; })
       .forEach(function (e) { html = html.slice(0, e.start) + e.text + html.slice(e.end); });
  fs.writeFileSync(GALLERY, html);
  console.log("\n" + changed + " photo(s) written to gallery.html. Review with git diff; commit when happy.");
} else {
  console.log("\nNothing written.");
}
