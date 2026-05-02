import Image from 'next/image';

interface HappySensesLogoProps {
  size?: number;
  className?: string;
}

export function HappySensesLogo({ size = 48, className }: HappySensesLogoProps) {
  return (
    <Image
      src="/heart.png"
      alt="Happy Senses"
      width={size}
      height={size}
      priority
      className={className}
    />
  );
}
