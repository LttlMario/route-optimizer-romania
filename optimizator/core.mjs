export function routeCost(order, matrix) {
  return order.slice(1).reduce((total, point, index) => total + Number(matrix[order[index]][point] ?? Infinity), 0);
}

export function validateOrder(order, pointCount) {
  if (!Array.isArray(order) || order.length < 2 || order[0] !== 0) return 'invalid-order-start';
  if (order.some((index) => !Number.isInteger(index) || index < 0 || index >= pointCount)) return 'invalid-order-index';
  const returned = order.at(-1) === 0;
  const body = returned ? order.slice(1, -1) : order.slice(1);
  if (new Set(body).size !== body.length) return 'duplicate-order-stop';
  if (body.length !== pointCount - 1) return 'missing-order-stop';
  if (returned && order.filter((index) => index === 0).length !== 2) return 'invalid-return-depot';
  if (!returned && order.includes(0, 1)) return 'unexpected-return-depot';
  return null;
}

export function validateDurationMatrix(matrix, pointCount) {
  if (!Array.isArray(matrix) || matrix.length !== pointCount) return 'invalid-matrix-size';
  for (const row of matrix) {
    if (!Array.isArray(row) || row.length !== pointCount) return 'invalid-matrix-row';
    if (row.some((value) => typeof value !== 'number' || !Number.isFinite(value) || value < 0)) return 'unreachable-matrix-leg';
  }
  return null;
}

export function validateRouteGeometry(geometry) {
  if (geometry?.type !== 'LineString' || !Array.isArray(geometry.coordinates) || geometry.coordinates.length < 2) return 'invalid-route-geometry';
  if (geometry.coordinates.some((coordinate) => !Array.isArray(coordinate) || coordinate.length < 2 || !Number.isFinite(Number(coordinate[0])) || !Number.isFinite(Number(coordinate[1])) || Number(coordinate[0]) < -180 || Number(coordinate[0]) > 180 || Number(coordinate[1]) < -90 || Number(coordinate[1]) > 90)) return 'invalid-route-geometry';
  return null;
}

export function validateRouteAnchors(geometry, points, order, toleranceMeters = 1500) {
  if (validateRouteGeometry(geometry) || !Array.isArray(points) || !Array.isArray(order) || order.length < 2 || !Number.isFinite(Number(toleranceMeters)) || Number(toleranceMeters) < 0) return 'invalid-route-anchors';
  const firstPoint = points[order[0]];
  const lastPoint = points[order.at(-1)];
  const firstCoordinate = geometry.coordinates[0];
  const lastCoordinate = geometry.coordinates.at(-1);
  const validPoint = (point) => Number.isFinite(Number(point?.lat)) && Number.isFinite(Number(point?.lon));
  if (!validPoint(firstPoint) || !validPoint(lastPoint)) return 'invalid-route-anchors';
  const distanceMeters = (a, b) => {
    const earthRadius = 6371008.8;
    const toRadians = (value) => Number(value) * Math.PI / 180;
    const latitudeA = toRadians(a[1]);
    const latitudeB = toRadians(b[1]);
    const deltaLatitude = toRadians(b[1] - a[1]);
    const deltaLongitude = toRadians(b[0] - a[0]);
    const sineLatitude = Math.sin(deltaLatitude / 2);
    const sineLongitude = Math.sin(deltaLongitude / 2);
    const haversine = sineLatitude * sineLatitude + Math.cos(latitudeA) * Math.cos(latitudeB) * sineLongitude * sineLongitude;
    return earthRadius * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(Math.max(0, 1 - haversine)));
  };
  if (distanceMeters([Number(firstPoint.lon), Number(firstPoint.lat)], firstCoordinate) > toleranceMeters || distanceMeters([Number(lastPoint.lon), Number(lastPoint.lat)], lastCoordinate) > toleranceMeters) return 'invalid-route-anchors';
  return null;
}

export function validateRouteWaypoints(geometry, points, order, toleranceMeters = 1000) {
  if (validateRouteGeometry(geometry) || !Array.isArray(points) || !Array.isArray(order) || !Number.isFinite(Number(toleranceMeters)) || Number(toleranceMeters) < 0) return 'invalid-route-waypoints';
  const coordinates = geometry.coordinates;
  const distanceToSegment = (point, start, end) => {
    const latitude = (Number(start[1]) + Number(end[1]) + Number(point.lat)) / 3 * Math.PI / 180;
    const scaleX = 6371008.8 * Math.PI / 180 * Math.cos(latitude);
    const scaleY = 6371008.8 * Math.PI / 180;
    const px = Number(point.lon) * scaleX;
    const py = Number(point.lat) * scaleY;
    const ax = Number(start[0]) * scaleX;
    const ay = Number(start[1]) * scaleY;
    const bx = Number(end[0]) * scaleX;
    const by = Number(end[1]) * scaleY;
    const dx = bx - ax;
    const dy = by - ay;
    const denominator = dx * dx + dy * dy;
    const factor = denominator ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / denominator)) : 0;
    return Math.hypot(px - (ax + factor * dx), py - (ay + factor * dy));
  };
  for (const pointIndex of order) {
    const point = points[pointIndex];
    if (!Number.isFinite(Number(point?.lat)) || !Number.isFinite(Number(point?.lon))) return 'invalid-route-waypoints';
    const nearest = coordinates.reduce((best, coordinate, index) => index === 0 ? best : Math.min(best, distanceToSegment(point, coordinates[index - 1], coordinate)), Infinity);
    if (nearest > toleranceMeters) return 'invalid-route-waypoints';
  }
  return null;
}

