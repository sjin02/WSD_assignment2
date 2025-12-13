import bcrypt from 'bcrypt';
import prisma from "../prisma/client.js";
import crypto from "crypto";
import {signAccessToken, signRefreshToken, verifyToken } from "../utils/jwt.js";

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findFirst({
      where: {email, deletedAt: null},
    });

    if (!user) {
      return res.fail(
        "이메일이 올바르지 않습니다",
        401,
        "AUTH_INVALID"
      );
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.fail(
        "비밀번호가 올바르지 않습니다",
        401,
        "AUTH_INVALID"
      );
    }

    const accessToken = signAccessToken({
      userId: user.id,
      role: user.role,
    });

    const refreshToken = signRefreshToken({
      userId: user.id,
    });

    const tokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");
    
    await prisma.refreshToken.updateMany({
      where: {
        userId: user.id,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(
          Date.now() + 14 * 24 * 60 * 60 * 1000
        ),
      },
    });

    return res.success(
      { accessToken, refreshToken },
      200,
      "Login successful"
    );
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.fail("refresh token 필요", 400, "TOKEN_REQUIRED");
    }

    //util로 검증
    const payload = verifyToken(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    const tokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const storedToken = await prisma.refreshToken.findFirst({
      where: {
        userId: payload.userId,
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!storedToken) {
      return res.fail("유효하지 않은 토큰", 401, "TOKEN_INVALID");
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || user.deletedAt) {
      return res.fail("사용자 없음", 401, "USER_NOT_FOUND");
    }

    const newAccessToken = signAccessToken({
      userId: user.id,
      role: user.role,
    });

    return res.success(
      { accessToken: newAccessToken },
      200,
      "Access token 재발급 성공"
    );
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    await prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    // refresh token 쿠키 삭제
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.success(
      {},
      200,
      "로그아웃 완료"
    );
  } catch (err) {
    next(err);
  }
};