import Image from "next/image";

export default function Logo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative h-6 w-6">
        <Image
          src="/icons/logo.svg"
          alt="Lucidia Logo"
          fill
          sizes="100%"
          className="object-contain"
          priority
        />
      </div>
      <span className="text-lg font-medium tracking-wider text-[#394149] uppercase">
        Lucidia
      </span>
    </div>
  );
}