export function validateRouteAvoidances(geometry, blockedPoints, toleranceMeters = 100) {
  if (validateRouteGeometry(geometry) || !Array.isArray(blockedPoints) || !Number.isFinite(Number(toleranceMeters)) || Number(toleranceMeters) < 0) return 'invalid-route-avoidances';
  const distanceToSegment = (point, start, end) => {
    const latitude = (Number(start[1]) + Number(end[1]) + Number(point.lat)) / 3 * Math.PI / 180;
    const scaleX = 6371008.8 * Math.PI / 180 * Math.cos(latitude);
    const scaleY = 6371008.8 * Math.PI / 180;
    const px = Number(point.lon) * scaleX;
    const py = Number(point.lat) * scaleY;
    const ax = Number(start[0]) * scaleX;
    const ay = Number(start[1]) * scaleY;
    const bx = Number(end[0]) * scaleX;
    const by = Number(end[1]) * scaleY;
    const dx = bx - ax;
    const dy = by - ay;
    const denominator = dx * dx + dy * dy;
    const factor = denominator ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / denominator)) : 0;
    return Math.hypot(px - (ax + factor * dx), py - (ay + factor * dy));
  };
  for (const point of blockedPoints) {
    if (!Number.isFinite(Number(point?.lat)) || !Number.isFinite(Number(point?.lon))) return 'invalid-route-avoidances';
    const nearest = geometry.coordinates.reduce((best, coordinate, index) => index === 0 ? best : Math.min(best, distanceToSegment(point, geometry.coordinates[index - 1], coordinate)), Infinity);
    if (nearest <= toleranceMeters) return 'route-crosses-avoided-location';
  }
  return null;
}

export function improveOrder(order, matrix) {
  let best = order.slice();
  let changed = true;
  while (changed) {
    changed = false;
    for (let start = 1; start < best.length - 2; start += 1) {
      for (let end = start + 1; end < best.length - 1; end += 1) {
        const candidate = best.slice(0, start).concat(best.slice(start, end + 1).reverse(), best.slice(end + 1));
        if (routeCost(candidate, matrix) + 0.5 < routeCost(best, matrix)) {
          best = candidate;
          changed = true;
        }
      }
    }
  }
  return best;
}

export function applyLockedOrder(order, points, returned) {
  const result = Array(order.length).fill(null);
  result[0] = 0;
  points.forEach((point, index) => {
    if (point.locked && index > 0 && index < result.length - (returned ? 1 : 0)) result[index] = index;
  });
  const locked = new Set(points.map((point, index) => point.locked ? index : -1));
  const free = order.filter((index) => !locked.has(index) && index !== 0);
  let cursor = 1;
  free.forEach((index) => {
    while (cursor < result.length && result[cursor] !== null) cursor += 1;
    if (cursor < result.length - (returned ? 1 : 0)) result[cursor] = index;
  });
  if (returned) result[result.length - 1] = 0;
  return result.filter((index) => index !== null);
}

