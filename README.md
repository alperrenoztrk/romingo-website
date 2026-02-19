# Romingo Website

Romingo, kelime-pratik, çeviri ve ilerleme takibi odaklı bir dil öğrenme web uygulamasıdır. Bu repoda React + TypeScript tabanlı istemci uygulaması bulunur.

## Hızlı Başlangıç (5 dakika)

### 1) Gereksinimler
- Node.js **18+** (öneri: LTS)
- npm **9+**

Sürümleri kontrol edin:

```bash
node -v
npm -v
```

### 2) Projeyi çalıştırın

```bash
# bağımlılıkları yükle
npm install

# geliştirme sunucusunu başlat
npm run dev
```

Ardından tarayıcıdan Vite’ın verdiği adresi açın (genellikle `http://localhost:5173`).

---

## Detaylı Geliştirici Tutorialı

### Proje komutları

```bash
# geliştirme
npm run dev

# production build
npm run build

# development modunda build
npm run build:dev

# build çıktısını lokal önizle
npm run preview

# linter
npm run lint

# testleri tek sefer çalıştır
npm run test

# testleri watch modunda çalıştır
npm run test:watch
```

### Önerilen günlük workflow
1. `npm run dev` ile yerelde geliştirme yapın.
2. Değişiklikten sonra `npm run lint` çalıştırın.
3. Sonrasında `npm run test` ile regresyon kontrolü yapın.
4. Son olarak gerekiyorsa `npm run build` alarak production derlemesini doğrulayın.

---

## Proje Yapısı (kısa özet)

- `src/pages/`: Sayfa bileşenleri (Home, Learn, Profile, Settings vb.).
- `src/components/`: UI ve domain bileşenleri.
- `src/components/ui/`: shadcn tabanlı yeniden kullanılabilir UI parçaları.
- `src/lib/`: İş kuralları, yardımcı fonksiyonlar ve test edilen utility modülleri.
- `src/data/`: Ders/veri katalogları.
- `src/test/`: Test altyapısı ve ortak test ayarları.

---

## Sık Karşılaşılan Problemler

### Port çakışması
`5173` doluysa Vite farklı port verebilir. Terminal çıktısındaki URL’i kullanın.

### Node sürümü uyumsuzluğu
Eski Node sürümlerinde bağımlılık kurulumu veya build aşaması hata verebilir. Node LTS’e geçin.

### Temiz kurulum
Sorun devam ediyorsa:

```bash
rm -rf node_modules package-lock.json
npm install
```

---

## Teknoloji Yığını

- Vite
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui
- Vitest + Testing Library

---

## Katkı Notu

PR açmadan önce minimum olarak şunları çalıştırmanız önerilir:

```bash
npm run lint
npm run test
npm run build
```

Bu adım, stil/kalite hatalarını ve olası kırılmaları erken yakalamanıza yardımcı olur.
