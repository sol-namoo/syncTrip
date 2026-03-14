export function moveItem<T>(items: T[], fromIndex: number, toIndex: number) {
  const cloned = [...items];
  const [moved] = cloned.splice(fromIndex, 1);

  if (!moved) {
    return items;
  }

  cloned.splice(toIndex, 0, moved);
  return cloned;
}
