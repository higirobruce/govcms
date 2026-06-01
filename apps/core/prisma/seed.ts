import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@govcms.local";
  const password = "changeme-now-please";

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name: "Platform Admin", passwordHash },
  });

  const tenant = await prisma.tenant.upsert({
    where: { slug: "pilot" },
    update: {},
    create: {
      name: "Pilot Ministry",
      slug: "pilot",
      locales: ["en", "rw"],
      defaultLocale: "en",
      memberships: { create: { userId: user.id, role: "OWNER" } },
      contentTypes: {
        create: [
          { key: "page", name: "Page" },
          { key: "news", name: "News" },
          { key: "service", name: "Service" },
        ],
      },
    },
  });

  console.log("Seeded:");
  console.log(`  user   ${email} / ${password}`);
  console.log(`  tenant ${tenant.slug} (${tenant.id})`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
