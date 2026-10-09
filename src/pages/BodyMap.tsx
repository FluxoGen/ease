import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import PointPicture from '../components/PointPicture';
import { library } from '../data/library';
import { AREAS } from '../data/library/areas';

/** One representative point per area, used as the card picture. */
const COVER: Record<string, string> = {
  head: 'gb20', 'chest-belly': 'cv12', back: 'bl23', arm: 'pc6', hand: 'li4', leg: 'st36', foot: 'lr3',
};

export default function BodyMap() {
  return (
    <div>
      <Link
        to="/"
        className="mb-3 flex items-center gap-1 text-sm text-muted hover:text-charcoal dark:text-muted-dark dark:hover:text-ivory"
      >
        <ChevronLeft size={16} />
        All symptoms
      </Link>
      <h1 className="text-2xl font-bold sm:text-3xl">Browse by body area</h1>
      <p className="mt-1 text-muted dark:text-muted-dark">Pick an area to see every point in it.</p>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {AREAS.map((a) => {
          const count = library.filter((p) => p.area === a.id).length;
          const cover = library.find((p) => p.id === COVER[a.id]);
          return (
            <Link
              key={a.id}
              to={`/points?area=${a.id}`}
              className="flex flex-col overflow-hidden rounded-2xl border border-charcoal/10 bg-sand shadow-sm dark:border-ivory/10 dark:bg-charcoal-soft"
            >
              <div className="aspect-square bg-[#fbf8f2]">
                {cover && <PointPicture point={cover} drawing compact className="h-full w-full" />}
              </div>
              <div className="px-3 py-2.5">
                <p className="font-bold text-charcoal dark:text-ivory">{a.label}</p>
                <p className="text-xs text-muted dark:text-muted-dark">{count} points</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
