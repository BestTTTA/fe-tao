"use client";
import TransparentHeader from "@/components/TransparentHeader";

export default function PolicyPage() {
  return (
    <div className="relative min-h-screen">
      <TransparentHeader
        title="นโยบายความเป็นส่วนตัว"
        subtitle="Privacy Policy"
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

      {/* Background gradient */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-slate-900 via-violet-900/40 to-slate-950" />

      <div className="mx-auto max-w-3xl px-4 pt-24 pb-12">
        <div className="rounded-2xl bg-white/95 shadow-2xl backdrop-blur">
          {/* Header */}
          <div className="border-b border-slate-200 p-6">
            <h1 className="text-2xl font-bold text-slate-900">
              นโยบายความเป็นส่วนตัว
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Privacy Policy
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-slate max-w-none p-6">
            <div className="mb-8">
              <p className="text-slate-700 leading-relaxed mb-4">
                <strong>บริษัท สำนักพิมพ์นิมิต จำกัด</strong> (&quot;บริษัท&quot;, &quot;เรา&quot;, หรือ &quot;ของเรา&quot;)
                ผู้ให้บริการแอปพลิเคชันและเว็บไซต์{" "}
                <a href="https://www.nimittarot.com" className="text-violet-600 hover:underline">
                  www.nimittarot.com
                </a>{" "}
                ตระหนักถึงความสำคัญของการคุ้มครองข้อมูลส่วนบุคคลของท่าน
                เราจึงได้จัดทำนโยบายความเป็นส่วนตัวฉบับนี้ขึ้น เพื่อชี้แจงให้ท่านทราบถึงรายละเอียดเกี่ยวกับการเก็บรวบรวม ใช้ เปิดเผย
                และบริหารจัดการข้อมูลส่วนบุคคลของท่าน ให้สอดคล้องกับพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)
              </p>
            </div>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                1. ข้อมูลส่วนบุคคลที่เราเก็บรวบรวม
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                เราเก็บรวบรวมข้อมูลของท่านเท่าที่จำเป็นต่อการให้บริการ โดยแบ่งเป็นประเภทดังนี้:
              </p>

              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-800 mb-2">1.1 ข้อมูลที่ระบุตัวตนและข้อมูลการติดต่อ</h3>
                <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4">
                  <li>ชื่อ-นามสกุล หรือ ชื่อเล่น</li>
                  <li>ที่อยู่อีเมล (Email Address)</li>
                  <li>รูปถ่ายโปรไฟล์ (Profile Picture)</li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-800 mb-2">1.2 ข้อมูลส่วนบุคคลที่มีความอ่อนไหว (Sensitive Data) เพื่อการพยากรณ์</h3>
                <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4">
                  <li>วัน เดือน ปีเกิด</li>
                  <li>เวลาตกฟาก (เวลาเกิด)</li>
                </ul>
                <p className="text-slate-600 italic mt-2 ml-4 text-sm">
                  หมายเหตุ: ข้อมูลนี้จะถูกนำไปใช้เพื่อการคำนวณและประมวลผลคำทำนายตามหลักโหราศาสตร์และการเปิดไพ่เท่านั้น
                  เราจะเก็บรักษาข้อมูลนี้เป็นความลับสูงสุด
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-800 mb-2">1.3 ข้อมูลประวัติการใช้งาน (Usage Data)</h3>
                <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4">
                  <li>
                    <strong>ประวัติการเปิดไพ่ (History):</strong> ระบบจะบันทึกหน้าไพ่ที่ท่านเปิดได้, คำถามที่ท่านตั้งจิต, และผลคำทำนาย
                    เพื่อให้ท่านสามารถย้อนกลับมาดูประวัติได้
                  </li>
                  <li>
                    <strong>รูปภาพที่บันทึก:</strong> กรณีท่านใช้ฟีเจอร์บันทึกรูปหน้าไพ่ (Save Image)
                    ไฟล์ภาพอาจถูกจัดเก็บในอุปกรณ์ของท่านหรือบนระบบคลาวด์ของเรา
                  </li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-800 mb-2">1.4 ข้อมูลทางเทคนิคและอุปกรณ์</h3>
                <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4">
                  <li>ข้อมูลการเข้าสู่ระบบผ่าน Social Media (Facebook, Google, Line, Apple ID)</li>
                  <li>ข้อมูลการเข้าสู่ระบบผ่าน E-Mail</li>
                  <li>หมายเลขระบุอุปกรณ์ (Device ID), รุ่นของอุปกรณ์, ระบบปฏิบัติการ</li>
                  <li>ข้อมูล Log Files และ Cookies เมื่อท่านเข้าใช้งานผ่านเว็บไซต์</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                2. วัตถุประสงค์ในการเก็บรวบรวมและใช้ข้อมูล
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                เราประมวลผลข้อมูลของท่านเพื่อวัตถุประสงค์ดังต่อไปนี้:
              </p>

              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-800 mb-2">2.1 เพื่อการให้บริการหลัก</h3>
                <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4">
                  <li>เพื่อให้ท่านสามารถเปิดไพ่ ดูดวง และอ่านคำทำนายได้ตามฟีเจอร์ของแอปพลิเคชัน</li>
                  <li>เพื่อยืนยันตัวตน (Authentication) ในการเข้าสู่ระบบ</li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-800 mb-2">2.2 เพื่อการจัดการสมาชิก (Subscription)</h3>
                <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4">
                  <li>เพื่อตรวจสอบสถานะสมาชิก VIP, วันหมดอายุสมาชิก และสิทธิ์ในการเข้าถึงไพ่ชุดพิเศษ</li>
                  <li>เพื่อจัดการช่วงทดลองใช้งานฟรี (Free Trial)</li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-800 mb-2">2.3 เพื่อการพัฒนาด้วยปัญญาประดิษฐ์ (AI Development)</h3>
                <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4">
                  <li>ในบางฟีเจอร์ เราอาจใช้เทคโนโลยีปัญญาประดิษฐ์ (AI) เพื่อช่วยสรุปความหมายของไพ่ให้สอดคล้องกับบริบทคำถามของท่าน</li>
                  <li>ข้อมูลที่ส่งไปประมวลผลจะเป็นข้อมูลบริบทหน้าไพ่ โดยไม่มีการส่งข้อมูลระบุตัวตนของท่านไปยังระบบ AI ภายนอก</li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-800 mb-2">2.4 เพื่อการสื่อสารและการแจ้งเตือน</h3>
                <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4">
                  <li>ส่งการแจ้งเตือน (Push Notifications) เช่น ดวงรายวัน หรือข่าวสารสำคัญ (ท่านสามารถปิดการแจ้งเตือนได้ที่เมนูตั้งค่าในอุปกรณ์)</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                3. การชำระเงินและธุรกรรมทางการเงิน
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                บริษัท <strong>ไม่มีการจัดเก็บ</strong> ข้อมูลบัตรเครดิตหรือข้อมูลทางการเงินของท่านโดยตรง
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                <li>
                  การชำระเงินค่าบริการสมาชิก VIP จะดำเนินการผ่านระบบ <strong>In-App Purchase</strong> ของ{" "}
                  <strong>Apple App Store</strong> หรือ <strong>Google Play Store</strong>
                </li>
                <li>ความปลอดภัยของข้อมูลการชำระเงินจะเป็นไปตามมาตรฐานสากลของ Apple และ Google</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                4. การเปิดเผยข้อมูลและการส่งต่อข้อมูล
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                เราจะไม่เปิดเผยข้อมูลส่วนบุคคลของท่านแก่บุคคลภายนอก เว้นแต่ในกรณีดังนี้:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                <li><strong>ผู้ให้บริการระบบ Cloud และ Server:</strong> เพื่อการจัดเก็บฐานข้อมูลที่ปลอดภัย</li>
                <li>
                  <strong>ผู้ให้บริการวิเคราะห์ข้อมูล (Analytics):</strong> เช่น Google Analytics หรือ Firebase
                  เพื่อช่วยเราวิเคราะห์ประสิทธิภาพแอปพลิเคชัน (ในรูปแบบข้อมูลภาพรวมที่ไม่ระบุตัวตน)
                </li>
                <li><strong>ข้อบังคับทางกฎหมาย:</strong> เมื่อได้รับการร้องขอจากหน่วยงานราชการที่มีอำนาจตามกฎหมาย</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                5. คุกกี้ (Cookies) และเทคโนโลยีติดตาม
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                สำหรับเว็บไซต์{" "}
                <a href="https://www.nimittarot.com" className="text-violet-600 hover:underline">
                  www.nimittarot.com
                </a>{" "}
                เรามีการใช้คุกกี้เพื่อจดจำการตั้งค่าและวิเคราะห์พฤติกรรมการเยี่ยมชมเว็บไซต์ เพื่อปรับปรุงประสบการณ์การใช้งานของท่าน
                ท่านสามารถตั้งค่าเบราว์เซอร์เพื่อปฏิเสธคุกกี้ได้ แต่อาจส่งผลต่อการทำงานบางส่วนของเว็บไซต์
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                6. ระยะเวลาในการเก็บรักษาข้อมูล
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                เราจะเก็บรักษาข้อมูลส่วนบุคคลของท่านตราบเท่าที่ท่านยังคงมีบัญชีผู้ใช้งานอยู่ในระบบ
              </p>
              <p className="text-slate-700 leading-relaxed mb-4">
                หากท่านทำการ <strong>ลบบัญชี (Delete Account)</strong> ข้อมูลของท่านจะถูกลบออกจากฐานข้อมูลหลักของเราภายใน{" "}
                <strong>90 วัน</strong> หรือตามระยะเวลาที่กฎหมายกำหนด
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                7. ข้อมูลเกี่ยวกับผู้เยาว์
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                แอปพลิเคชันนี้อาจมีเนื้อหาเกี่ยวกับความเชื่อและการพยากรณ์ ซึ่งจัดอยู่ในหมวดหมู่สำหรับผู้ที่มีอายุ{" "}
                <strong>17 ปีขึ้นไป</strong> (ตามเกณฑ์ของ App Store)
              </p>
              <p className="text-slate-700 leading-relaxed mb-4">
                เราไม่มีเจตนาเก็บรวบรวมข้อมูลจากเด็กอายุต่ำกว่า 13 ปี หากเราตรวจพบ เราจะดำเนินการลบข้อมูลดังกล่าวทันที
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                8. สิทธิของเจ้าของข้อมูลส่วนบุคคล
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">ท่านมีสิทธิตามกฎหมาย PDPA ดังนี้:</p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                <li><strong>สิทธิในการขอเข้าถึง:</strong> ขอตรวจสอบข้อมูลส่วนตัวและประวัติการดูดวงของท่าน</li>
                <li>
                  <strong>สิทธิในการลบข้อมูล (Right to be Forgotten):</strong> ท่านสามารถกดเมนู &quot;ลบบัญชีผู้ใช้&quot;
                  ภายในแอปพลิเคชันได้ด้วยตนเองตลอดเวลา
                </li>
                <li>
                  <strong>สิทธิในการระงับ/คัดค้าน:</strong> ท่านสามารถยกเลิกการรับข่าวสาร หรือระงับการประมวลผลข้อมูลบางส่วนได้
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                9. ช่องทางการติดต่อ
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                หากท่านมีข้อสงสัยเกี่ยวกับนโยบายความเป็นส่วนตัว หรือต้องการใช้สิทธิเกี่ยวกับข้อมูลของท่าน
                สามารถติดต่อเจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคล (DPO) ของเราได้ที่:
              </p>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-slate-700 font-bold">บริษัท สำนักพิมพ์นิมิต จำกัด</p>
                <p className="text-slate-700">
                  เว็บไซต์:{" "}
                  <a href="https://www.nimittarot.com" className="text-violet-600 hover:underline">
                    www.nimittarot.com
                  </a>
                </p>
                <p className="text-slate-700">
                  อีเมล:{" "}
                  <a href="mailto:nimit.publishing@gmail.com" className="text-violet-600 hover:underline">
                    nimit.publishing@gmail.com
                  </a>
                </p>
              </div>
            </section>

            {/* Footer */}
            <div className="mt-12 pt-6 border-t border-slate-200">
              <p className="text-sm text-slate-500 text-center">
                อัพเดทล่าสุด: {new Date().toLocaleDateString('th-TH', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom indicator */}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40">
        <div className="pointer-events-auto mx-auto h-1 w-24 rounded-full bg-white/30" />
      </div>
    </div>
  );
}
