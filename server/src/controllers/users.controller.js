import prisma from "../prisma/client.js";
import bcrypt from "bcrypt";

export async function signup(req, res) {
  const { email, password, name } = req.body;

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    throw { status: 409, code: "USER_EXISTS", message: "이미 존재하는 이메일" };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { email, passwordHash, name },
  });

  res.success({ id: user.id, email: user.email }, 201);
}

export async function getMe(req, res) {
  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    select: { id: true, email: true, name: true, role: true },
  });

  res.success(user);
}

export async function updateMe(req, res) {
  const user = await prisma.user.update({
    where: { id: req.user.userId },
    data: req.body,
  });

  res.success({ id: user.id, name: user.name });
}

//관리자 전용: 회원 정지 (Soft Delete)
export async function softDeleteUser(req, res) {
  await prisma.user.update({
    where: { id: Number(req.params.id) },
    data: { deletedAt: new Date() },
  });

  res.success({ message: "회원 정지 완료" });
}