// backend/utils/errorHandler.js

const handleSqlError = (err, res) => {
    console.error("SQL Error:", err);

    // PostgreSQL Error Codes
    // 23505: Unique violation
    if (err.code === '23505') {
        const detail = err.detail || '';
        // Extract field from detail: "Key (email)=(...) already exists."
        const match = detail.match(/\((.*?)\)=/);
        const fieldName = match ? match[1] : 'record';
        return res.status(400).json({ error: `This ${fieldName} is already taken. Please choose another.` });
    }

    // 23502: Not null violation
    if (err.code === '23502') {
        return res.status(400).json({ error: `The field '${err.column}' is required.` });
    }

    // 23503: Foreign key violation
    if (err.code === '23503') {
        return res.status(400).json({ error: 'Invalid reference. The item or user you are referring to does not exist.' });
    }

    // Default server error
    return res.status(500).json({ error: 'Something went wrong on our end. Please try again.' });
};

module.exports = { handleSqlError };
