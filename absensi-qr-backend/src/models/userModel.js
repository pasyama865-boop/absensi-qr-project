import pool from '../config/db.js';

export const findUserByUsername = async (username) => {
    const query = 'SELECT user_id, username, password_hash, role FROM users WHERE username = $1';
    const result = await pool.query(query, [username]);
    return result.rows[0];
};

export const findUserById = async (id) => {
    const query = 'SELECT user_id, username, role FROM users WHERE user_id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
};
