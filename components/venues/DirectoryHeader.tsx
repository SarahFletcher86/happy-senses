import { SiteHeader } from './SiteHeader';

interface DirectoryHeaderProps {
  venueCount: number;
}

export function DirectoryHeader({ venueCount }: DirectoryHeaderProps) {
  void venueCount;

  return <SiteHeader />;
}
