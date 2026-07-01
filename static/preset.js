(function () {
  var METRICS = ["pacing","saturation","contrast","motion","flashing","audio"];

  function norm(val, max) {
    if (val === null || val === undefined || max === 0) return 0;
    return Math.min(1, Math.max(0, val / max));
  }

  function badge(score) {
    var cls = score < 0.33 ? "badge-lo" : score < 0.40 ? "badge-md" : "badge-hi";
    return '<span class="badge ' + cls + '">' + score.toFixed(3) + '</span>';
  }

  function recompute() {
    var shows  = window.SHOW_DATA;
    var presets = window.PRESET_DATA;
    if (!shows || !presets) return;

    var name = document.getElementById("preset-select").value;
    var isCustom = (name === "Custom");
    var ranges = isCustom
      ? presets["General / All Ages"].ranges
      : presets[name].ranges;

    var weights = {};
    METRICS.forEach(function (k) {
      var el = document.getElementById("w-" + k);
      weights[k] = el ? parseFloat(el.value) : 0;
    });

    shows.forEach(function (show) {
      var score =
        weights.pacing     * norm(show.pacing,     ranges.cuts_per_min.max) +
        weights.saturation * norm(show.saturation, ranges.color_saturation_mean.max) +
        weights.contrast   * norm(show.contrast,   ranges.color_contrast_mean.max) +
        weights.motion     * norm(show.motion,      ranges.motion_mean.max) +
        weights.flashing   * norm(show.flashing,    ranges.flashing_events_per_min.max) +
        weights.audio      * norm(show.audio,       ranges.audio_rms_mean.max);

      var row = document.querySelector('tr[data-slug="' + show.slug + '"]');
      if (!row) return;
      var cell = row.querySelector(".score-cell");
      if (!cell) return;
      cell.innerHTML = badge(score);
      cell.dataset.val = score.toFixed(3);
    });
  }

  function loadPreset(name) {
    var presets = window.PRESET_DATA;
    if (!presets || !presets[name]) return;
    var p = presets[name];
    METRICS.forEach(function (k) {
      var el  = document.getElementById("w-" + k);
      var val = p.weights[k] !== undefined ? p.weights[k] : 0;
      if (el) el.value = val;
      var lbl = document.getElementById("w-" + k + "-val");
      if (lbl) lbl.textContent = val.toFixed(2);
    });
    var desc = document.getElementById("preset-desc");
    if (desc) desc.textContent = p.description || "";
  }

  function onPresetChange() {
    var name = document.getElementById("preset-select").value;
    var cw = document.getElementById("custom-weights");
    if (name === "Custom") {
      if (cw) cw.style.display = "";
    } else {
      if (cw) cw.style.display = "none";
      loadPreset(name);
    }
    recompute();
  }

  function onWeightChange(key) {
    var el  = document.getElementById("w-" + key);
    var lbl = document.getElementById("w-" + key + "-val");
    if (el && lbl) lbl.textContent = parseFloat(el.value).toFixed(2);
    var sel = document.getElementById("preset-select");
    if (sel) sel.value = "Custom";
    var cw = document.getElementById("custom-weights");
    if (cw) cw.style.display = "";
    recompute();
  }

  document.addEventListener("DOMContentLoaded", function () {
    var sel = document.getElementById("preset-select");
    if (!sel) return; // not on homepage

    sel.addEventListener("change", onPresetChange);

    METRICS.forEach(function (k) {
      var el = document.getElementById("w-" + k);
      if (el) el.addEventListener("input", function () { onWeightChange(k); });
    });

    // Initialize with General / All Ages
    sel.value = "General / All Ages";
    onPresetChange();
  });
})();
