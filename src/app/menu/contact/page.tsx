"use client";
import TransparentHeader from "@/components/TransparentHeader";

export default function ContactPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start bg-cover bg-center text-white"
      style={{ backgroundImage: "url('/images/bg-stars.jpg')" }}
    >
      <TransparentHeader
        title="ติดต่อเรา"
        subtitle=""
        routeRules={{
          "/menu/contact": {
            showBack: true,
            showLogo: false,
            showMenu: false,
            showSearch: false,
            backPath: "/menu",
          },
        }}
      />

      <div className="w-full max-w-md p-4 mt-20">
        <div className="bg-white/90 text-black rounded-xl p-5 shadow-lg space-y-3">
          <p className="font-semibold text-lg">บริษัท ดูดวงไม้ จำกัด</p>
          <p>
            27 ซอย อารีย์ 1 แขวงพญาไท เขตพญาไท
            <br />
            กรุงเทพมหานคร 10400
          </p>
          <p>
            โทรศัพท์: <span className="text-blue-500">00-000-0000</span>
          </p>
          <p>
            อีเมล:{" "}
            <a href="mailto:my-email@gmail.com" className="text-blue-500">
              my-email@gmail.com
            </a>
          </p>
          <p>ติดตามเราทางโซเชียลมีเดีย:</p>
          <div className="flex gap-3 text-xl">
            <a href="#">
              <i className="fa-brands fa-facebook text-blue-600" />
            </a>
            <a href="#">
              <i className="fa-brands fa-instagram text-pink-500" />
            </a>
            <a href="#">
              <i className="fa-brands fa-tiktok text-black" />
            </a>
            <a href="#">
              <i className="fa-brands fa-line text-green-500" />
            </a>
            <a href="#">
              <i className="fa-brands fa-youtube text-red-500" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
