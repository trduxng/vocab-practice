// vocab-practice/backend/src/services/categories.service.js
const { poolPromise, sql } = require("../config/db");

class CategoriesService {
  static async getPartOfSpeeches() {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT PartOfSpeechID AS id, PartOfSpeechName AS name, Description AS description FROM PartOfSpeeches
    `);
    return result.recordset;
  }

  static async getTopics() {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT TopicID AS id, TopicName AS name, TopicCode AS code, Description AS description FROM Topics
    `);
    return result.recordset;
  }
}

module.exports = CategoriesService;
