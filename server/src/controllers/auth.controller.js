import bcrypt from 'bcrypt';
import e from 'express';
import jwt from 'jsonwebtoken';

const users = [
  {
    id: 1, 
    email: 'test@example.com',
    password: '$2b$10$KIXQJZ6Yh1r8b8Z0u5cHee5pQ9KfOa5h7Fz1Z6Fz6Fz6Fz6Fz6Fz6' // 'password123'의 해시
  }
];

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ message: '이메일 혹은 비밀번호가 올바르지 않습니다.' });
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: '이메일 혹은 비밀번호가 올바르지 않습니다.' });
  }

  const token = jwt.sign(
    { userId: user.id }, process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  return res.json({
    message: '로그인 성공',
    token,
    user: { id: user.id, email: user.email },
  });
};