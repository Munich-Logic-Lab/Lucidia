export default function Footer() {
  return (
    <footer className="border-t border-zinc-100 py-4">
      <div className="container mx-auto text-center">
        <div className="flex items-center justify-center gap-1 text-sm text-gray-500">
          <span>© {new Date().getFullYear()} Lucidia</span>
          <span className="mx-2">|</span>
          <span className="flex items-center">
            Made with 🤍 during the TUM.ai Makeathon in Munich
          </span>
        </div>
      </div>
    </footer>
  );
}
