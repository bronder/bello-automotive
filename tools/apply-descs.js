#!/usr/bin/env node
/* Merge .descs/batch-*.tsv (id<TAB>description) into gallery.html:
   sets data-caption and alt for each photo. */
"use strict";
var fs = require("fs");
var path = require("path");

var ROOT = path.join(__dirname, "..");
var DESC_DIR = path.join(ROOT, ".descs");
var GALLERY = path.join(ROOT, "gallery.html");

var descs = {};
fs.readdirSync(DESC_DIR).filter(function (f) { return /^batch-\d+\.tsv$/.test(f); }).forEach(function (f) {
  fs.readFileSync(path.join(DESC_DIR, f), "utf8").split("\n").forEach(function (line) {
    if (!line.trim()) return;
    var i = line.indexOf("\t");
    if (i === -1) { console.error("BAD LINE in " + f + ": " + line.slice(0, 40)); return; }
    descs[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  });
});
console.log(Object.keys(descs).length + " descriptions loaded");

function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

var html = fs.readFileSync(GALLERY, "utf8");
var applied = 0, missing = [];
html = html.replace(/<figure class="gallery-item"([^>]*)>([\s\S]*?)<\/figure>/g,
  function (whole, attrs, body) {
    var src = (body.match(/src="images\/([^"]+)"/) || [])[1];
    if (!src) return whole;
    var id = src.replace(/\.webp$/, "");
    if (!(id in descs)) return whole;
    var d = esc(descs[id]);
    var nb = body.replace(/alt="[^"]*"/, 'alt="' + d + '"');
    nb = nb.replace(/data-caption="[^"]*"/, 'data-caption="' + d + '"');
    nb = nb.replace(/(<figcaption><small>[\s\S]*?<\/small>)[\s\S]*?(<\/figcaption>)/,
      function (_, small, close) { return small + d + close; });
    applied++;
    return '<figure class="gallery-item"' + attrs + ">" + nb + "</figure>";
  });

var used = {};
html.replace(/src="images\/([^"]+)"/g, function (_, s) { used[s.replace(/\.webp$/, "")] = true; return _; });
Object.keys(descs).forEach(function (id) { if (!used[id]) missing.push(id); });

fs.writeFileSync(GALLERY, html);
console.log("Applied " + applied + " descriptions to gallery.html" +
  (missing.length ? " — NOT FOUND IN GALLERY: " + missing.join(", ") : ""));
