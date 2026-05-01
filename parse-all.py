#!/usr/bin/env python3
"""
Parse file Word Sinh Học → JSON - Version 4 (fix split options & TF correct answer)
"""
import zipfile, re, json, os, shutil

DOCX_DIR = './docx-files'
DATA_DIR = './data'
OUT_DIR = './data/questions-by-topic'

os.makedirs(OUT_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)

TOPIC_MAP = [
    {'file': 'BÀI 2. BÀI TẬP DNA VÀ TÁI BẢN DNA.docx', 'topicId': 'bai-2', 'topicName': 'Bài tập DNA và Tái bản DNA', 'icon': '🧬', 'order': 2, 'examSet': 1},
    {'file': 'BÀI 3. TRUYỀN TTDT TỪ GENE ĐẾN PROTEIN - ĐA.docx', 'topicId': 'bai-3', 'topicName': 'Truyền TTDT từ Gene đến Protein', 'icon': '🔬', 'order': 3, 'examSet': 1},
    {'file': 'BÀI 4. BÀI TẬP MỐI QUAN HỆ GENE, RNA VÀ PROTEIN.docx', 'topicId': 'bai-4', 'topicName': 'Bài tập Gene - RNA - Protein', 'icon': '⚗️', 'order': 4, 'examSet': 1},
    {'file': 'BÀI 5. ĐIỀU HOÀ BIỂU HIỆN GENE.docx', 'topicId': 'bai-5', 'topicName': 'Điều hoà biểu hiện Gene', 'icon': '🎛️', 'order': 5, 'examSet': 1},
    {'file': 'BÀI 6. ĐỘT BIẾN GENE.docx', 'topicId': 'bai-6', 'topicName': 'Đột biến Gene', 'icon': '⚡', 'order': 6, 'examSet': 1},
    {'file': 'BÀI 7. BÀI TẬP ĐỘT BIẾN GENE.docx', 'topicId': 'bai-7', 'topicName': 'Bài tập Đột biến Gene', 'icon': '🧪', 'order': 7, 'examSet': 1},
    {'file': 'BÀI 8. CÔNGNGHỆ GENE VÀ HỆ GENE.docx', 'topicId': 'bai-8', 'topicName': 'Công nghệ Gene và Hệ Gene', 'icon': '💻', 'order': 8, 'examSet': 1},
    {'file': 'BÀI 9.1 ÔN TẬP DI TRUYỀN PHÂN TỬ.docx', 'topicId': 'bai-9', 'topicName': 'Ôn tập Di truyền Phân tử', 'icon': '📝', 'order': 9, 'examSet': 1},
    {'file': 'BÀI 9.2 ÔN TẬP DI TRUYỀN PHÂN TỬ.docx', 'topicId': 'bai-9', 'topicName': 'Ôn tập Di truyền Phân tử', 'icon': '📝', 'order': 9, 'examSet': 2},
    {'file': 'BÀI 10. NHIỄM SẮC THỂ.docx', 'topicId': 'bai-10', 'topicName': 'Nhiễm sắc thể', 'icon': '🔭', 'order': 10, 'examSet': 1},
    {'file': 'BÀI 11. NGUYÊN PHÂN, GIẢM PHÂN.docx', 'topicId': 'bai-11', 'topicName': 'Nguyên phân - Giảm phân', 'icon': '🔄', 'order': 11, 'examSet': 1},
    {'file': 'BAI 12. BÀI TẬP VỀ NST VÀ PHÂN BÀO.docx', 'topicId': 'bai-12', 'topicName': 'Bài tập NST và Phân bào', 'icon': '🧫', 'order': 12, 'examSet': 1},
    {'file': 'BÀI 13. ĐB CẤU TRÚC NST.docx', 'topicId': 'bai-13', 'topicName': 'Đột biến cấu trúc NST', 'icon': '🔀', 'order': 13, 'examSet': 1},
    {'file': 'BÀI 14. ĐỘT BIẾN SỐ LƯỢNG NST.docx', 'topicId': 'bai-14', 'topicName': 'Đột biến số lượng NST', 'icon': '📊', 'order': 14, 'examSet': 1},
    {'file': 'BÀI 15. BÀI TẬP VỀ ĐỌT BIẾN NST.docx', 'topicId': 'bai-15', 'topicName': 'Bài tập Đột biến NST', 'icon': '🔬', 'order': 15, 'examSet': 1},
    {'file': 'BÀI 16. QUY LUẬT DI TRUYỀN MENDEL.docx', 'topicId': 'bai-16', 'topicName': 'Quy luật Di truyền Mendel', 'icon': '🫘', 'order': 16, 'examSet': 1},
    {'file': 'BÀI 17. BÀI TẬP VỀ DI TRUYỀN MEDEL.docx', 'topicId': 'bai-17', 'topicName': 'Bài tập Di truyền Mendel', 'icon': '📋', 'order': 17, 'examSet': 1},
    {'file': 'BÀI 18. MỞ RỘNG HỌC THUYẾT MĐ (TƯƠNG TÁC GENE).docx', 'topicId': 'bai-18', 'topicName': 'Tương tác Gene', 'icon': '🔗', 'order': 18, 'examSet': 1},
    {'file': 'BÀI 19. BÀI TẬP VỀ TƯƠNG TÁC GENE.docx', 'topicId': 'bai-19', 'topicName': 'Bài tập Tương tác Gene', 'icon': '⚙️', 'order': 19, 'examSet': 1},
    {'file': 'BÀI 20. GIỚI TÍNH VÀ DI TRUYỀN LK GIỚI TÍNH.docx', 'topicId': 'bai-20', 'topicName': 'Giới tính và Di truyền LK giới tính', 'icon': '♀️', 'order': 20, 'examSet': 1},
    {'file': 'BÀI 21. BÀI TẬP DI TRUYỀN LK GIỚI TÍNH.docx', 'topicId': 'bai-21', 'topicName': 'Bài tập Di truyền LK giới tính', 'icon': '🧬', 'order': 21, 'examSet': 1},
    {'file': 'BÀI 22. LIÊN KẾT GENE VÀ HOÁN VỊ GENE.docx', 'topicId': 'bai-22', 'topicName': 'Liên kết Gene và Hoán vị Gene', 'icon': '🔁', 'order': 22, 'examSet': 1},
    {'file': 'BÀI 23. NÂNG CAO VỀ DI TRUYÊN LK, HOÁN VỊ GENE.docx', 'topicId': 'bai-23', 'topicName': 'Nâng cao DT LK - Hoán vị Gene', 'icon': '🎯', 'order': 23, 'examSet': 1},
    {'file': 'BÀI 25. MỐI QUAN HỆ GIỮA KG, MT, KH.docx', 'topicId': 'bai-25', 'topicName': 'Mối quan hệ KG - MT - KH', 'icon': '🌱', 'order': 25, 'examSet': 1},
    {'file': 'BÀI 26. THÀNH TỰU CỦACHỌN GIỐNG BẰNG LAI HỮU TÍNH.docx', 'topicId': 'bai-26', 'topicName': 'Chọn giống bằng lai hữu tính', 'icon': '🌾', 'order': 26, 'examSet': 1},
    {'file': 'BÀI 27. ÔN TẬP DI TRUYỀN NST.docx', 'topicId': 'bai-27', 'topicName': 'Ôn tập Di truyền NST', 'icon': '📚', 'order': 27, 'examSet': 1},
    {'file': 'BÀI 28. ÔN TẬP QLDT.docx', 'topicId': 'bai-28', 'topicName': 'Ôn tập Quy luật Di truyền', 'icon': '📖', 'order': 28, 'examSet': 1},
]

