import type { Category, Module } from "../types";

/** Find a category node anywhere below a root category, excluding the root. */
export function findDescendantCategory(
  root: Category,
  categoryId: string,
): Category | undefined {
  for (const child of root.subCategories || []) {
    if (child.id === categoryId) return child;
    const descendant = findDescendantCategory(child, categoryId);
    if (descendant) return descendant;
  }
  return undefined;
}

/**
 * Resolve the effective color for a category node, inheriting the nearest
 * ancestor color when the node does not define one itself.
 */
export function getCategoryNodeColor(
  root: Category,
  categoryId: string = root.id,
): string {
  const visit = (node: Category, inheritedColor: string): string | undefined => {
    const color = node.color || inheritedColor;
    if (node.id === categoryId) return color;

    for (const child of node.subCategories || []) {
      const result = visit(child, color);
      if (result !== undefined) return result;
    }

    return undefined;
  };

  return visit(root, root.color) ?? root.color;
}

/** Return every category node below a root, including the root itself. */
export function flattenCategoryTree(root: Category): Category[] {
  return [
    root,
    ...(root.subCategories || []).flatMap((child) =>
      flattenCategoryTree(child),
    ),
  ];
}

export function categoryHasDescendant(
  root: Category,
  categoryId: string,
): boolean {
  return !!findDescendantCategory(root, categoryId);
}

export function findCategoryRoot(
  categories: Category[],
  categoryId: string,
): Category | undefined {
  return categories.find(
    (category) =>
      category.id === categoryId || categoryHasDescendant(category, categoryId),
  );
}

/** Find a category node anywhere in a set of top-level categories. */
export function findCategory(
  categories: Category[],
  categoryId: string,
): Category | undefined {
  const root = findCategoryRoot(categories, categoryId);
  if (!root) return undefined;
  return root.id === categoryId ? root : findDescendantCategory(root, categoryId);
}

/** Return whether a module is assigned anywhere in a category node's subtree. */
export function moduleBelongsToCategoryNode(
  module: Module,
  root: Category,
  node: Category = root,
): boolean {
  if (module.categoryId !== root.id) return false;
  // The root scope represents the complete top-level category, including
  // direct modules and legacy/unassigned module references.
  if (node.id === root.id) return true;
  if (!module.subCategoryId) return node.id === root.id;
  return (
    module.subCategoryId === node.id ||
    !!findDescendantCategory(node, module.subCategoryId)
  );
}

/** @deprecated Use findCategoryRoot instead. */
export const getCategoryRoot = findCategoryRoot;
