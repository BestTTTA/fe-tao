 วิธีจัดการคำขอลบบัญชีใน Supabase Dashboard

  1. ดูรายการคำขอลบบัญชี

  ไปที่ Table Editor > account_deletion_requests                                                                                                         


  ดูรายการที่ status = 'pending'                                                                                                                         


  2. เมื่อต้องการลบบัญชี User                                                                                                                            


  ขั้นตอนที่ 1: ไปที่ Authentication > Users                                                                                                             

  - ค้นหา user จาก user_id ที่อยู่ในคำขอ                                                                                                                 

  - กด Delete user (จะลบข้อมูลทั้งหมดที่เกี่ยวข้อง)                                                                                                      


  ขั้นตอนที่ 2: อัพเดทสถานะคำขอ                                                                                                                          

  - กลับไปที่ Table Editor > account_deletion_requests                                                                                                   

  - แก้ไข record:
  status: 'completed'
  processed_at: NOW()
  note: 'ลบบัญชีเรียบร้อยแล้ว'

  3. หากปฏิเสธคำขอ

  แก้ไข record:
  status: 'rejected'
  processed_at: NOW()
  note: 'เหตุผลที่ปฏิเสธ...'                                                                                                                             


  Status ที่ใช้                                                                                                                                          

  ┌───────────┬────────────────┐
  │  Status   │     ความหมาย     │
  ├───────────┼────────────────┤
  │ pending   │ รอดำเนินการ       │
  ├───────────┼────────────────┤
  │ approved  │ อนุมัติแล้ว (รอลบ) │
  ├───────────┼────────────────┤
  │ completed │ ลบเรียบร้อยแล้ว   │
  ├───────────┼────────────────┤
  │ rejected  │ ปฏิเสธคำขอ       │
  └───────────┴────────────────┘