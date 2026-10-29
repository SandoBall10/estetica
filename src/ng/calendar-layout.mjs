export const minutes = (time) =>
  Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));
// Interval partitioning: overlapping appointments share a column group.
export function layoutAppointments(items) {
  const sorted = [...items].sort((a, b) => minutes(a.hora) - minutes(b.hora));
  const result = [];
  let group = [];
  let groupEnd = -1;
  const flush = () => {
    const lanes = [];
    const positioned = group.map((item) => {
      const start = minutes(item.hora),
        end = start + item.duracion;
      let lane = lanes.findIndex((value) => value <= start);
      if (lane < 0) lane = lanes.length;
      lanes[lane] = end;
      return { item, start, end, lane };
    });
    result.push(...positioned.map((p) => ({ ...p, lanes: lanes.length })));
    group = [];
  };
  for (const item of sorted) {
    const start = minutes(item.hora);
    if (group.length && start >= groupEnd) flush();
    if (!group.length) groupEnd = -1;
    group.push(item);
    groupEnd = Math.max(groupEnd, start + item.duracion);
  }
  flush();
  return result;
}
