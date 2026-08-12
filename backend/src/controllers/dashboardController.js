import { prisma } from "../server.js";
import { getScopedBaseId } from "../middleware/rbac.js";

function dateRange(startDate, endDate) {
  const start = startDate ? new Date(`${startDate}T00:00:00`) : null;
  const end = endDate ? new Date(`${endDate}T23:59:59.999`) : new Date();
  return { start, end };
}

export async function getDashboard(req, res) {
  try {
    const baseId = getScopedBaseId(req);
    const equipmentTypeId = req.query.equipmentTypeId
      ? Number(req.query.equipmentTypeId)
      : undefined;

    const { start, end } = dateRange(req.query.startDate, req.query.endDate);

    const baseFilter = baseId !== undefined ? { baseId } : {};
    const equipmentFilter = equipmentTypeId ? { equipmentTypeId } : {};

    const beforeDate = start || new Date("1970-01-01T00:00:00.000Z");

    const [
      purchasesBefore,
      incomingBefore,
      outgoingBefore,
      assignmentsBefore,
      expendituresBefore,
      purchasesPeriod,
      incomingPeriod,
      outgoingPeriod,
      assignmentsPeriod,
      expendituresPeriod
    ] = await Promise.all([
      prisma.purchase.aggregate({
        _sum: { quantity: true },
        where: {
          ...baseFilter,
          ...equipmentFilter,
          purchaseDate: { lt: beforeDate }
        }
      }),
      prisma.transfer.aggregate({
        _sum: { quantity: true },
        where: {
          ...(baseId !== undefined ? { destinationBaseId: baseId } : {}),
          ...equipmentFilter,
          transferDate: { lt: beforeDate }
        }
      }),
      prisma.transfer.aggregate({
        _sum: { quantity: true },
        where: {
          ...(baseId !== undefined ? { sourceBaseId: baseId } : {}),
          ...equipmentFilter,
          transferDate: { lt: beforeDate }
        }
      }),
      prisma.assignment.aggregate({
        _sum: { quantity: true },
        where: {
          ...baseFilter,
          ...equipmentFilter,
          assignedDate: { lt: beforeDate }
        }
      }),
      prisma.expenditure.aggregate({
        _sum: { quantity: true },
        where: {
          ...baseFilter,
          ...equipmentFilter,
          expendedDate: { lt: beforeDate }
        }
      }),
      prisma.purchase.aggregate({
        _sum: { quantity: true },
        where: {
          ...baseFilter,
          ...equipmentFilter,
          purchaseDate: { gte: beforeDate, lte: end }
        }
      }),
      prisma.transfer.aggregate({
        _sum: { quantity: true },
        where: {
          ...(baseId !== undefined ? { destinationBaseId: baseId } : {}),
          ...equipmentFilter,
          transferDate: { gte: beforeDate, lte: end }
        }
      }),
      prisma.transfer.aggregate({
        _sum: { quantity: true },
        where: {
          ...(baseId !== undefined ? { sourceBaseId: baseId } : {}),
          ...equipmentFilter,
          transferDate: { gte: beforeDate, lte: end }
        }
      }),
      prisma.assignment.aggregate({
        _sum: { quantity: true },
        where: {
          ...baseFilter,
          ...equipmentFilter,
          assignedDate: { gte: beforeDate, lte: end },
          status: "ACTIVE"
        }
      }),
      prisma.expenditure.aggregate({
        _sum: { quantity: true },
        where: {
          ...baseFilter,
          ...equipmentFilter,
          expendedDate: { gte: beforeDate, lte: end }
        }
      })
    ]);

    const n = (x) => x?._sum?.quantity || 0;

    const openingBalance =
      n(purchasesBefore) +
      n(incomingBefore) -
      n(outgoingBefore) -
      n(assignmentsBefore) -
      n(expendituresBefore);

    const purchases = n(purchasesPeriod);
    const transfersIn = n(incomingPeriod);
    const transfersOut = n(outgoingPeriod);
    const assigned = n(assignmentsPeriod);
    const expended = n(expendituresPeriod);

    const netMovement = purchases + transfersIn - transfersOut;
    const closingBalance = openingBalance + netMovement - assigned - expended;

    res.json({
      openingBalance,
      purchases,
      transfersIn,
      transfersOut,
      netMovement,
      assigned,
      expended,
      closingBalance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
