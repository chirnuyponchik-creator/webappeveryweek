// netlify/functions/api.js
const postgres = require('postgres');

// Подключение к базе данных через переменную окружения
const sql = postgres(process.env.DATABASE_URL, {
    ssl: 'require',
});

exports.handler = async (event, context) => {
    // Разрешаем CORS, чтобы сайт мог обращаться к функции
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        // --- ПОЛУЧЕНИЕ ДАННЫХ (GET) ---
        if (event.httpMethod === 'GET') {
            const result = await sql`SELECT data FROM app_state WHERE key = 'user_data' LIMIT 1`;

            if (result.length === 0) {
                return { statusCode: 200, headers, body: JSON.stringify({}) };
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(result[0].data),
            };
        }

        // --- СОХРАНЕНИЕ ДАННЫХ (POST) ---
        if (event.httpMethod === 'POST') {
            const newData = JSON.parse(event.body);

            // Обновляем JSON в базе данных
            await sql`
                INSERT INTO app_state (key, data)
                VALUES ('user_data', ${newData})
                ON CONFLICT (key) 
                DO UPDATE SET data = ${newData}
            `;

            return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
        }

        return { statusCode: 405, headers, body: 'Method Not Allowed' };

    } catch (error) {
        console.error('Database Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Database connection failed' }),
        };
    }
};