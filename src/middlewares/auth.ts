/*
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "sua_chave_secreta_aqui";

export interface AuthRequest extends Request {
  user?: {
    id: string | number;
    tipo: "admin" | "cliente";
  };
}

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Middleware para verificar token JWT
export const verificarToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  console.log("Headers recebidos:", req.headers);
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    console.log("Token não fornecido");
    return res.status(401).json({ error: "Token não fornecido" });
  }

  try {
    console.log("Tentando verificar token:", token);
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string | number;
      tipo: "admin" | "cliente";
    };
    console.log("Token decodificado:", decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Erro ao verificar token:", error);
    return res.status(401).json({ error: "Token inválido" });
  }
};

// Middleware para verificar se é administrador
export const verificarAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  console.log("Verificando permissão de admin. User:", req.user);
  if (!req.user || req.user.tipo !== "admin") {
    console.log("Acesso não autorizado. Tipo de usuário:", req.user?.tipo);
    return res.status(403).json({ error: "Acesso não autorizado" });
  }
  next();
};

// Middleware para verificar se é cliente
export const verificarCliente = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || req.user.tipo !== "cliente") {
    return res.status(403).json({ error: "Acesso não autorizado" });
  }
  next();
};

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Verificar se o header Authorization existe
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Token não fornecido" });
    }

    // Verificar se o formato do token está correto
    const parts = authHeader.split(" ");
    if (parts.length !== 2) {
      return res.status(401).json({ error: "Token mal formatado" });
    }

    const [scheme, token] = parts;
    if (!/^Bearer$/i.test(scheme)) {
      return res.status(401).json({ error: "Token mal formatado" });
    }

    // Verificar se o token é válido
    const secret = process.env.JWT_SECRET || "sua_chave_secreta";
    jwt.verify(token, secret, (err: any, decoded: any) => {
      if (err) {
        return res.status(401).json({ error: "Token inválido" });
      }

      req.user = decoded;
      return next();
    });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao verificar token" });
  }
};
*/