def para_full_text(xml_para):
    texts = re.findall(r'<w:t[^>]*>([^<]*)</w:t>', xml_para)
    return ''.join(texts)

def para_has_color(xml_para):
    """Tìm chữ cái A/B/C/D có màu = đáp án đúng"""
    runs = re.findall(r'(<w:r[ >].*?</w:r>)', xml_para, re.DOTALL)
    for r in runs:
        if 'w:color' in r:
            t = ''.join(re.findall(r'<w:t[^>]*>([^<]*)</w:t>', r))
            m = re.match(r'^\s*([A-D])[.\s]', t.strip())
            if m:
                return m.group(1)
    return None

def split_options_text(text):
    """
    Tách options từ 1 dòng text có thể chứa nhiều options.
    Xử lý cả 2 dạng:
    - "A. content    B. content" (có space)
    - "A. content.B. content" (không có space, chỉ dấu chấm)
    """
    # Thêm space trước các pattern [A-D]. để chuẩn hóa
    # Dạng: "...content.B." → "...content. B."
    text = re.sub(r'([a-zà-ỹA-ZÀ-Ỹ0-9\)])\.([A-D])\.', r'\1. \2.', text)
    # Dạng: "...content B." (space + letter + dot) → chỉ khi bắt đầu bằng chữ hoa có nghĩa
    
    # Bây giờ split theo pattern: khoảng trắng + [A-D].
    parts = re.split(r'\s+(?=[A-D]\.\s)', text.strip())
    
    results = []
    for part in parts:
        part = part.strip()
        m = re.match(r'^([A-D])\.\s*(.+)', part)
        if m:
            letter = m.group(1)
            content = m.group(2).strip()
            # Loại bỏ giải thích sau mũi tên
            content = re.split(r'[🡪→]|\s+->\s+', content)[0].strip()
            if content:
                results.append((letter, content))
    return results

