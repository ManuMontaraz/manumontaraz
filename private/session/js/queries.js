// queries.js
const path = require('path')
const { pool } = require(path.join(__dirname, '..', '..', 'database', 'js', 'database.js'))

exports.getUserByUsernameOrEmail = async (usernameOrEmail) => {
    // TO-DO: SI EN DB "REVOKE TOKEN", NO DEBERÍA PODER INICIAR SESIÓN CON JWT
    const response = await pool.query(
        `SELECT 
            username,
            name,
            last_name,
            email,
            password,
            password_salt
        FROM users
        WHERE username = $1
            OR email = $1`,
        [usernameOrEmail]
    )
    return response.rows[0] || null
}