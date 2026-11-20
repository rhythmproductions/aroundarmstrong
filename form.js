// Submission form: type first, fields per type, consent before photo.
// Plain JavaScript, no build step. Without JavaScript the whole form shows and the
// browser's own required checks still apply.
(function () {
  var form = document.getElementById("submission-form");
  if (!form) return;

  var MAX_PHOTO_BYTES = 8 * 1024 * 1024;
  var PET = "Pet of the week";

  // Consent wording. Every type has a photo upload right now, so every type uses the
  // photo wording. A type added later without a photo upload would use the other one.
  var CONSENT_PHOTO = "I took this photo or have permission to share it. If people are in it, they've agreed to it being shared (a parent or guardian for anyone under 18). Around Armstrong can show it on the show, the website and its social media pages.";
  var CONSENT_NO_PHOTO = "I have the right to share this, and Around Armstrong can use it on the show, the website and its social media pages.";
  var TYPES_WITHOUT_PHOTO = [];

  var $ = function (id) { return document.getElementById(id); };
  var typeSelect = $("f-type");
  var body = $("form-body");
  var consent = $("f-consent");
  var consentText = $("f-consent-text");
  var consentTextField = $("f-consent-text-field");
  var consentAt = $("f-consent-at");
  var photo = $("f-photo");
  var photoRow = $("f-photo-row");
  var photoLock = $("f-photo-lock");
  var photoOpt = $("f-photo-opt");
  var townOtherRadio = $("f-town-other-radio");
  var townOtherWrap = $("f-town-other-wrap");
  var townOther = $("f-town-other");
  var townOpt = form.querySelector("[data-town-opt]");
  var petAbout = $("f-pet-about");
  var petCount = $("f-pet-about-count");

  // Let our own checks handle errors so messages sit next to the field.
  form.setAttribute("novalidate", "");

  // ---- errors ----
  function setError(input, errId, message) {
    var el = $(errId);
    if (!el) return;
    if (message) {
      el.textContent = message;
      el.hidden = false;
      if (input) input.setAttribute("aria-invalid", "true");
    } else {
      el.textContent = "";
      el.hidden = true;
      if (input) input.removeAttribute("aria-invalid");
    }
  }
  function clearAllErrors() {
    form.querySelectorAll(".form__error").forEach(function (el) { el.hidden = true; el.textContent = ""; });
    form.querySelectorAll("[aria-invalid]").forEach(function (el) { el.removeAttribute("aria-invalid"); });
  }

  // ---- type switching ----
  function currentType() { return typeSelect.value; }

  function applyType() {
    var type = currentType();
    var isPet = type === PET;
    var hasType = type !== "";

    body.hidden = !hasType;

    // Show the right group and disable the other one. Disabled fields keep what the
    // person typed but are not sent and are not checked.
    form.querySelectorAll("[data-for]").forEach(function (group) {
      var on = hasType && (group.getAttribute("data-for") === (isPet ? "pet" : "general"));
      group.hidden = !on;
      group.disabled = !on;
    });

    form.querySelectorAll("[data-label-general]").forEach(function (el) { el.hidden = isPet; });
    form.querySelectorAll("[data-label-pet]").forEach(function (el) { el.hidden = !isPet; });
    form.querySelectorAll("[data-help-pet]").forEach(function (el) { el.hidden = !isPet; });

    townOpt.hidden = isPet;
    photoOpt.textContent = isPet ? "(required)" : "(optional)";
    photo.required = isPet;

    var noPhoto = TYPES_WITHOUT_PHOTO.indexOf(type) !== -1;
    photoRow.hidden = noPhoto;
    photo.disabled = noPhoto || !consent.checked;
    var text = noPhoto ? CONSENT_NO_PHOTO : CONSENT_PHOTO;
    if (consentText.textContent !== text) {
      // Wording changed, so the earlier tick no longer covers what is on screen.
      consentText.textContent = text;
      if (consent.checked) { consent.checked = false; onConsentChange(); }
    }
    consentTextField.value = text;
    updatePhotoLock();
    clearAllErrors();
  }

  // ---- consent and photo ----
  function updatePhotoLock() {
    photoLock.hidden = consent.checked || photoRow.hidden;
  }

  function onConsentChange() {
    if (consent.checked) {
      consentAt.value = new Date().toISOString();
      consentTextField.value = consentText.textContent;
      photo.disabled = photoRow.hidden;
      setError(consent, "f-consent-err", "");
    } else {
      consentAt.value = "";
      photo.value = "";
      photo.disabled = true;
      setError(photo, "f-photo-err", "");
    }
    updatePhotoLock();
  }

  function checkPhoto() {
    var file = photo.files && photo.files[0];
    if (!file) return "";
    if (!/^image\//.test(file.type)) return "That file isn't a photo. Please choose a JPG, PNG or HEIC image.";
    if (file.size > MAX_PHOTO_BYTES) return "That photo is over 8 MB. Please choose a smaller one, or send a screenshot of it.";
    return "";
  }

  // ---- town ----
  function townValue() {
    var picked = form.querySelector('input[name="town"]:checked');
    return picked ? picked.value : "";
  }
  function onTownChange() {
    var other = townValue() === "Other";
    townOtherWrap.hidden = !other;
    townOther.disabled = !other;
    setError(null, "f-town-err", "");
    if (!other) setError(townOther, "f-town-other-err", "");
  }

  // ---- pet counter ----
  function updateCount() {
    petCount.textContent = petAbout.value.length + " / 300";
  }

  // ---- validation on submit ----
  function validate() {
    clearAllErrors();
    var first = null;
    function fail(input, errId, msg) {
      setError(input, errId, msg);
      if (!first) first = input;
    }
    var type = currentType();
    var isPet = type === PET;
    var email = $("f-email").value.trim();

    if (!type) { fail(typeSelect, "f-type-err", "Pick what you're sending in."); return first; }

    if (isPet && !$("f-pet-name").value.trim()) fail($("f-pet-name"), "f-pet-name-err", "Add your pet's name.");
    if (!$("f-name").value.trim()) fail($("f-name"), "f-name-err", isPet ? "Add your first name." : "Add your name.");
    if (!email) fail($("f-email"), "f-email-err", "Add your email.");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail($("f-email"), "f-email-err", "That email doesn't look right. Check it for typos.");

    var town = townValue();
    if (isPet && !town) fail(form.querySelector('input[name="town"]'), "f-town-err", "Pick your town.");
    if (town === "Other" && !townOther.value.trim()) fail(townOther, "f-town-other-err", "Type your town.");

    if (!isPet && !$("f-details").value.trim()) fail($("f-details"), "f-details-err", "Tell me a bit about it.");
    if (isPet) {
      var about = petAbout.value.trim();
      if (!about) fail(petAbout, "f-pet-about-err", "Add a couple of sentences about your pet.");
      else if (about.length > 300) fail(petAbout, "f-pet-about-err", "Keep it to 300 characters.");
    }

    if (!consent.checked) fail(consent, "f-consent-err", "Please tick this box so we can use what you send.");

    var photoMsg = checkPhoto();
    if (photoMsg) fail(photo, "f-photo-err", photoMsg);
    else if (isPet && !(photo.files && photo.files[0])) {
      fail(photo, "f-photo-err", consent.checked ? "Add a photo of your pet." : "Tick the box above, then add a photo of your pet.");
    }

    return first;
  }

  // ---- wire up ----
  typeSelect.addEventListener("change", applyType);
  consent.addEventListener("change", onConsentChange);
  photo.addEventListener("change", function () { setError(photo, "f-photo-err", checkPhoto()); });
  form.querySelectorAll('input[name="town"]').forEach(function (r) { r.addEventListener("change", onTownChange); });
  petAbout.addEventListener("input", updateCount);

  // Clear a field's error as soon as it is fixed.
  form.addEventListener("input", function (e) {
    var t = e.target;
    if (t.getAttribute("aria-invalid") === "true" && t.value.trim()) {
      var describedBy = (t.getAttribute("aria-describedby") || "").split(" ");
      describedBy.forEach(function (id) { if (/-err$/.test(id)) setError(t, id, ""); });
    }
  });

  form.addEventListener("submit", function (e) {
    var bad = validate();
    if (bad) {
      e.preventDefault();
      bad.focus();
      return;
    }
    if (!consentAt.value) consentAt.value = new Date().toISOString();
    consentTextField.value = consentText.textContent;
  });

  // Initial state.
  townOther.disabled = true;
  photo.disabled = true;
  applyType();
  onTownChange();
  updateCount();
})();
