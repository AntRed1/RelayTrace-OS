import { SVGProps } from 'react';

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

const gradientId = 'relayTraceGradient';

export const GradientDef = () => (
  <defs>
    <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#22d3ee" />
      <stop offset="100%" stopColor="#2563eb" />
    </linearGradient>
  </defs>
);

export const DashboardIcon = ({ size = 48, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <GradientDef />
    <rect x="8" y="8" width="14" height="14" rx="4" stroke={`url(#${gradientId})`} strokeWidth="2" strokeLinecap="round" />
    <rect x="26" y="8" width="14" height="14" rx="4" stroke={`url(#${gradientId})`} strokeWidth="2" strokeLinecap="round" />
    <rect x="8" y="26" width="14" height="14" rx="4" stroke={`url(#${gradientId})`} strokeWidth="2" strokeLinecap="round" />
    <rect x="26" y="26" width="14" height="14" rx="4" stroke={`url(#${gradientId})`} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const TripsIcon = ({ size = 48, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <GradientDef />
    <rect x="10" y="10" width="28" height="28" rx="6" stroke={`url(#${gradientId})`} strokeWidth="2" strokeLinecap="round" />
    <path
      d="M10 20C10 16.686 12.686 14 16 14H32C35.314 14 38 16.686 38 20"
      stroke={`url(#${gradientId})`}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M22 10V38"
      stroke={`url(#${gradientId})`}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="36" cy="28" r="5" stroke={`url(#${gradientId})`} strokeWidth="2" />
    <path
      d="M36 23V28L39 31"
      stroke={`url(#${gradientId})`}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const PeopleIcon = ({ size = 48, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <GradientDef />
    <circle cx="19" cy="15" r="6" stroke={`url(#${gradientId})`} strokeWidth="2" strokeLinecap="round" />
    <path
      d="M7 40C7 33.373 12.373 28 19 28C25.627 28 31 33.373 31 40"
      stroke={`url(#${gradientId})`}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="33" cy="13" r="5" stroke={`url(#${gradientId})`} strokeWidth="2" strokeLinecap="round" />
    <path
      d="M34 28C38.418 28 42 31.582 42 36V40"
      stroke={`url(#${gradientId})`}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const OCRProcessingIcon = ({ size = 48, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <GradientDef />
    <path
      d="M14 6C11.791 6 10 7.791 10 10V38C10 40.209 11.791 42 14 42H34C36.209 42 38 40.209 38 38V16L28 6H14Z"
      stroke={`url(#${gradientId})`}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M28 6V14C28 15.105 28.895 16 30 16H38"
      stroke={`url(#${gradientId})`}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 24H24"
      stroke={`url(#${gradientId})`}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M16 30H22"
      stroke={`url(#${gradientId})`}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <rect x="26" y="24" width="12" height="12" rx="6" stroke={`url(#${gradientId})`} strokeWidth="2" strokeLinecap="round" />
    <path
      d="M29 27L33 31M33 27L29 31"
      stroke={`url(#${gradientId})`}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const ReconciliationIcon = ({ size = 48, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <GradientDef />
    <circle cx="24" cy="24" r="16" stroke={`url(#${gradientId})`} strokeWidth="2" strokeLinecap="round" />
    <path
      d="M15 24L20.5 29.5L33 17"
      stroke={`url(#${gradientId})`}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const OnboardingIcon = ({ size = 48, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <GradientDef />
    <path
      d="M6 24H34"
      stroke={`url(#${gradientId})`}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M28 18L34 24L28 30"
      stroke={`url(#${gradientId})`}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="38" cy="12" r="4" fill={`url(#${gradientId})`} />
    <circle cx="38" cy="24" r="4" stroke={`url(#${gradientId})`} strokeWidth="2" />
    <circle cx="38" cy="36" r="4" stroke={`url(#${gradientId})`} strokeWidth="2" opacity="0.4" />
  </svg>
);

export const PlansIcon = ({ size = 48, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <GradientDef />
    <rect x="6" y="18" width="12" height="24" rx="4" stroke={`url(#${gradientId})`} strokeWidth="2" strokeLinecap="round" />
    <rect x="18" y="12" width="12" height="30" rx="4" stroke={`url(#${gradientId})`} strokeWidth="2" strokeLinecap="round" />
    <rect x="30" y="6" width="12" height="36" rx="4" stroke={`url(#${gradientId})`} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const AuditLogIcon = ({ size = 48, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <GradientDef />
    <rect
      x="10"
      y="6"
      width="28"
      height="36"
      rx="6"
      stroke={`url(#${gradientId})`}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="17" cy="16" r="2.5" fill={`url(#${gradientId})`} />
    <path d="M24 16H34" stroke={`url(#${gradientId})`} strokeWidth="2" strokeLinecap="round" />
    <circle cx="17" cy="24" r="2.5" fill={`url(#${gradientId})`} />
    <path d="M24 24H34" stroke={`url(#${gradientId})`} strokeWidth="2" strokeLinecap="round" />
    <circle cx="17" cy="32" r="2.5" fill={`url(#${gradientId})`} />
    <path d="M24 32H34" stroke={`url(#${gradientId})`} strokeWidth="2" strokeLinecap="round" />
  </svg>
);
