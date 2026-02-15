/**
 * Generates clean, minimalist SVG fallback branding (logo + banner)
 * with topic-aware color palettes. Designed to always look polished.
 */

interface FallbackBrandingResult {
  logo_url: string;
  banner_url: string;
}

interface Theme {
  primary: string;
  secondary: string;
  accent: string;
  bg: string;
}

const topicThemes: Record<string, Theme> = {
  programming: { primary: "#3B82F6", secondary: "#8B5CF6", accent: "#06B6D4", bg: "#0F172A" },
  coding: { primary: "#3B82F6", secondary: "#8B5CF6", accent: "#06B6D4", bg: "#0F172A" },
  javascript: { primary: "#F7DF1E", secondary: "#F97316", accent: "#FBBF24", bg: "#1A1A2E" },
  python: { primary: "#3776AB", secondary: "#FFD43B", accent: "#306998", bg: "#0D1117" },
  react: { primary: "#61DAFB", secondary: "#282C34", accent: "#20232A", bg: "#0A0E1A" },
  ai: { primary: "#8B5CF6", secondary: "#EC4899", accent: "#06B6D4", bg: "#0F0A1E" },
  machine: { primary: "#8B5CF6", secondary: "#EC4899", accent: "#3B82F6", bg: "#0F0A1E" },
  data: { primary: "#10B981", secondary: "#3B82F6", accent: "#8B5CF6", bg: "#0A1628" },
  web: { primary: "#F97316", secondary: "#EC4899", accent: "#8B5CF6", bg: "#1A0A1E" },
  mobile: { primary: "#06B6D4", secondary: "#8B5CF6", accent: "#EC4899", bg: "#0A1628" },
  cloud: { primary: "#0EA5E9", secondary: "#6366F1", accent: "#A855F7", bg: "#0A1628" },
  cyber: { primary: "#10B981", secondary: "#059669", accent: "#14B8A6", bg: "#0A1E1A" },
  security: { primary: "#10B981", secondary: "#059669", accent: "#14B8A6", bg: "#0A1E1A" },
  business: { primary: "#1E40AF", secondary: "#3B82F6", accent: "#60A5FA", bg: "#0A1628" },
  marketing: { primary: "#EC4899", secondary: "#F97316", accent: "#FBBF24", bg: "#1E0A1A" },
  finance: { primary: "#059669", secondary: "#10B981", accent: "#34D399", bg: "#0A1E14" },
  investing: { primary: "#059669", secondary: "#FBBF24", accent: "#10B981", bg: "#0A1E14" },
  entrepreneur: { primary: "#F97316", secondary: "#EF4444", accent: "#FBBF24", bg: "#1E0A0A" },
  leadership: { primary: "#7C3AED", secondary: "#4F46E5", accent: "#8B5CF6", bg: "#0F0A1E" },
  management: { primary: "#6366F1", secondary: "#8B5CF6", accent: "#A855F7", bg: "#0F0A1E" },
  design: { primary: "#EC4899", secondary: "#8B5CF6", accent: "#F472B6", bg: "#1E0A1A" },
  art: { primary: "#F43F5E", secondary: "#EC4899", accent: "#FB7185", bg: "#1E0A14" },
  photography: { primary: "#F97316", secondary: "#FBBF24", accent: "#EF4444", bg: "#0F172A" },
  music: { primary: "#7C3AED", secondary: "#EC4899", accent: "#F472B6", bg: "#0F0A1E" },
  video: { primary: "#EF4444", secondary: "#F97316", accent: "#FBBF24", bg: "#1E0A0A" },
  writing: { primary: "#94A3B8", secondary: "#64748B", accent: "#CBD5E1", bg: "#0F172A" },
  creative: { primary: "#EC4899", secondary: "#F97316", accent: "#FBBF24", bg: "#1E0A1A" },
  health: { primary: "#10B981", secondary: "#06B6D4", accent: "#34D399", bg: "#0A1E1A" },
  fitness: { primary: "#EF4444", secondary: "#F97316", accent: "#FBBF24", bg: "#1E0A0A" },
  yoga: { primary: "#A855F7", secondary: "#EC4899", accent: "#F472B6", bg: "#1A0A2E" },
  meditation: { primary: "#6366F1", secondary: "#8B5CF6", accent: "#A855F7", bg: "#0F0A1E" },
  nutrition: { primary: "#22C55E", secondary: "#84CC16", accent: "#A3E635", bg: "#0A1E0A" },
  wellness: { primary: "#14B8A6", secondary: "#06B6D4", accent: "#22D3EE", bg: "#0A1E1A" },
  language: { primary: "#3B82F6", secondary: "#06B6D4", accent: "#0EA5E9", bg: "#0A1628" },
  math: { primary: "#6366F1", secondary: "#4F46E5", accent: "#818CF8", bg: "#0F0A1E" },
  science: { primary: "#0EA5E9", secondary: "#06B6D4", accent: "#22D3EE", bg: "#0A1628" },
  history: { primary: "#D97706", secondary: "#B45309", accent: "#FBBF24", bg: "#1E1A0A" },
  philosophy: { primary: "#94A3B8", secondary: "#64748B", accent: "#CBD5E1", bg: "#0F172A" },
  psychology: { primary: "#8B5CF6", secondary: "#A855F7", accent: "#C084FC", bg: "#0F0A1E" },
  personal: { primary: "#F59E0B", secondary: "#F97316", accent: "#FBBF24", bg: "#1E1A0A" },
  productivity: { primary: "#0EA5E9", secondary: "#3B82F6", accent: "#60A5FA", bg: "#0A1628" },
  cooking: { primary: "#F97316", secondary: "#EF4444", accent: "#FBBF24", bg: "#1E0A0A" },
  travel: { primary: "#06B6D4", secondary: "#0EA5E9", accent: "#22D3EE", bg: "#0A1628" },
  fashion: { primary: "#EC4899", secondary: "#F472B6", accent: "#FB7185", bg: "#1E0A1A" },
  lifestyle: { primary: "#F472B6", secondary: "#EC4899", accent: "#F9A8D4", bg: "#1E0A1A" },
};

