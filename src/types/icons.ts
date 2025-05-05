import { IconProps } from "@heroicons/react/24/outline";

export interface IconConfig {
  icon: React.ForwardRefExoticComponent<IconProps>;
  bgColor: string;
  textColor: string;
}

export interface SectionIcon extends IconConfig {
  title: string;
  description?: string;
}
