const LIVE_BUFFER_MS = 30 * 60 * 1000;

export const getSeminarStatus = (seminar, now = Date.now()) => {
  const startAtRaw = seminar?.schedule?.startAt;
  const endAtRaw = seminar?.schedule?.endAt;

  const startAt = startAtRaw ? new Date(startAtRaw).getTime() : NaN;
  const endAt = endAtRaw ? new Date(endAtRaw).getTime() : NaN;

  if (Number.isNaN(startAt) || Number.isNaN(endAt) || endAt <= startAt) {
    return "Past";
  }

  if (now < startAt - LIVE_BUFFER_MS) return "Future";
  if (now > endAt + LIVE_BUFFER_MS) return "Past";
  return "Live Now";
};

export const getSeminarLocalScheduleLabel = (seminar) => {
  const startAtRaw = seminar?.schedule?.startAt;
  const endAtRaw = seminar?.schedule?.endAt;
  if (!startAtRaw || !endAtRaw) return seminar?.schedule?.date || "TBD";

  const startAt = new Date(startAtRaw);
  const endAt = new Date(endAtRaw);

  if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
    return seminar?.schedule?.date || "TBD";
  }

  const date = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(startAt);

  const start = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit"
  }).format(startAt);

  const end = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit"
  }).format(endAt);

  return `${date}, ${start} - ${end}`;
};
