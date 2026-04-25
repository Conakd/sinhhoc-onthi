import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SERVICE_ACCOUNT_PATH = path.resolve(__dirname, '../serviceAccountKey.json');
const DATA_PATH = path.resolve(__dirname, '../data/questions.json');

// Khởi tạo Firebase Admin
if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
    console.error('❌ Lỗi: Không tìm thấy file serviceAccountKey.json ở thư mục gốc!');
    process.exit(1);
}

initializeApp({
    credential: cert(SERVICE_ACCOUNT_PATH)
});

const db = getFirestore();

async function seedDatabase() {
    try {
        // Đọc file JSON
        if (!fs.existsSync(DATA_PATH)) {
            console.error(`❌ Lỗi: Không tìm thấy file data tại ${DATA_PATH}`);
            process.exit(1);
        }

        const rawData = fs.readFileSync(DATA_PATH, 'utf8');
        const questions = JSON.parse(rawData);

        console.log(`⏳ Tìm thấy ${questions.length} câu hỏi. Đang tiến hành import...`);

        const collectionRef = db.collection('questions');

        // Firestore giới hạn mỗi batch tối đa 500 thao tác ghi
        const BATCH_SIZE = 500;
        let batch = db.batch();
        let count = 0;

        for (const question of questions) {
            // Tự động tạo ID cho Document
            const docRef = collectionRef.doc();

            // Thêm dữ liệu cộng thêm thời gian tạo (tuỳ chọn, rất hữu ích)
            batch.set(docRef, {
                ...question,
                createdAt: new Date().toISOString()
            });

            count++;

            // Commit batch nếu đạt giới hạn 500
            if (count % BATCH_SIZE === 0) {
                await batch.commit();
                console.log(`✅ Đã import ${count} câu hỏi...`);
                batch = db.batch(); // Khởi tạo batch mới
            }
        }

        // Commit những bản ghi còn sót lại (nếu tổng số không chia hết cho 500)
        if (count % BATCH_SIZE !== 0) {
            await batch.commit();
        }

        console.log(`🎉 Import thành công tổng cộng ${count} câu hỏi vào Firestore!`);

    } catch (error) {
        console.error('❌ Có lỗi xảy ra trong quá trình seed dữ liệu:', error);
    } finally {
        // Đóng kết nối (cần thiết để script tự kết thúc)
        process.exit(0);
    }
}

// Chạy hàm
seedDatabase();