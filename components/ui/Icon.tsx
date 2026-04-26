import { LucideProps } from 'lucide-react';
import { iconMap } from './icons';
import type { IconName } from './icons';

interface IconProps extends Omit<LucideProps, 'ref'> {
  name: IconName;
}

/**
 * Unified icon component using Lucide Icons.
 * Usage: <Icon name="book" size={20} className="text-primary-600" />
 */
export default function Icon({ name, size = 20, strokeWidth = 1.5, className = '', ...props }: IconProps) {
  const LucideIcon = iconMap[name];
  if (!LucideIcon) {
    console.warn(`[Icon] Unknown icon: "${name}"`);
    return null;
  }

  return <LucideIcon size={size} strokeWidth={strokeWidth} className={className} {...props} />;
}
