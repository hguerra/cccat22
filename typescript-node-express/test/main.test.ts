import axios from "axios";

test("Deve criar uma conta", async () => {
  // Given
  const inputSignup = {
    name: "John Doe",
    email: `abcd${new Date().getTime()}@gmail.com`,
    document: "97456321558",
    password: "asdQWE123",
  };
  // When
  const responseSignup = await axios.post("http://localhost:3000/signup", inputSignup);
  const outputSignup = responseSignup.data;
  // Then
  expect(outputSignup.accountId).toBeDefined();
  const responseGetAccount1 = await axios.get(`http://localhost:3000/accounts/${outputSignup.accountId}`);
  const outputGetAccount1 = responseGetAccount1.data;
  expect(outputGetAccount1.name).toBe(inputSignup.name);
  expect(outputGetAccount1.email).toBe(inputSignup.email);
  expect(outputGetAccount1.document).toBe(inputSignup.document);
  expect(outputGetAccount1.password).toBe(inputSignup.password);
  expect(outputGetAccount1.assets).toHaveLength(0);

  // Given
  const inputDeposit1 = {
    accountId: outputSignup.accountId,
    assetId: "BTC",
    quantity: 10,
  };
  // When
  const responseDeposit1 = await axios.post("http://localhost:3000/deposit", inputDeposit1);
  const outputDeposit1 = responseDeposit1.data;
  // Then
  expect(outputDeposit1.accountId).toBe(inputDeposit1.accountId);
  expect(outputDeposit1.assetId).toBe(inputDeposit1.assetId);
  expect(outputDeposit1.quantity).toBe(inputDeposit1.quantity);
  const responseGetAccount2 = await axios.get(`http://localhost:3000/accounts/${outputSignup.accountId}`);
  const outputGetAccount2 = responseGetAccount2.data;
  expect(outputGetAccount2.assets).toHaveLength(1);
  expect(outputGetAccount2.assets[0].assetId).toBe(outputDeposit1.assetId);
  expect(outputGetAccount2.assets[0].quantity).toBe(outputDeposit1.quantity);

  // Given
  const inputDeposit2 = {
    accountId: outputSignup.accountId,
    assetId: "BTC",
    quantity: 10,
  };
  // When
  const responseDeposit2 = await axios.post("http://localhost:3000/deposit", inputDeposit2);
  const outputDeposit2 = responseDeposit2.data;
  // Then
  expect(outputDeposit2.accountId).toBe(inputDeposit2.accountId);
  expect(outputDeposit2.assetId).toBe(inputDeposit2.assetId);
  expect(outputDeposit2.quantity).toBe(inputDeposit2.quantity);
  const responseGetAccount3 = await axios.get(`http://localhost:3000/accounts/${outputSignup.accountId}`);
  const outputGetAccount3 = responseGetAccount3.data;
  expect(outputGetAccount3.assets).toHaveLength(2);
  expect(outputGetAccount3.assets[0].assetId).toBe(outputDeposit2.assetId);
  expect(outputGetAccount3.assets[0].quantity).toBe(outputDeposit1.quantity + outputDeposit2.quantity);
});

test("Deve retornar erro ao criar conta com email invalido", async () => {
  // Given
  const input = {
    name: "John Doe",
    email: `abcd${new Date().getTime()}`,
    document: "97456321558",
    password: "asdQWE123",
  };
  try {
    // When
    await axios.post("http://localhost:3000/signup", input);
    fail();
  } catch (error: any) {
    // Then
    expect(error.status).toBe(400);
    expect(error.response.data.detail).toBe("O email deve ser válido.");
  }
});

test("Deve retornar erro ao criar conta com e-mail duplicado", async () => {
  // Given
  const randomEmail = `abcd${new Date().getTime()}@gmail.com`;
  const input = {
    name: "John Doe",
    email: randomEmail,
    document: "97456321558",
    password: "asdQWE123",
  };
  // When
  const responseSignup = await axios.post("http://localhost:3000/signup", input);
  const outputSignup = responseSignup.data;
  // Then
  expect(outputSignup.accountId).toBeDefined();
  try {
    await axios.post("http://localhost:3000/signup", input);
    fail();
  } catch (error: any) {
    expect(error.status).toBe(422);
    expect(error.response.data.detail).toBe("O email deve não deve ser duplicado.");
  }
});

test("Deve retornar erro ao criar conta com o nome invalido", async () => {
  // Given
  const input = {
    name: "John",
    email: "john.doe@gmail.com",
    document: "97456321558",
    password: "asdQWE123",
  };
  try {
    // When
    await axios.post("http://localhost:3000/signup", input);
    fail();
  } catch (error: any) {
    // Then
    expect(error.status).toBe(400);
    expect(error.response.data.detail).toBe("O nome deve ser composto por nome e sobrenome.");
  }
});

test("Deve retornar erro ao criar conta com o cpf invalido", async () => {
  // Given
  const input = {
    name: "John Doe",
    email: "john.doe@gmail.com",
    document: "1111",
    password: "asdQWE123",
  };
  try {
    // When
    await axios.post("http://localhost:3000/signup", input);
    fail();
  } catch (error: any) {
    // Then
    expect(error.status).toBe(400);
    expect(error.response.data.detail).toBe("O documento deve ser um CPF válido.");
  }
});

test("Deve retornar erro ao criar conta com a senha invalido", async () => {
  // Given
  const input = {
    name: "John Doe",
    email: "john.doe@gmail.com",
    document: "97456321558",
    password: "a",
  };
  try {
    // When
    await axios.post("http://localhost:3000/signup", input);
    fail();
  } catch (error: any) {
    // Then
    expect(error.status).toBe(400);
    expect(error.response.data.detail).toBe(
      "A senha deve ter no mínimo 8 caracteres com letras minúsculas, maiúsculas e números.",
    );
  }
});
