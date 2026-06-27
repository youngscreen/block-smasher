# Block Smasher - YouTube Playables Game

Phaser 3 ve Vite ile geliştirilmiş, **YouTube Playables SDK v1** spesifikasyonlarına tam uyumlu HTML5 Brick Breaker (Tuğla Kırma) oyunu.

## Özellikler

- **YouTube Playables SDK v1 Entegrasyonu**: 
  - `firstFrameReady` ve `gameReady` yaşam döngüsü çağrıları.
  - `saveData` ve `loadData` ile bulut tabanlı ilerleme kaydetme (UTF-16 lone surrogates denetimi dahil).
  - `sendScore` ile skor tablosuna veri gönderme.
  - `isAudioEnabled` ve `setAudioChangeCallback` ile sistem ses durumuna göre dinamik ses yönetimi.
  - BCP 47 formatında kullanıcı dili tespiti (`loadLanguage`).
- **Responsive Arayüz**: Mobil dikey (820x1180) ve masaüstü ekranlarında ölçek kaybetmeden çalışan tam ekran esnek yapı.
- **Sıfır Dış Varlık (Zero External Assets)**: Vektörel grafikler oyun başlangıcında Phaser üzerinde çizilir, böylece ağ yükleme süreleri minimize edilir.
- **Vite Bundler**: Hızlı geliştirme ortamı (HMR) ve optimize edilmiş Phaser kod bölümlendirmesi.

---

## Geliştirme Ortamı Kurulumu

Projeyi yerel makinenizde çalıştırmak için aşağıdaki adımları takip edin:

1. **Bağımlılıkları Yükleyin**:
   ```bash
   npm install
   ```

2. **Geliştirme Sunucusunu Başlatın**:
   ```bash
   npm run dev
   ```
   *(Tarayıcınızda otomatik olarak `http://localhost:3000` adresinde açılacaktır)*

3. **Üretim/Yayın Sürümünü Derleyin (Build)**:
   ```bash
   npm run build
   ```
   *(Derlenen optimize kodlar `/dist` klasörüne aktarılacaktır)*

---

## YouTube Playables'da Yayınlama

Oyunu YouTube Playables platformunda yayınlamak için şu adımları izleyin:

1. **Üretim Paketini Derleyin**:
   ```bash
   npm run build
   ```
2. **Zip Dosyası Oluşturun**:
   - Oluşan `/dist` klasörünün **içine** girin.
   - Klasörün içindeki tüm dosyaları (`index.html` ve `assets/` klasörünü) seçin.
   - Bu dosyaları bir **ZIP arşivi** haline getirin. (⚠️ **Önemli**: Zip dosyasını açtığınızda `index.html` dosyası doğrudan kök dizinde olmalıdır, `dist` klasörü şeklinde ziplenmemelidir).
3. **YouTube Konsoluna Yükleyin**:
   - YouTube Playables geliştirici konsolunuza gidin.
   - Oluşturduğunuz zip dosyasını yükleyin ve test aracını kullanarak entegrasyonu doğrulayın.

---

## Geliştirici Bilgisi

- **Kod Yapımcısı**: Kemal Kartal (Youngscreen)
