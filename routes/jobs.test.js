"use strict";

const request = require("supertest");
const app = require("../app");
const db = require("../db");
const Job = require("../models/job");
const {
	commonBeforeAll,
	commonBeforeEach,
	commonAfterEach,
	commonAfterAll,
	adminToken,
	u1Token,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
	it("works for admins", async function () {
		const resp = await request(app)
			.post("/jobs")
			.send({
				title: "new job",
				salary: 100000,
				equity: "0.05",
				companyHandle: "c1",
			})
			.set("authorization", `Bearer ${adminToken}`);
		expect(resp.statusCode).toEqual(201);
		expect(resp.body).toEqual({
			job: {
				id: expect.any(Number),
				title: "new job",
				salary: 100000,
				equity: "0.05",
				companyHandle: "c1",
			},
		});
	});

	it("fails for non-admin users", async function () {
		const resp = await request(app)
			.post("/jobs")
			.send({
				title: "new job",
				salary: 100000,
				equity: "0.05",
				companyHandle: "c1",
			})
			.set("authorization", `Bearer ${u1Token}`);
		expect(resp.statusCode).toEqual(401);
	});
});

/************************************** GET /jobs */

describe("GET /jobs", function () {
	it("works for anyone", async function () {
		const resp = await request(app).get("/jobs");
		expect(resp.body).toEqual({
			jobs: [
				{
					id: expect.any(Number),
					title: "Job1",
					salary: 50000,
					equity: "0.01",
					companyHandle: "c1",
				},
				{
					id: expect.any(Number),
					title: "Job2",
					salary: 60000,
					equity: "0.02",
					companyHandle: "c2",
				},
			],
		});
	});

	it("filters by title", async function () {
		const resp = await request(app)
			.get("/jobs")
			.query({ title: "Job1" });
		expect(resp.body).toEqual({
			jobs: [
				{
					id: expect.any(Number),
					title: "Job1",
					salary: 50000,
					equity: "0.01",
					companyHandle: "c1",
				},
			],
		});
	});

	it("filters by minSalary", async function () {
		const resp = await request(app)
			.get("/jobs")
			.query({ minSalary: 55000 });
		expect(resp.body).toEqual({
			jobs: [
				{
					id: expect.any(Number),
					title: "Job2",
					salary: 60000,
					equity: "0.02",
					companyHandle: "c2",
				},
			],
		});
	});

	it("filters by hasEquity true", async function () {
		const resp = await request(app)
			.get("/jobs")
			.query({ hasEquity: true });
		expect(resp.body).toEqual({
			jobs: [
				{
					id: expect.any(Number),
					title: "Job1",
					salary: 50000,
					equity: "0.01",
					companyHandle: "c1",
				},
				{
					id: expect.any(Number),
					title: "Job2",
					salary: 60000,
					equity: "0.02",
					companyHandle: "c2",
				},
			],
		});
	});

	it("filters by hasEquity false", async function () {
		const resp = await request(app)
			.get("/jobs")
			.query({ hasEquity: false });
		expect(resp.body).toEqual({
			jobs: [
				{
					id: expect.any(Number),
					title: "Job1",
					salary: 50000,
					equity: "0.01",
					companyHandle: "c1",
				},
				{
					id: expect.any(Number),
					title: "Job2",
					salary: 60000,
					equity: "0.02",
					companyHandle: "c2",
				},
			],
		});
	});
});

/************************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {
	it("works for anyone", async function () {
		const resp = await request(app).get("/jobs/1");
		expect(resp.body).toEqual({
			job: {
				id: 1,
				title: "Job1",
				salary: 50000,
				equity: "0.01",
				companyHandle: "c1",
			},
		});
	});

	it("fails if job not found", async function () {
		const resp = await request(app).get("/jobs/9999");
		expect(resp.statusCode).toEqual(404);
	});
});

/************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", function () {
	it("works for admins", async function () {
		const resp = await request(app)
			.patch("/jobs/1")
			.send({ title: "Updated Job1" })
			.set("authorization", `Bearer ${adminToken}`);
		expect(resp.body).toEqual({
			job: {
				id: 1,
				title: "Updated Job1",
				salary: 50000,
				equity: "0.01",
				companyHandle: "c1",
			},
		});
	});

	it("fails for non-admin users", async function () {
		const resp = await request(app)
			.patch("/jobs/1")
			.send({ title: "Updated Job1" })
			.set("authorization", `Bearer ${u1Token}`);
		expect(resp.statusCode).toEqual(401);
	});
});

/************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", function () {
	it("works for admins", async function () {
		const resp = await request(app)
			.delete("/jobs/1")
			.set("authorization", `Bearer ${adminToken}`);
		expect(resp.body).toEqual({ deleted: "1" });
	});

	it("fails for non-admin users", async function () {
		const resp = await request(app)
			.delete("/jobs/1")
			.set("authorization", `Bearer ${u1Token}`);
		expect(resp.statusCode).toEqual(401);
	});
});
