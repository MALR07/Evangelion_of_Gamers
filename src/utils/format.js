export function formatListDate(value) {
  if (!value) return 'Fecha desconocida';
  return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
}
