import React, { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0); // count = state

  return (
    <div style={{ marginTop: "20px" }}>
      <h3>현재 숫자: {count}</h3>
      <button onClick={() => setCount(count + 1)}>
        숫자 증가
      </button>
    </div>
  );
}

export default Counter;