def parse_paragraphs(xml):
    raw = re.split(r'(?=<w:p[ >])', xml)
    result = []
    for p in raw:
        text = para_full_text(p).strip()
        if text:
            colored = para_has_color(p)
            result.append({'text': text, 'colored': colored, 'xml': p})
    return result

def find_answer_start(paras):
    positions = [i for i, p in enumerate(paras)
                 if re.match(r'Câu\s*1[:\s.]', p['text'], re.I) and len(p['text']) > 15]
    if len(positions) >= 2:
        return positions[1]
    return len(paras) // 2

def find_question_start(paras):
    positions = [i for i, p in enumerate(paras)
                 if re.match(r'Câu\s*1[:\s.]', p['text'], re.I) and len(p['text']) > 15]
    return positions[0] if positions else 0

def parse_tf_subitems_from_question(question_paras, q_num):
    """Tìm các ý a/b/c/d của câu TF từ phần câu hỏi (nửa đầu file)"""
    sub_items = []
    for i, p in enumerate(question_paras):
        cau_m = re.match(r'Câu\s*(\d+)', p['text'], re.I)
        if cau_m and int(cau_m.group(1)) == q_num:
            j = i + 1
            while j < len(question_paras) and j < i + 15:
                t2 = question_paras[j]['text']
                if re.match(r'Câu\s*\d+[:\s.]', t2, re.I):
                    break
                sm = re.match(r'^([A-Da-d])[.\)]\s*(.+)', t2)
                if sm:
                    letter = sm.group(1).lower()
                    content = sm.group(2).strip()
                    sub_items.append({'label': letter, 'content': content, 'isCorrect': True})
                j += 1
            break
    return sub_items

def parse_tf_correct_from_answer(answer_paras, q_idx):
    """
    Đọc đúng/sai của TF từ phần đáp án.
    Trả về: (sub_items_from_answer, correct_ans_dict)
    """
    sub_items = []
    correct_ans = {}
    j = q_idx + 1

    while j < len(answer_paras) and j < q_idx + 30:
        t2 = answer_paras[j]['text']
        if re.match(r'Câu\s*\d+[:\s.]', t2, re.I) and j > q_idx + 1:
            break
        if re.search(r'TRẢ LỜI NGẮN|PHẦN III', t2, re.I):
            break

        # Dạng: "a. content Đúng" hoặc "a. Đúng" hoặc "a) Sai"
        sm = re.match(r'^([A-Da-d])[.\)]\s*(.*)', t2)
        if sm:
            letter = sm.group(1).lower()
            content = sm.group(2).strip()
            
            # Tìm đúng/sai
            is_true = None
            if re.search(r'\bĐúng\b', content):
                is_true = True
            elif re.search(r'\bSai\b', content):
                is_true = False
            elif re.search(r'\bđúng\b', content, re.I):
                is_true = True
            elif re.search(r'\bsai\b', content, re.I):
                is_true = False
            
            # Làm sạch content
            clean = re.sub(r'\s*(Đúng|Sai|đúng|sai)\s*[.:]?.*$', '', content).strip()
            clean = re.split(r'[🡪→]', clean)[0].strip()
            
            if clean:
                sub_items.append({
                    'label': letter,
                    'content': clean,
                    'isCorrect': bool(is_true) if is_true is not None else True
                })
                correct_ans[letter] = bool(is_true) if is_true is not None else True
        j += 1

    return sub_items, correct_ans, j

