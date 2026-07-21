export const emojisRE = /([\u2700-\u27BF\uE000-\uF8FF\u2011-\u26FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|\uD83E[\uDD10-\uDDFF])/g

export function groupBy<T>(items: T[], key: string, groups: Record<string, T[]> = {}) {
  for (const item of items) {
    const v = (item as any)[key] as string
    groups[v] = groups[v] || []
    groups[v].push(item)
  }
  return groups
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const htmlEscapes: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  '\'': '&#39;',
}

const htmlEscapeRE = /[&<>"']/g

/**
 * Escape HTML-sensitive characters in a single pass so the result never
 * contains raw `&`, `<`, `>`, `"` or `'`. Escaping in one pass (rather than
 * chaining separate `.replace()` calls) avoids accidentally re-escaping
 * entities produced by an earlier replacement (e.g. turning `<` into `&lt;`
 * and then mangling it into `&amp;lt;` when `&` is escaped afterwards).
 */
export function escapeHtml(str: string): string {
  return str.replace(htmlEscapeRE, char => htmlEscapes[char])
}

export function join(array?: string[], glue = ', ', finalGlue = ' and '): string {
  if (!array || array.length === 0)
    return ''

  if (array.length === 1)
    return array[0]

  if (array.length === 2)
    return array.join(finalGlue)

  return `${array.slice(0, -1).join(glue)}${finalGlue}${array.slice(-1)}`
}
