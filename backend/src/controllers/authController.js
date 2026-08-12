import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../server.js";

export async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const user = await prisma.user.findUnique({
      where: { username },
      include: { base: true }
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);

    if (!valid) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        baseId: user.baseId
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        baseId: user.baseId,
        baseName: user.base?.name || null
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function me(req, res) {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { base: true },
    select: {
      id: true,
      username: true,
      role: true,
      baseId: true,
      base: true
    }
  });

  res.json(user);
}