const defaultTheme: Theme = { primary: "#6366F1", secondary: "#8B5CF6", accent: "#EC4899", bg: "#0F0A1E" };

function getThemeForTopic(title: string, description: string = ""): Theme {
  const text = `${title} ${description}`.toLowerCase();
  for (const [keyword, theme] of Object.entries(topicThemes)) {
    if (text.includes(keyword)) return theme;
  }
  return defaultTheme;
}

function getInitials(title: string): string {
  const words = title.trim().split(/\s+/).filter(w => w.length > 2);
  if (words.length === 0) return title.substring(0, 2).toUpperCase() || "C";
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function generateLogoSVG(title: string, theme: Theme): string {
  const initials = getInitials(title);
  const h = hashStr(title);
  const cx = 256, cy = 256;
  const rotation = (h % 360);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.primary}"/>
      <stop offset="100%" stop-color="${theme.secondary}"/>
    </linearGradient>
    <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.secondary}" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="${theme.accent}" stop-opacity="0.1"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="40%">
      <stop offset="0%" stop-color="${theme.primary}" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="${theme.bg}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Background -->
  <rect width="512" height="512" rx="128" fill="${theme.bg}"/>
  <rect width="512" height="512" rx="128" fill="url(#glow)"/>

  <!-- Single accent shape -->
  <circle cx="${cx}" cy="${cy}" r="180" fill="none" stroke="url(#grad)" stroke-width="1.5" opacity="0.15"/>
  <circle cx="${cx}" cy="${cy}" r="140" fill="url(#grad)" opacity="0.12"/>

  <!-- Subtle rotated square -->
  <rect x="${cx - 80}" y="${cy - 80}" width="160" height="160" rx="20" fill="none" stroke="${theme.accent}" stroke-width="0.8" opacity="0.08" transform="rotate(${rotation % 45} ${cx} ${cy})"/>

  <!-- Initials -->
  <text x="${cx}" y="${cy + 20}" font-family="'SF Pro Display','Inter',system-ui,sans-serif" font-size="96" font-weight="800" fill="white" text-anchor="middle" letter-spacing="4" opacity="0.95">${initials}</text>

  <!-- Bottom gradient bar -->
  <rect x="${cx - 40}" y="${cy + 60}" width="80" height="4" rx="2" fill="url(#grad)" opacity="0.6"/>
