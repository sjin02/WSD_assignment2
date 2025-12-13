import prisma from "../prisma/client.js";
import bcrypt from "bcrypt";

// 회원가입
export async function signup(req, res, next) {
  try {
    const { email, password, name } = req.body;

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return res.fail("이미 존재하는 이메일", 409, "USER_EXISTS");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, passwordHash, name },
    });

    return res.success(
      { id: user.id, email: user.email },
      201,
      "회원가입 완료"
    );
  } catch (err) {
    next(err);
  }
}

// 내 정보 조회
export async function getMe(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return res.success(user);
  } catch (err) {
    next(err);
  }
}

// 내 정보 수정
export async function updateMe(req, res, next) {
  try {
    const { name } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: { name },
    });

    return res.success(
      { id: user.id, name: user.name },
      200,
      "회원 정보 수정 완료"
    );
  } catch (err) {
    next(err);
  }
}

// 본인 회원 탈퇴 (Soft Delete)
export async function deleteMe(req, res, next) {
  try {
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { deletedAt: new Date() },
    });

    return res.success(
      {},
      200,
      "회원 탈퇴 완료"
    );
  } catch (err) {
    next(err);
  }
}
