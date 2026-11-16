# Bayrog‘im — g‘ururim

O‘zbekiston Respublikasi Davlat bayrog‘i qabul qilinganining 35 yilligiga (1991-yil 18-noyabr — 2026-yil 18-noyabr) bag‘ishlangan interaktiv veb-platforma.

Shior: **«Bir bayroq ostida — bir xalq, bir Vatan, bir kelajak»**

## Imkoniyatlar

| Bo‘lim | Manzil | Nima qiladi |
|---|---|---|
| Bosh sahifa | `/` | Hilpirayotgan bayroq (Canvas), sana, ishtirok yo‘llari, jonli raqamlar |
| Viktorina | `/viktorina` | 15 savol, 4 variant, har javobdan keyin izoh, ball, PNG ishtirok diplomi |
| Tabrik kartasi | `/karta` | Ism + hudud, 4 shablon, PNG yuklab olish va ulashish |
| Faxr devori | `/faxr-devori` | «Men O‘zbekiston bilan faxrlanaman, chunki…» — moderatsiyadan keyin e’lon qilinadi |
| Tarix | `/tarix` | Qabul qilinishi, o‘lchamlar sxemasi, ramzlar, qonuniy asoslar, manbalar |
| Statistika | `/statistika` | Ishtirokchilar, viktorina taqsimoti, kartalar, 14 hudud kesimi |
| Boshqaruv | `/admin` | Kirish, fikrlarni tasdiqlash/rad etish/o‘chirish, statistika, e’lon satri |

## Texnologiyalar

React 18 + Vite 5 · Tailwind CSS 3 · Framer Motion · Supabase (Postgres, Auth, RLS) · HTML Canvas · Vercel.
Shriftlar (`Cormorant Garamond`, `Onest`) loyiha ichida — tashqi CDN ishlatilmaydi.

## Ishga tushirish

Talab: Node.js 18+.

```bash
npm install
cp .env.example .env.local   # qiymatlarni to‘ldiring
npm run dev                  # http://localhost:5173
npm run build                # dist/ papkasiga yig‘adi
npm run preview              # yig‘ilgan variantni ko‘rish
```

`.env.local` bo‘lmasa ham sayt ochiladi: viktorina, diplom va karta shu qurilmada to‘liq ishlaydi, faxr devori, statistika va boshqaruv paneli esa «baza ulanmagan» holatini ko‘rsatadi. Soxta raqamlar hech qayerda chiqarilmaydi.

### Muhit o‘zgaruvchilari

| O‘zgaruvchi | Izoh |
|---|---|
| `VITE_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Shu yerdagi **anon public** kalit. `service_role` kalitini frontendga qo‘ymang |
| `VITE_SITE_URL` | Saytning ochiq manzili, oxirida `/` siz. Open Graph va ulashish havolalari uchun |

## Supabase sozlash

1. [supabase.com](https://supabase.com) da yangi loyiha yarating.
2. **SQL Editor** → `supabase/migrations/0001_init.sql` faylining to‘liq matnini joylab, **Run** bosing. (Supabase CLI bo‘lsa: `supabase link` → `supabase db push`.) Migratsiyani qayta ishga tushirish xavfsiz.
3. **Authentication → Users → Add user**: administrator email va kuchli parol kiriting.
4. **Authentication → Sign In / Providers**: ochiq ro‘yxatdan o‘tishni o‘chiring (*Allow new users to sign up* — off).
5. SQL Editor'da administratorni tayinlang:

   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'admin@example.uz';
   ```

6. `/admin` sahifasida shu email va parol bilan kiring.

## Vercel'ga joylash

1. Loyihani GitHub'ga yuklang, Vercel'da **Add New → Project** orqali import qiling (Vite avtomatik aniqlanadi).
2. **Settings → Environment Variables** ga yuqoridagi uchta o‘zgaruvchini kiriting.
3. **Deploy**. `vercel.json` SPA yo‘naltirishlari, kesh va xavfsizlik sarlavhalarini (CSP, HSTS, X-Frame-Options) o‘zi sozlaydi.
4. Domen ulangach `VITE_SITE_URL` ni yangilab, qayta deploy qiling va `public/og-image.png` ijtimoiy tarmoqda to‘g‘ri chiqishini tekshiring.

## Arxitektura

