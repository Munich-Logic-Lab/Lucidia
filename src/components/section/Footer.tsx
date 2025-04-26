export default function Footer() {
  return (
    <footer className="border-t border-zinc-100 py-8">
      <div className="container mx-auto text-center">
        <div className="text-sm text-gray-500">
          © {new Date().getFullYear()} Lucidia
        </div>
      </div>
    </footer>
  );
}
