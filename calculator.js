// Nexi Payment Pricing Calculator
// Beta-Version — Berechnungslogik für Blended- und IC++-Modus

(function () {
  "use strict";

  // ---------- State ----------

  let mode = "blended";

  const defaultCardMix = [
    { id: "debit_eu", label: "Debit Consumer (EU-issued)", share: 45, interchange: 0.20, scheme: 0.03, placeholder: true },
    { id: "credit_eu", label: "Credit Consumer (EU-issued)", share: 30, interchange: 0.30, scheme: 0.04, placeholder: true },
    { id: "commercial", label: "Commercial / Business", share: 15, interchange: 1.50, scheme: 0.06, placeholder: true },
    { id: "premium_noneu", label: "Premium / Non-EU issued", share: 10, interchange: 2.00, scheme: 0.08, placeholder: true },
  ];

  let cardMix = defaultCardMix.map(function (c) { return Object.assign({}, c); });

  // ---------- Formatting helpers ----------

  function fmtCHF(n) {
    return new Intl.NumberFormat("de-CH", { style: "currency", currency: "CHF", maximumFractionDigits: 0 }).format(Math.round(n));
  }
  function fmtBp(n) {
    return (Math.round(n * 100) / 100).toFixed(2) + " bp";
  }
  function fmtPct(n) {
    return (Math.round(n * 1000) / 1000).toFixed(3) + " %";
  }

  // ---------- DOM refs ----------

  const el = {
    modeBlended: document.getElementById("mode-blended"),
    modeIcpp: document.getElementById("mode-icpp"),
    blendedInputs: document.getElementById("blended-inputs"),
    icppInputs: document.getElementById("icpp-inputs"),

    volume: document.getElementById("volume"),

    nexiBp: document.getElementById("nexi-bp"),
    compBp: document.getElementById("comp-bp"),

    cardMixRows: document.getElementById("card-mix-rows"),
    shareSum: document.getElementById("share-sum"),

    nexiAsfBp: document.getElementById("nexi-asf-bp"),
    nexiAsfFix: document.getElementById("nexi-asf-fix"),
    compAsfBp: document.getElementById("comp-asf-bp"),
    compAsfFix: document.getElementById("comp-asf-fix"),
    fixFeeNote: document.getElementById("fix-fee-note"),

    metricSavingsAbs: document.getElementById("metric-savings-abs"),
    metricSavingsPct: document.getElementById("metric-savings-pct"),
    metricNexiEff: document.getElementById("metric-nexi-eff"),
    metricCompEff: document.getElementById("metric-comp-eff"),

    breakdownNexiTotal: document.getElementById("breakdown-nexi-total"),
    breakdownCompTotal: document.getElementById("breakdown-comp-total"),
    barNexiInterchange: document.getElementById("bar-nexi-interchange"),
    barNexiScheme: document.getElementById("bar-nexi-scheme"),
    barNexiAsf: document.getElementById("bar-nexi-asf"),
    barCompInterchange: document.getElementById("bar-comp-interchange"),
    barCompScheme: document.getElementById("bar-comp-scheme"),
    barCompAsf: document.getElementById("bar-comp-asf"),
    legend: document.getElementById("legend"),
  };

  // ---------- Render card mix rows ----------

  function renderCardMixRows() {
    el.cardMixRows.innerHTML = "";
    cardMix.forEach(function (c, idx) {
      const row = document.createElement("div");
      row.className = "mix-row";

      const labelDiv = document.createElement("div");
      labelDiv.className = "mix-row-label";
      labelDiv.textContent = c.label;
      if (c.placeholder) {
        const badge = document.createElement("span");
        badge.className = "badge-placeholder";
        badge.textContent = "Platzhalter – prüfen";
        labelDiv.appendChild(badge);
      }
      row.appendChild(labelDiv);

      row.appendChild(buildMixField("Anteil", c.share, "%", idx, "share", "share-field", 1));
      row.appendChild(buildMixField("Interchange", c.interchange, "%", idx, "interchange", "", 0.01));
      row.appendChild(buildMixField("Scheme Fee", c.scheme, "%", idx, "scheme", "", 0.01));

      el.cardMixRows.appendChild(row);
    });
  }

  function buildMixField(labelText, value, suffix, idx, field, extraClass, step) {
    const wrap = document.createElement("div");
    wrap.className = "field " + extraClass;

    const label = document.createElement("label");
    label.textContent = labelText;
    wrap.appendChild(label);

    const inputSuffix = document.createElement("div");
    inputSuffix.className = "input-suffix";

    const input = document.createElement("input");
    input.type = "number";
    input.step = step;
    input.value = value;
    input.addEventListener("input", function () {
      cardMix[idx][field] = parseFloat(input.value) || 0;
      if (field === "interchange" || field === "scheme") {
        cardMix[idx].placeholder = false;
        renderCardMixRows();
      }
      recalculate();
    });
    inputSuffix.appendChild(input);

    const suffixSpan = document.createElement("span");
    suffixSpan.className = "suffix";
    suffixSpan.textContent = suffix;
    inputSuffix.appendChild(suffixSpan);

    wrap.appendChild(inputSuffix);
    return wrap;
  }

  // ---------- Mode switching ----------

  function setMode(newMode) {
    mode = newMode;
    el.modeBlended.classList.toggle("active", mode === "blended");
    el.modeIcpp.classList.toggle("active", mode === "icpp");
    el.modeBlended.setAttribute("aria-selected", mode === "blended");
    el.modeIcpp.setAttribute("aria-selected", mode === "icpp");
    el.blendedInputs.classList.toggle("hidden", mode !== "blended");
    el.icppInputs.classList.toggle("hidden", mode !== "icpp");
    recalculate();
  }

  el.modeBlended.addEventListener("click", function () { setMode("blended"); });
  el.modeIcpp.addEventListener("click", function () { setMode("icpp"); });

  // ---------- Recalculation ----------

  function getVolume() {
    return parseFloat(el.volume.value) || 0;
  }

  function recalculate() {
    const volume = getVolume();

    let savings, savingsPct, nexiTotal, compTotal, nexiEffBp, compEffBp;
    let interchangeTotal = 0, schemeTotal = 0, nexiAsfAmount = 0, compAsfAmount = 0;

    if (mode === "blended") {
      const nexiBp = parseFloat(el.nexiBp.value) || 0;
      const compBp = parseFloat(el.compBp.value) || 0;
      nexiTotal = volume * (nexiBp / 10000);
      compTotal = volume * (compBp / 10000);
      nexiEffBp = nexiBp;
      compEffBp = compBp;
      el.fixFeeNote.classList.add("hidden");
    } else {
      // IC++ mode
      let shareSum = 0;
      cardMix.forEach(function (c) {
        shareSum += c.share;
        const segVolume = volume * (c.share / 100);
        interchangeTotal += segVolume * (c.interchange / 100);
        schemeTotal += segVolume * (c.scheme / 100);
      });

      el.shareSum.textContent = "Summe Anteile: " + (Math.round(shareSum * 10) / 10) + " %";
      el.shareSum.classList.toggle("invalid", Math.abs(shareSum - 100) > 0.5);

      const nexiAsfBp = parseFloat(el.nexiAsfBp.value) || 0;
      const compAsfBp = parseFloat(el.compAsfBp.value) || 0;
      const nexiAsfFix = parseFloat(el.nexiAsfFix.value) || 0;
      const compAsfFix = parseFloat(el.compAsfFix.value) || 0;

      nexiAsfAmount = volume * (nexiAsfBp / 10000);
      compAsfAmount = volume * (compAsfBp / 10000);

      nexiTotal = interchangeTotal + schemeTotal + nexiAsfAmount;
      compTotal = interchangeTotal + schemeTotal + compAsfAmount;

      nexiEffBp = volume > 0 ? (nexiTotal / volume) * 10000 : 0;
      compEffBp = volume > 0 ? (compTotal / volume) * 10000 : 0;

      el.fixFeeNote.classList.toggle("hidden", nexiAsfFix === 0 && compAsfFix === 0);
    }

    savings = compTotal - nexiTotal;
    savingsPct = compTotal > 0 ? (savings / compTotal) * 100 : 0;

    // ---------- Update metrics ----------

    el.metricSavingsAbs.textContent = (savings >= 0 ? "" : "-") + fmtCHF(Math.abs(savings));
    el.metricSavingsAbs.className = "metric-value " + (savings >= 0 ? "positive" : "negative");

    el.metricSavingsPct.textContent = (savings >= 0 ? "" : "-") + fmtPct(Math.abs(savingsPct));
    el.metricSavingsPct.className = "metric-value " + (savings >= 0 ? "positive" : "negative");

    el.metricNexiEff.textContent = fmtBp(nexiEffBp);
    el.metricCompEff.textContent = fmtBp(compEffBp);

    // ---------- Update breakdown bars ----------

    el.breakdownNexiTotal.textContent = fmtCHF(nexiTotal);
    el.breakdownCompTotal.textContent = fmtCHF(compTotal);

    const maxBar = Math.max(nexiTotal, compTotal, 1);

    if (mode === "icpp") {
      el.barNexiInterchange.style.width = (interchangeTotal / maxBar * 100) + "%";
      el.barNexiScheme.style.width = (schemeTotal / maxBar * 100) + "%";
      el.barNexiAsf.style.width = (nexiAsfAmount / maxBar * 100) + "%";

      el.barCompInterchange.style.width = (interchangeTotal / maxBar * 100) + "%";
      el.barCompScheme.style.width = (schemeTotal / maxBar * 100) + "%";
      el.barCompAsf.style.width = (compAsfAmount / maxBar * 100) + "%";

      el.legend.innerHTML =
        legendItem("var(--interchange-color)", "Interchange " + fmtCHF(interchangeTotal)) +
        legendItem("var(--scheme-color)", "Scheme Fee " + fmtCHF(schemeTotal)) +
        legendItem("var(--nexi-blue)", "Nexi ASF " + fmtCHF(nexiAsfAmount)) +
        legendItem("var(--comp-color)", "Wettbewerber ASF " + fmtCHF(compAsfAmount));
    } else {
      el.barNexiInterchange.style.width = "0%";
      el.barNexiScheme.style.width = "0%";
      el.barNexiAsf.style.width = (nexiTotal / maxBar * 100) + "%";

      el.barCompInterchange.style.width = "0%";
      el.barCompScheme.style.width = "0%";
      el.barCompAsf.style.width = (compTotal / maxBar * 100) + "%";

      el.legend.innerHTML =
        legendItem("var(--nexi-blue)", "Nexi Effektivkosten " + fmtCHF(nexiTotal)) +
        legendItem("var(--comp-color)", "Wettbewerber Effektivkosten " + fmtCHF(compTotal));
    }
  }

  function legendItem(color, text) {
    return '<span class="legend-item"><span class="legend-dot" style="background:' + color + '"></span>' + text + "</span>";
  }

  // ---------- Wire up inputs ----------

  [el.volume, el.nexiBp, el.compBp, el.nexiAsfBp, el.nexiAsfFix, el.compAsfBp, el.compAsfFix].forEach(function (input) {
    input.addEventListener("input", recalculate);
  });

  // ---------- Init ----------

  renderCardMixRows();
  recalculate();
})();
