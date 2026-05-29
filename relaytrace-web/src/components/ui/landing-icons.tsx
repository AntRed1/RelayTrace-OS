import { SVGProps } from 'react';

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

// PROBLEMS SECTION ICONS

export const WhatsAppScreenshotIcon = ({ size = 48, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <defs>
      <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fb923c" />
        <stop offset="100%" stopColor="#f97316" />
      </linearGradient>
    </defs>
    <rect x="8" y="6" width="32" height="36" rx="6" stroke="url(#orangeGradient)" strokeWidth="2" strokeLinecap="round" />
    <circle cx="24" cy="24" r="9" stroke="url(#orangeGradient)" strokeWidth="2" strokeLinecap="round" />
    <path
      d="M20 22C20 22 20.5 24 22 24C23.5 24 27 20.5 27 20.5"
      stroke="url(#orangeGradient)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M29 30L32 33L35 36"
      stroke="url(#orangeGradient)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="24" cy="38" r="1.5" fill="url(#orangeGradient)" />
  </svg>
);

export const ManualSpreadsheetsIcon = ({ size = 48, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <defs>
      <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f87171" />
        <stop offset="100%" stopColor="#ef4444" />
      </linearGradient>
    </defs>
    <rect x="6" y="10" width="36" height="28" rx="4" stroke="url(#redGradient)" strokeWidth="2" strokeLinecap="round" />
    <path d="M6 18H42" stroke="url(#redGradient)" strokeWidth="2" strokeLinecap="round" />
    <path d="M18 18V38" stroke="url(#redGradient)" strokeWidth="2" strokeLinecap="round" />
    <path d="M30 18V38" stroke="url(#redGradient)" strokeWidth="2" strokeLinecap="round" />
    <path d="M6 26H42" stroke="url(#redGradient)" strokeWidth="2" strokeLinecap="round" />
    <circle cx="12" cy="14" r="1.5" fill="url(#redGradient)" />
    <circle cx="24" cy="14" r="1.5" fill="url(#redGradient)" />
    <circle cx="36" cy="14" r="1.5" fill="url(#redGradient)" />
  </svg>
);

export const NoDriverLinkIcon = ({ size = 48, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <defs>
      <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#a78bfa" />
        <stop offset="100%" stopColor="#8b5cf6" />
      </linearGradient>
    </defs>
    <circle cx="15" cy="15" r="7" stroke="url(#purpleGradient)" strokeWidth="2" strokeLinecap="round" />
    <path
      d="M8 35C8 30.029 12.029 26 17 26C21.971 26 26 30.029 26 35"
      stroke="url(#purpleGradient)"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <rect x="28" y="10" width="14" height="20" rx="4" stroke="url(#purpleGradient)" strokeWidth="2" strokeLinecap="round" />
    <path d="M28 18H42" stroke="url(#purpleGradient)" strokeWidth="2" strokeLinecap="round" />
    <path d="M33 10V30" stroke="url(#purpleGradient)" strokeWidth="2" strokeLinecap="round" />
    <path
      d="M6 40L18 28M18 40L6 28"
      stroke="url(#purpleGradient)"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const FraudUndetectedIcon = ({ size = 48, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <defs>
      <linearGradient id="yellowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#f59e0b" />
      </linearGradient>
    </defs>
    <path
      d="M24 6L8 14V24C8 33 16 40 24 42C32 40 40 33 40 24V14L24 6Z"
      stroke="url(#yellowGradient)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M24 18V24"
      stroke="url(#yellowGradient)"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="24" cy="30" r="1.5" fill="url(#yellowGradient)" />
  </svg>
);

// FEATURES/SOLUTIONS SECTION ICONS

export const DriverAcceptsLoadIcon = ({ size = 48, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <defs>
      <linearGradient id="cyanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#22d3ee" />
        <stop offset="100%" stopColor="#2563eb" />
      </linearGradient>
    </defs>
    <rect x="6" y="18" width="28" height="18" rx="4" stroke="url(#cyanGradient)" strokeWidth="2" strokeLinecap="round" />
    <path
      d="M34 24H38C39.105 24 40 24.895 40 26V32C40 33.105 39.105 34 38 34H34"
      stroke="url(#cyanGradient)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="36" r="4" stroke="url(#cyanGradient)" strokeWidth="2" />
    <circle cx="28" cy="36" r="4" stroke="url(#cyanGradient)" strokeWidth="2" />
    <path
      d="M17 14L20 17L26 11"
      stroke="url(#cyanGradient)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const QuickRegisterIcon = ({ size = 48, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <defs>
      <linearGradient id="cyanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#22d3ee" />
        <stop offset="100%" stopColor="#2563eb" />
      </linearGradient>
    </defs>
    <circle cx="24" cy="24" r="16" stroke="url(#cyanGradient)" strokeWidth="2" strokeLinecap="round" />
    <path
      d="M24 12V24L30 30"
      stroke="url(#cyanGradient)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M36 8L40 12L36 16"
      stroke="url(#cyanGradient)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M32 12H40"
      stroke="url(#cyanGradient)"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const CaptureEmailIcon = ({ size = 48, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <defs>
      <linearGradient id="cyanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#22d3ee" />
        <stop offset="100%" stopColor="#2563eb" />
      </linearGradient>
    </defs>
    <rect x="6" y="12" width="36" height="24" rx="4" stroke="url(#cyanGradient)" strokeWidth="2" strokeLinecap="round" />
    <path
      d="M6 16L24 26L42 16"
      stroke="url(#cyanGradient)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="36" cy="34" r="6" fill="white" stroke="url(#cyanGradient)" strokeWidth="2" />
    <path
      d="M33 34L35 36L39 32"
      stroke="url(#cyanGradient)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const AutoReconciliationIcon = ({ size = 48, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <defs>
      <linearGradient id="cyanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#22d3ee" />
        <stop offset="100%" stopColor="#2563eb" />
      </linearGradient>
    </defs>
    <rect x="6" y="10" width="16" height="28" rx="4" stroke="url(#cyanGradient)" strokeWidth="2" strokeLinecap="round" />
    <path d="M10 18H18" stroke="url(#cyanGradient)" strokeWidth="2" strokeLinecap="round" />
    <path d="M10 24H18" stroke="url(#cyanGradient)" strokeWidth="2" strokeLinecap="round" />
    <path d="M10 30H18" stroke="url(#cyanGradient)" strokeWidth="2" strokeLinecap="round" />

    <rect x="26" y="10" width="16" height="28" rx="4" stroke="url(#cyanGradient)" strokeWidth="2" strokeLinecap="round" />
    <path d="M30 18H38" stroke="url(#cyanGradient)" strokeWidth="2" strokeLinecap="round" />
    <path d="M30 24H38" stroke="url(#cyanGradient)" strokeWidth="2" strokeLinecap="round" />
    <path d="M30 30H38" stroke="url(#cyanGradient)" strokeWidth="2" strokeLinecap="round" />

    <circle cx="24" cy="24" r="5" fill="white" stroke="url(#cyanGradient)" strokeWidth="2" />
    <path
      d="M22 24L23.5 25.5L26 23"
      stroke="url(#cyanGradient)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const RealTimeAlertsIcon = ({ size = 48, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <defs>
      <linearGradient id="cyanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#22d3ee" />
        <stop offset="100%" stopColor="#2563eb" />
      </linearGradient>
    </defs>
    <path
      d="M18 32C13.582 32 10 28.418 10 24C10 19.582 13.582 16 18 16C18.336 16 18.668 16.018 18.996 16.052C19.628 11.254 23.642 7.5 28.5 7.5C33.746 7.5 38 11.754 38 17C38 17.168 37.994 17.334 37.982 17.5C40.746 18.092 42.5 20.298 42.5 23C42.5 26.038 40.038 28.5 37 28.5"
      stroke="url(#cyanGradient)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M24 22V28"
      stroke="url(#cyanGradient)"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="24" cy="34" r="1.5" fill="url(#cyanGradient)" />
    <path
      d="M32 18L36 14M36 14L40 18M36 14V22"
      stroke="url(#cyanGradient)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const OperationalVisibilityIcon = ({ size = 48, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <defs>
      <linearGradient id="cyanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#22d3ee" />
        <stop offset="100%" stopColor="#2563eb" />
      </linearGradient>
    </defs>
    <circle cx="24" cy="24" r="12" stroke="url(#cyanGradient)" strokeWidth="2" strokeLinecap="round" />
    <circle cx="24" cy="24" r="5" stroke="url(#cyanGradient)" strokeWidth="2" strokeLinecap="round" />
    <path d="M24 12V8" stroke="url(#cyanGradient)" strokeWidth="2" strokeLinecap="round" />
    <path d="M24 40V36" stroke="url(#cyanGradient)" strokeWidth="2" strokeLinecap="round" />
    <path d="M12 24H8" stroke="url(#cyanGradient)" strokeWidth="2" strokeLinecap="round" />
    <path d="M40 24H36" stroke="url(#cyanGradient)" strokeWidth="2" strokeLinecap="round" />
    <circle cx="24" cy="24" r="2" fill="url(#cyanGradient)" />
  </svg>
);
