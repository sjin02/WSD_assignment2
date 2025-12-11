import React from "react";

function BookCard({ title, author, price }) {
  return (
    <div style={{ border: "1px solid #ddd", padding: "12px", borderRadius: "8px", marginBottom: "12px" }}>
      <h3>{title}</h3>
      <p>저자: {author}</p>
      <p>가격: {price}원</p>
    </div>
  );
}

export default BookCard;
