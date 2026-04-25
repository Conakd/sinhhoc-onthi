#!/usr/bin/env python3
"""
Parse toàn bộ file Word Sinh Học → JSON - Version 2 (fixed option parsing & TF subItems)
Chạy: python3 parse-all.py
"""
import zipfile, re, json, os

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
    """Lấy full text của paragraph, giữ nguyên spaces"""
    texts = re.findall(r'<w:t[^>]*>([^<]*)</w:t>', xml_para)
    return ''.join(texts).strip()

def has_color(xml_para):
    """Kiểm tra đoạn văn có chứa định dạng màu không"""
    return bool(re.search(r'<w:color\b', xml_para))

def parse_paragraphs(xml):
    """Tách XML thành danh sách paragraphs"""
    raw = re.split(r'(?=<w:p[ >])', xml)
    result = []
    for p in raw:
        text = para_full_text(p)
        colored = has_color(p)
        if text:
            result.append({'text': text, 'colored': colored, 'xml': p})
    return result

def find_answer_start(paras):
    """Tìm vị trí bắt đầu phần đáp án (lần 2 của Câu 1)"""
    positions = [i for i, p in enumerate(paras)
                 if re.match(r'Câu\s*1[:\s.]', p['text'], re.I) and len(p['text']) > 15]
    if len(positions) >= 2:
        return positions[1]
    return len(paras) // 2

def get_tf_subitems_from_first_half(paras, start_idx, q_num):
    """
    Quay ngược lại phần Đề bài (từ đầu đến start_idx) 
    Tìm câu hỏi TF để lấy text nội dung 4 ý a, b, c, d
    """
    content_dict = {}
    for i in range(start_idx):
        text = paras[i]['text']
        # Dùng (?!\d) để 'Câu 1' không match nhầm với 'Câu 10'
        if re.match(rf'Câu\s*{q_num}(?!\d)', text, re.I):
            k = i + 1
            while k < start_idx:
                t2 = paras[k]['text']
                if re.match(r'Câu\s*\d+', t2, re.I) or re.search(r'PHẦN', t2, re.I):
                    break
                
                # Bắt ý a) b) c) d)
                sm = re.match(r'^([a-d])[.\)]\s*(.*)', t2, re.I)
                if sm:
                    letter = sm.group(1).lower()
                    content = sm.group(2).strip()
                    content_dict[letter] = content
                k += 1
            break
    return content_dict

def parse_mc_options(paras, start_idx):
    """
    Parse options cho câu MC - Xử lý chuẩn xác chỉ bắt dòng A., B., C., D.
    """
    options = []
    correct = None
    j = start_idx

    while j < len(paras) and j < start_idx + 12:
        text = paras[j]['text']
        colored = paras[j]['colored']

        # Dừng nếu gặp câu mới hoặc phần mới
        if j > start_idx and re.match(r'Câu\s*\d+[:\s.]', text, re.I):
            break
        if re.search(r'ĐÚNG.{0,5}SAI|TRẢ LỜI NGẮN|PHẦN II|PHẦN III', text, re.I):
            break

        # Chỉ bắt option khi bắt đầu BẰNG "^A. " (Có khoảng trắng sau dấu chấm)
        single = re.match(r'^([A-D])\.\s+(.+)$', text)
        if single:
            letter = single.group(1)
            content = single.group(2).strip()
            # Loại bỏ phần giải thích sau mũi tên nếu có
            content = re.split(r'🡪|→|\s+->\s+', content)[0].strip()
            options.append(f"{letter}. {content}")
            
            # Nếu dòng này chứa định dạng màu -> Chính là đáp án đúng
            if colored and not correct:
                correct = letter
        else:
            # Dòng tiếp nối không có A/B/C/D ở đầu -> Nối vào option trước đó
            if options and not re.match(r'^[A-D]\.', text):
                options[-1] = options[-1] + ' ' + text

        j += 1

    return options, correct, j


