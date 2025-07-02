import csv
import firebase_admin
from firebase_admin import credentials, firestore

# Firebase Admin SDK ile kimlik doğrulama
cred = credentials.Certificate("serviceAccountKey.json")  # Firebase servis hesabı JSON dosyası
firebase_admin.initialize_app(cred)
db = firestore.client()

# CSV dosyasını oku ve Firestore'a yükle
with open('package_list.csv', newline='', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)  # Her satırı dict olarak okur (başlıklar gerekiyor)
    for row in reader:
        doc_ref = db.collection('packages').document()  # Otomatik ID ile belge oluştur
        doc_ref.set(row)  # Satır verisini belge olarak kaydet
