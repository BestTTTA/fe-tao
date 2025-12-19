"use client";
import TransparentHeader from "@/components/TransparentHeader";

export default function TermsPage() {
  return (
    <div className="relative min-h-screen">
      <TransparentHeader
        title="ข้อตกลงและเงื่อนไข"
        subtitle="Terms of Service"
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

      {/* Background gradient */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-slate-900 via-violet-900/40 to-slate-950" />

      <div className="mx-auto max-w-3xl px-4 pt-24 pb-12">
        <div className="rounded-2xl bg-white/95 shadow-2xl backdrop-blur">
          {/* Header */}
          <div className="border-b border-slate-200 p-6">
            <h1 className="text-2xl font-bold text-slate-900">
              ข้อตกลงและเงื่อนไขการใช้งาน
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Terms of Service
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-slate max-w-none p-6">
            <div className="mb-8">
              <p className="text-slate-700 leading-relaxed mb-4">
                ยินดีต้อนรับสู่แอปพลิเคชัน <strong>Tarot &amp; Oracle by Nimit</strong> และเว็บไซต์{" "}
                <a href="https://www.nimittarot.com" className="text-violet-600 hover:underline">
                  www.nimittarot.com
                </a>{" "}
                ของ <strong>บริษัท สำนักพิมพ์นิมิต จำกัด</strong> (&quot;บริษัท&quot;, &quot;เรา&quot;, หรือ &quot;ของเรา&quot;)
              </p>
              <p className="text-slate-700 leading-relaxed mb-4">
                กรุณาอ่านข้อตกลงและเงื่อนไขการใช้งานเหล่านี้ (&quot;ข้อตกลง&quot;) โดยละเอียดก่อนเข้าใช้งานแอปพลิเคชัน
                การที่ท่านดาวน์โหลด ติดตั้ง หรือเข้าใช้งานแอปพลิเคชันนี้ ถือว่าท่านได้อ่าน เข้าใจ และตกลงที่จะผูกพันตามข้อตกลงฉบับนี้ทุกประการ
                หากท่านไม่ยอมรับข้อตกลงเหล่านี้ กรุณายุติการใช้งานทันที
              </p>
            </div>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                1. ขอบเขตการให้บริการ
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                แอปพลิเคชันนี้ให้บริการดูดวงออนไลน์ผ่านไพ่ทาโรต์และออราเคิล ภายใต้รูปแบบการให้บริการดังนี้:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 mb-4">
                <li>
                  <strong>ผู้ใช้งานทั่วไป (Free User):</strong> สามารถเข้าใช้งานไพ่ชุดมาตรฐานได้ฟรีตามจำนวนที่กำหนด
                </li>
                <li>
                  <strong>สมาชิกวีไอพี (VIP Subscription):</strong> สามารถเข้าถึงไพ่ทุกชุดที่มีในระบบ (All Access)
                  รวมถึงไพ่ชุดใหม่ที่จะเพิ่มเข้ามาในอนาคต พร้อมฟีเจอร์พิเศษอื่นๆ
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                2. บัญชีผู้ใช้งานและการรักษาความปลอดภัย
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                <strong>2.1 การลงทะเบียน:</strong> ท่านอาจจำเป็นต้องสมัครสมาชิกหรือเข้าสู่ระบบผ่านบัญชีโซเชียลมีเดีย
                (Facebook, Google, Line, Apple ID) หรือ E-Mail เพื่อเข้าใช้งานฟีเจอร์บางอย่าง
              </p>
              <p className="text-slate-700 leading-relaxed mb-4">
                <strong>2.2 ความรับผิดชอบ:</strong> ท่านมีหน้าที่รักษาความลับของรหัสผ่านและบัญชีของท่าน
                และต้องรับผิดชอบต่อกิจกรรมทั้งหมดที่เกิดขึ้นภายใต้บัญชีของท่าน
              </p>
              <p className="text-slate-700 leading-relaxed mb-4">
                <strong>2.3 อายุผู้ใช้งาน:</strong> บริการนี้เหมาะสำหรับผู้ใช้งานที่มีอายุ 17 ปีขึ้นไป
                (ตามเกณฑ์มาตรฐานของ App Store) กรณีผู้ใช้งานมีอายุต่ำกว่า 18 ปี
                ควรได้รับคำแนะนำจากผู้ปกครองก่อนการสมัครสมาชิก VIP
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                3. การสมัครสมาชิก VIP และการชำระเงิน
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                <strong>3.1 แพ็กเกจสมาชิก:</strong> เราให้บริการสมาชิกแบบ <strong>ต่ออายุอัตโนมัติ (Auto-renewable Subscription)</strong>
                ทั้งแบบรายเดือนและรายปี
              </p>
              <div className="mb-4">
                <p className="text-slate-700 font-bold mb-2">3.2 การทดลองใช้งานฟรี (Free Trial):</p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                  <li>หากท่านได้รับสิทธิ์ทดลองใช้งานฟรี เมื่อสิ้นสุดระยะเวลาทดลองใช้ ระบบจะทำการ <strong>ตัดเงินและต่ออายุสมาชิกโดยอัตโนมัติ</strong> ตามแพ็กเกจที่ท่านเลือก</li>
                  <li>หากไม่ต้องการถูกเรียกเก็บเงิน ท่านต้องทำการยกเลิกอย่างน้อย 24 ชั่วโมงก่อนหมดช่วงทดลองใช้</li>
                </ul>
              </div>
              <p className="text-slate-700 leading-relaxed mb-4">
                <strong>3.3 การชำระเงิน:</strong> ค่าบริการจะถูกเรียกเก็บผ่านบัญชี Apple ID หรือ Google Play Store ของท่านเมื่อยืนยันการสั่งซื้อ
              </p>
              <div className="mb-4">
                <p className="text-slate-700 font-bold mb-2">3.4 การต่ออายุและการยกเลิก:</p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                  <li>การเป็นสมาชิกจะถูกต่ออายุโดยอัตโนมัติ ภายใน 24 ชั่วโมงก่อนสิ้นสุดรอบบิลปัจจุบัน</li>
                  <li>ท่านสามารถ <strong>&quot;ยกเลิกการต่ออายุ&quot;</strong> ได้ตลอดเวลาที่เมนู &quot;การตั้งค่าสมาชิก&quot; (Subscription Settings) บน Apple ID หรือ Google Play Store</li>
                </ul>
              </div>
              <p className="text-slate-700 leading-relaxed mb-4">
                <strong>3.5 การคืนเงิน (Refund):</strong> การขอคืนเงินจะเป็นไปตามนโยบายและดุลยพินิจของ Apple หรือ Google
                ทางบริษัทไม่สามารถดำเนินการคืนเงินโดยตรงผ่านระบบได้
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                4. สิทธิ์การใช้งานและทรัพย์สินทางปัญญา (License &amp; Copyright)
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                <strong>4.1 ความเป็นเจ้าของลิขสิทธิ์:</strong> รูปภาพไพ่ทาโรต์ ไพ่ออราเคิล กราฟิก คู่มือ ข้อความคำทำนาย
                และองค์ประกอบทั้งหมดภายในแอปพลิเคชัน เป็นลิขสิทธิ์ของ <strong>บริษัท สำนักพิมพ์นิมิต จำกัด</strong> แต่เพียงผู้เดียว
              </p>
              <div className="mb-4">
                <p className="text-slate-700 font-bold mb-2">4.2 การอนุญาตให้ใช้งาน (Grant of License):</p>
                <p className="text-slate-700 mb-2">บริษัทอนุญาตให้ท่านใช้งานแอปพลิเคชันภายใต้เงื่อนไขดังนี้:</p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                  <li>
                    <strong>การใช้งานส่วนบุคคล (Personal Use):</strong> ท่านสามารถใช้แอปพลิเคชันเพื่อดูดวงให้ตนเอง ครอบครัว หรือเพื่อนได้
                  </li>
                  <li>
                    <strong>การใช้งานเชิงวิชาชีพ (Professional Use):</strong> ท่าน<strong>สามารถ</strong>นำแอปพลิเคชันไปใช้เป็นเครื่องมือประกอบวิชาชีพพยากรณ์
                    (ดูดวงให้ลูกค้า) หรือใช้เป็นสื่อการสอนได้ โดยอนุญาตให้แสดงหน้าจอแอปพลิเคชัน (Show Screen) ให้แก่ลูกค้าหรือผู้เรียนดูได้
                  </li>
                </ul>
              </div>
              <div className="mb-4">
                <p className="text-slate-700 font-bold mb-2 text-red-600">4.3 ข้อห้าม (Restrictions):</p>
                <p className="text-slate-700 mb-2">เพื่อให้เป็นไปตามกฎหมายลิขสิทธิ์ ท่าน <strong>ห้าม</strong> กระทำการดังต่อไปนี้:</p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                  <li>ห้ามคัดลอก ดัดแปลง แยกไฟล์รูปภาพ (Extract Assets) หรือแคปหน้าจอเพื่อนำรูปภาพไพ่ไปผลิตจำหน่าย แจกจ่าย หรือพิมพ์ขาย (Physical Reproduction)</li>
                  <li>ห้ามนำแอปพลิเคชันไปทำวิศวกรรมย้อนกลับ (Reverse Engineer) หรือสร้างแอปพลิเคชันลอกเลียนแบบ</li>
                  <li>ห้ามนำบัญชีสมาชิก VIP ของท่านไปแชร์ให้ผู้อื่นใช้งานในลักษณะหารบัญชี (Account Sharing)</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                5. เนื้อหาคำทำนายและการใช้ AI
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                <strong>5.1 ลักษณะเนื้อหา:</strong> คำทำนายในแอปพลิเคชันเป็นการประมวลผลจากฐานข้อมูลคู่มือไพ่ และ/หรือ
                การประมวลผลร่วมกับเทคโนโลยีปัญญาประดิษฐ์ (AI) เพื่อสรุปความหมายให้สอดคล้องกับคำถาม
              </p>
              <p className="text-slate-700 leading-relaxed mb-4">
                <strong>5.2 ข้อจำกัดความรับผิดชอบ:</strong> เนื้อหาคำทำนายจัดทำขึ้นเพื่อความบันเทิงและเป็นแนวทางทางใจ
                (Belief &amp; Entertainment purposes only) บริษัทไม่รับประกันความแม่นยำของคำทำนายไม่ว่ากรณีใดๆ
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                6. ข้อจำกัดความรับผิดชอบ (Disclaimer)
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                บริษัทจะไม่รับผิดชอบต่อความเสียหายใดๆ ทั้งทางตรงและทางอ้อม ที่เกิดจากการใช้งานแอปพลิเคชัน
                หรือเกิดจากการตัดสินใจของท่านที่อ้างอิงจากผลการทำนาย ท่านควรใช้วิจารณญาณในการรับข้อมูล
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                7. การเปลี่ยนแปลงข้อตกลง
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                บริษัทขอสงวนสิทธิ์ในการแก้ไขหรือเปลี่ยนแปลงข้อตกลงเหล่านี้ได้ตามความเหมาะสม โดยจะประกาศให้ทราบผ่านทางแอปพลิเคชันหรือเว็บไซต์
                การที่ท่านใช้งานแอปพลิเคชันต่อไปหลังการเปลี่ยนแปลง ถือว่าท่านยอมรับข้อตกลงฉบับใหม่
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                8. กฎหมายที่ใช้บังคับและการระงับข้อพิพาท
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                <strong>8.1 กฎหมายที่ใช้บังคับ:</strong> ข้อตกลงนี้อยู่ภายใต้บังคับและการตีความตาม
                <strong>กฎหมายของราชอาณาจักรไทย</strong> โดยไม่คำนึงถึงหลักการขัดกันของกฎหมาย (Conflict of Laws principles)
              </p>
              <p className="text-slate-700 leading-relaxed mb-4">
                <strong>8.2 การเจรจาไกล่เกลี่ย:</strong> หากเกิดข้อพิพาทใดๆ ขึ้นจากการใช้งานแอปพลิเคชัน
                ท่านตกลงที่จะติดต่อบริษัทเพื่อพยายามเจรจาหาข้อยุติอย่างฉันมิตร (Amicable Negotiation) เป็นเวลาอย่างน้อย 30 วัน
                ก่อนที่จะดำเนินการทางกฎหมายใดๆ
              </p>
              <p className="text-slate-700 leading-relaxed mb-4">
                <strong>8.3 เขตอำนาจศาล:</strong> หากไม่สามารถหาข้อยุติได้ ท่านตกลงให้ข้อพิพาทนั้นอยู่ภายใต้เขตอำนาจของ
                <strong>ศาลในราชอาณาจักรไทยแต่เพียงผู้เดียว</strong> (Exclusive Jurisdiction of Thai Courts)
              </p>
              <p className="text-slate-700 leading-relaxed mb-4">
                <strong>8.4 ภาษาที่ใช้บังคับ:</strong> ในกรณีที่มีการแปลข้อตกลงนี้เป็นภาษาอื่นนอกจากภาษาไทย และเกิดความขัดแย้งในความหมาย
                ให้ยึดถือข้อความใน<strong>ฉบับภาษาไทย</strong>เป็นหลักในการตีความ
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                9. การติดต่อ
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                หากท่านมีข้อสงสัยเกี่ยวกับเงื่อนไขการใช้งาน หรือต้องการแจ้งปัญหาการใช้งาน สามารถติดต่อเราได้ที่:
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
