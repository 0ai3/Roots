import React from "react";
import Image from "next/image";

type Props = {
  src: string;
  alt?: string;
  className?: string;
  width?: number | string;
  height?: number | string;
};

export function ImageWithFallback({ src, alt = "", className }: Props) {
  const [currentSrc, setCurrentSrc] = React.useState(src);

  const handleError = () => {
    // Fallback to a default image or handle the error as needed
    setCurrentSrc("/path/to/default/image.jpg");
  };

  return (
    <Image
      src={currentSrc}
      alt={alt}
      fill
      className={className}
      onError={handleError}
    />
  );
}

export default ImageWithFallback;
