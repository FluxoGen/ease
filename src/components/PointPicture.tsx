import AtlasDiagram from './atlas/AtlasDiagram';
import { pointXY, type LibraryPoint } from '../data/library';
import { photoFor } from '../data/library/photos';


interface PointPictureProps {
  point: LibraryPoint;
  className?: string;
  /** Thumbnail mode. */
  compact?: boolean;
  /** Prefer the drawing even when a handout photo exists. */
  drawing?: boolean;
}

/** VA handout photo when there is one, otherwise the atlas drawing with the point marked. */
export default function PointPicture({ point, className, compact, drawing }: PointPictureProps) {
  const photo = drawing ? undefined : photoFor(point);
  if (photo) {
    return <img src={photo} alt={`Where ${point.code} is`} className={`object-contain ${className ?? ''}`} />;
  }
  const xy = pointXY(point);
  if (!xy) return null;
  return <AtlasDiagram view={point.view} marks={point.marks ?? [xy]} compact={compact} className={className} tone={point.selfCare === 'avoid' ? 'stop' : 'press'} />;
}
