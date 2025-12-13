import {
  addFavorite,
  removeFavorite,
  getMyFavorites,
} from "../services/favorite.service.js";

export async function addFavoriteController(req, res, next) {
  try {
    const userId = req.user.userId;
    const bookId = Number(req.params.id);

    await addFavorite({ userId, bookId });
    res.success({}, 201, "찜 추가 완료");
  } catch (err) {
    // 이미 찜한 경우 (unique constraint)
    if (err.code === "P2002") {
      return res.fail("이미 찜한 도서입니다", 409, "ALREADY_FAVORITED");
    }
    next(err);
  }
}

export async function removeFavoriteController(req, res, next) {
  try {
    const userId = req.user.userId;
    const bookId = Number(req.params.id);

    await removeFavorite({ userId, bookId });
    res.success({}, 200, "찜 제거 완료");
  } catch (err) {
    next(err);
  }
}

export async function getMyFavoritesController(req, res, next) {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10 } = req.query;

    const result = await getMyFavorites({
      userId,
      page: Number(page),
      limit: Number(limit),
    });

    res.success(result, 200, "내 찜 목록 조회 완료");
  } catch (err) {
    next(err);
  }
}
