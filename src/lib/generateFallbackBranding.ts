/**
 * Generates beautiful SVG-based fallback branding (logo + banner)
 * when AI generation is unavailable. Colors are derived from the course topic.
 */

interface FallbackBrandingResult {
  logo_url: string;
  banner_url: string;
}

// Topic-to-color mapping for intelligent theming
const topicColorThemes: Record<string, { primary: string; secondary: string; accent: string }> = {
  // Technology & Programming
  programming: { primary: "#3B82F6", secondary: "#8B5CF6", accent: "#06B6D4" },
  coding: { primary: "#3B82F6", secondary: "#8B5CF6", accent: "#06B6D4" },
  javascript: { primary: "#F7DF1E", secondary: "#F97316", accent: "#FBBF24" },
  python: { primary: "#3776AB", secondary: "#FFD43B", accent: "#306998" },
  react: { primary: "#61DAFB", secondary: "#282C34", accent: "#20232A" },
  ai: { primary: "#8B5CF6", secondary: "#EC4899", accent: "#06B6D4" },
  machine: { primary: "#8B5CF6", secondary: "#EC4899", accent: "#3B82F6" },
  data: { primary: "#10B981", secondary: "#3B82F6", accent: "#8B5CF6" },
  web: { primary: "#F97316", secondary: "#EC4899", accent: "#8B5CF6" },
  mobile: { primary: "#06B6D4", secondary: "#8B5CF6", accent: "#EC4899" },
  cloud: { primary: "#0EA5E9", secondary: "#6366F1", accent: "#A855F7" },
  cyber: { primary: "#10B981", secondary: "#059669", accent: "#14B8A6" },
  security: { primary: "#10B981", secondary: "#059669", accent: "#14B8A6" },
  
  // Business & Finance
  business: { primary: "#1E40AF", secondary: "#3B82F6", accent: "#60A5FA" },
  marketing: { primary: "#EC4899", secondary: "#F97316", accent: "#FBBF24" },
  finance: { primary: "#059669", secondary: "#10B981", accent: "#34D399" },
  investing: { primary: "#059669", secondary: "#FBBF24", accent: "#10B981" },
  entrepreneur: { primary: "#F97316", secondary: "#EF4444", accent: "#FBBF24" },
  leadership: { primary: "#7C3AED", secondary: "#4F46E5", accent: "#8B5CF6" },
  management: { primary: "#6366F1", secondary: "#8B5CF6", accent: "#A855F7" },
  
  // Creative & Design
  design: { primary: "#EC4899", secondary: "#8B5CF6", accent: "#F472B6" },
  art: { primary: "#F43F5E", secondary: "#EC4899", accent: "#FB7185" },
  photography: { primary: "#0F172A", secondary: "#334155", accent: "#F97316" },
  music: { primary: "#7C3AED", secondary: "#EC4899", accent: "#F472B6" },
  video: { primary: "#EF4444", secondary: "#F97316", accent: "#FBBF24" },
  writing: { primary: "#6B7280", secondary: "#374151", accent: "#9CA3AF" },
  creative: { primary: "#EC4899", secondary: "#F97316", accent: "#FBBF24" },
  
  // Health & Wellness
  health: { primary: "#10B981", secondary: "#06B6D4", accent: "#34D399" },
  fitness: { primary: "#EF4444", secondary: "#F97316", accent: "#FBBF24" },
  yoga: { primary: "#A855F7", secondary: "#EC4899", accent: "#F472B6" },
  meditation: { primary: "#6366F1", secondary: "#8B5CF6", accent: "#A855F7" },
  nutrition: { primary: "#22C55E", secondary: "#84CC16", accent: "#A3E635" },
  wellness: { primary: "#14B8A6", secondary: "#06B6D4", accent: "#22D3EE" },
  
  // Education & Personal Development
  language: { primary: "#3B82F6", secondary: "#06B6D4", accent: "#0EA5E9" },
  math: { primary: "#6366F1", secondary: "#4F46E5", accent: "#818CF8" },
  science: { primary: "#0EA5E9", secondary: "#06B6D4", accent: "#22D3EE" },
  history: { primary: "#92400E", secondary: "#B45309", accent: "#D97706" },
  philosophy: { primary: "#4B5563", secondary: "#6B7280", accent: "#9CA3AF" },
  psychology: { primary: "#8B5CF6", secondary: "#A855F7", accent: "#C084FC" },
  personal: { primary: "#F59E0B", secondary: "#F97316", accent: "#FBBF24" },
  productivity: { primary: "#0EA5E9", secondary: "#3B82F6", accent: "#60A5FA" },
  
  // Lifestyle
  cooking: { primary: "#F97316", secondary: "#EF4444", accent: "#FBBF24" },
  travel: { primary: "#06B6D4", secondary: "#0EA5E9", accent: "#22D3EE" },
  fashion: { primary: "#EC4899", secondary: "#F472B6", accent: "#FB7185" },
  lifestyle: { primary: "#F472B6", secondary: "#EC4899", accent: "#F9A8D4" },
};

// Default elegant gradient for unknown topics
const defaultTheme = { primary: "#6366F1", secondary: "#8B5CF6", accent: "#EC4899" };

