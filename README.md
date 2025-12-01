# 📚 Book Management API (검색 기능 포함)

도서 정보를 관리하고 검색할 수 있는 REST API입니다.  
Node.js, Express, MongoDB(Mongoose)를 사용합니다.  
GitHub Pages(`/docs`)로 프로젝트 소개 및 검색 데모 UI를 제공합니다.

---

## 🚀 주요 기능
- 도서 전체 조회 (GET `/books`)
- 도서 검색 (GET `/books?q=키워드` 또는 `/books?title=...&author=...&isbn=...`)
- 특정 도서 조회 (GET `/books/:id`)
- 도서 추가 (POST `/books`)
- 도서 수정 (PUT/PATCH `/books/:id`)
- 도서 삭제 (DELETE `/books/:id`)
- 헬스 체크 (GET `/health`)
- 샘플 데이터 시드 (POST `/seed`)

---

## 🛠️ 설치 및 실행

### 1) 저장소 클론
```bash
git clone https://github.com/username/book-api.git
cd book-api