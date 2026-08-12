import { prisma } from "../server.js";
import { createAudit } from "../utils/audit.js";
import { validateWriteBase, getScopedBaseId } from "../middleware/rbac.js";

async function getAvailableStock(tx, baseId, equipmentTypeId) {
  const [purchases, incoming, outgoing, assignments, expenditures] =
    await Promise.all([
      tx.purchase.aggregate({
        _sum: { quantity: true },
        where: { baseId, equipmentTypeId }
      }),
      tx.transfer.aggregate({
        _sum: { quantity: true },
        where: { destinationBaseId: baseId, equipmentTypeId }
      }),
      tx.transfer.aggregate({
        _sum: { quantity: true },
        where: { sourceBaseId: baseId, equipmentTypeId }
      }),
      tx.assignment.aggregate({
        _sum: { quantity: true },
        where: { baseId, equipmentTypeId, status: "ACTIVE" }
      }),
      tx.expenditure.aggregate({
        _sum: { quantity: true },
        where: { baseId, equipmentTypeId }
      })
    ]);

  return (
    (purchases._sum.quantity || 0) +
    (incoming._sum.quantity || 0) -
    (outgoing._sum.quantity || 0) -
    (assignments._sum.quantity || 0) -
    (expenditures._sum.quantity || 0)
  );
}

export async function listAssignments(req, res) {
  const baseId = getScopedBaseId(req);

  const assignments = await prisma.assignment.findMany({
    where: {
      ...(baseId !== undefined ? { baseId } : {})
    },
    include: {
      base: true,
      equipmentType: true,
      createdBy: { select: { username: true } }
    },
    orderBy: { assignedDate: "desc" }
  });

  const expenditures = await prisma.expenditure.findMany({
    where: {
      ...(baseId !== undefined ? { baseId } : {})
    },
    include: {
      base: true,
      equipmentType: true,
      createdBy: { select: { username: true } }
    },
    orderBy: { expendedDate: "desc" }
  });

  res.json({ assignments, expenditures });
}

export async function createAssignment(req, res) {
  try {
    const { baseId, equipmentTypeId, quantity, assignedTo } = req.body;

    if (!baseId || !equipmentTypeId || !quantity || !assignedTo) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!validateWriteBase(req, baseId)) {
      return res.status(403).json({ message: "Invalid base" });
    }

    const assignment = await prisma.$transaction(async (tx) => {
      const available = await getAvailableStock(
        tx,
        Number(baseId),
        Number(equipmentTypeId)
      );

      if (available < Number(quantity)) {
        throw new Error(
          `Insufficient stock. Available: ${available}, requested: ${quantity}`
        );
      }

      const item = await tx.assignment.create({
        data: {
          baseId: Number(baseId),
          equipmentTypeId: Number(equipmentTypeId),
          quantity: Number(quantity),
          assignedTo,
          createdById: req.user.id
        },
        include: { base: true, equipmentType: true }
      });

      await createAudit(
        tx,
        req.user.id,
        "ASSIGNMENT",
        `Assigned ${quantity} ${item.equipmentType.name} to ${assignedTo} at ${item.base.name}`
      );

      return item;
    });

    res.status(201).json(assignment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function createExpenditure(req, res) {
  try {
    const { baseId, equipmentTypeId, quantity, reason } = req.body;

    if (!baseId || !equipmentTypeId || !quantity || !reason) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!validateWriteBase(req, baseId)) {
      return res.status(403).json({ message: "Invalid base" });
    }

    const expenditure = await prisma.$transaction(async (tx) => {
      const available = await getAvailableStock(
        tx,
        Number(baseId),
        Number(equipmentTypeId)
      );

      if (available < Number(quantity)) {
        throw new Error(
          `Insufficient stock. Available: ${available}, requested: ${quantity}`
        );
      }

      const item = await tx.expenditure.create({
        data: {
          baseId: Number(baseId),
          equipmentTypeId: Number(equipmentTypeId),
          quantity: Number(quantity),
          reason,
          createdById: req.user.id
        },
        include: { base: true, equipmentType: true }
      });

      await createAudit(
        tx,
        req.user.id,
        "EXPENDITURE",
        `Expended ${quantity} ${item.equipmentType.name} at ${item.base.name}. Reason: ${reason}`
      );

      return item;
    });

    res.status(201).json(expenditure);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}
