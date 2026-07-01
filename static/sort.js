(function () {
  function cellVal(row, idx) {
    // Use data-val if present (strips badge text), else raw textContent
    var td = row.children[idx];
    return td ? (td.dataset.val !== undefined ? td.dataset.val : td.textContent.trim()) : "";
  }

  function sortTable(th) {
    var table = th.closest("table");
    var tbody = table.querySelector("tbody");
    if (!tbody) return;
    var rows = Array.from(tbody.querySelectorAll("tr"));
    var idx  = Array.from(th.parentNode.children).indexOf(th);
    var isNum = th.classList.contains("num");
    var asc  = th.dataset.sort !== "asc";

    // Reset all headers in this table
    table.querySelectorAll("thead th").forEach(function (h) {
      h.dataset.sort = "";
      h.querySelector(".sort-arrow") && (h.querySelector(".sort-arrow").textContent = "");
    });

    th.dataset.sort = asc ? "asc" : "desc";
    var arrow = th.querySelector(".sort-arrow");
    if (arrow) arrow.textContent = asc ? " \u25b2" : " \u25bc";

    rows.sort(function (a, b) {
      var av = cellVal(a, idx);
      var bv = cellVal(b, idx);
      if (isNum) {
        var an = parseFloat(av);
        var bn = parseFloat(bv);
        an = isNaN(an) ? (asc ? Infinity : -Infinity) : an;
        bn = isNaN(bn) ? (asc ? Infinity : -Infinity) : bn;
        return asc ? an - bn : bn - an;
      }
      return asc ? av.localeCompare(bv) : bv.localeCompare(av);
    });

    rows.forEach(function (r) { tbody.appendChild(r); });
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("table thead th").forEach(function (th) {
      th.style.cursor = "pointer";
      th.style.userSelect = "none";
      var arrow = document.createElement("span");
      arrow.className = "sort-arrow";
      th.appendChild(arrow);
      th.addEventListener("click", function () { sortTable(th); });
    });

    // Stamp data-val on badge cells so sort uses the numeric value
    document.querySelectorAll("td.num .badge").forEach(function (badge) {
      badge.parentElement.dataset.val = badge.textContent.trim();
    });
  });
})();
