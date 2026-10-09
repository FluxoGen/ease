import type { LibraryPoint } from '.';

/** Short badge text; the two VA zones have long names. */
export const badgeText = (p: LibraryPoint) => (p.code.length > 7 ? p.code.split(' ')[0].toUpperCase().slice(0, 4) : p.code);
