import { prisma } from "../server.js";
import { createAudit } from "../utils/audit.js";
import { validateWriteBase, getScopedBaseId } from "../middleware/rbac.js";

async function getBalance(tx, baseId, equipmentTypeId) {
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

export async function listTransfers(req, res) {
  const baseId = getScopedBaseId(req);

  const transfers = await prisma.transfer.findMany({
    where: {
      ...(baseId !== undefined
        ? {
            OR: [
              { sourceBaseId: baseId },
              { destinationBaseId: baseId }
            ]
          }
        : {})
    },
    include: {
      sourceBase: true,
      destinationBase: true,
      equipmentType: true,
      initiatedBy: { select: { username: true } }
    },
    orderBy: { transferDate: "desc" }
  });

  res.json(transfers);
}

export async function createTransfer(req, res) {
  try {
    const {
      sourceBaseId,
      destinationBaseId,
      equipmentTypeId,
      quantity
    } = req.body;

    if (
      !sourceBaseId ||
      !destinationBaseId ||
      !equipmentTypeId ||
      !quantity ||
      Number(quantity) <= 0
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (Number(sourceBaseId) === Number(destinationBaseId)) {
      return res.status(400).json({
        message: "Source and destination bases must be different"
      });
    }

    if (!validateWriteBase(req, sourceBaseId)) {
      return res.status(403).json({
        message: "You can only transfer stock from your assigned base"
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const balance = await getBalance(
        tx,
        Number(sourceBaseId),
        Number(equipmentTypeId)
      );

      if (balance < Number(quantity)) {
        throw new Error(
          `Insufficient stock. Available: ${balance}, requested: ${quantity}`
        );
      }

      const transfer = await tx.transfer.create({
        data: {
          sourceBaseId: Number(sourceBaseId),
          destinationBaseId: Number(destinationBaseId),
          equipmentTypeId: Number(equipmentTypeId),
          quantity: Number(quantity),
          initiatedById: req.user.id
        },
        include: {
          sourceBase: true,
          destinationBase: true,
          equipmentType: true
        }
      });

      await createAudit(
        tx,
        req.user.id,
        "TRANSFER",
        `Transferred ${quantity} ${transfer.equipmentType.name} from ${transfer.sourceBase.name} to ${transfer.destinationBase.name}`
      );

      return transfer;
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}
