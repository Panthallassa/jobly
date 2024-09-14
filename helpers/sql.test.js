const { sqlForPartialUpdate } = require("./sql");
const { BadRequestError } = require("../expressError");

describe("sqlForPartialUpdate", () => {
	test("Correctly generates SQL query and values", () => {
		const dataToUpdate = { firstName: "Aliya", age: 32 };
		const jsToSql = { firstName: "first_name" };

		const result = sqlForPartialUpdate(
			dataToUpdate,
			jsToSql
		);
		expect(result).toEqual({
			setCols: '"first_name"=$1, "age"=$2',
			values: ["Aliya", 32],
		});
	});

	test("Works without jsToSql mapping", () => {
		const dataToUpdate = { firstName: "Aliya", age: 32 };

		const result = sqlForPartialUpdate(dataToUpdate, {});
		expect(result).toEqual({
			setCols: '"firstName"=$1, "age"=$2',
			values: ["Aliya", 32],
		});
	});

	test("Throws BadRequestError if no data provided", () => {
		expect(() => sqlForPartialUpdate({}, {})).toThrow(
			BadRequestError
		);
	});

	test("Handles single field update", () => {
		const dataToUpdate = { firstName: "Aliya" };
		const jsToSql = { firstName: "first_name" };

		const result = sqlForPartialUpdate(
			dataToUpdate,
			jsToSql
		);
		expect(result).toEqual({
			setCols: '"first_name"=$1',
			values: ["Aliya"],
		});
	});
});
