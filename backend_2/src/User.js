const { UserModel } = require("../db/redis-models");

class User {
	constructor(username, roomId, role = "student", id = null) {
		this.id = id;
		this.username = username;
		this.roomId = roomId;
		this.role = role;
	}

	isTeacher() {
		return this.role === "teacher";
	}

	getUserId() {
		return this.id;
	}

	/**
	 * Save user to Redis
	 * @returns {Promise<string>} userId
	 */
	async save() {
		if (!this.id) {
			this.id = await UserModel.create({
				username: this.username,
				roomId: this.roomId,
				role: this.role,
			});
		}
		return this.id;
	}

	/**
	 * Load user from Redis by ID
	 * @param {string} userId
	 * @returns {Promise<User|null>}
	 */
	static async findById(userId) {
		const userData = await UserModel.findById(userId);
		if (!userData) return null;

		return new User(
			userData.username,
			userData.roomId,
			userData.role,
			userData.userId,
		);
	}

	/**
	 * Find user by criteria
	 * @param {Object} criteria
	 * @returns {Promise<User|null>}
	 */
	static async findOne(criteria) {
		const userData = await UserModel.findOne(criteria);
		if (!userData) return null;

		return new User(
			userData.username,
			userData.roomId,
			userData.role,
			userData.userId,
		);
	}

	/**
	 * Add submission to user
	 * @param {Object} submission
	 */
	async addSubmission(submission) {
		if (!this.id)
			throw new Error("User must be saved before adding submissions");
		await UserModel.addSubmission(this.id, submission);
	}

	/**
	 * Update user submissions
	 * @param {Array} submissions
	 */
	async updateSubmissions(submissions) {
		if (!this.id)
			throw new Error("User must be saved before updating submissions");
		await UserModel.updateSubmissions(this.id, submissions);
	}

	/**
	 * Get user with submissions
	 * @returns {Promise<Object>}
	 */
	async getWithSubmissions() {
		if (!this.id) throw new Error("User must be saved first");
		return await UserModel.findById(this.id);
	}
}

module.exports = User;
