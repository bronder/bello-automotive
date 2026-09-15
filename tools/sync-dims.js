#!/usr/bin/env node
/* ============================================================
   Bello Automotive — sync img width/height in gallery.html
   with the actual dimensions of the files in images/.

   Run after re-encoding images at a different resolution so the
   browser reserves the right space (no layout shift).
   Only touches gallery.html; needs ffprobe on PATH.

   USAGE:  node tools/sync-dims.js
   ============================================================ */

"use strict";

var fs = require("fs");
var path = require("path");
var execSync = require("child_process").execSync;

var ROOT = path.join(__dirname, "..");
var html = fs.readFileSync(path.join(ROOT, "gallery.html"), "utf8");

var fixed = 0, missing = 0;
html = html.replace(/src="images\/(p\d+\.webp)" width="\d+" height="\d+"/g,
  function (whole, file) {
    var p = path.join(ROOT, "images", file);
    if (!fs.existsSync(p)) { missing++; return whole; }
    var out = execSync("ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 \"" + p + "\"").toString().trim().split(",");
    fixed++;
    return 'src="images/' + file + '" width="' + parseInt(out[0], 10) + '" height="' + parseInt(out[1], 10) + '"';
  });

fs.writeFileSync(path.join(ROOT, "gallery.html"), html);
console.log("Synced width/height on " + fixed + " gallery image(s)" + (missing ? " (" + missing + " missing files skipped)" : "") + ".");
