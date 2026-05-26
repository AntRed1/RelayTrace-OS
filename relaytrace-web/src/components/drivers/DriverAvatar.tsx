export function DriverAvatar({
  name,
  size = 8,
}: {
  name: string;
  size?: number;
}) {
  return (
    <div
      className={`w-${size} h-${size} rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0`}
      style={{ background: "var(--rt-gradient)" }}
    >
      {name?.charAt(0).toUpperCase() ?? "?"}
    </div>
  );
}
