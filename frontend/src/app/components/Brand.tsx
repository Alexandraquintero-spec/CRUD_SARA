import emblem from "@/assets/sara-emblem.png";

/*
 * Marca SARA: emblema original (gorro de chef, plato y cubiertos) + nombre.
 * tone="light" para fondos claros y tone="dark" para fondos de color.
 */
interface BrandProps {
  size?: "sm" | "md" | "lg";
  tone?: "light" | "dark";
  subtitle?: string;
  className?: string;
}

const SIZES = {
  sm: { img: "w-9 h-9", name: "text-lg", sub: "text-[10px]" },
  md: { img: "w-12 h-12", name: "text-2xl", sub: "text-xs" },
  lg: { img: "w-20 h-20", name: "text-4xl", sub: "text-sm" },
};

export default function Brand({ size = "sm", tone = "light", subtitle = "Gestión gastronómica", className = "" }: BrandProps) {
  const s = SIZES[size];
  const dark = tone === "dark";
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <span className={`${s.img} flex-none rounded-full ${dark ? "bg-white shadow-md p-0.5" : ""}`}>
        <img src={emblem} alt="Emblema de SARA" className="w-full h-full object-contain" />
      </span>
      <span className="leading-none">
        <span className={`block font-extrabold tracking-tight ${s.name}`}>
          <span style={{ color: dark ? "#ffffff" : "#2E8A00" }}>SA</span>
          <span style={{ color: dark ? "#FFC27A" : "#F27C00" }}>RA</span>
        </span>
        {subtitle && (
          <span className={`block mt-1 ${s.sub} ${dark ? "text-white/75" : "text-gray-500"}`}>{subtitle}</span>
        )}
      </span>
    </div>
  );
}
