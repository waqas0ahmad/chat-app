const { createConnection } = require('mysql');

const connection = createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    typeCast: function (field, useDefaultTypeCasting) {
        // We only want to cast bit fields that have a single-bit in them. If the field
        // has more than one bit, then we cannot assume it is supposed to be a Boolean.
        if ((field.type === "BIT") && (field.length >= 1)) {

            var bytes = field.buffer();

            // A Buffer in Node represents a collection of 8-bit unsigned integers.
            // Therefore, our single "bit field" comes back as the bits '0000 0001',
            // which is equivalent to the number 1.
            if (!bytes) return false;
            return (bytes[0] === 1);

        }

        return (useDefaultTypeCasting());
    }
})
/**
 * 
 * @param {any} query 
 * @param {any} data 
 * @returns {Promise<{success:Boolean,data:any}>}
 */
const executeSQL = function (query, data = []) {
    return new Promise((resolve, reject) => {
        connection.query(query, data, (error, result) => {
            if (error) {
                resolve({
                    success:false,
                    data:error
                });
            } else {
                resolve({
                    success:true,
                    data:result});
            }
        });
    })
}
module.exports = {executeSQL};