def parse_docx(docx_path, topic_id, exam_set_id):
    try:
        with zipfile.ZipFile(docx_path) as z:
            with z.open('word/document.xml') as f:
                xml = f.read().decode('utf-8')
    except Exception as e:
        print(f'   ❌ Lỗi: {e}')
        return []

    paras = parse_paragraphs(xml)
    ans_start = find_answer_start(paras)
    q_start = find_question_start(paras)

    question_paras = paras[q_start:ans_start]
    answer_paras = paras[ans_start:]

    questions = []
    section = 'mc'
    i = 0

    while i < len(answer_paras):
        text = answer_paras[i]['text']
        colored = answer_paras[i]['colored']

        # Nhận diện section
        if re.search(r'ĐÚNG.{0,5}SAI|II\.\s*C[ÂA]U', text, re.I) and not re.match(r'Câu\s*\d+', text, re.I):
            section = 'tf'; i += 1; continue
        if re.search(r'TRẢ LỜI NGẮN|III\.\s*C[ÂA]U', text, re.I) and not re.match(r'Câu\s*\d+', text, re.I):
            section = 'short'; i += 1; continue

        cau_m = re.match(r'Câu\s*(\d+)[^a-zA-Z\d]*\s*(.*)', text, re.I)
        if not cau_m:
            i += 1; continue

        q_num = int(cau_m.group(1))
        q_text = cau_m.group(2).strip()
        if not q_text or len(q_text) < 3:
            i += 1; continue

        # === TRẮC NGHIỆM MC ===
        if section == 'mc':
            options_dict = {}
            correct = colored
            j = i + 1

            while j < len(answer_paras) and j < i + 15:
                t2 = answer_paras[j]['text']
                c2 = answer_paras[j]['colored']

                if re.match(r'Câu\s*\d+[:\s.]', t2, re.I) and j > i + 1: break
                if re.search(r'ĐÚNG.{0,5}SAI|TRẢ LỜI|PHẦN II|PHẦN III', t2, re.I): break

                if c2 and not correct:
                    correct = c2

                opts = split_options_text(t2)
                for letter, content in opts:
                    if letter not in options_dict:
                        options_dict[letter] = content
                j += 1

            options_list = []
            for letter in ['A', 'B', 'C', 'D']:
                if letter in options_dict:
                    options_list.append(f"{letter}. {options_dict[letter]}")

            if len(options_list) >= 2:
                questions.append({
                    'type': 'mc',
                    'content': q_text,
                    'options': options_list,
                    'correctAnswer': correct or 'A',
                    'explanation': '',
                    'difficulty': 2,
                    'topicId': topic_id,
                    'examSetId': exam_set_id
                })
            i = j

        # === ĐÚNG SAI TF ===
        elif section == 'tf':
            # Đọc đúng/sai từ phần đáp án
            sub_items, correct_ans, j = parse_tf_correct_from_answer(answer_paras, i)

            # Nếu tìm được sub_items từ phần đáp án → dùng luôn
            # Nếu không → lấy content từ phần câu hỏi
            if not sub_items:
                sub_items = parse_tf_subitems_from_question(question_paras, q_num)
            else:
                # Nếu content trong sub_items quá ngắn → thay bằng content từ phần câu hỏi
                q_subs = parse_tf_subitems_from_question(question_paras, q_num)
                if q_subs:
                    # Merge: giữ isCorrect từ answer_paras, lấy content từ question_paras
                    label_map = {s['label']: s for s in sub_items}
                    merged = []
                    for qs in q_subs:
                        lbl = qs['label']
                        if lbl in label_map:
                            merged.append({
                                'label': lbl,
                                'content': qs['content'],
                                'isCorrect': label_map[lbl]['isCorrect']
                            })
                            if lbl not in correct_ans:
                                correct_ans[lbl] = label_map[lbl]['isCorrect']
                        else:
                            merged.append(qs)
                    sub_items = merged

            if sub_items:
                questions.append({
                    'type': 'tf',
                    'content': q_text,
                    'options': [],
                    'correctAnswer': correct_ans if correct_ans else {s['label']: s['isCorrect'] for s in sub_items},
                    'explanation': '',
                    'difficulty': 2,
                    'subItems': sub_items,
                    'topicId': topic_id,
                    'examSetId': exam_set_id
                })
            i = j

        # === TRẢ LỜI NGẮN ===
        elif section == 'short':
            answer = ''
            j = i + 1
            while j < len(answer_paras) and j < i + 8:
                t2 = answer_paras[j]['text']
                if re.match(r'Câu\s*\d+[:\s.]', t2, re.I) and j > i + 1: break
                da = re.search(r'(?:Điền đáp án|ĐÁP ÁN)[:\s\*]*(.+)', t2, re.I)
                if da:
                    answer = re.split(r'[🡪→]', re.sub(r'\*+', '', da.group(1)))[0].strip()
                star_m = re.search(r'\*{2,}\s*(.+)', t2)
                if star_m and not answer:
                    answer = re.split(r'[🡪→]', star_m.group(1))[0].strip()
                j += 1

            questions.append({
                'type': 'short',
                'content': q_text,
                'options': [],
                'correctAnswer': answer,
                'explanation': '',
                'difficulty': 2,
                'topicId': topic_id,
                'examSetId': exam_set_id
            })
            i = j
        else:
            i += 1

    return questions


