import Image from "next/image";

export default function Logo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative flex items-center">
        <Image
          src="/icons/logo.svg"
          alt="Lucidia Logo"
          sizes="100%"
          className="object-contain"
          priority
          height={45}
          width={45}
        />
      </div>
      <span className="flex items-center text-[18px] leading-[23px] font-bold tracking-[1.08px] uppercase">
        Lucidia
      </span>
    </div>
  );
}
