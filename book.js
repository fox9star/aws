const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bookdb';

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB 연결 성공"))
  .catch(err => console.error("❌ MongoDB 연결 실패:", err));

app.use(cors()); // GitHub Pages에서 API 호출 가능하도록
app.use(bodyParser.json());

// Book 모델 정의
const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  isbn: String,
  year: Number
}, { timestamps: true });

const Book = mongoose.model('Book', bookSchema);

// 헬스 체크
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// 도서 조회 + 검색
app.get('/books', async (req, res) => {
  const { q, title, author, isbn } = req.query;
  let filter = {};

  if (q) {
    const regex = new RegExp(q, 'i');
    filter = { $or: [{ title: regex }, { author: regex }, { isbn: regex }] };
  } else {
    if (title) filter.title = new RegExp(title, 'i');
    if (author) filter.author = new RegExp(author, 'i');
    if (isbn) filter.isbn = new RegExp(isbn, 'i');
  }

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
  const newBook = new Book(req.body);
  await newBook.save();
  res.status(201).json(newBook);
});

// 도서 수정
app.put('/books/:id', async (req, res) => {
  const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(book);
});

// 도서 삭제
app.delete('/books/:id', async (req, res) => {
  await Book.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

// 샘플 데이터 시드
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
  console.log(`📘 Book API 서버 실행: http://localhost:${PORT}`);
});