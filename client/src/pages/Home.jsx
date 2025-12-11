import React from "react";
import BookCard from "../components/BookCard";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div>
      <h2>서점 홈</h2>
      <Link to="/login">로그인 하러가기</Link>
      <br /><br />
      <Link to="/books/3">3번 책 상세 보기</Link>

      <BookCard
        title="해리포터와 마법사의 돌"
        author="J.K. 롤링"
        price={15000}
      />

      <BookCard
        title="나미야 잡화점의 기적"
        author="히가시노 게이고"
        price={14000}
      />

      <BookCard
        title="미움받을 용기"
        author="기시미 이치로"
        price={13000}
      />
    </div>
  );
}

export default Home;
