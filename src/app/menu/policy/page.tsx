"use client";
import TransparentHeader from "@/components/TransparentHeader";

export default function PolicyPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start bg-cover bg-center text-white"
      style={{ backgroundImage: "url('/images/bg-stars.jpg')" }}
    >
      <TransparentHeader
        title="นโยบายความเป็นส่วนตัว"
        subtitle=""
        routeRules={{
          "/menu/policy": {
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
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam arcu
            libero, vestibulum vel ipsum quis, pellentesque iaculis nisi.
          </p>
        </div>
      </div>
    </div>
  );
}
