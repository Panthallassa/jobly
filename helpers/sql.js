const { BadRequestError } = require("../expressError");

/**
 * Generates the SQL code for a partial update operation.
 * This function takes an object of key-value pairs (`dataToUpdate`) and an optional mapping object (`jsToSql`)
 * that converts JavaScript-style keys to SQL column names. It returns an object containing the SQL SET clause
 * and the values to be updated.
 *
 * @param {Object} dataToUpdate - An object where the keysa re the fields to update, and the values are the new data.
 * @param {Object} jsToSql - An optional objectt that maps Javascript-style object keys to the SQL column names.
 *
 * @returns {Object} An object with two properties:
 * - `setCols`: A string representing the SQL SET clause, where each field is mapped to a positional parameter.
 * - `values`: An array of the new values to be updated, ordered to match the positional parameters in `setCols`.
 *
 * @throws {BadRequestError} If `dataToUpdate` is empty, indicating no data to update.
 * Example usage:
 * ```js
 * const dataToUpdate = { firstName: 'Aliya', age: 32 };
 * const jsToSql = { firstName: "first_name" };
 *
 * const result = sqlForPartialUpdate(dataToUpdate, jsToSql);
 * // result => {
 * //   setCols: '"first_name"=$1, "age"=$2',
 * //   values: ['Aliya', 32]
 * // }
 * ```
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
	const keys = Object.keys(dataToUpdate);
	if (keys.length === 0)
		throw new BadRequestError("No data");

	// {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
	const cols = keys.map(
		(colName, idx) =>
			`"${jsToSql[colName] || colName}"=$${idx + 1}`
	);

	return {
		setCols: cols.join(", "),
		values: Object.values(dataToUpdate),
	};
}

module.exports = { sqlForPartialUpdate };
