import React, { useEffect, useState } from "react";
import { getBooks } from "../api/books";
import BookCard from "../components/BookCard";

function Home() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getBooks();
        setBooks(data); // 받아온 데이터를 상태로 저장
      } catch (err) {
        console.error("책 불러오기 오류:", err);
      }
    }
    fetchData();
  }, []);

  return (
    <div>
      <h2>책 목록</h2>

      {books.map((book) => (
        <BookCard
          key={book.id}
          title={book.title}
          author={book.author}
          price={book.price}
        />
      ))}
    </div>
  );
}

export default Home;
