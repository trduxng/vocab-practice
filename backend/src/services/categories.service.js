// vocab-practice/backend/src/services/categories.service.js
const { poolPromise, sql } = require("../config/db");

class CategoriesService {
  static async getPartOfSpeeches() {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT TuLoaiID AS id, TenTuLoai AS name, MoTa AS description FROM TuLoai
    `);
    return result.recordset;
  }

  static async getTopics() {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT ChuDeID AS id, TenChuDe AS name, MaChuDe AS code, MoTa AS description FROM ChuDe
    `);
    return result.recordset;
  }
}

module.exports = CategoriesService;
