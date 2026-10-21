import { ImageOff } from "lucide-react";

/** Product photo with a neutral placeholder when the listing has no image. */
export default function ProductImage({
  src,
  alt,
  className = "",
}: {
  src?: string;
  alt: string;
  className?: string;
}) {
  if (!src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex items-center justify-center bg-gray-100 text-gray-300 ${className}`}
      >
        <ImageOff className="w-1/4 h-1/4 max-w-10 max-h-10" />
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={`object-cover ${className}`} />;
}
