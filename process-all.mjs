/**
 * Script: Extract Word → Gemini parse → JSON
 * Chạy: GEMINI_API_KEY=xxx node process-all.mjs
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { execSync } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const GEMINI_KEY = process.env.GEMINI_API_KEY
if (!GEMINI_KEY) { console.error('Cần GEMINI_API_KEY!'); process.exit(1) }

const UPLOADS = path.resolve(__dirname, './docx-files')
const OUT = path.resolve(__dirname, './data/questions-by-topic')
mkdirSync(OUT, { recursive: true })
mkdirSync(path.resolve(__dirname, './data'), { recursive: true })

const TOPIC_MAP = [
  { file: 'BÀI 2. BÀI TẬP DNA VÀ TÁI BẢN DNA.docx', topicId: 'bai-2', topicName: 'Bài tập DNA và Tái bản DNA', icon: '🧬', order: 2, examSet: 1 },
  { file: 'BÀI 3. TRUYỀN TTDT TỪ GENE ĐẾN PROTEIN - ĐA.docx', topicId: 'bai-3', topicName: 'Truyền TTDT từ Gene đến Protein', icon: '🔬', order: 3, examSet: 1 },
  { file: 'BÀI 4. BÀI TẬP MỐI QUAN HỆ GENE, RNA VÀ PROTEIN.docx', topicId: 'bai-4', topicName: 'Bài tập Gene - RNA - Protein', icon: '⚗️', order: 4, examSet: 1 },
  { file: 'BÀI 5. ĐIỀU HOÀ BIỂU HIỆN GENE.docx', topicId: 'bai-5', topicName: 'Điều hoà biểu hiện Gene', icon: '🎛️', order: 5, examSet: 1 },
  { file: 'BÀI 6. ĐỘT BIẾN GENE.docx', topicId: 'bai-6', topicName: 'Đột biến Gene', icon: '⚡', order: 6, examSet: 1 },
  { file: 'BÀI 7. BÀI TẬP ĐỘT BIẾN GENE.docx', topicId: 'bai-7', topicName: 'Bài tập Đột biến Gene', icon: '🧪', order: 7, examSet: 1 },
  { file: 'BÀI 8. CÔNGNGHỆ GENE VÀ HỆ GENE.docx', topicId: 'bai-8', topicName: 'Công nghệ Gene và Hệ Gene', icon: '💻', order: 8, examSet: 1 },
  { file: 'BÀI 9.1 ÔN TẬP DI TRUYỀN PHÂN TỬ.docx', topicId: 'bai-9', topicName: 'Ôn tập Di truyền Phân tử', icon: '📝', order: 9, examSet: 1 },
  { file: 'BÀI 9.2 ÔN TẬP DI TRUYỀN PHÂN TỬ.docx', topicId: 'bai-9', topicName: 'Ôn tập Di truyền Phân tử', icon: '📝', order: 9, examSet: 2 },
  { file: 'BÀI 10. NHIỄM SẮC THỂ.docx', topicId: 'bai-10', topicName: 'Nhiễm sắc thể', icon: '🔭', order: 10, examSet: 1 },
  { file: 'BÀI 11. NGUYÊN PHÂN, GIẢM PHÂN.docx', topicId: 'bai-11', topicName: 'Nguyên phân - Giảm phân', icon: '🔄', order: 11, examSet: 1 },
  { file: 'BAI 12. BÀI TẬP VỀ NST VÀ PHÂN BÀO.docx', topicId: 'bai-12', topicName: 'Bài tập NST và Phân bào', icon: '🧫', order: 12, examSet: 1 },
  { file: 'BÀI 13. ĐB CẤU TRÚC NST.docx', topicId: 'bai-13', topicName: 'Đột biến cấu trúc NST', icon: '🔀', order: 13, examSet: 1 },
  { file: 'BÀI 14. ĐỘT BIẾN SỐ LƯỢNG NST.docx', topicId: 'bai-14', topicName: 'Đột biến số lượng NST', icon: '📊', order: 14, examSet: 1 },
  { file: 'BÀI 15. BÀI TẬP VỀ ĐỌT BIẾN NST.docx', topicId: 'bai-15', topicName: 'Bài tập Đột biến NST', icon: '🔬', order: 15, examSet: 1 },
  { file: 'BÀI 16. QUY LUẬT DI TRUYỀN MENDEL.docx', topicId: 'bai-16', topicName: 'Quy luật Di truyền Mendel', icon: '🫘', order: 16, examSet: 1 },
  { file: 'BÀI 17. BÀI TẬP VỀ DI TRUYỀN MEDEL.docx', topicId: 'bai-17', topicName: 'Bài tập Di truyền Mendel', icon: '📋', order: 17, examSet: 1 },
  { file: 'BÀI 18. MỞ RỘNG HỌC THUYẾT MĐ (TƯƠNG TÁC GENE).docx', topicId: 'bai-18', topicName: 'Tương tác Gene', icon: '🔗', order: 18, examSet: 1 },
  { file: 'BÀI 19. BÀI TẬP VỀ TƯƠNG TÁC GENE.docx', topicId: 'bai-19', topicName: 'Bài tập Tương tác Gene', icon: '⚙️', order: 19, examSet: 1 },
  { file: 'BÀI 20. GIỚI TÍNH VÀ DI TRUYỀN LK GIỚI TÍNH.docx', topicId: 'bai-20', topicName: 'Giới tính và Di truyền LK giới tính', icon: '♀️', order: 20, examSet: 1 },
  { file: 'BÀI 21. BÀI TẬP DI TRUYỀN LK GIỚI TÍNH.docx', topicId: 'bai-21', topicName: 'Bài tập Di truyền LK giới tính', icon: '🧬', order: 21, examSet: 1 },
  { file: 'BÀI 22. LIÊN KẾT GENE VÀ HOÁN VỊ GENE.docx', topicId: 'bai-22', topicName: 'Liên kết Gene và Hoán vị Gene', icon: '🔁', order: 22, examSet: 1 },
  { file: 'BÀI 23. NÂNG CAO VỀ DI TRUYỀN LK, HOÁN VỊ GENE.docx', topicId: 'bai-23', topicName: 'Nâng cao DT LK - Hoán vị Gene', icon: '🎯', order: 23, examSet: 1 },
  { file: 'BÀI 25. MỐI QUAN HỆ GIỮA KG, MT, KH.docx', topicId: 'bai-25', topicName: 'Mối quan hệ KG - MT - KH', icon: '🌱', order: 25, examSet: 1 },
  { file: 'BÀI 26. THÀNH TỰU CỦA CHỌN GIỐNG BẰNG LAI HỮU TÍNH.docx', topicId: 'bai-26', topicName: 'Chọn giống bằng lai hữu tính', icon: '🌾', order: 26, examSet: 1 },
  { file: 'BÀI 27. ÔN TẬP DI TRUYỀN NST.docx', topicId: 'bai-27', topicName: 'Ôn tập Di truyền NST', icon: '📚', order: 27, examSet: 1 },
  { file: 'BÀI 28. ÔN TẬP QLDT.docx', topicId: 'bai-28', topicName: 'Ôn tập Quy luật Di truyền', icon: '📖', order: 28, examSet: 1 },
]

const GEMINI_PROMPT = `Bạn là chuyên gia phân tích đề thi Sinh Học THPT Việt Nam.
Tôi sẽ cho bạn nội dung một file đề thi Sinh Học (phần có đáp án).
File có 3 phần:
- Phần I: Trắc nghiệm nhiều lựa chọn (type: "mc") - 4 đáp án A/B/C/D
- Phần II: Đúng/Sai (type: "tf") - mỗi câu có 4 ý a/b/c/d
- Phần III: Trả lời ngắn (type: "short")

CÁCH NHẬN BIẾT ĐÁP ÁN:
- Phần I MC: Đáp án đúng có mũi tên 🡪 kèm giải thích, hoặc được gạch dưới/in màu
- Phần II TF: Sau mỗi ý có chữ "đúng" hoặc "sai" kèm giải thích
- Phần III: Đáp án sau dấu *** hoặc "Điền đáp án:"

Trả về JSON array (KHÔNG có markdown, KHÔNG có text khác):
[
  {"type":"mc","content":"Câu hỏi","options":["A. ...","B. ...","C. ...","D. ..."],"correctAnswer":"C","explanation":"Giải thích","difficulty":2},
  {"type":"tf","content":"Câu hỏi chính","options":[],"correctAnswer":{"a":true,"b":false,"c":true,"d":true},"explanation":"","difficulty":2,"subItems":[{"label":"a","content":"Nội dung ý a","isCorrect":true},{"label":"b","content":"Nội dung ý b","isCorrect":false},{"label":"c","content":"Nội dung ý c","isCorrect":true},{"label":"d","content":"Nội dung ý d","isCorrect":true}]},
  {"type":"short","content":"Câu hỏi","options":[],"correctAnswer":"đáp án","explanation":"","difficulty":2}
]`

async function callGemini(text) {
  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + GEMINI_KEY,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: GEMINI_PROMPT + '\n\nNỘI DUNG ĐỀ THI:\n' + text.slice(0, 30000) }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 8192 }
      })
    }
  )
  const data = await response.json()
  if (data.error) throw new Error(data.error.message)
  return data.candidates[0].content.parts[0].text
}

function extractText(filePath) {
  try {
    const escaped = filePath.replace(/'/g, "'\\''")
    const result = execSync(`python3 -c "
import zipfile, re
with zipfile.ZipFile('${escaped}') as z:
    with z.open('word/document.xml') as f:
        xml = f.read().decode('utf-8')
text = re.sub(r'<[^>]+>', ' ', xml)
text = re.sub(r'[ \\\\t]+', ' ', text)
lines = [l.strip() for l in text.split('\\\\n') if l.strip()]
mid = len(lines) // 2
print('\\\\n'.join(lines[mid:]))
"`, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 })
    return result
  } catch (e) {
    return ''
  }
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function main() {
  console.log('🚀 Bắt đầu xử lý ' + TOPIC_MAP.length + ' files...\n')
  const allTopics = {}
  const allExamSets = []
  const allQuestions = []

  for (let idx = 0; idx < TOPIC_MAP.length; idx++) {
    const item = TOPIC_MAP[idx]
    const filePath = path.join(UPLOADS, item.file)

    if (!existsSync(filePath)) {
      console.log('⚠️  Không tìm thấy: ' + item.file)
      continue
    }

    const outFile = path.join(OUT, item.topicId + '-bo' + item.examSet + '.json')
    if (existsSync(outFile)) {
      console.log('⏭️  Cache: ' + item.topicId + ' Bộ ' + item.examSet)
      const cached = JSON.parse(readFileSync(outFile, 'utf8'))
      cached.forEach(q => allQuestions.push(q))
      if (!allTopics[item.topicId]) allTopics[item.topicId] = { id: item.topicId, name: item.topicName, icon: item.icon, order: item.order, grade: '12', examSetCount: 0 }
      allTopics[item.topicId].examSetCount++
      allExamSets.push({ id: item.topicId + '-bo' + item.examSet, topicId: item.topicId, name: 'Bộ ' + item.examSet, order: item.examSet, questionCount: cached.length })
      continue
    }

    console.log('[' + (idx + 1) + '/' + TOPIC_MAP.length + '] ' + item.topicName + ' (Bộ ' + item.examSet + ')')
    const text = extractText(filePath)
    if (!text || text.length < 200) { console.log('   ❌ Không đọc được'); continue }
    console.log('   📝 ' + text.length + ' ký tự')

    try {
      const rawResult = await callGemini(text)
      let questions = []
      try {
        questions = JSON.parse(rawResult.replace(/```json\n?|\n?```/g, '').trim())
      } catch (e) {
        const m = rawResult.match(/\[[\s\S]+\]/)
        if (m) questions = JSON.parse(m[0])
        else throw new Error('Không parse JSON được')
      }
      questions = questions.map(q => ({ ...q, topicId: item.topicId, examSetId: item.topicId + '-bo' + item.examSet }))
      writeFileSync(outFile, JSON.stringify(questions, null, 2), 'utf8')
      console.log('   ✅ ' + questions.length + ' câu hỏi')
      questions.forEach(q => allQuestions.push(q))
      if (!allTopics[item.topicId]) allTopics[item.topicId] = { id: item.topicId, name: item.topicName, icon: item.icon, order: item.order, grade: '12', examSetCount: 0 }
      allTopics[item.topicId].examSetCount++
      allExamSets.push({ id: item.topicId + '-bo' + item.examSet, topicId: item.topicId, name: 'Bộ ' + item.examSet, order: item.examSet, questionCount: questions.length })
      if (idx < TOPIC_MAP.length - 1) { console.log('   ⏳ 4 giây...'); await sleep(4000) }
    } catch (e) {
      console.log('   ❌ ' + e.message?.slice(0, 100))
      await sleep(10000)
    }
  }

  writeFileSync(path.resolve(__dirname, './data/topics.json'), JSON.stringify(Object.values(allTopics), null, 2))
  writeFileSync(path.resolve(__dirname, './data/exam-sets.json'), JSON.stringify(allExamSets, null, 2))
  writeFileSync(path.resolve(__dirname, './data/questions-all.json'), JSON.stringify(allQuestions, null, 2))

  console.log('\n🎉 XONG! ' + Object.keys(allTopics).length + ' chủ đề, ' + allExamSets.length + ' bộ đề, ' + allQuestions.length + ' câu hỏi')
  console.log('➡️  Tiếp theo: npm run seed-v2')
}

main().catch(console.error)
