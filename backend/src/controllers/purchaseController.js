import { prisma } from "../server.js";
import { createAudit } from "../utils/audit.js";
import { validateWriteBase, getScopedBaseId } from "../middleware/rbac.js";

export async function listPurchases(req, res) {
  const baseId = getScopedBaseId(req);
  const equipmentTypeId = req.query.equipmentTypeId
    ? Number(req.query.equipmentTypeId)
    : undefined;

  const purchases = await prisma.purchase.findMany({
    where: {
      ...(baseId !== undefined ? { baseId } : {}),
      ...(equipmentTypeId ? { equipmentTypeId } : {})
    },
    include: {
      base: true,
      equipmentType: true,
      createdBy: { select: { username: true } }
    },
    orderBy: { purchaseDate: "desc" }
  });

  res.json(purchases);
}

export async function createPurchase(req, res) {
  try {
    const { baseId, equipmentTypeId, quantity, purchaseDate } = req.body;

    if (!baseId || !equipmentTypeId || !quantity || Number(quantity) <= 0) {
      return res.status(400).json({
        message: "baseId, equipmentTypeId and positive quantity are required"
      });
    }

    if (!validateWriteBase(req, baseId)) {
      return res.status(403).json({ message: "You can only add stock to your base" });
    }

    const purchase = await prisma.$transaction(async (tx) => {
      const item = await tx.purchase.create({
        data: {
          baseId: Number(baseId),
          equipmentTypeId: Number(equipmentTypeId),
          quantity: Number(quantity),
          purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
          createdById: req.user.id
        },
        include: {
          base: true,
          equipmentType: true
        }
      });

      await createAudit(
        tx,
        req.user.id,
        "PURCHASE",
        `Purchased ${quantity} ${item.equipmentType.name} for ${item.base.name}`
      );

      return item;
    });

    res.status(201).json(purchase);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
