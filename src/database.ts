
import { Sequelize } from 'sequelize';
import endpoints from './config/endpoints.config';


const sequelize: Sequelize = new Sequelize(
    endpoints.DB_NAME,
    endpoints.DB_USER,
    endpoints.DB_PASS,
    {
        host: endpoints.DB_HOST,
        dialect: 'mysql',
    });

sequelize.authenticate()
    .then((res) => {
        console.log('Connection has been established successfully', res);
    })
    .catch((err) => {
        console.log(`Error connectng to database: ${err}`);
    });

export default sequelize;