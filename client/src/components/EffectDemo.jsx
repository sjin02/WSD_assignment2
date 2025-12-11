import React, { useState, useEffect } from "react";

function EffectDemo() {
  const [name, setName] = useState("");

  // 컴포넌트가 처음 렌더될 때 1번 실행
  useEffect(() => {
    console.log("화면에 컴포넌트가 나타났습니다.");
  }, []);

  // name 값이 바뀔 때마다 실행
  useEffect(() => {
    console.log("name 값이 변경됨:", name);
  }, [name]);

  return (
    <div style={{ marginTop: "20px" }}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="이름 입력"
      />
    </div>
  );
}

export default EffectDemo;
