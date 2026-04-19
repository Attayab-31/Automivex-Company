const formatter = new Intl.DateTimeFormat("en", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export function formatDateLabel(value) {
  return formatter.format(new Date(value));
}