def main():
    print(f'🚀 Parse {len(TOPIC_MAP)} files...\n')

    if os.path.exists(OUT_DIR):
        shutil.rmtree(OUT_DIR)
    os.makedirs(OUT_DIR, exist_ok=True)

    all_topics = {}
    all_exam_sets = []
    all_questions = []

    for idx, item in enumerate(TOPIC_MAP):
        fpath = os.path.join(DOCX_DIR, item['file'])
        tid = item['topicId']
        eset = item['examSet']
        exam_set_id = f"{tid}-bo{eset}"

        if not os.path.exists(fpath):
            print(f'⚠️  [{idx+1}/{len(TOPIC_MAP)}] Không tìm thấy: {item["file"]}')
            continue

        print(f'📄 [{idx+1}/{len(TOPIC_MAP)}] {item["topicName"]}')
        questions = parse_docx(fpath, tid, exam_set_id)

        mc = sum(1 for q in questions if q['type'] == 'mc')
        tf = sum(1 for q in questions if q['type'] == 'tf')
        sh = sum(1 for q in questions if q['type'] == 'short')
        print(f'   ✅ {len(questions)} câu: MC={mc} TF={tf} Short={sh}')

        out_file = os.path.join(OUT_DIR, f"{exam_set_id}.json")
        with open(out_file, 'w', encoding='utf-8') as f:
            json.dump(questions, f, ensure_ascii=False, indent=2)

        all_questions.extend(questions)

        if tid not in all_topics:
            all_topics[tid] = {'id': tid, 'name': item['topicName'], 'icon': item['icon'],
                               'order': item['order'], 'grade': '12', 'description': item['topicName'],
                               'examSetCount': 0, 'questionCount': 0}
        all_topics[tid]['examSetCount'] += 1
        all_topics[tid]['questionCount'] += len(questions)
        all_exam_sets.append({'id': exam_set_id, 'topicId': tid, 'name': f'Bộ {eset}',
                              'order': eset, 'questionCount': len(questions)})

    with open(os.path.join(DATA_DIR, 'topics.json'), 'w', encoding='utf-8') as f:
        json.dump(list(all_topics.values()), f, ensure_ascii=False, indent=2)
    with open(os.path.join(DATA_DIR, 'exam-sets.json'), 'w', encoding='utf-8') as f:
        json.dump(all_exam_sets, f, ensure_ascii=False, indent=2)
    with open(os.path.join(DATA_DIR, 'questions-all.json'), 'w', encoding='utf-8') as f:
        json.dump(all_questions, f, ensure_ascii=False, indent=2)

    mc_t = sum(1 for q in all_questions if q['type'] == 'mc')
    tf_t = sum(1 for q in all_questions if q['type'] == 'tf')
    sh_t = sum(1 for q in all_questions if q['type'] == 'short')
    print(f'\n🎉 XONG! {len(all_topics)} chủ đề, {len(all_exam_sets)} bộ đề, {len(all_questions)} câu')
    print(f'   MC={mc_t} TF={tf_t} Short={sh_t}')
    print(f'➡️  npm run clear && npm run seed-v2')

if __name__ == '__main__':
    main()