def parse_docx(docx_path, topic_id, exam_set_id):
    try:
        with zipfile.ZipFile(docx_path) as z:
            with z.open('word/document.xml') as f:
                xml = f.read().decode('utf-8')
    except Exception as e:
        print(f'   ❌ Lỗi đọc file: {e}')
        return []

    paras = parse_paragraphs(xml)
    start = find_answer_start(paras)
    answer_paras = paras[start:]

    questions = []
    section = 'mc'
    i = 0

    while i < len(answer_paras):
        text = answer_paras[i]['text']

        # Nhận diện section
        if re.search(r'ĐÚNG.{0,5}SAI|II\.\s*CÂU', text, re.I) and not re.match(r'Câu\s*\d+', text, re.I):
            section = 'tf'; i += 1; continue
        if re.search(r'TRẢ LỜI NGẮN|III\.\s*CÂU', text, re.I) and not re.match(r'Câu\s*\d+', text, re.I):
            section = 'short'; i += 1; continue

        # Nhận diện câu hỏi
        cau_m = re.match(r'Câu\s*(\d+)[^a-zA-Z\d]*\s*(.*)', text, re.I)
        if not cau_m:
            i += 1; continue
        
        q_num = cau_m.group(1)
        q_text = cau_m.group(2).strip()
        if not q_text:
            i += 1; continue

        # === TRẮC NGHIỆM MC ===
        if section == 'mc':
            options, correct, next_i = parse_mc_options(answer_paras, i + 1)

            # Chỉ lưu nếu có đủ options
            if len(options) >= 2:
                questions.append({
                    'type': 'mc',
                    'content': q_text,
                    'options': options[:4],
                    'correctAnswer': correct or 'A',
                    'explanation': '',
                    'difficulty': 2,
                    'topicId': topic_id,
                    'examSetId': exam_set_id
                })
            i = next_i

        # === ĐÚNG SAI TF ===
        elif section == 'tf':
            # 1. Lấy nội dung text từ nửa đầu văn bản (Phần đề)
            content_dict = get_tf_subitems_from_first_half(paras, start, q_num)
            
            sub_items = []
            correct_ans = {}
            j = i + 1

            # 2. Quét đáp án đúng/sai ở đoạn sau
            while j < len(answer_paras) and j < i + 30:
                t2 = answer_paras[j]['text']
                if re.match(r'Câu\s*\d+[:\s.]', t2, re.I) and j > i + 1:
                    break
                if re.search(r'TRẢ LỜI NGẮN|PHẦN III', t2, re.I):
                    break

                sm = re.match(r'^([a-d])[.\)]\s*(.*)', t2, re.I)
                if sm:
                    letter = sm.group(1).lower()
                    ans_text = sm.group(2).strip()
                    
                    # Bắt true/false
                    is_true = None
                    if re.search(r'\bđúng\b', ans_text, re.I): is_true = True
                    elif re.search(r'\bsai\b', ans_text, re.I): is_true = False
                    
                    if is_true is not None:
                        correct_ans[letter] = is_true
                        
                    # Fallback (nếu phần đầu vì lý do nào đó không tìm thấy text)
                    clean_ans = re.sub(r'\s*(đúng|sai)\s*[.:]?.*$', '', ans_text, flags=re.I)
                    clean_ans = re.split(r'🡪|→', clean_ans)[0].strip()
                    if letter not in content_dict and clean_ans:
                        content_dict[letter] = clean_ans
                j += 1

            # 3. Gộp thành mảng subItems hoàn chỉnh
            for letter in ['a', 'b', 'c', 'd']:
                if letter in content_dict or letter in correct_ans:
                    sub_items.append({
                        'label': letter,
                        'content': content_dict.get(letter, ''),
                        'isCorrect': correct_ans.get(letter, True)
                    })

            if sub_items:
                questions.append({
                    'type': 'tf',
                    'content': q_text,
                    'options': [],
                    'correctAnswer': correct_ans,
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
            while j < len(answer_paras) and j < i + 6:
                t2 = answer_paras[j]['text']
                if re.match(r'Câu\s*\d+[:\s.]', t2, re.I) and j > i + 1:
                    break
                da = re.search(r'(?:Điền đáp án|ĐÁP ÁN)[:\s\*]*(.+)', t2, re.I)
                if da:
                    answer = re.split(r'🡪|→', re.sub(r'\*+', '', da.group(1)))[0].strip()
                star_m = re.search(r'\*{2,}\s*(.+)', t2)
                if star_m and not answer:
                    answer = re.split(r'🡪|→', star_m.group(1))[0].strip()
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
    print(f'🚀 Parse {len(TOPIC_MAP)} files (xóa cache cũ)...\n')

    # Xóa cache cũ để parse lại sạch
    import shutil
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
        out_file = os.path.join(OUT_DIR, f"{exam_set_id}.json")

        if not os.path.exists(fpath):
            print(f'⚠️  [{idx+1}/{len(TOPIC_MAP)}] Không tìm thấy: {item["file"]}')
            continue

        print(f'📄 [{idx+1}/{len(TOPIC_MAP)}] {item["topicName"]}')
        questions = parse_docx(fpath, tid, exam_set_id)

        mc = sum(1 for q in questions if q['type'] == 'mc')
        tf = sum(1 for q in questions if q['type'] == 'tf')
        sh = sum(1 for q in questions if q['type'] == 'short')
        print(f'   ✅ {len(questions)} câu: MC={mc} TF={tf} Short={sh}')

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
    print(f'➡️  Chạy tiếp: npm run seed-v2')

if __name__ == '__main__':
    main()