export function validateStops({ start, stops, packageCapacity = Infinity, maxWeight = 0, maxVolume = 0 }) {
  if (!start) return 'missing-start';
  if (!Array.isArray(stops) || !stops.length) return 'missing-stops';
  const validCoordinate = (point) => Number.isFinite(Number(point?.lat)) && Number.isFinite(Number(point?.lon)) && Number(point.lat) >= -90 && Number(point.lat) <= 90 && Number(point.lon) >= -180 && Number(point.lon) <= 180;
  if (!validCoordinate(start) || stops.some((stop) => !validCoordinate(stop))) return 'invalid-coordinate';
  if (start.needsReview || stops.some((stop) => stop.needsReview)) return 'unverified-address';
  if ((packageCapacity !== Infinity && (!Number.isFinite(Number(packageCapacity)) || Number(packageCapacity) < 0)) || !Number.isFinite(Number(maxWeight)) || Number(maxWeight) < 0 || !Number.isFinite(Number(maxVolume)) || Number(maxVolume) < 0) return 'invalid-capacity-limits';
  if (stops.some((stop) => !Number.isFinite(Number(stop.packageCount ?? 1)) || Number(stop.packageCount ?? 1) < 1 || !Number.isFinite(Number(stop.weightKg ?? 0)) || Number(stop.weightKg ?? 0) < 0 || !Number.isFinite(Number(stop.volumeM3 ?? 0)) || Number(stop.volumeM3 ?? 0) < 0)) return 'invalid-package-data';
  const seen = new Set([`${Number(start.lat).toFixed(5)},${Number(start.lon).toFixed(5)}`]);
  let packages = 0;
  let weight = 0;
  let volume = 0;
  const validTime = (value) => !value || (/^\d{2}:\d{2}$/.test(value) && Number(value.slice(0, 2)) < 24 && Number(value.slice(3, 5)) < 60);
  for (const stop of stops) {
    const key = `${Number(stop.lat).toFixed(5)},${Number(stop.lon).toFixed(5)}`;
    if (seen.has(key)) return 'duplicate-stop';
    seen.add(key);
    if (!validTime(stop.windowStart) || !validTime(stop.windowEnd) || (stop.windowStart && stop.windowEnd && stop.windowStart > stop.windowEnd)) return 'invalid-time-window';
    packages += Math.max(1, Number(stop.packageCount || 1));
    weight += Math.max(0, Number(stop.weightKg || 0));
    volume += Math.max(0, Number(stop.volumeM3 || 0));
  }
  if (Number(packageCapacity) > 0 && packages > packageCapacity) return 'package-capacity-exceeded';
  if (maxWeight > 0 && weight > maxWeight) return 'weight-capacity-exceeded';
  if (maxVolume > 0 && volume > maxVolume) return 'volume-capacity-exceeded';
  return null;
}

export function scoreRoute({ distanceMeters, durationSeconds, stopCount, waitSeconds = 0, risk = 0 }) {
  const score = 100 - (Number(distanceMeters || 0) / 1000) * 0.22 - (Number(durationSeconds || 0) / 60) * 0.08 - stopCount * 0.05 - (Number(waitSeconds || 0) / 60) * 0.12 - Number(risk || 0) * 4;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function scheduleOrder(order, points, durationMatrix, { departure = '', trafficFactor = 1, locale = 'ro-RO' } = {}) {
  const start = departure ? (() => { const value = new Date(); const [hours, minutes] = departure.split(':').map(Number); value.setHours(hours, minutes, 0, 0); return value; })() : new Date();
  let elapsedSeconds = 0;
  let waitSeconds = 0;
  let lateStops = 0;
  const clockMinutes = (value) => { if (!value) return null; const [hours, minutes] = value.split(':').map(Number); return hours * 60 + minutes; };
  order.forEach((pointIndex, index) => {
    const point = points[pointIndex];
    if (index > 0) elapsedSeconds += Number(durationMatrix[order[index - 1]][pointIndex] || 0) * trafficFactor;
    const arrivalMinutes = (start.getHours() * 60 + start.getMinutes()) + elapsedSeconds / 60;
    const opening = clockMinutes(point.windowStart);
    const closing = clockMinutes(point.windowEnd);
    const wait = opening !== null ? Math.max(0, opening - arrivalMinutes) : 0;
    if (wait) { elapsedSeconds += wait * 60; waitSeconds += wait * 60; }
    const finalMinutes = arrivalMinutes + wait;
    const lateMinutes = closing !== null ? Math.max(0, finalMinutes - closing) : 0;
    if (lateMinutes) lateStops += 1;
    point.etaAt = start.getTime() + elapsedSeconds * 1000;
    point.etaLabel = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(new Date(point.etaAt));
    point.windowWaitMinutes = Math.round(wait);
    point.lateMinutes = Math.round(lateMinutes);
    if (index > 0) elapsedSeconds += Number(point.serviceTime || 0) * 60;
  });
  return { totalSeconds: Math.round(elapsedSeconds), waitSeconds: Math.round(waitSeconds), lateStops };
}

export function choosePriorityOrder(baseOrder, candidateOrder, points, durationMatrix, { departure = '', locale = 'ro-RO' } = {}) {
  const objective = (order) => {
    const scheduledPoints = points.map((point) => ({ ...point }));
    const schedule = scheduleOrder(order, scheduledPoints, durationMatrix, { departure, trafficFactor: 1, locale });
    const lateness = scheduledPoints.reduce((total, point) => total + Number(point.lateMinutes || 0) * (point.priority === 'urgent' ? 10000 : point.priority === 'high' ? 5000 : 1000), 0);
    return lateness + schedule.waitSeconds + routeCost(order, durationMatrix);
  };
  return objective(candidateOrder) <= objective(baseOrder) ? candidateOrder.slice() : baseOrder.slice();
}

