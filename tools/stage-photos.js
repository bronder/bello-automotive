#!/usr/bin/env node
/* ============================================================
   Bello Automotive — stage new photos into the gallery

   Scans images/ for p####.webp files that gallery.html does not
   reference yet, and appends a hidden <figure> for each one:

     - hidden until you assign a category with curate-gallery.js
       (assigning categories unhides the photo automatically)
     - width/height are read from the actual file with ffprobe so
       the page doesn't reflow when the photo goes live
     - heading starts as "(to sort)"; --auto or --heading on the
       curation script replaces it

   Requires ffprobe (any ffmpeg install) on PATH.

   USAGE:  node tools/stage-photos.js [--alt-prefix "Shop photo"]
   ============================================================ */

"use strict";

var fs = require("fs");
var path = require("path");
var execSync = require("child_process").execSync;

var ROOT = path.join(__dirname, "..");
var GALLERY = path.join(ROOT, "gallery.html");
var IMAGES = path.join(ROOT, "images");

var altPrefix = "Shop photo";
var ai = process.argv.indexOf("--alt-prefix");
if (ai !== -1 && process.argv[ai + 1]) altPrefix = process.argv[ai + 1];

var html = fs.readFileSync(GALLERY, "utf8");

// which images does the gallery already reference?
var referenced = {};
(html.match(/src="images\/(p[0-9]+\.webp)"/g) || []).forEach(function (s) {
  referenced[s.replace(/src="images\//, "").replace(/"$/, "")] = true;
});

// candidate files not yet referenced, in numeric order
var files = fs.readdirSync(IMAGES)
  .filter(function (f) { return /^p\d+\.webp$/.test(f) && !referenced[f]; })
  .sort(function (a, b) {
    return parseInt(a.slice(1), 10) - parseInt(b.slice(1), 10);
  });

if (!files.length) {
  console.log("No new photos to stage — every images/p####.webp is already in gallery.html.");
  process.exit(0);
}

function dims(file) {
  var out = execSync("ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 \"" + file + "\"").toString().trim();
  var p = out.split(",");
  return { w: parseInt(p[0], 10), h: parseInt(p[1], 10) };
}

var figs = "";
files.forEach(function (f) {
  var d;
  try { d = dims(path.join(IMAGES, f)); }
  catch (e) { console.error("skipping " + f + " — ffprobe failed: " + e.message); return; }
  var id = f.replace(/\.webp$/, "");
  figs +=
    '\n        <figure class="gallery-item" data-cat="" hidden>\n' +
    '          <button class="gallery-trigger" type="button" data-caption="(to sort)">\n' +
    '            <img src="images/' + f + '" width="' + d.w + '" height="' + d.h + '" loading="lazy"\n' +
    '                 alt="' + altPrefix + ' ' + id + ' — awaiting sorting">\n' +
    '          </button>\n' +
    '          <figcaption><small>(to sort)</small></figcaption>\n' +
    '        </figure>';
});

// append just before the gallery grid closes (after the last existing figure)
var anchor = html.lastIndexOf("</figure>");
if (anchor === -1) fail("no existing </figure> found — gallery.html structure unexpected?");
anchor += "</figure>".length;
html = html.slice(0, anchor) + figs + html.slice(anchor);

fs.writeFileSync(GALLERY, html);
console.log("Staged " + files.length + " photo(s) as hidden gallery entries.");
console.log("Curate with:  node tools/curate-gallery.js --list | grep hidden   (hint: --filter works too)");
console.log("Then assign:  node tools/curate-gallery.js <id...> --cats \"...\" --auto   (this unhides them)");

function fail(msg) { console.error("Error: " + msg); process.exit(1); }
