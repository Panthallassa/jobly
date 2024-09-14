"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const {
	BadRequestError,
	UnauthorizedError,
} = require("../expressError");
const {
	authenticateJWT,
	ensureLoggedIn,
} = require("../middleware/auth");
const Company = require("../models/company");

const companyNewSchema = require("../schemas/companyNew.json");
const companyUpdateSchema = require("../schemas/companyUpdate.json");

const router = new express.Router();

/** POST / { company } =>  { company }
 *
 * company should be { handle, name, description, numEmployees, logoUrl }
 *
 * Returns { handle, name, description, numEmployees, logoUrl }
 *
 * Authorization required: login
 */

router.post(
	"/",
	authenticateJWT,
	ensureLoggedIn,
	async function (req, res, next) {
		try {
			const currentUser = res.locals.user;

			// Check if Admin
			if (!currentUser.isAdmin) {
				throw new UnauthorizedError(
					"Admin privleges requires"
				);
			}

			const validator = jsonschema.validate(
				req.body,
				companyNewSchema
			);
			if (!validator.valid) {
				const errs = validator.errors.map((e) => e.stack);
				throw new BadRequestError(errs);
			}

			const company = await Company.create(req.body);
			return res.status(201).json({ company });
		} catch (err) {
			return next(err);
		}
	}
);

/** GET /  =>
 *   { companies: [ { handle, name, description, numEmployees, logoUrl }, ...] }
 *
 * Can filter on provided search filters:
 * - minEmployees
 * - maxEmployees
 * - nameLike (will find case-insensitive, partial matches)
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
	try {
		const { nameLike, minEmployees, maxEmployees } =
			req.params;

		// Validate if minEmployees > maxEmployees
		if (
			minEmployees !== undefined &&
			maxEmployees !== undefined &&
			+minEmployees > +maxEmployees
		) {
			throw new BadRequestError(
				"minEmployees cannot be greater than maxEmployees"
			);
		}

		const companies = await Company.findAll({
			nameLike,
			minEmployees,
			maxEmployees,
		});
		return res.json({ companies });
	} catch (err) {
		return next(err);
	}
});

/** GET /[handle]  =>  { company }
 *
 *  Company is { handle, name, description, numEmployees, logoUrl, jobs }
 *   where jobs is [{ id, title, salary, equity }, ...]
 *
 * Authorization required: none
 */

router.get("/:handle", async function (req, res, next) {
	try {
		const company = await Company.get(req.params.handle);
		return res.json({ company });
	} catch (err) {
		return next(err);
	}
});

/** PATCH /[handle] { fld1, fld2, ... } => { company }
 *
 * Patches company data.
 *
 * fields can be: { name, description, numEmployees, logo_url }
 *
 * Returns { handle, name, description, numEmployees, logo_url }
 *
 * Authorization required: login
 */

router.patch(
	"/:handle",
	authenticateJWT,
	ensureLoggedIn,
	async function (req, res, next) {
		try {
			const currentUser = res.locals.user;

			if (!currentUser.isAdmin) {
				throw new UnauthorizedError(
					"Admin privleges required"
				);
			}

			const validator = jsonschema.validate(
				req.body,
				companyUpdateSchema
			);
			if (!validator.valid) {
				const errs = validator.errors.map((e) => e.stack);
				throw new BadRequestError(errs);
			}

			const company = await Company.update(
				req.params.handle,
				req.body
			);
			return res.json({ company });
		} catch (err) {
			return next(err);
		}
	}
);

/** DELETE /[handle]  =>  { deleted: handle }
 *
 * Authorization: login
 */

router.delete(
	"/:handle",
	authenticateJWT,
	ensureLoggedIn,
	async function (req, res, next) {
		try {
			const currentUser = res.locals.user;

			// Check if the user is an admin
			if (!currentUser.isAdmin) {
				throw new UnauthorizedError(
					"Admin privileges required"
				);
			}

			await Company.remove(req.params.handle);
			return res.json({ deleted: req.params.handle });
		} catch (err) {
			return next(err);
		}
	}
);

module.exports = router;
