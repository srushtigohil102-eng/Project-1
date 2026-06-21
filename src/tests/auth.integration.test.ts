import request from "supertest";
import app from "../app";

describe("Authentication Routes", () => {
const testUser = {
name: "Test User",
email: "[test@example.com](mailto:test@example.com)",
password: "Password123"
};

it("should register a new user", async () => {
const res = await request(app)
.post("/auth/register")
.send(testUser);

```
expect(res.status).toBe(201);

expect(res.body).toHaveProperty("message");
```

});

it("should login successfully", async () => {
const res = await request(app)
.post("/auth/login")
.send({
email: testUser.email,
password: testUser.password
});

```
expect(res.status).toBe(200);

expect(res.body).toHaveProperty("token");
```

});

it("should return 401 for protected route without token", async () => {
const res = await request(app)
.get("/auth/profile");

```
expect(res.status).toBe(401);
```

});
});
