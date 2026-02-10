/**
 * Generates premium SVG-based fallback branding (logo + banner)
 * when AI generation is unavailable. Features rich gradients,
 * geometric patterns, topic-aware icons, and cinematic theming.
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
  icon: string; // SVG path for topic icon
}

const topicThemes: Record<string, Theme> = {
  programming: { primary: "#3B82F6", secondary: "#8B5CF6", accent: "#06B6D4", bg: "#0F172A", icon: "code" },
  coding: { primary: "#3B82F6", secondary: "#8B5CF6", accent: "#06B6D4", bg: "#0F172A", icon: "code" },
  javascript: { primary: "#F7DF1E", secondary: "#F97316", accent: "#FBBF24", bg: "#1A1A2E", icon: "code" },
  python: { primary: "#3776AB", secondary: "#FFD43B", accent: "#306998", bg: "#0D1117", icon: "code" },
  react: { primary: "#61DAFB", secondary: "#282C34", accent: "#20232A", bg: "#0A0E1A", icon: "code" },
  ai: { primary: "#8B5CF6", secondary: "#EC4899", accent: "#06B6D4", bg: "#0F0A1E", icon: "brain" },
  machine: { primary: "#8B5CF6", secondary: "#EC4899", accent: "#3B82F6", bg: "#0F0A1E", icon: "brain" },
  data: { primary: "#10B981", secondary: "#3B82F6", accent: "#8B5CF6", bg: "#0A1628", icon: "chart" },
  web: { primary: "#F97316", secondary: "#EC4899", accent: "#8B5CF6", bg: "#1A0A1E", icon: "globe" },
  mobile: { primary: "#06B6D4", secondary: "#8B5CF6", accent: "#EC4899", bg: "#0A1628", icon: "phone" },
  cloud: { primary: "#0EA5E9", secondary: "#6366F1", accent: "#A855F7", bg: "#0A1628", icon: "cloud" },
  cyber: { primary: "#10B981", secondary: "#059669", accent: "#14B8A6", bg: "#0A1E1A", icon: "shield" },
  security: { primary: "#10B981", secondary: "#059669", accent: "#14B8A6", bg: "#0A1E1A", icon: "shield" },
  business: { primary: "#1E40AF", secondary: "#3B82F6", accent: "#60A5FA", bg: "#0A1628", icon: "briefcase" },
  marketing: { primary: "#EC4899", secondary: "#F97316", accent: "#FBBF24", bg: "#1E0A1A", icon: "megaphone" },
  finance: { primary: "#059669", secondary: "#10B981", accent: "#34D399", bg: "#0A1E14", icon: "chart" },
  investing: { primary: "#059669", secondary: "#FBBF24", accent: "#10B981", bg: "#0A1E14", icon: "chart" },
  entrepreneur: { primary: "#F97316", secondary: "#EF4444", accent: "#FBBF24", bg: "#1E0A0A", icon: "rocket" },
  leadership: { primary: "#7C3AED", secondary: "#4F46E5", accent: "#8B5CF6", bg: "#0F0A1E", icon: "star" },
  management: { primary: "#6366F1", secondary: "#8B5CF6", accent: "#A855F7", bg: "#0F0A1E", icon: "briefcase" },
  design: { primary: "#EC4899", secondary: "#8B5CF6", accent: "#F472B6", bg: "#1E0A1A", icon: "pen" },
  art: { primary: "#F43F5E", secondary: "#EC4899", accent: "#FB7185", bg: "#1E0A14", icon: "pen" },
  photography: { primary: "#F97316", secondary: "#FBBF24", accent: "#EF4444", bg: "#0F172A", icon: "camera" },
  music: { primary: "#7C3AED", secondary: "#EC4899", accent: "#F472B6", bg: "#0F0A1E", icon: "music" },
  video: { primary: "#EF4444", secondary: "#F97316", accent: "#FBBF24", bg: "#1E0A0A", icon: "play" },
  writing: { primary: "#94A3B8", secondary: "#64748B", accent: "#CBD5E1", bg: "#0F172A", icon: "pen" },
  creative: { primary: "#EC4899", secondary: "#F97316", accent: "#FBBF24", bg: "#1E0A1A", icon: "sparkle" },
  health: { primary: "#10B981", secondary: "#06B6D4", accent: "#34D399", bg: "#0A1E1A", icon: "heart" },
  fitness: { primary: "#EF4444", secondary: "#F97316", accent: "#FBBF24", bg: "#1E0A0A", icon: "bolt" },
  yoga: { primary: "#A855F7", secondary: "#EC4899", accent: "#F472B6", bg: "#1A0A2E", icon: "heart" },
  meditation: { primary: "#6366F1", secondary: "#8B5CF6", accent: "#A855F7", bg: "#0F0A1E", icon: "sparkle" },
  nutrition: { primary: "#22C55E", secondary: "#84CC16", accent: "#A3E635", bg: "#0A1E0A", icon: "heart" },
  wellness: { primary: "#14B8A6", secondary: "#06B6D4", accent: "#22D3EE", bg: "#0A1E1A", icon: "heart" },
  language: { primary: "#3B82F6", secondary: "#06B6D4", accent: "#0EA5E9", bg: "#0A1628", icon: "globe" },
  math: { primary: "#6366F1", secondary: "#4F46E5", accent: "#818CF8", bg: "#0F0A1E", icon: "calculator" },
  science: { primary: "#0EA5E9", secondary: "#06B6D4", accent: "#22D3EE", bg: "#0A1628", icon: "flask" },
  history: { primary: "#D97706", secondary: "#B45309", accent: "#FBBF24", bg: "#1E1A0A", icon: "book" },
  philosophy: { primary: "#94A3B8", secondary: "#64748B", accent: "#CBD5E1", bg: "#0F172A", icon: "book" },
  psychology: { primary: "#8B5CF6", secondary: "#A855F7", accent: "#C084FC", bg: "#0F0A1E", icon: "brain" },
  personal: { primary: "#F59E0B", secondary: "#F97316", accent: "#FBBF24", bg: "#1E1A0A", icon: "star" },
  productivity: { primary: "#0EA5E9", secondary: "#3B82F6", accent: "#60A5FA", bg: "#0A1628", icon: "bolt" },
  cooking: { primary: "#F97316", secondary: "#EF4444", accent: "#FBBF24", bg: "#1E0A0A", icon: "flame" },
  travel: { primary: "#06B6D4", secondary: "#0EA5E9", accent: "#22D3EE", bg: "#0A1628", icon: "globe" },
  fashion: { primary: "#EC4899", secondary: "#F472B6", accent: "#FB7185", bg: "#1E0A1A", icon: "sparkle" },
  lifestyle: { primary: "#F472B6", secondary: "#EC4899", accent: "#F9A8D4", bg: "#1E0A1A", icon: "sparkle" },
};

const defaultTheme: Theme = { primary: "#6366F1", secondary: "#8B5CF6", accent: "#EC4899", bg: "#0F0A1E", icon: "star" };

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

/** Returns an SVG path string for the given icon type, centered at (cx, cy) with given size */
function getIconPath(icon: string, cx: number, cy: number, size: number): string {
  const s = size / 2;
  const paths: Record<string, string> = {
    code: `<path d="M${cx - s * 0.6} ${cy} L${cx - s} ${cy - s * 0.5} M${cx - s * 0.6} ${cy} L${cx - s} ${cy + s * 0.5} M${cx + s * 0.6} ${cy} L${cx + s} ${cy - s * 0.5} M${cx + s * 0.6} ${cy} L${cx + s} ${cy + s * 0.5} M${cx - s * 0.2} ${cy - s * 0.6} L${cx + s * 0.2} ${cy + s * 0.6}" stroke-linecap="round" stroke-width="${size * 0.08}"/>`,
    brain: `<circle cx="${cx}" cy="${cy - s * 0.1}" r="${s * 0.35}" fill="none" stroke-width="${size * 0.07}"/><path d="M${cx - s * 0.35} ${cy - s * 0.1} Q${cx - s * 0.7} ${cy - s * 0.6} ${cx - s * 0.15} ${cy - s * 0.7} Q${cx + s * 0.4} ${cy - s * 0.9} ${cx + s * 0.35} ${cy - s * 0.1}" fill="none" stroke-width="${size * 0.07}"/><path d="M${cx} ${cy + s * 0.25} L${cx} ${cy + s * 0.7}" stroke-linecap="round" stroke-width="${size * 0.07}"/>`,
    chart: `<rect x="${cx - s * 0.7}" y="${cy + s * 0.1}" width="${s * 0.3}" height="${s * 0.6}" rx="2" fill="currentColor" opacity="0.5"/><rect x="${cx - s * 0.15}" y="${cy - s * 0.4}" width="${s * 0.3}" height="${s * 1.1}" rx="2" fill="currentColor" opacity="0.7"/><rect x="${cx + s * 0.4}" y="${cy - s * 0.15}" width="${s * 0.3}" height="${s * 0.85}" rx="2" fill="currentColor"/>`,
    globe: `<circle cx="${cx}" cy="${cy}" r="${s * 0.6}" fill="none" stroke-width="${size * 0.06}"/><ellipse cx="${cx}" cy="${cy}" rx="${s * 0.25}" ry="${s * 0.6}" fill="none" stroke-width="${size * 0.05}"/><line x1="${cx - s * 0.6}" y1="${cy}" x2="${cx + s * 0.6}" y2="${cy}" stroke-width="${size * 0.05}"/>`,
    shield: `<path d="M${cx} ${cy - s * 0.7} L${cx + s * 0.55} ${cy - s * 0.35} L${cx + s * 0.55} ${cy + s * 0.15} Q${cx + s * 0.45} ${cy + s * 0.6} ${cx} ${cy + s * 0.8} Q${cx - s * 0.45} ${cy + s * 0.6} ${cx - s * 0.55} ${cy + s * 0.15} L${cx - s * 0.55} ${cy - s * 0.35} Z" fill="none" stroke-width="${size * 0.07}"/><path d="M${cx - s * 0.15} ${cy + s * 0.05} L${cx} ${cy + s * 0.25} L${cx + s * 0.25} ${cy - s * 0.15}" fill="none" stroke-linecap="round" stroke-width="${size * 0.08}"/>`,
    briefcase: `<rect x="${cx - s * 0.55}" y="${cy - s * 0.3}" width="${s * 1.1}" height="${s * 0.85}" rx="4" fill="none" stroke-width="${size * 0.07}"/><path d="M${cx - s * 0.25} ${cy - s * 0.3} L${cx - s * 0.25} ${cy - s * 0.55} Q${cx - s * 0.25} ${cy - s * 0.7} ${cx - s * 0.1} ${cy - s * 0.7} L${cx + s * 0.1} ${cy - s * 0.7} Q${cx + s * 0.25} ${cy - s * 0.7} ${cx + s * 0.25} ${cy - s * 0.55} L${cx + s * 0.25} ${cy - s * 0.3}" fill="none" stroke-width="${size * 0.07}"/>`,
    rocket: `<path d="M${cx} ${cy - s * 0.7} Q${cx + s * 0.5} ${cy - s * 0.2} ${cx + s * 0.2} ${cy + s * 0.5} L${cx} ${cy + s * 0.3} L${cx - s * 0.2} ${cy + s * 0.5} Q${cx - s * 0.5} ${cy - s * 0.2} ${cx} ${cy - s * 0.7} Z" fill="none" stroke-width="${size * 0.07}"/><circle cx="${cx}" cy="${cy - s * 0.15}" r="${s * 0.12}" fill="currentColor"/><path d="M${cx - s * 0.15} ${cy + s * 0.4} L${cx} ${cy + s * 0.75} L${cx + s * 0.15} ${cy + s * 0.4}" fill="none" stroke-linecap="round" stroke-width="${size * 0.06}"/>`,
    star: `<polygon points="${Array.from({ length: 5 }, (_, i) => {
      const a1 = (Math.PI * 2 * i) / 5 - Math.PI / 2;
      const a2 = a1 + Math.PI / 5;
      return `${cx + s * 0.65 * Math.cos(a1)},${cy + s * 0.65 * Math.sin(a1)} ${cx + s * 0.28 * Math.cos(a2)},${cy + s * 0.28 * Math.sin(a2)}`;
    }).join(' ')}" fill="currentColor" opacity="0.85"/>`,
    heart: `<path d="M${cx} ${cy + s * 0.5} Q${cx - s * 0.9} ${cy - s * 0.1} ${cx} ${cy - s * 0.5} Q${cx + s * 0.9} ${cy - s * 0.1} ${cx} ${cy + s * 0.5} Z" fill="currentColor" opacity="0.8"/>`,
    bolt: `<polygon points="${cx - s * 0.1},${cy - s * 0.7} ${cx - s * 0.35},${cy + s * 0.05} ${cx + s * 0.05},${cy + s * 0.05} ${cx + s * 0.1},${cy + s * 0.7} ${cx + s * 0.35},${cy - s * 0.05} ${cx - s * 0.05},${cy - s * 0.05}" fill="currentColor" opacity="0.85"/>`,
    flame: `<path d="M${cx} ${cy - s * 0.7} Q${cx + s * 0.5} ${cy - s * 0.2} ${cx + s * 0.35} ${cy + s * 0.3} Q${cx + s * 0.25} ${cy + s * 0.7} ${cx} ${cy + s * 0.55} Q${cx - s * 0.25} ${cy + s * 0.7} ${cx - s * 0.35} ${cy + s * 0.3} Q${cx - s * 0.5} ${cy - s * 0.2} ${cx} ${cy - s * 0.7} Z" fill="currentColor" opacity="0.8"/>`,
    book: `<path d="M${cx} ${cy - s * 0.5} L${cx} ${cy + s * 0.5} M${cx} ${cy - s * 0.5} Q${cx - s * 0.5} ${cy - s * 0.6} ${cx - s * 0.6} ${cy - s * 0.45} L${cx - s * 0.6} ${cy + s * 0.45} Q${cx - s * 0.5} ${cy + s * 0.55} ${cx} ${cy + s * 0.5} M${cx} ${cy - s * 0.5} Q${cx + s * 0.5} ${cy - s * 0.6} ${cx + s * 0.6} ${cy - s * 0.45} L${cx + s * 0.6} ${cy + s * 0.45} Q${cx + s * 0.5} ${cy + s * 0.55} ${cx} ${cy + s * 0.5}" fill="none" stroke-width="${size * 0.07}"/>`,
    pen: `<path d="M${cx + s * 0.4} ${cy - s * 0.55} L${cx - s * 0.35} ${cy + s * 0.2} L${cx - s * 0.5} ${cy + s * 0.6} L${cx - s * 0.1} ${cy + s * 0.45} L${cx + s * 0.65} ${cy - s * 0.3} Z" fill="none" stroke-width="${size * 0.06}"/>`,
    camera: `<rect x="${cx - s * 0.6}" y="${cy - s * 0.3}" width="${s * 1.2}" height="${s * 0.9}" rx="5" fill="none" stroke-width="${size * 0.07}"/><circle cx="${cx}" cy="${cy + s * 0.05}" r="${s * 0.25}" fill="none" stroke-width="${size * 0.06}"/><rect x="${cx - s * 0.15}" y="${cy - s * 0.5}" width="${s * 0.3}" height="${s * 0.2}" rx="2" fill="currentColor" opacity="0.5"/>`,
    music: `<circle cx="${cx - s * 0.25}" cy="${cy + s * 0.35}" r="${s * 0.18}" fill="currentColor" opacity="0.7"/><circle cx="${cx + s * 0.35}" cy="${cy + s * 0.2}" r="${s * 0.18}" fill="currentColor" opacity="0.7"/><path d="M${cx - s * 0.07} ${cy + s * 0.35} L${cx - s * 0.07} ${cy - s * 0.55} L${cx + s * 0.53} ${cy - s * 0.7} L${cx + s * 0.53} ${cy + s * 0.2}" fill="none" stroke-width="${size * 0.06}"/>`,
    play: `<polygon points="${cx - s * 0.3},${cy - s * 0.5} ${cx + s * 0.5},${cy} ${cx - s * 0.3},${cy + s * 0.5}" fill="currentColor" opacity="0.85"/>`,
    phone: `<rect x="${cx - s * 0.3}" y="${cy - s * 0.6}" width="${s * 0.6}" height="${s * 1.2}" rx="6" fill="none" stroke-width="${size * 0.07}"/><circle cx="${cx}" cy="${cy + s * 0.4}" r="${s * 0.07}" fill="currentColor"/>`,
    megaphone: `<path d="M${cx - s * 0.5} ${cy - s * 0.15} L${cx + s * 0.3} ${cy - s * 0.55} L${cx + s * 0.3} ${cy + s * 0.55} L${cx - s * 0.5} ${cy + s * 0.15} Z" fill="none" stroke-width="${size * 0.07}"/><rect x="${cx - s * 0.65}" y="${cy - s * 0.15}" width="${s * 0.15}" height="${s * 0.3}" rx="2" fill="currentColor" opacity="0.6"/>`,
    sparkle: `<polygon points="${cx},${cy - s * 0.6} ${cx + s * 0.12},${cy - s * 0.12} ${cx + s * 0.6},${cy} ${cx + s * 0.12},${cy + s * 0.12} ${cx},${cy + s * 0.6} ${cx - s * 0.12},${cy + s * 0.12} ${cx - s * 0.6},${cy} ${cx - s * 0.12},${cy - s * 0.12}" fill="currentColor" opacity="0.85"/>`,
    flask: `<path d="M${cx - s * 0.15} ${cy - s * 0.6} L${cx - s * 0.15} ${cy - s * 0.1} L${cx - s * 0.5} ${cy + s * 0.55} Q${cx - s * 0.5} ${cy + s * 0.7} ${cx - s * 0.35} ${cy + s * 0.7} L${cx + s * 0.35} ${cy + s * 0.7} Q${cx + s * 0.5} ${cy + s * 0.7} ${cx + s * 0.5} ${cy + s * 0.55} L${cx + s * 0.15} ${cy - s * 0.1} L${cx + s * 0.15} ${cy - s * 0.6}" fill="none" stroke-width="${size * 0.07}" stroke-linecap="round"/><line x1="${cx - s * 0.25}" y1="${cy - s * 0.6}" x2="${cx + s * 0.25}" y2="${cy - s * 0.6}" stroke-width="${size * 0.08}" stroke-linecap="round"/>`,
    calculator: `<rect x="${cx - s * 0.45}" y="${cy - s * 0.65}" width="${s * 0.9}" height="${s * 1.3}" rx="5" fill="none" stroke-width="${size * 0.07}"/><rect x="${cx - s * 0.3}" y="${cy - s * 0.5}" width="${s * 0.6}" height="${s * 0.25}" rx="2" fill="currentColor" opacity="0.4"/><circle cx="${cx - s * 0.2}" cy="${cy + s * 0.1}" r="${s * 0.07}" fill="currentColor" opacity="0.6"/><circle cx="${cx + s * 0.2}" cy="${cy + s * 0.1}" r="${s * 0.07}" fill="currentColor" opacity="0.6"/><circle cx="${cx - s * 0.2}" cy="${cy + s * 0.4}" r="${s * 0.07}" fill="currentColor" opacity="0.6"/><circle cx="${cx + s * 0.2}" cy="${cy + s * 0.4}" r="${s * 0.07}" fill="currentColor" opacity="0.6"/>`,
  };
  return paths[icon] || paths.star;
}

