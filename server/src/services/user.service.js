import prisma from "../prisma/client.js";
import bcrypt from "bcrypt";

// 관리자: 전체 유저 조회 (검색/정렬/페이지네이션)
export async function getAdminUsers({
  page = 1,
  limit = 20,
  sort = "createdAt",
  order = "desc",
  q,
  role,
}) {
  const skip = (page - 1) * limit;

  const where = {
    deletedAt: null,
    ...(role && { role }),
    ...(q && {
      OR: [
        { email: { contains: q, mode: "insensitive" } },
        { name: { contains: q, mode: "insensitive" } },
      ],
    }),
  };

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sort]: order },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    items,
    meta: {
      page,
      limit,
      total,
      hasNext: skip + items.length < total,
    },
  };
}

// 관리자: 유저 정보 수정 (역할 변경, 비밀번호 초기화, 복구)
export async function adminUpdateUser({
  targetUserId,
  adminUserId,
  role,
  resetPassword,
  restore,
}) {
  // 1️. 대상 유저 조회
  const user = await prisma.user.findUnique({
    where: { id: targetUserId },
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  // 2️. 자기 자신 변경 방지
  if (targetUserId === adminUserId) {
    throw new Error("CANNOT_UPDATE_SELF");
  }

  const updateData = {};

  // 3️. role 변경
  if (role) {
    updateData.role = role;
  }

  // 4️. 비밀번호 초기화
  let tempPassword;
  if (resetPassword) {
    tempPassword = Math.random().toString(36).slice(-10);
    updateData.passwordHash = await bcrypt.hash(tempPassword, 10);
  }

  // 5️. soft delete 복구
  if (restore) {
    updateData.deletedAt = null;
  }

  await prisma.user.update({
    where: { id: targetUserId },
    data: updateData,
  });

  return {
    resetPassword: !!resetPassword,
    tempPassword, // 이메일 전송
    restored: !!restore,
    roleChanged: !!role,
  };
}