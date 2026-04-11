/**
 * Keeps category order from the API but moves "Others" to the bottom of selects.
 */
export function withOthersLast(categories) {
  if (!Array.isArray(categories)) return [];
  const rest = [];
  const others = [];
  for (const c of categories) {
    const label = (c.name || c.categoryName || '').trim().toLowerCase();
    if (label === 'others') others.push(c);
    else rest.push(c);
  }
  return [...rest, ...others];
}
