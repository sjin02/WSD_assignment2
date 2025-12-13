import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from "../prisma/client.js";


export async function login(req, res) {
  const { email, password } = req.body;

  const user = await prisma.user.findFirst({
    where: { email, deletedAt: null },
  });

  if (!user) {
    throw { status: 401, code: "LOGIN_FAILED", message: "로그인 실패" };
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    throw { status: 401, code: "LOGIN_FAILED", message: "로그인 실패" };
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.success({ token });
}