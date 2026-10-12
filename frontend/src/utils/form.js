/** Reads a submitted form into a plain object, turning empty optional fields into null. */
export function readForm(form, optionalFields = []) {
  const values = Object.fromEntries(new FormData(form))
  for (const name of optionalFields) values[name] ||= null
  return values
}
