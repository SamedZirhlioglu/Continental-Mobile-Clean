import openpyxl
import os
from PIL import Image

# Excel dosyası ve klasör ayarları
excel_dosyasi = "CONTINENTAL WHOLESALE 2.xlsx"   # Buraya kendi dosya adını yaz
kayit_klasoru = "images"

if not os.path.exists(kayit_klasoru):
    os.makedirs(kayit_klasoru)

# Çalışma kitabını ve 'Package' sayfasını aç
wb = openpyxl.load_workbook(excel_dosyasi)
ws = wb["Package"]

# Resimleri işle
for image in ws._images:
    anchor = image.anchor._from
    kolon = anchor.col
    satir = anchor.row

    if kolon == 6:  # G sütunu (0 tabanlı)
        urun_kodu = ws.cell(row=satir + 1, column=3).value  # C sütunu

        if urun_kodu:
            dosya_adi = f"{urun_kodu}.png"
            kayit_yolu = os.path.join(kayit_klasoru, dosya_adi)

            # Görseli kaydet (image.ref zaten BytesIO objesi)
            pil_resim = Image.open(image.ref)
            pil_resim.save(kayit_yolu)
            print(f"{dosya_adi} kaydedildi.")
        else:
            print(f"Satır {satir+1}: Ürün kodu bulunamadı.")

print("Tüm resimler başarıyla kaydedildi.")