const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bookdb';

// DB 연결
mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB 연결 성공'))
  .catch((err) => {
    console.error('❌ MongoDB 연결 실패:', err.message);
    process.exit(1);
  });

app.use(cors()); // GitHub Pages의 검색 데모가 로컬/클라우드 API에 접근 가능하도록
app.use(bodyParser.json());

// Book 모델
const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    isbn: { type: String, trim: true },
    year: { type: Number }
  },
  { timestamps: true }
);

const Book = mongoose.model('Book', bookSchema);

// 헬스 체크
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// 도서 전체 조회 + 필터(검색)
app.get('/books', async (req, res) => {
  const { q, title, author, isbn } = req.query;

  // q가 있으면 title/author/isbn 전체에서 부분 일치 검색
  if (q) {
    const regex = new RegExp(q, 'i');
    const books = await Book.find({
      $or: [{ title: regex }, { author: regex }, { isbn: regex }]
    }).sort({ createdAt: -1 });
    return res.json(books);
  }

  // 개별 필드 검색
  const filter = {};
  if (title) filter.title = new RegExp(title, 'i');
  if (author) filter.author = new RegExp(author, 'i');
  if (isbn) filter.isbn = new RegExp(isbn, 'i');

  const books = await Book.find(filter).sort({ createdAt: -1 });
  res.json(books);
});

// 특정 도서 조회
app.get('/books/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: '도서를 찾을 수 없습니다.' });
    res.json(book);
  } catch {
    res.status(400).json({ message: '잘못된 도서 ID입니다.' });
  }
});

// 도서 추가
app.post('/books', async (req, res) => {
  try {
    const { title, author, isbn, year } = req.body;
    if (!title || !author) return res.status(400).json({ message: 'title과 author는 필수입니다.' });
    const newBook = await Book.create({ title, author, isbn, year });
    res.status(201).json(newBook);
  } catch (err) {
    res.status(500).json({ message: '도서 생성 중 오류', error: err.message });
  }
});

// 도서 수정(전체)
app.put('/books/:id', async (req, res) => {
  try {
    const { title, author, isbn, year } = req.body;
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { title, author, isbn, year },
      { new: true, runValidators: true }
    );
    if (!book) return res.status(404).json({ message: '도서를 찾을 수 없습니다.' });
    res.json(book);
  } catch {
    res.status(400).json({ message: '잘못된 요청입니다.' });
  }
});

// 도서 일부 수정
app.patch('/books/:id', async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!book) return res.status(404).json({ message: '도서를 찾을 수 없습니다.' });
    res.json(book);
  } catch {
    res.status(400).json({ message: '잘못된 요청입니다.' });
  }
});

// 도서 삭제
app.delete('/books/:id', async (req, res) => {
  try {
    const deleted = await Book.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: '도서를 찾을 수 없습니다.' });
    res.status(204).send();
  } catch {
    res.status(400).json({ message: '잘못된 요청입니다.' });
  }
});

// (옵션) 개발용 샘플 데이터 시드
app.post('/seed', async (_req, res) => {
  await Book.deleteMany({});
  await Book.insertMany([
    { title: 'Node.js 교과서', author: '홍길동', isbn: '978-000000001', year: 2024 },
    { title: 'JavaScript Deep Dive', author: '박자바', isbn: '978-000000002', year: 2023 },
    { title: 'MongoDB Basics', author: '이몽고', isbn: '978-000000003', year: 2022 }
  ]);
  res.status(201).json({ message: 'Seed completed' });
});

app.listen(PORT, () => {
  console.log(`📘 Book API 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
  console.log(`MongoDB: ${MONGODB_URI}`);
});