function generateLogoSVG(title: string, theme: Theme): string {
  const initials = getInitials(title);
  const h = hashStr(title);
  const rotation = (h % 60) + 15;

  const cx = 256, cy = 256;

  // Outer decorative ring segments
  const ringSegments = Array.from({ length: 6 }, (_, i) => {
    const startAngle = (Math.PI * 2 * i) / 6 + (h % 100) * 0.01;
    const endAngle = startAngle + Math.PI / 4.5;
    const r = 230;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const colors = [theme.primary, theme.secondary, theme.accent];
    return `<path d="M${x1},${y1} A${r},${r} 0 0 1 ${x2},${y2}" fill="none" stroke="${colors[i % 3]}" stroke-width="2.5" opacity="${0.25 + (i % 3) * 0.1}" stroke-linecap="round"/>`;
  }).join('');

  // Floating particles in orbit
  const particles = Array.from({ length: 18 }, (_, i) => {
    const a = (Math.PI * 2 * i) / 18 + (h % 100) * 0.02;
    const dist = 195 + ((h * (i + 1)) % 50);
    const px = cx + dist * Math.cos(a);
    const py = cy + dist * Math.sin(a);
    const r = 1 + ((h * (i + 2)) % 3);
    const op = 0.1 + ((h * (i + 3)) % 30) / 100;
    const colors = [theme.accent, theme.primary, theme.secondary];
    return `<circle cx="${px}" cy="${py}" r="${r}" fill="${colors[i % 3]}" opacity="${op}"/>`;
  }).join('');

  // The main icon rendered large and prominent
  const mainIcon = getIconPath(theme.icon, cx, cy - 15, 140);

  // Small decorative corner icons
  const cornerPositions = [
    { x: 85, y: 85 }, { x: 427, y: 85 }, { x: 85, y: 427 }, { x: 427, y: 427 },
  ];
  const cornerIcons = cornerPositions.map(({ x, y }, i) =>
    `<g stroke="${[theme.primary, theme.accent, theme.secondary, theme.primary][i]}" fill="${[theme.primary, theme.accent, theme.secondary, theme.primary][i]}" opacity="0.08">${getIconPath(theme.icon, x, y, 28)}</g>`
  ).join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="lg1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.primary}"/>
      <stop offset="50%" stop-color="${theme.secondary}"/>
      <stop offset="100%" stop-color="${theme.accent}"/>
    </linearGradient>
    <linearGradient id="lg2" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${theme.accent}" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="${theme.primary}" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="bgGlow" cx="50%" cy="45%">
      <stop offset="0%" stop-color="${theme.primary}" stop-opacity="0.25"/>
      <stop offset="60%" stop-color="${theme.secondary}" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="${theme.bg}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="innerGlow" cx="50%" cy="42%">
      <stop offset="0%" stop-color="${theme.accent}" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="${theme.bg}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="circGrad" cx="40%" cy="35%">
      <stop offset="0%" stop-color="${theme.primary}" stop-opacity="0.9"/>
      <stop offset="70%" stop-color="${theme.secondary}" stop-opacity="0.7"/>
      <stop offset="100%" stop-color="${theme.accent}" stop-opacity="0.5"/>
    </radialGradient>
    <filter id="glow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="bigGlow"><feGaussianBlur stdDeviation="10" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="dshadow"><feDropShadow dx="0" dy="6" stdDeviation="16" flood-color="#000" flood-opacity="0.45"/></filter>
    <filter id="iconShadow"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="${theme.primary}" flood-opacity="0.5"/></filter>
    <clipPath id="circleClip"><circle cx="${cx}" cy="${cy}" r="165"/></clipPath>
  </defs>

  <!-- Dark rounded background -->
  <rect width="512" height="512" rx="96" fill="${theme.bg}"/>
  <rect width="512" height="512" rx="96" fill="url(#bgGlow)"/>

  <!-- Subtle hex grid background -->
  <g opacity="0.03" stroke="${theme.primary}" stroke-width="0.5" fill="none">
    ${Array.from({ length: 9 }, (_, r) =>
      Array.from({ length: 9 }, (_, c) => {
        const hx = 30 + c * 56 + (r % 2 ? 28 : 0);
        const hy = 20 + r * 52;
        return `<polygon points="${[0,1,2,3,4,5].map(i => {
          const a = Math.PI / 3 * i - Math.PI / 6;
          return `${hx + 20 * Math.cos(a)},${hy + 20 * Math.sin(a)}`;
        }).join(' ')}"/>`;
      }).join('')
    ).join('')}
  </g>

  <!-- Outer decorative ring segments -->
  <g transform="rotate(${rotation} ${cx} ${cy})">${ringSegments}</g>

  <!-- Floating particles -->
  ${particles}

  <!-- Corner icons -->
  ${cornerIcons}

  <!-- Decorative geometric shapes -->
  <rect x="${cx - 120}" y="${cy - 120}" width="240" height="240" rx="30" fill="none" stroke="url(#lg1)" stroke-width="0.8" opacity="0.1" transform="rotate(45 ${cx} ${cy})"/>
  <rect x="${cx - 100}" y="${cy - 100}" width="200" height="200" rx="25" fill="none" stroke="url(#lg2)" stroke-width="0.6" opacity="0.06" transform="rotate(${rotation * 0.5} ${cx} ${cy})"/>

  <!-- Main circle with gradient fill -->
  <circle cx="${cx}" cy="${cy}" r="165" fill="url(#circGrad)" filter="url(#dshadow)"/>
  
  <!-- Glass overlay on circle -->
  <circle cx="${cx}" cy="${cy}" r="165" fill="url(#innerGlow)"/>
  
  <!-- Glass highlight arc -->
  <path d="M${cx - 130},${cy - 85} A165,165 0 0,1 ${cx + 130},${cy - 85}" fill="white" opacity="0.06"/>

  <!-- Inner ring accents -->
  <circle cx="${cx}" cy="${cy}" r="150" fill="none" stroke="white" stroke-width="0.6" opacity="0.15"/>
  <circle cx="${cx}" cy="${cy}" r="160" fill="none" stroke="white" stroke-width="0.4" opacity="0.08" stroke-dasharray="8 12"/>

  <!-- MAIN TOPIC ICON - large and prominent -->
  <g stroke="white" fill="white" opacity="0.9" filter="url(#iconShadow)">
    ${mainIcon}
  </g>

  <!-- Initials below the icon -->
  <text x="${cx}" y="${cy + 75}" font-family="'SF Pro Display','Inter',system-ui,sans-serif" font-size="42" font-weight="800" fill="white" text-anchor="middle" letter-spacing="6" opacity="0.85" filter="url(#glow)">${initials}</text>

  <!-- Bottom label badge -->
  <rect x="${cx - 55}" y="420" width="110" height="22" rx="11" fill="white" opacity="0.08"/>
  <text x="${cx}" y="435" font-family="'SF Pro Display','Inter',system-ui,sans-serif" font-size="9" font-weight="700" fill="${theme.accent}" text-anchor="middle" letter-spacing="4" opacity="0.7">COURSE</text>

  <!-- Top subtle accent line -->
  <rect x="${cx - 40}" y="52" width="80" height="2" rx="1" fill="url(#lg1)" opacity="0.25"/>
</svg>`;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

function generateBannerSVG(title: string, theme: Theme): string {
  const h = hashStr(title);
  const angle1 = 15 + (h % 25);

  // Generate flowing wave path
  const wave = (y: number, amp: number, freq: number, phase: number) => {
    const points: string[] = [];
    for (let x = 0; x <= 1920; x += 40) {
      const py = y + Math.sin((x / 1920) * Math.PI * freq + phase) * amp;
      points.push(x === 0 ? `M0,${py}` : `L${x},${py}`);
    }
    return points.join(' ') + ` L1920,1080 L0,1080 Z`;
  };

  // Scattered icons across banner
  const iconPositions = [
    { x: 150, y: 180, size: 50, op: 0.06 },
    { x: 1750, y: 150, size: 45, op: 0.05 },
    { x: 350, y: 850, size: 40, op: 0.04 },
    { x: 1600, y: 800, size: 55, op: 0.07 },
    { x: 960, y: 120, size: 35, op: 0.04 },
    { x: 700, y: 900, size: 42, op: 0.05 },
    { x: 1300, y: 200, size: 38, op: 0.04 },
  ];

  const scatteredIcons = iconPositions.map(({ x, y, size, op }) =>
    `<g stroke="${theme.accent}" fill="${theme.accent}" opacity="${op}">${getIconPath(theme.icon, x, y, size)}</g>`
  ).join('');

  // Title text - truncate if too long
  const displayTitle = title.length > 35 ? title.substring(0, 33) + '…' : title;
  const titleSize = title.length > 25 ? 64 : title.length > 18 ? 76 : 88;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.bg}"/>
      <stop offset="40%" stop-color="${theme.bg}"/>
      <stop offset="100%" stop-color="${theme.primary}" stop-opacity="0.2"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.primary}"/>
      <stop offset="50%" stop-color="${theme.secondary}"/>
      <stop offset="100%" stop-color="${theme.accent}"/>
    </linearGradient>
    <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="white"/>
      <stop offset="100%" stop-color="${theme.accent}" stop-opacity="0.9"/>
    </linearGradient>
    <radialGradient id="orb1" cx="20%" cy="35%">
      <stop offset="0%" stop-color="${theme.primary}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="${theme.primary}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="orb2" cx="80%" cy="65%">
      <stop offset="0%" stop-color="${theme.accent}" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="${theme.accent}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="orb3" cx="50%" cy="25%">
      <stop offset="0%" stop-color="${theme.secondary}" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="${theme.secondary}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="centerGlow" cx="50%" cy="50%">
      <stop offset="0%" stop-color="${theme.primary}" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="${theme.bg}" stop-opacity="0"/>
    </radialGradient>
    <filter id="blur1"><feGaussianBlur stdDeviation="80"/></filter>
    <filter id="blur2"><feGaussianBlur stdDeviation="50"/></filter>
    <filter id="blur3"><feGaussianBlur stdDeviation="120"/></filter>
    <filter id="textGlow"><feGaussianBlur stdDeviation="20" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <linearGradient id="fade" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="${theme.bg}" stop-opacity="0.7"/>
      <stop offset="50%" stop-color="${theme.bg}" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="topFade" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${theme.bg}" stop-opacity="0.4"/>
      <stop offset="30%" stop-color="${theme.bg}" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="waveFill" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${theme.primary}" stop-opacity="0.08"/>
      <stop offset="50%" stop-color="${theme.secondary}" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="${theme.accent}" stop-opacity="0.08"/>
    </linearGradient>
  </defs>

  <!-- Base -->
  <rect width="1920" height="1080" fill="url(#bg)"/>
  <rect width="1920" height="1080" fill="url(#centerGlow)"/>

  <!-- Large orbs -->
  <circle cx="350" cy="280" r="500" fill="url(#orb1)" filter="url(#blur3)"/>
  <circle cx="1550" cy="750" r="550" fill="url(#orb2)" filter="url(#blur3)"/>
  <circle cx="960" cy="150" r="450" fill="url(#orb3)" filter="url(#blur1)"/>

  <!-- Flowing waves -->
  <path d="${wave(780, 40, 3, h * 0.1)}" fill="url(#waveFill)"/>
  <path d="${wave(830, 30, 4, h * 0.2 + 1)}" fill="url(#waveFill)" opacity="0.6"/>

  <!-- Geometric wireframes -->
  <rect x="80" y="80" width="280" height="280" rx="35" fill="none" stroke="${theme.primary}" stroke-width="0.8" opacity="0.06" transform="rotate(${angle1} 220 220)"/>
  <rect x="1520" y="620" width="240" height="240" rx="28" fill="none" stroke="${theme.accent}" stroke-width="0.8" opacity="0.06" transform="rotate(-${angle1} 1640 740)"/>
  <circle cx="1720" cy="180" r="110" fill="none" stroke="${theme.secondary}" stroke-width="0.8" opacity="0.05"/>
  <circle cx="180" cy="820" r="75" fill="none" stroke="${theme.accent}" stroke-width="0.8" opacity="0.05"/>
  <polygon points="960,100 1040,200 880,200" fill="none" stroke="${theme.primary}" stroke-width="0.6" opacity="0.04"/>

  <!-- Dot grid -->
  <g fill="${theme.primary}" opacity="0.04">
    ${Array.from({ length: 12 }, (_, r) =>
      Array.from({ length: 22 }, (_, c) =>
        `<circle cx="${100 + c * 82}" cy="${80 + r * 82}" r="1.2"/>`
      ).join('')
    ).join('')}
  </g>

  <!-- Scattered topic icons -->
  ${scatteredIcons}

  <!-- Diagonal accent lines -->
  <line x1="0" y1="1080" x2="1920" y2="0" stroke="url(#accent)" stroke-width="1.5" opacity="0.06"/>
  <line x1="100" y1="1080" x2="1920" y2="100" stroke="url(#accent)" stroke-width="0.8" opacity="0.03"/>

  <!-- Accent glow blobs -->
  <ellipse cx="960" cy="500" rx="650" ry="280" fill="${theme.primary}" opacity="0.03" filter="url(#blur1)"/>
  <circle cx="250" cy="500" r="180" fill="${theme.accent}" opacity="0.06" filter="url(#blur2)"/>
  <circle cx="1650" cy="380" r="160" fill="${theme.secondary}" opacity="0.06" filter="url(#blur2)"/>

  <!-- Center content area -->
  <!-- Subtle glass card behind text -->
  <rect x="260" y="380" width="1400" height="320" rx="24" fill="${theme.bg}" opacity="0.35"/>
  <rect x="260" y="380" width="1400" height="320" rx="24" fill="none" stroke="white" stroke-width="0.5" opacity="0.06"/>

  <!-- Course title -->
  <text x="960" y="${530 - (titleSize > 70 ? 5 : 0)}" font-family="'SF Pro Display','Inter',system-ui,sans-serif" font-size="${titleSize}" font-weight="800" fill="url(#textGrad)" text-anchor="middle" letter-spacing="-2" filter="url(#textGlow)">${displayTitle}</text>

  <!-- Accent divider -->
  <rect x="860" y="565" width="200" height="3" rx="1.5" fill="url(#accent)" opacity="0.5"/>

  <!-- Subtitle badge -->
  <rect x="830" y="600" width="260" height="36" rx="18" fill="${theme.primary}" opacity="0.12"/>
  <text x="960" y="624" font-family="'SF Pro Display','Inter',system-ui,sans-serif" font-size="14" font-weight="600" fill="${theme.accent}" text-anchor="middle" letter-spacing="5" opacity="0.75">PREMIUM COURSE</text>

  <!-- Top & bottom fades -->
  <rect width="1920" height="1080" fill="url(#fade)"/>
  <rect width="1920" height="1080" fill="url(#topFade)"/>

  <!-- Corner accent dots -->
  <circle cx="60" cy="60" r="4" fill="${theme.accent}" opacity="0.2"/>
  <circle cx="1860" cy="60" r="4" fill="${theme.primary}" opacity="0.2"/>
  <circle cx="60" cy="1020" r="4" fill="${theme.secondary}" opacity="0.2"/>
  <circle cx="1860" cy="1020" r="4" fill="${theme.accent}" opacity="0.2"/>
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
