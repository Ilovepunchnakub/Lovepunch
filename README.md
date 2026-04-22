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


---

## วิธีปรับ “กรอบสวิตช์โปรไฟล์” และ “ขนาดตัวสวิตช์หัวใจ”

แก้ที่ไฟล์ `styles/mobile-ux.css` กลุ่มคลาสต่อไปนี้:

- `.profile-toggle-wrap` = กรอบสวิตช์
- `.profile-toggle-heart` = ตำแหน่ง/ขนาดตัวหัวใจ
- `.profile-toggle-heart .round` = ปุ่มวงกลมตรงกลาง
- `.profile-toggle-heart::after` และ `.profile-toggle-heart .bottom` = ส่วนเส้นโค้งของหัวใจ

### ค่าที่ใช้ปรับกรอบโดยตรง

- `width`, `height` → ขนาดกรอบ
- `border-radius` → ความมน
- `background`, `border`, `box-shadow` → โทน Soft UI
- `overflow: hidden` → กันชิ้นส่วนหัวใจล้นกรอบ

### ค่าที่ใช้ปรับให้หัวใจอยู่กลางกรอบ

- `top: 50%`, `left: 50%` ที่ `.profile-toggle-heart`
- `transform: translate(..., ...) rotate(...) scale(...)`
  - `translate` = ขยับตำแหน่งละเอียด
  - `scale` = ย่อ/ขยายหัวใจ
- `transform-origin: center` = หมุน/สเกลจากจุดกลาง

> โครง HTML ของสวิตช์อยู่ใน `index.html` ที่ `#profileToggleWrap` และ `<label class="profile-toggle-heart">`

---

## ตั้งค่าเพลงพื้นหลัง (BGM)

ไฟล์ที่เกี่ยวข้อง:

- `scripts/app.js` จุดเริ่มต้นการตั้งค่า BGM (`createBackgroundMusicManager`)
- `scripts/backgroundMusic.js` logic เล่น/หยุด/แสดง popup
- `index.html` element เสียง `#bgmAudio` และ popup `#bgmGate`
- `styles/components.css` สไตล์ popup บังคับกดเล่นเพลง

### วิธีใส่เพลงใหม่หรือเปลี่ยนชื่อไฟล์เพลง

1. วางไฟล์เพลงไว้ที่ `assets/audio/` (แนะนำ `.mp3`)
2. ไปที่ `scripts/app.js` แล้วแก้ค่า `src` เช่น:
   - `src: 'assets/audio/bg-home-loop.mp3'`
3. รีเฟรชหน้าเว็บ

### วิธีปรับระดับเสียงและความเร็วการค่อย ๆ ดัง (Fade-in)

แก้ที่ `scripts/app.js` ตอนสร้าง `createBackgroundMusicManager`:

- `targetVolume` = ระดับเสียงปลายทาง (เช่น `0.38`, `0.42`, `0.5`)
- `fadeInMs` = เวลาค่อย ๆ ดัง (ms)

### พฤติกรรม BGM ปัจจุบัน

- หลังปลดล็อกหัวใจและออกจากหน้าโหลดแรก จะเด้ง popup บังคับให้กดปุ่ม “เปิดเพลงตอนนี้”
- Popup มีฉากหลังเบลอและบล็อกการกดส่วนอื่น จนกว่าจะกดปุ่มเล่นเพลง
- เพลงเล่นแบบ loop ต่อเนื่อง
- เริ่มจากเสียงเบาแล้วค่อย ๆ เพิ่มจนถึง `targetVolume`
- ระหว่างเห็นหน้าโหลด (`app:loader-visibility`) จะหยุดเพลงชั่วคราว
- ออกจากหน้าโหลดจะเล่นต่ออัตโนมัติ
- ถ้าแท็บไม่ active / พับแอป / สลับออกจากเบราว์เซอร์ (`document.hidden`) จะหยุดเพลง และกลับมาเล่นต่อเมื่อกลับเข้าหน้าเว็บ


### Single Source of Copy (ข้อความทั้งเว็บ)

ตอนนี้ข้อความหลักทั้งแบบ static + dynamic ถูกย้ายมาไว้ที่ `scripts/siteTextContent.js` แล้ว
- ข้อความหน้าเว็บ (`sections`)
- ข้อความ logic runtime (`app`)
- ข้อมูลข้อความหลักของระบบ (`data`)

แก้ไฟล์นี้ไฟล์เดียวเป็นหลักได้เลย
