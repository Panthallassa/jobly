"use strict";

const db = require("../db");
const Job = require("./job");
const {
	commonBeforeAll,
	commonBeforeEach,
	commonAfterEach,
	commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
	it("works", async function () {
		const job = await Job.create({
			title: "New Job",
			salary: 100000,
			equity: "0.05",
			companyHandle: "c1",
		});
		expect(job).toEqual({
			id: expect.any(Number),
			title: "New Job",
			salary: 100000,
			equity: "0.05",
			companyHandle: "c1",
		});
	});
});

/************************************** findAll */

describe("findAll", function () {
	it("works", async function () {
		const jobs = await Job.findAll();
		expect(jobs).toEqual([
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
		]);
	});
});

/************************************** get */

describe("get", function () {
	it("works", async function () {
		const job = await Job.get(1);
		expect(job).toEqual({
			id: 1,
			title: "Job1",
			salary: 50000,
			equity: "0.01",
			companyHandle: "c1",
		});
	});

	it("not found if no such job", async function () {
		try {
			await Job.get(9999);
			fail();
		} catch (err) {
			expect(err instanceof NotFoundError).toBeTruthy();
		}
	});
});

/************************************** update */

describe("update", function () {
	const updateData = {
		title: "Updated Job",
		salary: 60000,
		equity: "0.03",
	};

	it("works", async function () {
		const job = await Job.update(1, updateData);
		expect(job).toEqual({
			id: 1,
			...updateData,
			companyHandle: "c1",
		});
	});

	it("not found if no such job", async function () {
		try {
			await Job.update(9999, updateData);
			fail();
		} catch (err) {
			expect(err instanceof NotFoundError).toBeTruthy();
		}
	});
});

/************************************** remove */

describe("remove", function () {
	it("works", async function () {
		await Job.remove(1);
		const res = await db.query(
			"SELECT id FROM jobs WHERE id=$1",
			[1]
		);
		expect(res.rows.length).toEqual(0);
	});

	it("not found if no such job", async function () {
		try {
			await Job.remove(9999);
			fail();
		} catch (err) {
			expect(err instanceof NotFoundError).toBeTruthy();
		}
	});
});
