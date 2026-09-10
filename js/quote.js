/* ============================================================
   Bello Automotive — Paint Quote Request form logic
   Client-side only: builds a plain-text request, then lets the
   customer email it to the shop, copy it, or download it.
   ============================================================ */

(function () {
  "use strict";

  var SHOP_EMAIL = "krisfrombelloauto@gmail.com";

  var form = document.getElementById("quoteForm");
  var partList = document.getElementById("partList");
  var addPartBtn = document.getElementById("addPart");
  var generated = document.getElementById("generated");
  var statusEl = document.getElementById("formStatus");

  /* ---------- Dynamic "Parts Being Painted" rows ---------- */

  function addPartRow(name, notes) {
    var row = document.createElement("div");
    row.className = "part-row";

    var nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.className = "part-name";
    nameInput.placeholder = "Part (e.g. tank, front fender, lids)";
    nameInput.value = name || "";
    nameInput.setAttribute("aria-label", "Part name");

    var notesInput = document.createElement("input");
    notesInput.type = "text";
    notesInput.className = "part-notes";
    notesInput.placeholder = "Condition / notes for this part (optional)";
    notesInput.value = notes || "";
    notesInput.setAttribute("aria-label", "Part notes");

    var removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "remove-part";
    removeBtn.textContent = "✕";
    removeBtn.setAttribute("aria-label", "Remove part");
    removeBtn.addEventListener("click", function () {
      row.remove();
      if (!partList.children.length) addPartRow();
      buildRequest();
    });

    row.appendChild(nameInput);
    row.appendChild(notesInput);
    row.appendChild(removeBtn);
    partList.appendChild(row);
  }

  addPartBtn.addEventListener("click", function () {
    addPartRow();
    var rows = partList.querySelectorAll(".part-name");
    rows[rows.length - 1].focus();
  });

  // Start with two empty part rows (most jobs are at least tank + fender)
  addPartRow();
  addPartRow();

  /* ---------- Build the plain-text request ---------- */

  function val(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : "";
  }

  function line(label, value) {
    if (!value) return "";
    return label + ": " + value + "\n";
  }

  function buildRequest() {
    var parts = [];
    partList.querySelectorAll(".part-row").forEach(function (row) {
      var name = row.querySelector(".part-name").value.trim();
      var notes = row.querySelector(".part-notes").value.trim();
      if (name || notes) parts.push("  - " + (name || "(part)") + (notes ? " — " + notes : ""));
    });

    var text = "MOTORCYCLE PAINT QUOTE REQUEST\n";
    text += "Sent from bellautoservices.com — " + new Date().toLocaleDateString() + "\n\n";

    text += "CUSTOMER INFO\n";
    text += line("Name", val("custName"));
    text += line("Phone", val("custPhone"));
    text += line("Email", val("custEmail"));
    text += line("Preferred contact", val("prefContact"));
    text += line("Motorcycle", val("vehicle"));
    text += line("Timeline", val("timeline"));
    text += line("Deadline", val("deadline"));

    text += "\nPAINT JOB DETAILS\n";
    text += line("Paint style", val("paintStyle"));
    text += line("Finish", val("finish"));
    text += line("Color / design idea", val("designIdea"));
    text += line("Damage / bodywork", val("damage"));

    text += "\nPARTS BEING PAINTED\n";
    text += (parts.length ? parts.join("\n") : "  (none listed yet)") + "\n";

    text += "\nNOTES\n";
    text += line("Extra notes", val("extraNotes"));

    text += "\n(Photos will be attached to the message or sent separately.)\n";

    generated.value = text;
    return text;
  }

  // Rebuild the preview on any input; use capture so part-row inputs are caught too
  form.addEventListener("input", buildRequest);
  form.addEventListener("change", buildRequest);

  /* ---------- Send actions ---------- */

  function requireContactInfo() {
    if (!val("custName") || !val("custPhone")) {
      statusEl.style.color = "#c92a2a";
      statusEl.textContent = "Please add your name and phone number first.";
      return false;
    }
    return true;
  }

  function flashStatus(msg, ok) {
    statusEl.style.color = ok ? "#2b8a3e" : "#c92a2a";
    statusEl.textContent = msg;
    if (msg) setTimeout(function () { statusEl.textContent = ""; }, 4000);
  }

  document.getElementById("emailBtn").addEventListener("click", function () {
    var text = requireContactInfo() ? buildRequest() : "";
    if (!text) return;
    var subject = "Paint Quote Request — " + val("custName") + (val("vehicle") ? " — " + val("vehicle") : "");
    window.location.href =
      "mailto:" + SHOP_EMAIL +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(text);
  });

  document.getElementById("copyBtn").addEventListener("click", function () {
    if (!requireContactInfo()) return;
    var text = buildRequest();
    function done() { flashStatus("Request copied — paste it into a text or email.", true); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text, done); });
    } else {
      fallbackCopy(text, done);
    }
  });

  function fallbackCopy(text, done) {
    generated.removeAttribute("readonly");
    generated.select();
    try { document.execCommand("copy"); done(); } catch (e) { flashStatus("Copy failed — select the text manually.", false); }
    generated.setAttribute("readonly", "");
    window.getSelection().removeAllRanges();
  }

  document.getElementById("downloadBtn").addEventListener("click", function () {
    if (!requireContactInfo()) return;
    var text = buildRequest();
    var blob = new Blob([text], { type: "text/plain" });
    var a = document.createElement("a");
    var stamp = new Date().toISOString().slice(0, 10);
    var who = val("custName").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
    a.href = URL.createObjectURL(blob);
    a.download = "paint-quote-" + (who || "request") + "-" + stamp + ".txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
    flashStatus("Request file downloaded — email it to " + SHOP_EMAIL + " with your photos.", true);
  });

  /* ---------- Required-field check on submit attempt ---------- */

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    requireContactInfo();
  });

  buildRequest();
})();
