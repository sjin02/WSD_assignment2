import prisma from "./client.js";
import { createUsers } from "./data/users.js";
import { createBooks } from "./data/books.js";
import { randomInt, randomPick } from "./data/utils.js";

async function main() {
  console.log("DB 초기화 중...");
  await prisma.review.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.book.deleteMany();
  await prisma.user.deleteMany();

  console.log("Seeding 시작...");

  await createUsers(prisma);
  await createBooks(prisma);

  const users = await prisma.user.findMany({ where: { role: "USER" } });
  const books = await prisma.book.findMany();

  // Reviews 50개
  for (let i = 0; i < 50; i++) {
    await prisma.review.create({
      data: {
        userId: randomPick(users).id,
        bookId: randomPick(books).id,
        rating: randomInt(1, 5),
        comment: `리뷰 내용 ${i + 1}`,
      },
    });
  }

  // Favorites 30개
  for (let i = 0; i < 30; i++) {
    const user = randomPick(users);
    const book = randomPick(books);

    await prisma.favorite.upsert({
      where: {
        userId_bookId: {
          userId: user.id,
          bookId: book.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        bookId: book.id,
      },
    });
  }

  // Orders 20개
  for (let i = 0; i < 20; i++) {
    const user = randomPick(users);
    const book = randomPick(books);
    const quantity = randomInt(1, 3);

    await prisma.order.create({
      data: {
        userId: user.id,
        totalAmount: book.price * quantity,
        status: "PAID",
        items: {
          create: [
            {
              bookId: book.id,
              quantity,
              unitPrice: book.price,
            },
          ],
        },
      },
    });
  }

  console.log("seeding 완료");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
