interface VadaiIconProps {
  id: string;
  className?: string;
}

export default function VadaiIcon({ id, className }: VadaiIconProps) {
  const gId = `vg-${id}`;
  const eId = `ve-${id}`;

  return (
    <svg className={className} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <radialGradient id={gId} cx="38%" cy="32%" r="68%">
          <stop offset="0%"   stopColor="#F5C46A" />
          <stop offset="28%"  stopColor="#D4852A" />
          <stop offset="62%"  stopColor="#A85E1A" />
          <stop offset="100%" stopColor="#6B380A" />
        </radialGradient>
        <radialGradient id={eId} cx="50%" cy="50%" r="50%">
          <stop offset="52%"  stopColor="transparent" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.55)" />
        </radialGradient>
      </defs>

      {/* Main body */}
      <circle cx="40" cy="40" r="36" fill={`url(#${gId})`} />
      {/* Edge darkening for depth */}
      <circle cx="40" cy="40" r="36" fill={`url(#${eId})`} />

      {/* Outer ring texture — fried spots */}
      <circle cx="22" cy="30" r="2"   fill="rgba(70,25,5,0.42)" />
      <circle cx="30" cy="20" r="1.5" fill="rgba(70,25,5,0.36)" />
      <circle cx="43" cy="17" r="2"   fill="rgba(70,25,5,0.46)" />
      <circle cx="55" cy="23" r="1.5" fill="rgba(70,25,5,0.36)" />
      <circle cx="63" cy="35" r="2"   fill="rgba(70,25,5,0.42)" />
      <circle cx="64" cy="48" r="1.5" fill="rgba(70,25,5,0.36)" />
      <circle cx="58" cy="59" r="2"   fill="rgba(70,25,5,0.46)" />
      <circle cx="45" cy="65" r="1.5" fill="rgba(70,25,5,0.36)" />
      <circle cx="31" cy="63" r="2"   fill="rgba(70,25,5,0.42)" />
      <circle cx="20" cy="53" r="1.5" fill="rgba(70,25,5,0.36)" />
      <circle cx="16" cy="39" r="2"   fill="rgba(70,25,5,0.42)" />
      {/* Inner band texture */}
      <circle cx="29" cy="32" r="1.5" fill="rgba(70,25,5,0.28)" />
      <circle cx="51" cy="29" r="1.5" fill="rgba(70,25,5,0.28)" />
      <circle cx="55" cy="51" r="1.5" fill="rgba(70,25,5,0.28)" />
      <circle cx="32" cy="54" r="1.5" fill="rgba(70,25,5,0.28)" />
      <circle cx="37" cy="26" r="1"   fill="rgba(70,25,5,0.22)" />
      <circle cx="57" cy="42" r="1"   fill="rgba(70,25,5,0.22)" />
      <circle cx="26" cy="46" r="1"   fill="rgba(70,25,5,0.22)" />

      {/* Specular highlight — crispy sheen top-left */}
      <ellipse cx="28" cy="26" rx="9" ry="5.5"
        fill="rgba(255,215,120,0.38)"
        transform="rotate(-22 28 26)" />

      {/* Outer edge crispiness line */}
      <circle cx="40" cy="40" r="35.5" fill="none"
        stroke="rgba(90,40,5,0.35)" strokeWidth="1.5" />

      {/* Center hole */}
      <circle cx="40" cy="40" r="14" fill="#0c0c0c" />
      {/* Hole rim shadow */}
      <circle cx="40" cy="40" r="16" fill="none"
        stroke="rgba(0,0,0,0.45)" strokeWidth="3.5" />
      {/* Hole inner highlight — warm reflection from body */}
      <circle cx="40" cy="40" r="14" fill="none"
        stroke="rgba(160,85,18,0.45)" strokeWidth="1.2" />
    </svg>
  );
}
