import express, { Request, Response } from "express";
import crypto from "crypto";
import pgp from "pg-promise";
import { validateCpf } from "./validateCpf";
const app = express();
app.use(express.json());

const connection = pgp()("postgres://postgres:123456@localhost:5432/app");

function validatePassword(password?: string, minSize = 8): boolean {
  if (!password || password.length < minSize) {
    return false;
  }
  if (!/[a-z]/.test(password)) {
    return false;
  }
  if (!/[A-Z]/.test(password)) {
    return false;
  }
  if (!/[0-9]/.test(password)) {
    return false;
  }
  return true;
}

app.post("/signup", async (req: Request, res: Response) => {
  const account = req.body;
  console.log("/signup", account);

  const name: string | undefined = account.name?.trim();
  if (!name || name?.length <= 1 || name.split(" ").length <= 1) {
    res.status(400);
    res.json({
      type: "validation-error",
      title: "Parâmetros inválidos",
      detail: "O nome deve ser composto por nome e sobrenome.",
    });
    return;
  }

  const email: string | undefined = account.email?.trim();
  if (!email || !email.includes("@")) {
    res.status(400);
    res.json({
      type: "validation-error",
      title: "Parâmetros inválidos",
      detail: "O email deve ser válido.",
    });
    return;
  }

  if (!validateCpf(account.document)) {
    res.status(400);
    res.json({
      type: "validation-error",
      title: "Parâmetros inválidos",
      detail: "O documento deve ser um CPF válido.",
    });
    return;
  }

  if (!validatePassword(account.password)) {
    res.status(400);
    res.json({
      type: "validation-error",
      title: "Parâmetros inválidos",
      detail: "A senha deve ter no mínimo 8 caracteres com letras minúsculas, maiúsculas e números.",
    });
    return;
  }

  const accountId = crypto.randomUUID();
  try {
    await connection.query(
      "insert into ccca.account (account_id, name, email, document, password) values ($1, $2, $3, $4, $5)",
      [accountId, name, email, account.document, account.password],
    );
  } catch (error: any) {
    if (error?.message === `duplicate key value violates unique constraint "account_email_key"`) {
      res.status(422);
      res.json({
        type: "validation-error",
        title: "Parâmetros inválidos",
        detail: "O email deve não deve ser duplicado.",
      });
      return;
    }
    throw error;
  }

  res.json({
    accountId,
  });
});

app.get("/accounts/:accountId", async (req: Request, res: Response) => {
  const accountId = req.params.accountId;
  console.log(`/accounts/${accountId}`);
  const [account] = await connection.query("select * from ccca.account where account_id = $1", [accountId]);
  if (!account) {
    res.status(404);
    res.json({
      type: "not-found-error",
      title: "Conta não encontrada",
      detail: "A conta não foi encontrada.",
    });
  }
  res.json(account);
});

app.listen(3000);
