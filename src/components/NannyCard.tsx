import Link from "next/link";
import { MaterialIcon } from "./MaterialIcon";

interface NannyCardProps {
  name: string;
  location: string;
  rating: number;
  image: string;
  tags: string[];
}

export default function NannyCard({ name, location, rating, image, tags }: NannyCardProps) {
  return (
    <div className="min-w-[320px] bg-surface-container-lowest rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow border border-outline-variant/10">
      <div className="h-64 relative">
        <img alt={`${name} profile`} className="w-full h-full object-cover" src={image} />
        <div className="absolute top-4 right-4 bg-tertiary-fixed text-on-tertiary-fixed px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
          <MaterialIcon name="verified" className="text-sm" fill />
          VERIFIED
        </div>
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h4 className="font-headline text-xl font-bold text-primary">{name}</h4>
            <div className="flex items-center text-on-surface-variant text-sm gap-1 mt-1">
              <MaterialIcon name="location_on" className="text-sm" />
              {location}
            </div>
          </div>
          <div className="flex items-center gap-1 bg-surface-container px-2 py-1 rounded-lg">
            <MaterialIcon name="star" className="text-secondary text-sm" fill />
            <span className="font-bold text-sm">{rating.toFixed(1)}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          {tags.map((tag) => (
            <span key={tag} className="px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed rounded-full text-[10px] font-bold uppercase tracking-wider">
              {tag}
            </span>
          ))}
        </div>
        <Link href="/profile" className="block w-full text-center py-3 rounded-xl border border-primary text-primary font-bold hover:bg-primary hover:text-white transition-all">
          View Profile
        </Link>
      </div>
    </div>
  );
}
