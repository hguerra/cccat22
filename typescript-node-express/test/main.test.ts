import axios from "axios";

test("Deve criar uma conta", async () => {
  // Given
  const input = {
    name: "John Doe",
    email: `abcd${new Date().getTime()}@gmail.com`,
    document: "97456321558",
    password: "asdQWE123",
  };
  // When
  const responseSignup = await axios.post("http://localhost:3000/signup", input);
  const outputSignup = responseSignup.data;
  // Then
  expect(outputSignup.accountId).toBeDefined();
  const responseGetAccount = await axios.get(`http://localhost:3000/accounts/${outputSignup.accountId}`);
  const outputGetAccount = responseGetAccount.data;
  expect(outputGetAccount.name).toBe(input.name);
  expect(outputGetAccount.email).toBe(input.email);
  expect(outputGetAccount.document).toBe(input.document);
  expect(outputGetAccount.password).toBe(input.password);
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
