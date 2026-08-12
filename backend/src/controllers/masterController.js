import { prisma } from "../server.js";

export async function getBases(req, res) {
  const bases = await prisma.base.findMany({
    orderBy: { name: "asc" }
  });
  res.json(bases);
}

export async function getEquipmentTypes(req, res) {
  const types = await prisma.equipmentType.findMany({
    orderBy: { name: "asc" }
  });
  res.json(types);
}
