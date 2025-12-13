import bcrypt from "bcrypt";

export async function createUsers(prisma) {
  const passwordHash = await bcrypt.hash("password123", 10);

  const users = [];

  // ADMIN 1명
  users.push({
    email: "admin@test.com",
    name: "관리자",
    passwordHash,
    role: "ADMIN",
  });

  // SELLER 4명
  for (let i = 1; i <= 4; i++) {
    users.push({
      email: `seller${i}@test.com`,
      name: `판매자${i}`,
      passwordHash,
      role: "SELLER",
    });
  }

  // USER 15명
  for (let i = 1; i <= 15; i++) {
    users.push({
      email: `user${i}@test.com`,
      name: `유저${i}`,
      passwordHash,
      role: "USER",
    });
  }

  await prisma.user.createMany({ data: users });
}
