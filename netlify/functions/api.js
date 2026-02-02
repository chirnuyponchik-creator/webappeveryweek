// netlify/functions/api.js
const postgres = require('postgres');

// Подключение к БД
const sql = postgres(process.env.DATABASE_URL, {
    ssl: 'require',
});

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        // --- ПОЛУЧЕНИЕ (GET) ---
        if (event.httpMethod === 'GET') {
            // Используем жесткий ключ 'user_data'. 
            // Внимание: это значит, что все посетители сайта делят ОДНУ базу.
            const result = await sql`SELECT data FROM app_state WHERE key = 'user_data' LIMIT 1`;

            if (result.length === 0) {
                // Если базы нет, возвращаем null, чтобы фронтенд использовал локальные данные
                return { statusCode: 200, headers, body: JSON.stringify(null) };
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(result[0].data),
            };
        }

        // --- СОХРАНЕНИЕ (POST) ---
        if (event.httpMethod === 'POST') {
            const newData = JSON.parse(event.body);

            // sql.json(newData) помогает драйверу понять, что это JSONB
            await sql`
                INSERT INTO app_state (key, data)
                VALUES ('user_data', ${sql.json(newData)})
                ON CONFLICT (key) 
                DO UPDATE SET data = ${sql.json(newData)}
            `;

            return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
        }

        return { statusCode: 405, headers, body: 'Method Not Allowed' };

    } catch (error) {
        console.error('Database Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message }),
        };
    }
};