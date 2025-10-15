import { useTheme } from "next-themes";
import logoDark from "@/assets/logo-full.png";
import logoLight from "@/assets/logo-light.png";

interface LogoProps {
  className?: string;
  alt?: string;
}

export function Logo({ className = "h-16 md:h-20 object-contain", alt = "Coursia" }: LogoProps) {
  const { theme } = useTheme();
  
  return (
    <img 
      src={theme === "light" ? logoLight : logoDark} 
      alt={alt} 
      className={className}
    />
  );
}
