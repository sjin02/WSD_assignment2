import { randomInt } from "./utils.js";

export async function createBooks(prisma) {
  const books = [];

  for (let i = 1; i <= 100; i++) {
    books.push({
      title: `책 ${i}`,
      author: `저자${randomInt(1, 10)}`,
      price: randomInt(10000, 30000),
      stock: randomInt(0, 50),
      isbn: `ISBN-${i}`,
      description: `적당한 도서 ${i}`,
    });
  }

  await prisma.book.createMany({ data: books });
}
