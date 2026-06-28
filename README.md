# WordFlow

Excel veya CSV dosyasından İngilizce kelime öğrenmek için hazırlanmış yerel bir çalışma uygulaması.

## Çalıştırma

```bash
npm install
npm run dev
```

Uygulama varsayılan olarak `http://127.0.0.1:5173` adresinde açılır.

## Dosya Yükleme

Excel veya CSV dosyanızda şu kolonlardan en az kelime ve çeviri alanları bulunmalıdır:

- `english`, `word`, `term` veya `ingilizce`
- `turkish`, `translation`, `meaning`, `turkce`, `türkçe` veya `anlam`

İsteğe bağlı kolonlar:

- `example`, `sentence`, `ornek`, `örnek`
- `category`, `kategori`, `group`
- `level`, `seviye`

Upload sayfasındaki örnek şablonu indirerek doğru formatta başlangıç dosyası oluşturabilirsiniz. İçe aktarma sırasında aynı İngilizce kelime zaten listenizde varsa veya dosyada tekrar ediyorsa uygulama bu satırları otomatik atlar.

## Özellikler

- Excel/CSV yükleme ve otomatik kolon eşleştirme
- Flashcards, quiz ve writing çalışma modları
- Zor kelimeleri öne alan basit spaced repetition sistemi
- Bugünkü tekrarlar ekranı ile zor ve zamanı gelen kelimeleri hızlı çalışma
- Quiz sonunda yanlış cevapların kısa tekrarı
- Writing modunda aksan/Türkçe karakter toleransı ve alternatif cevap desteği
- Kelimeler için sesli telaffuz düğmesi
- Dashboard üzerinde günlük hedef ilerlemesi, doğruluk, tekrar zamanı ve streak takibi
- Günlük hedef tamamlanınca başarı rozeti gösterimi
- Masaüstünde kapatılıp tekrar açılabilen sol menü
- Kelime arama, filtreleme, manuel ekleme, düzenleme ve silme
- LocalStorage ile kalıcı kelime ve ilerleme verisi
- Excel dışa aktarma
- Tüm ilerlemeyi koruyan JSON yedekleme ve geri yükleme
- Günlük hedef hatırlatma bildirimi
- Karanlık mod

## Yedekleme

Settings sayfasından:

- `Export Data (Excel)` ile kelime listenizi tablo olarak indirebilirsiniz.
- `Backup (JSON)` ile kelimeler, ilerleme, günlük çalışma kayıtları ve ayarlar dahil tam yedek alabilirsiniz.
- `Restore Backup` ile daha önce alınmış JSON yedeğini geri yükleyebilirsiniz.

Geri yükleme mevcut kelime listenizi ve ilerlemenizi seçilen yedekle değiştirir.

## Tamamlanan Öğrenme Deneyimi Geliştirmeleri

- Günlük hedef tamamlanınca Dashboard üzerinde başarı rozeti gösterilir.
- Zor ve tekrar zamanı gelen kelimeler için ayrı `Bugünkü Tekrarlar` ekranı eklendi.
- Quiz sonunda yanlış cevaplar, verilen cevap ve doğru cevapla birlikte listelenir.
- Writing modunda aksan/Türkçe karakter toleransı ve alternatif kabul edilen cevaplar desteklenir.
- Kelime kartları, quiz, writing, tekrar ekranı ve kelime listesinde sesli telaffuz düğmesi bulunur.
