/* ============================================================
   Bello Automotive — Quote Request form logic
   Client-side only: builds a plain-text request, then lets the
   customer email it to the shop, copy it, or download it.
   ============================================================ */

(function () {
  "use strict";

  var SHOP_EMAIL = "krisfrombelloauto@gmail.com";

  // Web3Forms access key for krisfrombelloauto@gmail.com — free key from
  // https://web3forms.com (one key per inbox). Until a real key is pasted here,
  // the "Send Request to Shop" button fails gracefully to the manual options.
  var WEB3FORMS_KEY = "PASTE-WEB3FORMS-ACCESS-KEY";

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

  // Validation rules: field id -> [error span id, human message]
  var REQUIRED = [
    ["custName", "custName-error", "Please enter your name."],
    ["custPhone", "custPhone-error", "Please enter a phone number so the shop can reply."],
    ["serviceType", "serviceType-error", "Please choose the type of work."]
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

    REQUIRED.forEach(function (rule) {
      var empty = !val(rule[0]);
      if (!setFieldError(rule[0], rule[1], rule[2], empty) && !firstBad) firstBad = rule[0];
    });

    // If they prefer email contact, we need the address
    var wantsEmail = val("prefContact") === "Email";
    var emailMissing = wantsEmail && !val("custEmail");
    if (!setFieldError("custEmail", "custEmail-error",
        "You picked email as your preferred contact — please add your email address (or switch to text/call).",
        emailMissing) && !firstBad) {
      firstBad = "custEmail";
    }

    if (firstBad) {
      var el = document.getElementById(firstBad);
      el.focus();
      flashStatus("Please fix the highlighted fields above, then send your request.", false);
    }
    return !firstBad;
  }

  // Clear a field's error as soon as the user starts fixing it (input covers
  // text fields; change covers selects)
  function clearErrorsOnInput(e) {
    var id = e.target.id;
    REQUIRED.forEach(function (rule) {
      if (rule[0] === id && val(id)) setFieldError(id, rule[1], "", false);
    });
    if (id === "custEmail" && (val(id) || val("prefContact") !== "Email")) {
      setFieldError(id, "custEmail-error", "", false);
    }
  }
  form.addEventListener("input", clearErrorsOnInput);
  form.addEventListener("change", clearErrorsOnInput);

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
        flashStatus("Request sent! The shop will get back to you shortly — photos can come in the reply.", true);
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
