const { poolPromise, sql } = require('../config/db');

class CategoriesService {
  static async getPartOfSpeeches() {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT PartOfSpeechID, Name, Description FROM PartOfSpeeches
    `);
    return result.recordset;
  }

  static async getTopics() {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT TopicID, Name, Description FROM Topics
    `);
    return result.recordset;
  }
}

module.exports = CategoriesService;
