export function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
}

export function getScopedBaseId(req) {
  if (req.user.role === "ADMIN") {
    return req.query.baseId ? Number(req.query.baseId) : undefined;
  }

  return req.user.baseId;
}

export function validateWriteBase(req, baseId) {
  if (req.user.role === "ADMIN") return true;
  return Number(baseId) === Number(req.user.baseId);
}
