import React from "react";

type Props = {
  src: string;
  alt?: string;
  className?: string;
  width?: number | string;
  height?: number | string;
};


export function ImageWithFallback({ src, alt = "", className }: Props) {
  return <img src={src} alt={alt} className={className} />;
}

export default ImageWithFallback;
