# Lovepunch

เว็บแอปธีมความรักแบบหน้าเดียว (Single Page App) ที่มีหลายซีน เช่น Home, Rain, Hyper, Fingerprint, Love Letter และ Anniversary Popup.

## โครงสร้างโปรเจกต์

- `index.html` โครงหน้าและจุด mount ของทุกซีน
- `styles/` แยก CSS ตามบทบาท
  - `base.css` โครงหลัก
  - `components.css` คอมโพเนนต์ต่าง ๆ
  - `effects.css` แอนิเมชันและเอฟเฟกต์
- `scripts/` โค้ดแอปแบบแยกโมดูล
  - `app.js` จุดเริ่มต้นระบบ
  - `home.js`, `rain.js`, `finger.js`, `hyper.js` ฟีเจอร์หลักแต่ละหน้า
  - `anniversaryExperience.js` ฟลว์นับถอยหลัง + การ์ดวันครบรอบ
  - `effects.js` เอฟเฟกต์ interaction ตอนแตะ/คลิก
  - `siteTextContent.js` ศูนย์รวม “ข้อความหน้าเว็บ”
  - `clickEffectConfig.js` ศูนย์รวม “ค่าเอฟเฟกต์คลิก/อิโมจิ”

## วิธีรันโปรเจกต์

โปรเจกต์เป็น static web:

1. เปิดด้วย local server ใดก็ได้ (เช่น VSCode Live Server)
2. หรือใช้คำสั่งตัวอย่าง:

```bash
python -m http.server 8080
```

แล้วเปิด `http://localhost:8080`

---

## คู่มือแก้ “ข้อความทุกส่วน” จากไฟล์เดียว

แก้ที่ไฟล์: `scripts/siteTextContent.js`

### โครงสร้าง

```js
export const TEXT_CONTENT = {
  sections: {
    HOME_HERO_TAG: '...',
    ...
  }
};
```

### วิธีเพิ่มข้อความใหม่

1. ที่ `index.html` ใส่ `data-text-key="YOUR_KEY"` ให้ element ที่ต้องการ
2. ไปเพิ่ม `YOUR_KEY` ใน `TEXT_CONTENT.sections`
3. รีเฟรชหน้า ข้อความจะอัปเดตอัตโนมัติ

> ระบบเรียก `applySectionTexts()` ตอนบูตใน `scripts/app.js`

---

## คู่มือแก้เอฟเฟกต์คลิก/แตะจากไฟล์เดียว

แก้ที่ไฟล์: `scripts/clickEffectConfig.js`

### ค่าแก้ได้ทันที

- `cursorEmoji` อิโมจิเมาส์
- `particleEmojis` อิโมจิที่กระจายตอนคลิก
- `floatingMessages` ข้อความลอย
- `particleCount` จำนวนอนุภาค
- `particleDistance` ระยะกระจาย
- `particleDuration` ความยาวแอนิเมชัน
- `rippleDurationMs` เวลา ripple
- `messageChance` โอกาสสุ่มแสดงข้อความ

### หมายเหตุการรองรับอุปกรณ์

- ใช้ `pointerdown` รองรับทั้งเมาส์และสัมผัส
- cursor แบบอิโมจิแสดงเฉพาะอุปกรณ์ที่เป็น `pointer: fine` (desktop/laptop)
- มือถือยังเห็นอนุภาค + ripple + ข้อความลอยได้เหมือนกัน

---

## สรุปการแก้บั๊กการ์ดวันครบรอบไม่อยู่กึ่งกลาง

อาการ: การ์ด `.anniv-popup` บางครั้งไปเอียงเหมือนอยู่ล่างขวา (ชัดบนมือถือ)

สาเหตุจริง:
- keyframes `annivPopupRise` เขียน `transform` ทับค่า `translate(-50%, -50%)` ที่ใช้จัดกึ่งกลาง
- เมื่อ animation จบ ค่า `transform` ไม่เหลือ offset กึ่งกลาง ทำให้ตำแหน่งเพี้ยน

แนวทางแก้:
- ใส่ `translate(-50%, -50%)` อยู่ในทุกเฟรมของ `annivPopupRise`
- คงหลักการจัดกึ่งกลางไว้ทั้งระหว่างและหลัง animation

---

## แนวทางดูแลโค้ด

- โค้ด UI text ให้แก้ผ่าน `siteTextContent.js` ก่อนเสมอ
- โค้ดคลิกเอฟเฟกต์ให้แก้ผ่าน `clickEffectConfig.js` ก่อนเสมอ
- หลีกเลี่ยงแก้ selector ใน HTML โดยไม่ตรวจไฟล์ JS ที่อ้าง `id/class`
- ถ้าแก้ animation ที่มี `transform` ให้ตรวจว่าทับ transform layout หรือไม่

