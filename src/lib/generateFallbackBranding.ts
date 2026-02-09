/**
 * Generates premium SVG-based fallback branding (logo + banner)
 * when AI generation is unavailable. Features rich gradients,
 * geometric patterns, and topic-aware theming.
 */

interface FallbackBrandingResult {
  logo_url: string;
  banner_url: string;
}

const topicColorThemes: Record<string, { primary: string; secondary: string; accent: string; bg: string }> = {
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

const defaultTheme = { primary: "#6366F1", secondary: "#8B5CF6", accent: "#EC4899", bg: "#0F0A1E" };

type Theme = { primary: string; secondary: string; accent: string; bg: string };

function getThemeForTopic(title: string, description: string = ""): Theme {
  const text = `${title} ${description}`.toLowerCase();
  for (const [keyword, theme] of Object.entries(topicColorThemes)) {
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

/** Simple hash for deterministic variation */
function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function generateLogoSVG(title: string, theme: Theme): string {
  const initials = getInitials(title);
  const h = hashStr(title);
  const rotation = (h % 60) + 15; // 15-75 deg
  const starPoints = 6 + (h % 4); // 6-9 points

  // Generate star/seal polygon points
  const cx = 256, cy = 256;
  const outerR = 200, innerR = 170;
  const pts: string[] = [];
  for (let i = 0; i < starPoints * 2; i++) {
    const angle = (Math.PI * i) / starPoints - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="lg1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.primary}"/>
      <stop offset="100%" stop-color="${theme.secondary}"/>
    </linearGradient>
    <linearGradient id="lg2" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${theme.accent}" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="${theme.primary}" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="rg1" cx="40%" cy="35%">
      <stop offset="0%" stop-color="white" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="white" stop-opacity="0"/>
    </radialGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="dshadow">
      <feDropShadow dx="0" dy="6" stdDeviation="16" flood-color="${theme.bg}" flood-opacity="0.7"/>
    </filter>
  </defs>

  <!-- Dark background -->
  <rect width="512" height="512" rx="80" fill="${theme.bg}"/>
  
  <!-- Subtle grid -->
  <g stroke="${theme.primary}" stroke-width="0.5" opacity="0.08">
    ${Array.from({length:9}, (_,i) => `<line x1="${(i+1)*51}" y1="0" x2="${(i+1)*51}" y2="512"/>`).join('')}
    ${Array.from({length:9}, (_,i) => `<line x1="0" y1="${(i+1)*51}" x2="512" y2="${(i+1)*51}"/>`).join('')}
  </g>

  <!-- Decorative rotated square -->
  <rect x="156" y="156" width="200" height="200" rx="20" fill="none" stroke="url(#lg1)" stroke-width="1.5" opacity="0.2" transform="rotate(${rotation} 256 256)"/>

  <!-- Seal polygon -->
  <polygon points="${pts.join(' ')}" fill="url(#lg1)" filter="url(#dshadow)" opacity="0.15"/>

  <!-- Main circle -->
  <circle cx="256" cy="256" r="160" fill="url(#lg1)" filter="url(#dshadow)"/>
  <circle cx="256" cy="256" r="160" fill="url(#rg1)"/>

  <!-- Inner ring -->
  <circle cx="256" cy="256" r="130" fill="none" stroke="white" stroke-width="1" opacity="0.15"/>
  <circle cx="256" cy="256" r="145" fill="none" stroke="url(#lg2)" stroke-width="2" opacity="0.4"/>

  <!-- Accent dot cluster -->
  <circle cx="340" cy="140" r="6" fill="${theme.accent}" opacity="0.6" filter="url(#glow)"/>
  <circle cx="365" cy="160" r="3" fill="${theme.accent}" opacity="0.4"/>
  <circle cx="355" cy="130" r="4" fill="${theme.primary}" opacity="0.5"/>

  <!-- Initials -->
  <text x="256" y="275" font-family="'SF Pro Display',system-ui,-apple-system,sans-serif" font-size="120" font-weight="800" fill="white" text-anchor="middle" letter-spacing="-4">${initials}</text>

  <!-- Bottom label -->
  <text x="256" y="420" font-family="'SF Pro Display',system-ui,-apple-system,sans-serif" font-size="18" font-weight="600" fill="${theme.accent}" text-anchor="middle" letter-spacing="6" opacity="0.7">COURSE</text>
</svg>`;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

function generateBannerSVG(title: string, theme: Theme): string {
  const h = hashStr(title);
  const angle1 = 20 + (h % 30);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.bg}"/>
      <stop offset="50%" stop-color="${theme.bg}"/>
      <stop offset="100%" stop-color="${theme.primary}" stop-opacity="0.3"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.primary}"/>
      <stop offset="50%" stop-color="${theme.secondary}"/>
      <stop offset="100%" stop-color="${theme.accent}"/>
    </linearGradient>
    <radialGradient id="orb1" cx="25%" cy="40%">
      <stop offset="0%" stop-color="${theme.primary}" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="${theme.primary}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="orb2" cx="75%" cy="60%">
      <stop offset="0%" stop-color="${theme.accent}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="${theme.accent}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="orb3" cx="50%" cy="30%">
      <stop offset="0%" stop-color="${theme.secondary}" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="${theme.secondary}" stop-opacity="0"/>
    </radialGradient>
    <filter id="blur1"><feGaussianBlur stdDeviation="80"/></filter>
    <filter id="blur2"><feGaussianBlur stdDeviation="50"/></filter>
    <filter id="blur3"><feGaussianBlur stdDeviation="120"/></filter>
    <linearGradient id="fade" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="${theme.bg}" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="${theme.bg}" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <!-- Base -->
  <rect width="1920" height="1080" fill="url(#bg)"/>

  <!-- Large orbs -->
  <circle cx="400" cy="300" r="500" fill="url(#orb1)" filter="url(#blur3)"/>
  <circle cx="1500" cy="700" r="600" fill="url(#orb2)" filter="url(#blur3)"/>
  <circle cx="960" cy="200" r="400" fill="url(#orb3)" filter="url(#blur1)"/>

  <!-- Diagonal accent line -->
  <line x1="0" y1="1080" x2="1920" y2="0" stroke="url(#accent)" stroke-width="2" opacity="0.1"/>
  <line x1="0" y1="900" x2="1920" y2="-180" stroke="url(#accent)" stroke-width="1" opacity="0.06"/>

  <!-- Geometric shapes -->
  <rect x="100" y="100" width="300" height="300" rx="40" fill="none" stroke="${theme.primary}" stroke-width="1" opacity="0.08" transform="rotate(${angle1} 250 250)"/>
  <rect x="1500" y="600" width="250" height="250" rx="30" fill="none" stroke="${theme.accent}" stroke-width="1" opacity="0.08" transform="rotate(-${angle1} 1625 725)"/>
  <circle cx="1700" cy="200" r="120" fill="none" stroke="${theme.secondary}" stroke-width="1" opacity="0.06"/>
  <circle cx="200" cy="800" r="80" fill="none" stroke="${theme.accent}" stroke-width="1" opacity="0.06"/>

  <!-- Dot grid -->
  <g fill="${theme.primary}" opacity="0.06">
    ${Array.from({length: 15}, (_, r) =>
      Array.from({length: 25}, (_, c) =>
        `<circle cx="${80 + c * 75}" cy="${80 + r * 75}" r="1.5"/>`
      ).join('')
    ).join('')}
  </g>

  <!-- Accent glow blobs -->
  <ellipse cx="960" cy="540" rx="600" ry="300" fill="${theme.primary}" opacity="0.04" filter="url(#blur1)"/>
  <circle cx="300" cy="540" r="200" fill="${theme.accent}" opacity="0.08" filter="url(#blur2)"/>
  <circle cx="1600" cy="400" r="180" fill="${theme.secondary}" opacity="0.08" filter="url(#blur2)"/>

  <!-- Horizontal accent stripe -->
  <rect x="0" y="520" width="1920" height="2" fill="url(#accent)" opacity="0.06"/>

  <!-- Bottom fade -->
  <rect width="1920" height="1080" fill="url(#fade)"/>
</svg>`;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
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
