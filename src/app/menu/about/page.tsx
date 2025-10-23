"use client";
import TransparentHeader from "@/components/TransparentHeader";

export default function AboutPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start bg-cover bg-center text-white"
      style={{ backgroundImage: "url('/images/bg-stars.jpg')" }}
    >
      <TransparentHeader
        title="เกี่ยวกับเรา"
        subtitle=""
        routeRules={{
          "/menu/about": {
            showBack: true,
            showLogo: false,
            showMenu: false,
            showSearch: false,
            backPath: "/menu",
          },
        }}
      />

      <div className="w-full max-w-md p-4 mt-20">
        <div className="bg-white/90 text-black rounded-xl p-5 shadow-lg">
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris
            imperdiet placerat sagittis. Vestibulum suscipit erat non enim
            rutrum pharetra. Etiam sollicitudin nulla a iaculis semper.
          </p>
        </div>
      </div>
    </div>
  );
}
