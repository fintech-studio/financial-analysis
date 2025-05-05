import { SVGProps } from "react";

export type IconProps = SVGProps<SVGSVGElement>;

export interface IconConfig {
  icon: React.ForwardRefExoticComponent<IconProps>;
  bgColor: string;
  textColor: string;
}

export interface SectionIcon extends IconConfig {
  title: string;
  description?: string;
}
