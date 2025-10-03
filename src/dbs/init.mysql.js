const mysql = require("mysql2/promise");

const { dbMySqlSlave, dbMySqlMaster } = require("../configs");
class Database {
    constructor(config) {
        this.config = config;
        this.connection = null;
        this.queryString = "";
        this.placeholders = [];
        this.connect();
    }
    query(query, placeholders = []) {
        this.queryString = query;
        this.placeholders = placeholders;
        return this;
    }
    async connect() {
        await mysql
            .createConnection(this.config)
            .then((_) => {
                this.connection = _;
            })
            .catch((err) => console.log(err));
    }
    select(fields) {
        this.queryString += `SELECT ${fields.join(", ")}`;
        return this;
    }

    from(table) {
        this.queryString += ` FROM ${table}`;
        return this;
    }

    where(conditions) {
        this.queryString += " WHERE";
        Object.keys(conditions).forEach((key, index) => {
            const value = conditions[key];
            const operator = index === 0 ? "" : " AND";
            this.queryString += `${operator} ${key} = '${value}'`;
        });
        return this;
    }

    join(table, condition) {
        this.queryString += ` JOIN ${table} ON ${condition}`;
        return this;
    }
    joinLeft(table, condition) {
        this.queryString += ` JOIN ${table} ON ${condition}`;
        return this;
    }
    joinRight(table, condition) {
        ``;
        this.queryString += ` JOIN ${table} ON ${condition}`;
        return this;
    }
    having(condition) {
        this.queryString += `HAVING ${condition}`;
        return this;
    }
    order_by(condition) {
        this.queryString += ` ORDER BY ${condition}`;
        return this;
    }
    limit(limit) {
        this.queryString += ` LIMIT ${limit}`;
        return this;
    }
    offset(offset) {
        this.queryString += ` OFFSET ${offset}`;
        return this;
    }
    insert(table, data) {
        // Data as json format
        let k = [];
        let v = [];
        for (let i in data) {
            k.push(i);
            v.push(`'${data[i]}'`);
        }

        this.queryString = `INSERT INTO ${table} (${k.join(
            ","
        )}) VALUES (${v.join(",")})`;
        return this;
    }
    update(table, data) {
        let v = [];
        for (let i in data) {
            v.push(`${i}='${data[i]}'`);
        }
        this.queryString = `UPDATE ${table} SET ${v.join(",")} `;
        return this;
    }
    delete(table) {
        this.queryString = `DELETE FROM ${table} `;
        return this;
    }

    async execute() {
        try {
            await this.connect();
            console.log(this.queryString);
            let rows, fields;
            if (this.placeholders.length > 0) {
                [rows, fields] = await this.connection.query(
                    this.queryString,
                    this.placeholders
                );
            } else {
                [rows, fields] = await this.connection.query(this.queryString);
            }
            return rows;
        } catch (error) {
            console.error("Error executing query:", error);
            // throw new Error(error);
        } finally {
            this.connection.end();
            this.queryString = ""; // Reset câu truy vấn
            this.placeholders = [];
        }
    }
    async execute_one() {
        try {
            await this.connect();
            console.log(this.queryString);
            const [rows, fields] = await this.connection.query(
                this.queryString
            );
            // Xử lý kết quả ở đây
            console.log("Query result:", rows);

            // Đóng kết nối
            this.connection.end();

            // Reset câu truy vấn để sử dụng cho các truy vấn tiếp theo
            this.queryString = "";
            return rows[0];
        } catch (error) {
            console.error("Error executing query:", error);

            // Đóng kết nối nếu có lỗi
            this.connection.end();
            return error;
        }
    }
    static getInstance(connectSql) {
        if (!Database.instance) {
            Database.instance = new Database(connectSql);
        }

        return Database.instance;
    }
}
// Sử dụng class Database với kết nối SQL

// const db =  Database.getInstance(connectSql);
const dbMasterSQL = Database.getInstance(dbMySqlMaster);
const dbSlaveSQL = Database.getInstance(dbMySqlSlave);
module.exports = { dbMasterSQL, dbSlaveSQL };
