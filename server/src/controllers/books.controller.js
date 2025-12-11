import prisma from '../prisma/client.js';

export const getBooks = async (req, res) => {
  try {
    const books = await prisma.book.findMany();
    res.json(books);
  } catch (error) {
    console.error('GET /books error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};