function getThemeForTopic(title: string, description: string = ""): { primary: string; secondary: string; accent: string } {
  const text = `${title} ${description}`.toLowerCase();
  
  for (const [keyword, theme] of Object.entries(topicColorThemes)) {
    if (text.includes(keyword)) {
      return theme;
    }
  }
  
  return defaultTheme;
}

function getInitials(title: string): string {
  const words = title.trim().split(/\s+/).filter(w => w.length > 0);
  if (words.length === 0) return "C";
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function generateLogoSVG(title: string, theme: { primary: string; secondary: string; accent: string }): string {
  const initials = getInitials(title);
  
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${theme.primary};stop-opacity:1" />
          <stop offset="50%" style="stop-color:${theme.secondary};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${theme.accent};stop-opacity:1" />
        </linearGradient>
        <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:white;stop-opacity:0.3" />
          <stop offset="100%" style="stop-color:white;stop-opacity:0" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="20" flood-color="${theme.primary}" flood-opacity="0.4"/>
        </filter>
      </defs>
      
      <!-- Background circle with gradient -->
      <circle cx="256" cy="256" r="220" fill="url(#bgGrad)" filter="url(#shadow)"/>
      
      <!-- Subtle inner glow -->
      <circle cx="256" cy="256" r="200" fill="url(#glowGrad)" opacity="0.5"/>
      
      <!-- Decorative ring -->
      <circle cx="256" cy="256" r="180" fill="none" stroke="white" stroke-width="2" opacity="0.2"/>
      
      <!-- Initials text -->
      <text 
        x="256" 
        y="280" 
        font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
        font-size="140" 
        font-weight="700" 
        fill="white" 
        text-anchor="middle"
        style="text-shadow: 0 4px 12px rgba(0,0,0,0.3)"
      >${initials}</text>
    </svg>
  `.trim();
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

function generateBannerSVG(title: string, theme: { primary: string; secondary: string; accent: string }): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
      <defs>
        <linearGradient id="bannerBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${theme.primary};stop-opacity:1" />
          <stop offset="40%" style="stop-color:${theme.secondary};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${theme.accent};stop-opacity:1" />
        </linearGradient>
        <linearGradient id="overlay" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" style="stop-color:black;stop-opacity:0.4" />
          <stop offset="50%" style="stop-color:black;stop-opacity:0.1" />
          <stop offset="100%" style="stop-color:black;stop-opacity:0" />
        </linearGradient>
        <radialGradient id="glow1" cx="20%" cy="30%" r="50%">
          <stop offset="0%" style="stop-color:white;stop-opacity:0.15" />
          <stop offset="100%" style="stop-color:white;stop-opacity:0" />
        </radialGradient>
        <radialGradient id="glow2" cx="80%" cy="70%" r="40%">
          <stop offset="0%" style="stop-color:${theme.accent};stop-opacity:0.3" />
          <stop offset="100%" style="stop-color:${theme.accent};stop-opacity:0" />
        </radialGradient>
        <filter id="blur1">
          <feGaussianBlur stdDeviation="60" />
        </filter>
        <filter id="blur2">
          <feGaussianBlur stdDeviation="40" />
        </filter>
      </defs>
      
      <!-- Base gradient -->
      <rect width="1920" height="1080" fill="url(#bannerBg)"/>
      
      <!-- Decorative blurred circles -->
      <circle cx="300" cy="200" r="300" fill="${theme.secondary}" opacity="0.3" filter="url(#blur1)"/>
      <circle cx="1600" cy="800" r="400" fill="${theme.accent}" opacity="0.25" filter="url(#blur1)"/>
      <circle cx="960" cy="540" r="200" fill="white" opacity="0.1" filter="url(#blur2)"/>
      
      <!-- Mesh-like decorative lines -->
      <g stroke="white" stroke-width="1" opacity="0.1">
        <line x1="0" y1="400" x2="1920" y2="300"/>
        <line x1="0" y1="700" x2="1920" y2="600"/>
        <line x1="400" y1="0" x2="300" y2="1080"/>
        <line x1="1200" y1="0" x2="1400" y2="1080"/>
        <line x1="800" y1="0" x2="600" y2="1080"/>
      </g>
      
      <!-- Glowing orbs -->
      <rect width="1920" height="1080" fill="url(#glow1)"/>
      <rect width="1920" height="1080" fill="url(#glow2)"/>
      
      <!-- Bottom gradient for text legibility -->
      <rect width="1920" height="1080" fill="url(#overlay)"/>
      
      <!-- Decorative geometric shapes -->
      <polygon points="100,1080 0,1080 0,900" fill="white" opacity="0.05"/>
      <polygon points="1920,0 1920,200 1720,0" fill="white" opacity="0.05"/>
      
      <!-- Subtle grid pattern -->
      <g stroke="white" stroke-width="0.5" opacity="0.05">
        ${Array.from({ length: 20 }, (_, i) => 
          `<line x1="${i * 100}" y1="0" x2="${i * 100}" y2="1080"/>`
        ).join('')}
        ${Array.from({ length: 12 }, (_, i) => 
          `<line x1="0" y1="${i * 100}" x2="1920" y2="${i * 100}"/>`
        ).join('')}
      </g>
    </svg>
  `.trim();
  
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