```
src/
  main.jsx, App.jsx        marshrutlar (sahifalar lazy yuklanadi)
  components/
    Layout.jsx             sarlavha, mobil menyu, e’lon satri, footer, PageBand
    Flag.jsx               FlagSvg (aniq o‘lchamli) va WavingFlag (Canvas animatsiya)
    ShareRow.jsx           PNG yuklab olish / ulashish
    States.jsx             Loading, ErrorState, EmptyState, Notice
  pages/                   Home, Quiz, Card, Wall, History, Stats, Admin, NotFound
  lib/
    flag.js                bayroq geometriyasi (Qonun bo‘yicha, santimetrda)
    canvasArt.js           karta va diplom chizish
    api.js                 Supabase so‘rovlari va xatolarni o‘zbekchaga o‘girish
    supabase.js, session.js, regions.js, hooks.js
  data/quiz.js             15 savol va izohlar
supabase/migrations/       SQL sxema, RLS, triggerlar, statistika funksiyalari
```

Dizayn tamoyili: sahifaning o‘zi bayroq tuzilishini takrorlaydi — moviy sarlavha, qizil hoshiya, oq mazmun, qizil hoshiya, yashil footer.

## Ma’lumotlar va maxfiylik

| Jadval | Nima saqlanadi | Kim o‘qiydi |
|---|---|---|
| `quiz_results` | sessiya UUID, hudud, ball | hech kim (faqat yig‘ma funksiya) |
| `cards` | sessiya UUID, hudud, shablon | hech kim (faqat yig‘ma funksiya) |
| `pride_messages` | ism, hudud, fikr, holat | hamma — faqat tasdiqlanganlarini; administrator — hammasini |
| `site_content` | e’lon satri, devor ochiq/yopiq | hamma o‘qiydi, administrator o‘zgartiradi |
| `admins`, `blocked_words` | administratorlar, spam so‘zlari | faqat SQL Editor |

- Viktorina va karta uchun kiritilgan **ism serverga yuborilmaydi** — u faqat brauzerda PNG ichiga yoziladi.
- Sessiya UUID tasodifiy, qurilmada saqlanadi, shaxsni aniqlamaydi va ommaga chiqarilmaydi.
- Ommaviy statistika `get_public_stats()` funksiyasi orqali faqat yig‘ma sonlar ko‘rinishida beriladi.

## Xavfsizlik va spamdan himoya

- Barcha jadvallarda RLS yoqilgan; anonim rol faqat ruxsat etilgan ustunlarga `insert` qila oladi (holatni `approved` qilib yuborib bo‘lmaydi).
- Fikr holatini faqat `admins` jadvalidagi foydalanuvchi o‘zgartiradi; fikr matnini administrator ham tahrirlay olmaydi.
- Baza darajasida: uzunlik va hudud tekshiruvi, havola/telefon/username filtri, `blocked_words` ro‘yxati, takror matn tekshiruvi, tezlik cheklovi (fikr — kuniga 3 ta, viktorina — soatiga 5 ta, karta — soatiga 20 ta, har sessiya uchun).
- Frontendda: yashirin tuzoq maydon, formani juda tez yuborishni rad etish, rozilik belgisi.
- React matnni avtomatik ekranlashtiradi; `dangerouslySetInnerHTML` ishlatilmagan.

**Cheklov.** Tezlik cheklovi brauzer sessiyasiga bog‘langan: sessiyani ataylab almashtirib turgan bot uni aylanib o‘tishi mumkin. Bunday yozuvlar baribir moderatsiyadan o‘tmaydi, lekin statistikani shishirishi mumkin. Respublika miqyosida ochishdan oldin yozuvlarni Cloudflare Turnstile (yoki hCaptcha) tekshiruvi bilan Supabase Edge Function orqali o‘tkazish tavsiya etiladi.

`blocked_words` ro‘yxatini SQL Editor orqali to‘ldiring:

```sql
insert into public.blocked_words (word) values ('yangi so‘z') on conflict do nothing;
```

## Kontentni boshqarish

- **E’lon satri** va **devorni ochish/yopish** — `/admin → Kontent`.
- **Viktorina savollari** — `src/data/quiz.js` (har savolda `options[0]` to‘g‘ri javob; variantlar ekranda aralashtiriladi).
- **Tarix matnlari va manbalar** — `src/pages/History.jsx`.

Savollar va tarix matnlari ataylab kodda saqlanadi: ular rasmiy manbalarga tayanadi va o‘zgarishi ko‘rib chiqishdan o‘tishi kerak.

## Manbalar

- «O‘zbekiston Respublikasining Davlat bayrog‘i to‘g‘risida»gi Qonun, 407-XII-son, 18.11.1991 — <https://lex.uz/docs/-100122>
- Davlat ramzlari, Tashqi ishlar vazirligi — <https://gov.uz/oz/mfa/sections/view/14473>
- Davlat ramzlari, Prezidentning rasmiy veb-sayti — <https://president.uz/oz/pages/view/symbols>

E’lon qilishdan oldin viktorina va «Tarix» matnlarini mas’ul mutaxassis bilan yana bir bor solishtirib chiqing.
