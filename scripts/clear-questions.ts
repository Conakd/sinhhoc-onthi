import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { existsSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const SA = path.resolve(__dirname, '../serviceAccountKey.json')

initializeApp({ credential: cert(SA) })
const db = getFirestore()

async function clearAll() {
  for (const col of ['questions', 'examSets', 'topics']) {
    const snap = await db.collection(col).get()
    const batches = []
    let batch = db.batch()
    let count = 0
    for (const doc of snap.docs) {
      batch.delete(doc.ref)
      count++
      if (count % 400 === 0) {
        batches.push(batch.commit())
        batch = db.batch()
      }
    }
    batches.push(batch.commit())
    await Promise.all(batches)
    console.log(`✅ Đã xóa ${snap.size} docs trong ${col}`)
  }
  console.log('🎉 Xóa xong! Chạy npm run seed-v2')
}

clearAll().catch(console.error)
