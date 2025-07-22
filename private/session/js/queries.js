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
            password_salt,
            language
        FROM users
        WHERE username = $1
            OR email = $1`,
        [usernameOrEmail]
    )
    return response.rows[0] || null
}

exports.signupUser = async (userData) => {
    const { username, name, lastName, email, password, passwordSalt, language } = userData

    const response = await pool.query(
        `INSERT INTO users (username, name, last_name, email, password, password_salt, language)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING username`,
        [username, name, lastName, email, password, passwordSalt, language]
    )

    if (response.rowCount === 0) {
        return null
    }
    return "ok"
}