import type { LibraryPoint } from '.';

const PHOTOS = import.meta.glob<string>('../../assets/points/*.jpg', { eager: true, import: 'default' });

/** VA handout photo for a point, if it has one. */
export const photoFor = (p: Pick<LibraryPoint, 'image'>) =>
  p.image ? PHOTOS[`../../assets/points/${p.image}.jpg`] : undefined;
