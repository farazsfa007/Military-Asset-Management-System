import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.auditLog.deleteMany();
  await prisma.expenditure.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.transfer.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.user.deleteMany();
  await prisma.equipmentType.deleteMany();
  await prisma.base.deleteMany();

  const alpha = await prisma.base.create({
    data: { name: "Fort Alpha", location: "Northern Command" }
  });

  const bravo = await prisma.base.create({
    data: { name: "Fort Bravo", location: "Central Command" }
  });

  const charlie = await prisma.base.create({
    data: { name: "Fort Charlie", location: "Western Command" }
  });

  const ammo = await prisma.equipmentType.create({
    data: { name: "5.56mm Ammunition", category: "AMMUNITION" }
  });

  const rifle = await prisma.equipmentType.create({
    data: { name: "M4 Carbine", category: "WEAPON" }
  });

  const humvee = await prisma.equipmentType.create({
    data: { name: "Humvee", category: "VEHICLE" }
  });

  const adminPassword = await bcrypt.hash("AdminPass123!", 10);
  const commanderPassword = await bcrypt.hash("CommandPass123!", 10);
  const logisticsPassword = await bcrypt.hash("LogisticsPass123!", 10);

  const admin = await prisma.user.create({
    data: {
      username: "admin_user",
      passwordHash: adminPassword,
      role: "ADMIN"
    }
  });

  const commander = await prisma.user.create({
    data: {
      username: "commander_alpha",
      passwordHash: commanderPassword,
      role: "BASE_COMMANDER",
      baseId: alpha.id
    }
  });

  const logistics = await prisma.user.create({
    data: {
      username: "logistics_officer",
      passwordHash: logisticsPassword,
      role: "LOGISTICS_OFFICER",
      baseId: alpha.id
    }
  });

  await prisma.purchase.createMany({
    data: [
      { baseId: alpha.id, equipmentTypeId: ammo.id, quantity: 1000, createdById: admin.id },
      { baseId: alpha.id, equipmentTypeId: rifle.id, quantity: 50, createdById: admin.id },
      { baseId: bravo.id, equipmentTypeId: ammo.id, quantity: 700, createdById: admin.id },
      { baseId: alpha.id, equipmentTypeId: humvee.id, quantity: 8, createdById: admin.id }
    ]
  });

  await prisma.transfer.create({
    data: {
      sourceBaseId: alpha.id,
      destinationBaseId: bravo.id,
      equipmentTypeId: ammo.id,
      quantity: 200,
      initiatedById: admin.id
    }
  });

  await prisma.assignment.create({
    data: {
      baseId: alpha.id,
      equipmentTypeId: rifle.id,
      quantity: 5,
      assignedTo: "Alpha Unit A",
      createdById: commander.id
    }
  });

  await prisma.expenditure.create({
    data: {
      baseId: alpha.id,
      equipmentTypeId: ammo.id,
      quantity: 100,
      reason: "Training exercise",
      createdById: commander.id
    }
  });

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "SEED",
      details: "Initial sample data created"
    }
  });

  console.log("Database seeded successfully.");
  console.log("Admin:", admin.username, " / AdminPass123!");
  console.log("Commander:", commander.username, " / CommandPass123!");
  console.log("Logistics:", logistics.username, " / LogisticsPass123!");
  console.log("Bases:", alpha.name, bravo.name, charlie.name);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
