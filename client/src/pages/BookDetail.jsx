import React from "react";
import { useParams } from "react-router-dom";

function BookDetail() {
  const { id } = useParams(); // URL에서 /books/:id 받아오기

  return (
    <div>
      <h2>책 상세 페이지</h2>
      <p>책 ID: {id}</p>
    </div>
  );
}

export default BookDetail;
