#!/usr/bin/env node
/* Apply a curation set: read tools/keep.tsv (id <TAB> category per line),
   set data-cat + auto heading on those photos (unhiding them), and add the
   `hidden` attribute to every other gallery figure. Image files are never
   touched; git is the undo. Complements curate-gallery.js, which handles
   one-off edits.

   USAGE: node tools/gallery-set.js */
"use strict";
var fs = require("fs");
var path = require("path");

var GALLERY = path.join(__dirname, "..", "gallery.html");
var KEEP = path.join(__dirname, "keep.tsv");

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

var keep = {};
fs.readFileSync(KEEP, "utf8").split("\n").forEach(function (line) {
  var m = line.trim().match(/^(\S+)\t(\S+)$/);
  if (m) keep[m[1]] = m[2];
});

var html = fs.readFileSync(GALLERY, "utf8");
var FIG = /<figure class="gallery-item"[^>]*>[\s\S]*?<\/figure>/g;
var edits = [], kept = 0, hid = 0, m;

function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

while ((m = FIG.exec(html)) !== null) {
  var t = m[0];
  var id = ((t.match(/src="images\/([^"]+)"/) || [])[1] || "").replace(/\.[a-z]+$/i, "");
  var cat = keep[id];
  var out;
  if (cat) {
    kept++;
    out = t.replace(/\s+hidden(?=[\s>])/g, "")
           .replace(/data-cat="[^"]*"/, 'data-cat="' + cat + '"')
           .replace(/(<figcaption><small>)[\s\S]*?(<\/small>)/, "$1" + esc(CAT_NAME[cat]) + "$2");
    var cap = ((t.match(/data-caption="(?:[^—]*)—\s*([^"]*)"/) || [])[1] || "");
    out = out.replace(/data-caption="[^"]*"/, 'data-caption="' + esc(CAT_NAME[cat]) + (cap ? " \u2014 " + cap : "") + '"');
  } else {
    hid++;
    out = / hidden[\s>]/.test(t) ? t : t.replace('<figure class="gallery-item"', '<figure class="gallery-item" hidden');
  }
  if (out !== t) edits.push({ start: m.index, end: m.index + t.length, text: out });
}

edits.sort(function (a, b) { return b.start - a.start; })
     .forEach(function (e) { html = html.slice(0, e.start) + e.text + html.slice(e.end); });
fs.writeFileSync(GALLERY, html);
console.log("kept " + kept + ", hid " + hid + " -> gallery.html");