</svg>`;

  try {
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
  } catch {
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }
}

function generateBannerSVG(title: string, theme: Theme): string {
  const h = hashStr(title);
  const displayTitle = title.length > 40 ? title.substring(0, 38) + '…' : title;
  const titleSize = title.length > 30 ? 56 : title.length > 20 ? 68 : 80;

  // Generate soft organic blob path
  const blobPoints = Array.from({ length: 8 }, (_, i) => {
    const angle = (Math.PI * 2 * i) / 8;
    const radius = 280 + ((h * (i + 1)) % 120);
    return `${960 + radius * Math.cos(angle)},${540 + radius * Math.sin(angle)}`;
  });

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.bg}"/>
      <stop offset="100%" stop-color="${theme.bg}"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${theme.primary}"/>
      <stop offset="50%" stop-color="${theme.secondary}"/>
      <stop offset="100%" stop-color="${theme.accent}"/>
    </linearGradient>
    <radialGradient id="orb1" cx="25%" cy="40%">
      <stop offset="0%" stop-color="${theme.primary}" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="${theme.primary}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="orb2" cx="75%" cy="60%">
      <stop offset="0%" stop-color="${theme.accent}" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="${theme.accent}" stop-opacity="0"/>
    </radialGradient>
    <filter id="blur"><feGaussianBlur stdDeviation="100"/></filter>
    <filter id="textGlow"><feGaussianBlur stdDeviation="12" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>

  <!-- Base -->
  <rect width="1920" height="1080" fill="url(#bg)"/>

  <!-- Soft gradient orbs -->
  <circle cx="400" cy="350" r="500" fill="url(#orb1)" filter="url(#blur)"/>
  <circle cx="1500" cy="700" r="500" fill="url(#orb2)" filter="url(#blur)"/>

  <!-- Subtle grid dots -->
  <g fill="${theme.primary}" opacity="0.04">
    ${Array.from({ length: 8 }, (_, r) =>
      Array.from({ length: 16 }, (_, c) =>
        `<circle cx="${120 + c * 110}" cy="${100 + r * 120}" r="1.5"/>`
      ).join('')
    ).join('')}
  </g>

  <!-- Minimal geometric accents -->
  <circle cx="960" cy="540" r="320" fill="none" stroke="${theme.primary}" stroke-width="0.8" opacity="0.06"/>
  <circle cx="960" cy="540" r="280" fill="none" stroke="${theme.secondary}" stroke-width="0.5" opacity="0.04"/>

  <!-- Title -->
  <text x="960" y="520" font-family="'SF Pro Display','Inter',system-ui,sans-serif" font-size="${titleSize}" font-weight="800" fill="white" text-anchor="middle" letter-spacing="-1" filter="url(#textGlow)" opacity="0.95">${displayTitle}</text>

  <!-- Accent bar under title -->
  <rect x="880" y="555" width="160" height="4" rx="2" fill="url(#accent)" opacity="0.6"/>

  <!-- Top and bottom edge fades -->
  <rect width="1920" height="120" fill="${theme.bg}" opacity="0.3"/>
  <rect y="960" width="1920" height="120" fill="${theme.bg}" opacity="0.5"/>
</svg>`;

  try {
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
  } catch {
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }
}

export function generateFallbackBranding(
  courseTitle: string,
  courseDescription: string = ""
): FallbackBrandingResult {
  const theme = getThemeForTopic(courseTitle, courseDescription);
  return {
    logo_url: generateLogoSVG(courseTitle, theme),
    banner_url: generateBannerSVG(courseTitle, theme),
  };
}
