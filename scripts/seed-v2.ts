import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { readFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SA_PATH = path.resolve(__dirname, '../serviceAccountKey.json')
if (!existsSync(SA_PATH)) {
  console.error('❌ Không tìm thấy serviceAccountKey.json')
  process.exit(1)
}

initializeApp({ credential: cert(SA_PATH) })
const db = getFirestore()

async function seedAll() {
  // 1. Import Topics
  const topics = JSON.parse(readFileSync(path.resolve(__dirname, '../data/topics.json'), 'utf8'))
  console.log(`📚 Import ${topics.length} chủ đề...`)
  
  for (const topic of topics) {
    await db.collection('topics').doc(topic.id).set({
      name: topic.name,
      icon: topic.icon,
      order: topic.order,
      grade: '12',
      description: topic.name,
      questionCount: 0,
      examSetCount: topic.examSetCount || 1,
      createdAt: new Date().toISOString()
    })
    process.stdout.write('.')
  }
  console.log('\n✅ Topics xong')
  
  // 2. Import ExamSets
  const examSets = JSON.parse(readFileSync(path.resolve(__dirname, '../data/exam-sets.json'), 'utf8'))
  console.log(`📋 Import ${examSets.length} bộ đề...`)
  
  for (const es of examSets) {
    await db.collection('examSets').doc(es.id).set({
      topicId: es.topicId,
      name: es.name,
      order: es.order,
      questionCount: 0,
      createdAt: new Date().toISOString()
    })
    process.stdout.write('.')
  }
  console.log('\n✅ ExamSets xong')
  
  // 3. Import Questions (batch)
  const questions = JSON.parse(readFileSync(path.resolve(__dirname, '../data/questions-all.json'), 'utf8'))
  console.log(`❓ Import ${questions.length} câu hỏi...`)
  
  const BATCH_SIZE = 400
  let count = 0
  
  for (let i = 0; i < questions.length; i += BATCH_SIZE) {
    const batch = db.batch()
    const chunk = questions.slice(i, i + BATCH_SIZE)
    
    for (const q of chunk) {
      const ref = db.collection('questions').doc()
      batch.set(ref, {
        topicId: q.topicId,
        examSetId: q.examSetId,
        type: q.type,
        content: q.content,
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || '',
        difficulty: q.difficulty || 2,
	subItems: q.subItems || [],
        imageUrl: q.imageUrl || null,
        createdAt: new Date().toISOString()
      })
      count++
    }
    await batch.commit()
    process.stdout.write(`${count}...`)
  }
  
  // 4. Cập nhật questionCount
  console.log('\n🔢 Cập nhật số lượng câu hỏi...')
  
  // Count per topic và examSet
  const topicCounts: Record<string, number> = {}
  const examSetCounts: Record<string, number> = {}
  
  for (const q of questions) {
    topicCounts[q.topicId] = (topicCounts[q.topicId] || 0) + 1
    examSetCounts[q.examSetId] = (examSetCounts[q.examSetId] || 0) + 1
  }
  
  const batch2 = db.batch()
  for (const [id, cnt] of Object.entries(topicCounts)) {
    batch2.update(db.collection('topics').doc(id), { questionCount: cnt })
  }
  for (const [id, cnt] of Object.entries(examSetCounts)) {
    batch2.update(db.collection('examSets').doc(id), { questionCount: cnt })
  }
  await batch2.commit()
  
  console.log('\n🎉 IMPORT HOÀN TẤT!')
  console.log(`   📚 ${topics.length} chủ đề`)
  console.log(`   📋 ${examSets.length} bộ đề`)
  console.log(`   ❓ ${count} câu hỏi`)
}

seedAll().catch(console.error)

