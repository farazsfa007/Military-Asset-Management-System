export async function createAudit(tx, userId, action, details) {
  await tx.auditLog.create({
    data: {
      userId,
      action,
      details
    }
  });
}
