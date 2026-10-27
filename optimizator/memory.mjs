export function addressMemoryKey(point) {
  const postcode = String(point?.postcode || '').trim().toLowerCase().replace(/\s+/g, ' ');
  if (postcode) return `postcode:${postcode}`;
  return `coordinates:${Number(point?.lat).toFixed(5)},${Number(point?.lon).toFixed(5)}`;
}

export function applyAddressMemory(point, memory = {}) {
  const learned = memory[addressMemoryKey(point)];
  if (!learned) return { ...point, learnedFromMemory: false };
  const learnedTime = point.actualServiceMinutes === undefined ? learned.serviceTime : undefined;
  return { ...point, group: point.group || learned.group || '', notes: point.notes || learned.notes || '', apartment: point.apartment || learned.apartment || '', intercom: point.intercom || learned.intercom || '', parking: point.parking || learned.parking || '', accessRestriction: point.accessRestriction || learned.accessRestriction || '', serviceTime: point.actualServiceMinutes ?? learnedTime ?? point.serviceTime, learnedFromMemory: true, memoryUpdatedAt: learned.updatedAt || '' };
}

export function rememberAddress(memory = {}, point, updatedAt = new Date().toISOString()) {
  const key = addressMemoryKey(point);
  const previous = memory[key] || {};
  const next = { ...previous, updatedAt };
  if (point.group) next.group = String(point.group).trim();
  if (point.notes) next.notes = String(point.notes).trim();
  if (point.apartment) next.apartment = String(point.apartment).trim();
  if (point.intercom) next.intercom = String(point.intercom).trim();
  if (point.parking) next.parking = String(point.parking).trim();
  if (point.accessRestriction) next.accessRestriction = String(point.accessRestriction).trim();
  if (Number.isFinite(Number(point.actualServiceMinutes)) && Number(point.actualServiceMinutes) >= 0) next.serviceTime = Number(point.actualServiceMinutes);
  return { ...memory, [key]: next };
}

