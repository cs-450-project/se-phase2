import { Sequelize } from "sequelize";

const sequelize = new Sequelize("postgres://postgres:mypassword@172.19.22.130:5432/package-registry");

export default sequelize;