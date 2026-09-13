/* ============================================================
   Bello Automotive — Quote Request form logic
   Client-side only: builds a plain-text request, then lets the
   customer email it to the shop, copy it, or download it.
   ============================================================ */

(function () {
  "use strict";

  var SHOP_EMAIL = "krisfrombelloauto@gmail.com";

  // Web3Forms access key — free key from https://web3forms.com (one key per inbox).
  // FOR NOW: Scott's key (delivers to scottbronder@gmail.com) for testing.
  // Before launch, create a web3forms entry for krisfrombelloauto@gmail.com
  // and swap in that key.
  var WEB3FORMS_KEY = "e8265f14-1781-4140-ac75-4e40b5917b31";

  var form = document.getElementById("quoteForm");
  var partList = document.getElementById("partList");
  var addPartBtn = document.getElementById("addPart");
  var generated = document.getElementById("generated");
  var statusEl = document.getElementById("formStatus");

  /* ---------- Dynamic "Parts / Work Needed" rows ---------- */

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
    removeBtn.addEventListener("click", function () {
      row.remove();
      labelRemoveButtons();
      if (!partList.children.length) addPartRow();
      buildRequest();
    });

    row.appendChild(nameInput);
    row.appendChild(notesInput);
    row.appendChild(removeBtn);
    partList.appendChild(row);
    labelRemoveButtons();
  }

  // Numbered labels so screen readers can tell identical rows apart
  function labelRemoveButtons() {
    partList.querySelectorAll(".part-row").forEach(function (row, i) {
      row.querySelector(".remove-part").setAttribute("aria-label", "Remove part " + (i + 1));
    });
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

    var text = "QUOTE REQUEST\n";
    text += "Sent from the Bello Automotive website — " + new Date().toLocaleDateString() + "\n\n";

    text += "CUSTOMER INFO\n";
    text += line("Name", val("custName"));
    text += line("Phone", val("custPhone"));
    text += line("Email", val("custEmail"));
    text += line("Preferred contact", val("prefContact"));
    text += line("Vehicle", val("vehicle"));
    text += line("Timeline", val("timeline"));
    text += line("Deadline", val("deadline"));

    text += "\nPROJECT DETAILS\n";
    text += line("Type of work", val("serviceType"));
    text += line("Paint style (if paint work)", val("paintStyle"));
    text += line("Finish (if paint work)", val("finish"));
    text += line("Work / design idea", val("designIdea"));
    text += line("Damage / bodywork", val("damage"));

    text += "\nPARTS / WORK NEEDED\n";
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

  /* ---------- Validation ---------- */

  function validPhone(v) {
    var d = v.replace(/\D/g, "");
    // 10-digit US number, or 11 with a leading 1. Format-agnostic otherwise.
    return (d.length === 10 && d[0] !== "0" && d[0] !== "1") ||
           (d.length === 11 && d[0] === "1");
  }

  function validEmail(v) {
    // Pragmatic plausibility check, not full RFC validation
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  }

  // Validation rules: required-empty message, plus optional format check
  var RULES = [
    { id: "custName", err: "custName-error", empty: "Please enter your name." },
    { id: "custPhone", err: "custPhone-error", empty: "Please enter a phone number so the shop can reply.",
      format: validPhone, formatMessage: "That phone number doesn't look complete — include the area code, e.g. (508) 461-6432." },
    { id: "serviceType", err: "serviceType-error", empty: "Please choose the type of work." },
    { id: "custEmail", err: "custEmail-error", empty: "",
      format: validEmail, formatMessage: "That email address doesn't look right — double-check it for typos." }
  ];

  function setFieldError(fieldId, errId, message, hasError) {
    var el = document.getElementById(fieldId);
    var err = document.getElementById(errId);
    if (!el || !err) return !hasError;
    if (hasError) {
      el.setAttribute("aria-invalid", "true");
      err.textContent = message;
      err.hidden = false;
    } else {
      el.removeAttribute("aria-invalid");
      err.hidden = true;
    }
    return !hasError;
  }

  // Validates all rules; moves focus to the first invalid field. Returns true when valid.
  function validateContactInfo() {
    var firstBad = null;

    RULES.forEach(function (rule) {
      var v = val(rule.id);
      var bad = false, msg = "";
      if (!v && rule.empty) {
        bad = true;
        msg = rule.empty;
      } else if (v && rule.format && !rule.format(v)) {
        bad = true;
        msg = rule.formatMessage;
      }
      if (!setFieldError(rule.id, rule.err, msg, bad) && !firstBad) firstBad = rule.id;
    });

    // If they prefer email contact, we need the address (only when it's empty —
    // otherwise this would wipe a format error set above)
    if (!val("custEmail")) {
      var wantsEmail = val("prefContact") === "Email";
      if (!setFieldError("custEmail", "custEmail-error",
          "You picked email as your preferred contact — please add your email address (or switch to text/call).",
          wantsEmail) && !firstBad) {
        firstBad = "custEmail";
      }
    }

    if (firstBad) {
      var el = document.getElementById(firstBad);
      el.focus();
      flashStatus("Please fix the highlighted fields above, then send your request.", false);
    }
    return !firstBad;
  }

  // Clear a field's error as soon as it becomes valid (never ADD errors mid-typing)
  function clearErrorsOnInput(e) {
    var id = e.target.id;
    RULES.forEach(function (rule) {
      if (rule.id !== id) return;
      var v = val(id);
      var ok = rule.empty ? !!v : true;
      if (ok && rule.format) ok = rule.format(v);
      if (ok) setFieldError(id, rule.err, "", false);
    });
    if (id === "prefContact" && val("prefContact") !== "Email") {
      setFieldError("custEmail", "custEmail-error", "", false);
    }
  }
  form.addEventListener("input", clearErrorsOnInput);
  form.addEventListener("change", clearErrorsOnInput);

  // Format-check non-empty fields on blur so typos surface early
  form.addEventListener("focusout", function (e) {
    var id = e.target.id;
    RULES.forEach(function (rule) {
      if (rule.id !== id || !rule.format) return;
      var v = val(id);
      if (v && !rule.format(v)) setFieldError(id, rule.err, rule.formatMessage, true);
    });
  });

  function flashStatus(msg, ok) {
    statusEl.classList.remove("is-error", "is-success");
    statusEl.classList.add(ok ? "is-success" : "is-error");
    statusEl.textContent = msg;
    if (msg && ok) {
      // Success notes auto-dismiss; errors stay until fixed
      setTimeout(function () {
        if (statusEl.textContent === msg) statusEl.textContent = "";
      }, 6000);
    }
  }

  /* ---------- Send actions ---------- */

  document.getElementById("emailBtn").addEventListener("click", function () {
    if (!validateContactInfo()) return;
    var text = buildRequest();
    var subject = "Quote Request — " + val("custName") + (val("vehicle") ? " — " + val("vehicle") : "");
    window.location.href =
      "mailto:" + SHOP_EMAIL +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(text);
  });

  document.getElementById("copyBtn").addEventListener("click", function () {
    if (!validateContactInfo()) return;
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
    if (!validateContactInfo()) return;
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

  /* ---------- Direct send to the shop (Web3Forms) ---------- */

  var sendBtn = document.getElementById("sendBtn");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validateContactInfo()) return;

    var text = buildRequest();
    var subject = "Quote Request — " + val("custName") + (val("vehicle") ? " — " + val("vehicle") : "");
    var payload = Object.fromEntries(new FormData(form));
    payload.access_key = WEB3FORMS_KEY;
    payload.subject = subject;
    payload.from_name = "Bello Automotive website";
    payload["Request details"] = text;

    var label = sendBtn.textContent;
    sendBtn.disabled = true;
    sendBtn.textContent = "Sending…";
    statusEl.textContent = "";

    fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload)
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (!data.success) throw new Error(data.message || "Submission failed");
        flashStatus("Request sent! The shop will review it and follow up with next steps. Need something sooner? Call (508) 461-6432.", true);
        form.reset();
        partList.innerHTML = "";
        addPartRow();
        addPartRow();
        buildRequest();
      })
      .catch(function () {
        flashStatus("Couldn't send automatically — no worries: use Email, Copy, or Download below to send the request yourself.", false);
      })
      .then(function () {
        sendBtn.disabled = false;
        sendBtn.textContent = label;
      });
  });

  /* ---------- Init ---------- */

  // Deadline can't be in the past
  var deadline = document.getElementById("deadline");
  if (deadline) deadline.min = new Date().toISOString().slice(0, 10);

  buildRequest();
})();
