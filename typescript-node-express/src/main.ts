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

async function findAccountById(accountId: string) {
  const rows = await connection.query(
    `
  select
    acc.account_id account__account_id,
    acc.name account__name,
    acc.email account__email,
    acc.document account__document,
    acc.password account__password,
    ass.asset_id asset__asset_id,
    ass.quantity asset__quantity
  from ccca.account acc
    left join ccca.account_asset ass on acc.account_id = ass.account_id
  where acc.account_id = $1
  order by acc.account_id, ass.asset_id`,
    [accountId],
  );

  if (!rows || !rows.length) {
    return null;
  }

  const firstRow = rows[0];
  return {
    accountId,
    name: firstRow["account__name"],
    email: firstRow["account__email"],
    document: firstRow["account__document"],
    password: firstRow["account__password"],
    assets: [
      ...new Set(
        rows
          .filter((row: any) => row["asset__asset_id"])
          .map((row: any) => ({ assetId: row["asset__asset_id"], quantity: row["asset__quantity"] })),
      ),
    ],
  };
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
  const account = await findAccountById(accountId);
  if (!account) {
    res.status(404);
    res.json({
      type: "not-found-error",
      title: "Conta não encontrada",
      detail: "A conta não foi encontrada.",
    });
    return;
  }
  res.json(account);
});

app.post("/deposit", async (req: Request, res: Response) => {
  console.log("/deposit", req.body);

  const account = await findAccountById(req.body.accountId);
  if (!account) {
    res.status(404);
    res.json({
      type: "not-found-error",
      title: "Conta não encontrada",
      detail: "A conta não foi encontrada.",
    });
    return;
  }

  // TODO
  res.json(account);
});

app.post("/withdraw", async (req: Request, res: Response) => {
  console.log("/withdraw", req.body);
});

app.listen(3000);
