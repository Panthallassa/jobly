"use strict";

const request = require("supertest");

const db = require("../db.js");
const app = require("../app");
const { createToken } = require("../helpers/tokens");
const User = require("../models/user");

const {
	commonBeforeAll,
	commonBeforeEach,
	commonAfterEach,
	commonAfterAll,
	u1Token,
	adminToken,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /users */

describe("POST /users", function () {
	test("works for admin: create non-admin user", async function () {
		const resp = await request(app)
			.post("/users")
			.send({
				username: "u-new",
				firstName: "First-new",
				lastName: "Last-new",
				password: "password-new",
				email: "new@email.com",
				isAdmin: false,
			})
			.set("authorization", `Bearer ${adminToken}`);
		expect(resp.statusCode).toEqual(201);
		expect(resp.body).toEqual({
			user: {
				username: "u-new",
				firstName: "First-new",
				lastName: "Last-new",
				email: "new@email.com",
				isAdmin: false,
			},
			token: expect.any(String),
		});
	});

	test("works for admin: create admin user", async function () {
		const resp = await request(app)
			.post("/users")
			.send({
				username: "u-new",
				firstName: "First-new",
				lastName: "Last-new",
				password: "password-new",
				email: "new@email.com",
				isAdmin: true,
			})
			.set("authorization", `Bearer ${adminToken}`);
		expect(resp.statusCode).toEqual(201);
		expect(resp.body).toEqual({
			user: {
				username: "u-new",
				firstName: "First-new",
				lastName: "Last-new",
				email: "new@email.com",
				isAdmin: true,
			},
			token: expect.any(String),
		});
	});

	test("unauth for non-admin", async function () {
		const resp = await request(app)
			.post("/users")
			.send({
				username: "u-new",
				firstName: "First-new",
				lastName: "Last-new",
				password: "password-new",
				email: "new@email.com",
				isAdmin: true,
			})
			.set("authorization", `Bearer ${u1Token}`);
		expect(resp.statusCode).toEqual(401);
	});

	test("unauth for anon", async function () {
		const resp = await request(app).post("/users").send({
			username: "u-new",
			firstName: "First-new",
			lastName: "Last-new",
			password: "password-new",
			email: "new@email.com",
			isAdmin: true,
		});
		expect(resp.statusCode).toEqual(401);
	});

	test("bad request if missing data", async function () {
		const resp = await request(app)
			.post("/users")
			.send({
				username: "u-new",
			})
			.set("authorization", `Bearer ${adminToken}`);
		expect(resp.statusCode).toEqual(400);
	});

	test("bad request if invalid data", async function () {
		const resp = await request(app)
			.post("/users")
			.send({
				username: "u-new",
				firstName: "First-new",
				lastName: "Last-new",
				password: "password-new",
				email: "not-an-email",
				isAdmin: true,
			})
			.set("authorization", `Bearer ${adminToken}`);
		expect(resp.statusCode).toEqual(400);
	});
});

/************************************** GET /users */

describe("GET /users", function () {
	test("works for admin", async function () {
		const resp = await request(app)
			.get("/users")
			.set("authorization", `Bearer ${adminToken}`);
		expect(resp.body).toEqual({
			users: [
				{
					username: "u1",
					firstName: "U1F",
					lastName: "U1L",
					email: "user1@user.com",
					isAdmin: false,
				},
				{
					username: "u2",
					firstName: "U2F",
					lastName: "U2L",
					email: "user2@user.com",
					isAdmin: false,
				},
				{
					username: "u3",
					firstName: "U3F",
					lastName: "U3L",
					email: "user3@user.com",
					isAdmin: false,
				},
			],
		});
	});

	test("unauth for non-admin", async function () {
		const resp = await request(app)
			.get("/users")
			.set("authorization", `Bearer ${u1Token}`);
		expect(resp.statusCode).toEqual(401);
	});

	test("unauth for anon", async function () {
		const resp = await request(app).get("/users");
		expect(resp.statusCode).toEqual(401);
	});
});

/************************************** GET /users/:username */

describe("GET /users/:username", function () {
	test("works for own user", async function () {
		const resp = await request(app)
			.get(`/users/u1`)
			.set("authorization", `Bearer ${u1Token}`);
		expect(resp.body).toEqual({
			user: {
				username: "u1",
				firstName: "U1F",
				lastName: "U1L",
				email: "user1@user.com",
				isAdmin: false,
			},
		});
	});

	test("works for admin", async function () {
		const resp = await request(app)
			.get(`/users/u1`)
			.set("authorization", `Bearer ${adminToken}`);
		expect(resp.body).toEqual({
			user: {
				username: "u1",
				firstName: "U1F",
				lastName: "U1L",
				email: "user1@user.com",
				isAdmin: false,
			},
		});
	});

	test("unauth for non-admin and not own user", async function () {
		const resp = await request(app)
			.get(`/users/u2`)
			.set("authorization", `Bearer ${u1Token}`);
		expect(resp.statusCode).toEqual(401);
	});

	test("unauth for anon", async function () {
		const resp = await request(app).get(`/users/u1`);
		expect(resp.statusCode).toEqual(401);
	});

	test("not found if user not found", async function () {
		const resp = await request(app)
			.get(`/users/nope`)
			.set("authorization", `Bearer ${u1Token}`);
		expect(resp.statusCode).toEqual(401);
	});
});

/************************************** PATCH /users/:username */

describe("PATCH /users/:username", () => {
	test("works for own user", async function () {
		const resp = await request(app)
			.patch(`/users/u1`)
			.send({
				firstName: "New",
			})
			.set("authorization", `Bearer ${u1Token}`);
		expect(resp.body).toEqual({
			user: {
				username: "u1",
				firstName: "New",
				lastName: "U1L",
				email: "user1@user.com",
				isAdmin: false,
			},
		});
	});

	test("works for admin", async function () {
		const resp = await request(app)
			.patch(`/users/u1`)
			.send({
				firstName: "New",
			})
			.set("authorization", `Bearer ${adminToken}`);
		expect(resp.body).toEqual({
			user: {
				username: "u1",
				firstName: "New",
				lastName: "U1L",
				email: "user1@user.com",
				isAdmin: false,
			},
		});
	});

	test("unauth for non-admin and not own user", async function () {
		const resp = await request(app)
			.patch(`/users/u2`)
			.send({
				firstName: "New",
			})
			.set("authorization", `Bearer ${u1Token}`);
		expect(resp.statusCode).toEqual(401);
	});

	test("unauth for anon", async function () {
		const resp = await request(app)
			.patch(`/users/u1`)
			.send({
				firstName: "New",
			});
		expect(resp.statusCode).toEqual(401);
	});

	test("not found if no such user", async function () {
		const resp = await request(app)
			.patch(`/users/nope`)
			.send({
				firstName: "Nope",
			})
			.set("authorization", `Bearer ${u1Token}`);
		expect(resp.statusCode).toEqual(401);
	});

	test("bad request if invalid data", async function () {
		const resp = await request(app)
			.patch(`/users/u1`)
			.send({
				firstName: 42,
			});
	});
});

/************************************** POST /users/:username/jobs/:id */
describe("POST /users/:username/jobs/:id", function () {
	let testUser;
	let testJobId;

	beforeEach(async function () {
		// Retrieve the test user and job
		const resultUser = await db.query(
			`SELECT username FROM users WHERE username = 'u1'`
		);
		testUser = resultUser.rows[0];

		const resultJob = await db.query(
			`SELECT id FROM jobs WHERE title = 'Job1'`
		);
		testJobId = resultJob.rows[0].id;
	});

	test("apply for a job", async function () {
		const resp = await request(app)
			.post(`/users/${testUser.username}/jobs/${testJobId}`)
			.set("authorization", `Bearer ${u1Token}`);

		expect(resp.body).toEqual({ applied: testJobId });

		// Check the database to ensure the application was inserted
		const result = await db.query(
			`SELECT * FROM applications WHERE username = $1 AND job_id = $2`,
			[testUser.username, testJobId]
		);

		expect(result.rows.length).toEqual(1);
	});
});
