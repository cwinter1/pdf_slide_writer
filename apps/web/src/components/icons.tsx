import type { SVGProps } from 'react';

const base = (props: SVGProps<SVGSVGElement>) => ({
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  ...props,
});

export function SaveIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
      <path d="M17 21v-8H7v8" />
      <path d="M7 3v5h8" />
    </svg>
  );
}

export function FolderIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M4 20h16a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-8.5L9 4H4a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1Z" />
    </svg>
  );
}

export function DownloadIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M12 3v12" />
      <path d="m7 11 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}

export function LogoutIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

export function GoogleDriveIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)} strokeWidth={0} fill="currentColor">
      <path d="M7.71 3.5 1 15l3.5 6 6.7-11.5L7.71 3.5Z" opacity={0.9} />
      <path d="M14.29 3.5h-6.6l6.7 11.5h6.6L14.29 3.5Z" opacity={0.7} />
      <path d="M4.5 21h15l3.29-6H8.21L4.5 21Z" opacity={0.85} />
    </svg>
  );
}
