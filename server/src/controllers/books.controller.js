import prisma from "../prisma/client.js";

export async function getBooks(req, res) {
  try {
    const books = await prisma.book.findMany();

    res.json({ books });
  } catch (error) {
    console.error("Book fetch error:", error);
    res.status(500).json({ message: "Failed to fetch books" });
  }
}
