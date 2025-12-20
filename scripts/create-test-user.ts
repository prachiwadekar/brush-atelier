import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const email = "test@brushatelier.ai";
  const password = "password123";
  const name = "Test User";

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log("Test user already exists!");
    console.log("Email:", email);
    console.log("Password: password123");
    return;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role: "STUDENT",
    },
  });

  console.log("✅ Test user created successfully!");
  console.log("Email:", email);
  console.log("Password: password123");
  console.log("User ID:", user.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
