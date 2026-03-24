import assert from "node:assert/strict";
import { formatDateTimeForDisplay, getBusinessDayRange, getBusinessMonthRange, getDisplayDateParts } from "../utils/time.utils";

function run() {
  const punchUtc = new Date("2026-03-24T02:40:00.000Z");
  const display = formatDateTimeForDisplay(punchUtc, "America/Sao_Paulo");
  const parts = getDisplayDateParts(punchUtc, "America/Sao_Paulo");
  assert.equal(punchUtc.toISOString(), "2026-03-24T02:40:00.000Z");
  assert.match(display, /23\/03\/2026, 23:40:00,000/);
  assert.equal(parts.dayBr, "23/03/2026");
  assert.equal(parts.timeBr, "23:40:00,000");

  const dayRange = getBusinessDayRange(punchUtc, "America/Sao_Paulo");
  assert.equal(dayRange.start.toISOString(), "2026-03-23T03:00:00.000Z");
  assert.equal(dayRange.end.toISOString(), "2026-03-24T02:59:59.999Z");

  const monthRange = getBusinessMonthRange(3, 2026, "America/Sao_Paulo");
  assert.equal(monthRange.start.toISOString(), "2026-03-01T03:00:00.000Z");
  assert.equal(monthRange.end.toISOString(), "2026-04-01T02:59:59.999Z");

  console.log("time.utils checks passed");
}

run();
