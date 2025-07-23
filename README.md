# AutoVibe: Araç Deneyimleri ve Bakım Takibi Platformu 🚗

AutoVibe, araç sahiplerinin taşıtlarıyla ilgili deneyimlerini paylaştığı, detaylı kullanım ve değerlendirme yapabildiği, aynı zamanda araçlarının bakım geçmişini takip edebildiği kapsamlı bir web uygulamasıdır. Bu platform, kişisel araç yönetimini kolaylaştırırken, aynı zamanda diğer kullanıcıların araç seçimleri ve deneyimleri hakkında bilgi edinmesini sağlar.

## Ana Özellikler

* **Kullanıcı Kimlik Doğrulama:** Firebase Authentication ile güvenli giriş ve kayıt sistemi. Kullanıcılar giriş yapmadığında garaj sayfasına erişemez.
* **Kişisel Garaj:** Kullanıcıların sahip oldukları araçları marka, model, yıl, kilometre gibi detaylarla ekleyebildiği özel garaj alanı.
* **Araç Deneyimi Paylaşımı:** Her bir araç için başlık, detaylar, konfor, performans, yakıt verimliliği, donanım ve servis deneyimi gibi kategorilerde kişisel deneyimlerin paylaşılması.
* **Bakım Geçmişi Takibi:** Araçlara ait düzenli ve düzensiz bakımların (yağ değişimi, lastik değişimi vb.) kayıt altına alınması.
* **Global Akış (Feed):** Tüm kullanıcıların paylaştığı araç deneyimlerinin kronolojik olarak görüntülendiği genel akış sayfası.
* **Görsel Destek:** Eklenen araçların fotoğraflarının yüklenmesi ve akışta gösterilmesi. **Önemli Not:** Resimler doğrudan Firestore'a kaydedildiği için **1MB belge limiti** bulunmaktadır. Büyük boyutlu görseller yüklenmeyecektir. Daha büyük görseller için Firebase Storage gibi harici bir depolama çözümü önerilir.

## 🛠️ Teknolojiler

* **Frontend:** React.js
* **Veritabanı/Backend:** Google Firebase (Authentication, Firestore)
* **Styling:** CSS3
* **Yönlendirme:** React Router

## Feed
<img width="1899" height="954" alt="image" src="https://github.com/user-attachments/assets/a971ef15-0ff9-4ae0-b53f-721f95dd5891" />

## Garage
<img width="1905" height="952" alt="image" src="https://github.com/user-attachments/assets/cbf58c14-6dc2-4a6c-8ee4-ee4563d4b00b" />

## Experience
<img width="1904" height="951" alt="image" src="https://github.com/user-attachments/assets/ed3025c1-f799-4e46-9eaa-c85148d8d203" />
