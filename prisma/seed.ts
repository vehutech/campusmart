import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Categories
  const categories = await Promise.all([
    prisma.category.upsert({ where: { slug: "books" }, update: {}, create: { name: "Books & Stationery", slug: "books", icon: "📚" } }),
    prisma.category.upsert({ where: { slug: "electronics" }, update: {}, create: { name: "Electronics", slug: "electronics", icon: "💻" } }),
    prisma.category.upsert({ where: { slug: "fashion" }, update: {}, create: { name: "Fashion & Clothing", slug: "fashion", icon: "👗" } }),
    prisma.category.upsert({ where: { slug: "food" }, update: {}, create: { name: "Food & Snacks", slug: "food", icon: "🍱" } }),
    prisma.category.upsert({ where: { slug: "accessories" }, update: {}, create: { name: "Accessories", slug: "accessories", icon: "🎒" } }),
    prisma.category.upsert({ where: { slug: "services" }, update: {}, create: { name: "Services", slug: "services", icon: "🛠️" } }),
  ]);

  console.log(`✅ ${categories.length} categories created`);

  // Demo users
  const hashedPass = await bcrypt.hash("password123", 12);

  const buyer = await prisma.user.upsert({
    where: { email: "buyer@campusmart.ng" },
    update: {},
    create: {
      name: "Amina Ibrahim",
      email: "buyer@campusmart.ng",
      password: hashedPass,
      role: "BUYER",
      matricNo: "FUL/2021/0045",
      phone: "+234 810 123 4567",
    },
  });

  const vendor = await prisma.user.upsert({
    where: { email: "vendor@campusmart.ng" },
    update: {},
    create: {
      name: "Chidi Okonkwo",
      email: "vendor@campusmart.ng",
      password: hashedPass,
      role: "VENDOR",
      matricNo: "FUL/2020/0112",
      phone: "+234 802 987 6543",
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@campusmart.ng" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@campusmart.ng",
      password: hashedPass,
      role: "ADMIN",
    },
  });

  console.log(`✅ Demo users created`);

  // Demo products
  const booksCat = categories[0];
  const elecCat = categories[1];
  const fashionCat = categories[2];

  const products = await Promise.all([
    prisma.product.create({
      data: {
        title: "Engineering Mathematics Textbook",
        description: "Complete engineering mathematics textbook, 3rd edition. Very good condition, minimal highlighting. Perfect for 200 level students.",
        price: 4500,
        images: ["https://placehold.co/400x400/111827/00d4ff?text=Math+Book"],
        condition: "USED",
        stock: 1,
        location: "Block D Hostel",
        vendorId: vendor.id,
        categoryId: booksCat.id,
      },
    }),
    prisma.product.create({
      data: {
        title: "Samsung Galaxy Earbuds",
        description: "Original Samsung Galaxy Buds. Works perfectly, selling because I got AirPods. Comes with original case.",
        price: 18000,
        images: ["https://placehold.co/400x400/111827/00e5a0?text=Earbuds"],
        condition: "USED",
        stock: 1,
        location: "Faculty of Engineering",
        vendorId: vendor.id,
        categoryId: elecCat.id,
      },
    }),
    prisma.product.create({
      data: {
        title: "Ankara Fabric (6 yards)",
        description: "Beautiful high quality Ankara fabric, 6 yards. Blue and gold pattern. Great for aso-ebi or personal use.",
        price: 8500,
        images: ["https://placehold.co/400x400/111827/ff7d3b?text=Ankara"],
        condition: "NEW",
        stock: 3,
        location: "Female Hostel Area",
        vendorId: vendor.id,
        categoryId: fashionCat.id,
      },
    }),
    prisma.product.create({
      data: {
        title: "HP Laptop Charger (65W)",
        description: "Original HP 65W laptop charger. Compatible with most HP ProBook and EliteBook models. Works 100%.",
        price: 7000,
        images: ["https://placehold.co/400x400/111827/a78bfa?text=HP+Charger"],
        condition: "USED",
        stock: 1,
        location: "Library Area",
        vendorId: vendor.id,
        categoryId: elecCat.id,
      },
    }),
    prisma.product.create({
      data: {
        title: "Introduction to Programming (Python)",
        description: "Brand new Python programming book for beginners. Covers basics to intermediate. Ideal for CS and IT students.",
        price: 3200,
        images: ["https://placehold.co/400x400/111827/00d4ff?text=Python+Book"],
        condition: "NEW",
        stock: 2,
        location: "Faculty of Science",
        vendorId: vendor.id,
        categoryId: booksCat.id,
      },
    }),
    prisma.product.create({
      data: {
        title: "School Backpack (High Quality)",
        description: "Durable waterproof backpack with laptop compartment. Multiple pockets, adjustable straps. Black color.",
        price: 6500,
        images: ["https://placehold.co/400x400/111827/ff4d6d?text=Backpack"],
        condition: "NEW",
        stock: 5,
        location: "Main Gate Area",
        vendorId: vendor.id,
        categoryId: categories[4].id,
      },
    }),
  ]);

  console.log(`✅ ${products.length} demo products created`);
  console.log("\n🎉 Seeding complete!");
  console.log("\nDemo credentials:");
  console.log("  Buyer:  buyer@campusmart.ng / password123");
  console.log("  Vendor: vendor@campusmart.ng / password123");
  console.log("  Admin:  admin@campusmart.ng / password123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
