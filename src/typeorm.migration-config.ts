import * as dotenv from 'dotenv'; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();
import { DataSource } from 'typeorm';
const isDevelop = process.env.PROD_MIGRATION === 'false';

const migrations = isDevelop ? ['src/migrations/*.ts'] : ['migrations/*.js'];
const entities = isDevelop
    ? ['**/**/entity/*.entity.ts']
    : ['**/**/entity/*.entity.js'];
const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.POSTGRES_HOST,
    database: isDevelop
        ? process.env.POSTGRES_MIGRATION_DB
        : process.env.POSTGRES_DB,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    port: +process.env.POSTGRES_PORT,
    synchronize: isDevelop,
    logging: process.env.NODE_ENV === 'development',
    migrations,
    entities,
    migrationsTableName: 'migrations_typeorm',
    migrationsRun: true,
});
export default dataSource;
