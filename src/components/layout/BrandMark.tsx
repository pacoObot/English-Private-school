import { AppLogo } from "./AppLogo";

type BrandMarkProps = {
  context?: string;
  dark?: boolean;
};

export function BrandMark({ context = "Language Academy", dark = false }: BrandMarkProps) {
  return <AppLogo context={context} dark={dark} />;
}
