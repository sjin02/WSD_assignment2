import prisma from "../prisma/client.js";
import { getAdminUsers } from "../services/user.service.js";
import { adminUpdateUser } from "../services/user.service.js";
import { adminUpdateUserDto } from "../dtos/adminUser.dto.js";

// 관리자: 전체 유저 조회 (검색/정렬/페이지네이션)
export async function getAllUsers(req, res, next) {
  try {
    const {
      page = 1,
      limit = 20,
      sort = "createdAt",
      order = "desc",
      q,
      role,
    } = req.query;

    const result = await getAdminUsers({
      page: Number(page),
      limit: Number(limit),
      sort,
      order,
      q,
      role,
    });

    return res.success(
      result,
      200,
      "유저 목록 조회 완료"
    );
  } catch (err) {
    next(err);
  }
}

// 관리자: 회원 정지 (Soft Delete)
export async function softDeleteUser(req, res, next) {
  try {
    const targetId = Number(req.params.id);

    // 자기 자신 정지 방지
    if (targetId === req.user.userId) {
      return res.fail("관리자는 자기 자신을 정지할 수 없습니다", 400, "INVALID_OPERATION");
    }

    await prisma.user.update({
      where: { id: targetId },
      data: { deletedAt: new Date() },
    });

    return res.success(
      {},
      200,
      "회원 정지 완료"
    );
  } catch (err) {
    next(err);
  }
}

// 관리자: 유저 정보 수정 (role 변경 / 비밀번호 초기화 / 복구)
export async function updateUserByAdmin(req, res, next) {
  try {
    const targetUserId = Number(req.params.id);
    const adminUserId = req.user.userId;

    const dto = adminUpdateUserDto.parse(req.body);

    const result = await adminUpdateUser({
      targetUserId,
      adminUserId,
      ...dto,
    });

    return res.success(
      result,
      200,
      "유저 정보 수정 완료"
    );
  } catch (err) {
    if (err.message === "USER_NOT_FOUND") {
      return res.fail("유저를 찾을 수 없습니다", 404, "USER_NOT_FOUND");
    }

    if (err.message === "CANNOT_UPDATE_SELF") {
      return res.fail("자기 자신은 수정할 수 없습니다", 400, "INVALID_OPERATION");
    }

    next(err);
  }
}
