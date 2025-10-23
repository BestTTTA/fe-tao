"use client";
import TransparentHeader from "@/components/TransparentHeader";

export default function TermsPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start bg-cover bg-center text-white"
      style={{ backgroundImage: "url('/images/bg-stars.jpg')" }}
    >
      <TransparentHeader
        title="ข้อตกลงในการใช้งาน"
        subtitle=""
        routeRules={{
          "/menu/tnc": {
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
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer
            vehicula convallis purus, non condimentum risus aliquet nec.
            Suspendisse potenti.
          </p>
        </div>
      </div>
    </div>
  );
}
