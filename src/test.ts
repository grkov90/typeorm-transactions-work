import {config} from "dotenv";
import {UserEntity} from "./user.entity";
import {ConnectionOptions, Connection, createConnection, getConnection, getRepository, Repository} from "typeorm";
import {Chance} from "chance";

config();
const random = new Chance();

/**
 * Configs.
 */
const {
    MYSQL_USER: username,
    MYSQL_PASSWORD: password,
    MYSQL_DATABASE: database,
    MYSQL_HOST: host,
    MYSQL_PORT: port,
} = process.env;

/**
 * Connect options.
 */
const connectionConfig: ConnectionOptions = {
    type:"mysql",
    host,
    port: Number(port),
    username,
    password,
    database,
    entities: [UserEntity],

    // Can view typeorm logs if set true.
    logging: true,

    // Drop when connect.
    dropSchema: true,
    // Sync when connect.
    synchronize: true
}

/**
 * Fills User entity from mock data.
 */
function userFactoryMock(): UserEntity {
    const user = new UserEntity();

    user.name = random.name();
    user.age = random.age();

    return user;
}

/**
 * Makes users array.
 */
function makeStubData(count = 1000): UserEntity[] {
    const arr = [];

    while (count--) {
        arr.push(userFactoryMock());
    }

    return arr;
}


describe('Insert rows to db', () => {
    let connection: Connection;
    let userRepo: Repository<UserEntity>;
    let rows: UserEntity[];

    beforeEach(async () => {
        connection = await createConnection(connectionConfig);
        userRepo = getRepository(UserEntity);
        rows = makeStubData();
    })

    afterEach(() => {
        return getConnection().close();
    })


    /**
     *  INSERT INTO ... VALUES (...);
     *  INSERT INTO ... VALUES (...);
     *  INSERT INTO ... VALUES (...);
     */
    it('(1) repo.insert(row)', async () => {
        for (const row of rows) {
            await userRepo.insert(row);
        }
    })

    /**
     *  START TRANSACTION;  # different runner.
     *  INSERT INTO ... VALUES (...);
     *  INSERT INTO ... VALUES (...);
     *  INSERT INTO ... VALUES (...);
     *  COMMIT;
     */
    it('(2) repo.insert(row) manual transaction does not work', async () => {
        await connection.transaction(async () => {
            for (const row of rows) {
                await userRepo.insert(row);
            }
        })
    })

    /**
     * INSERT INTO ... VALUES (...), (...), (...);
     */
    it('(3) repo.insert(rows)', async () => {
        await userRepo.insert(rows);
    })

    /**
     *  START TRANSACTION;
     *  INSERT INTO ... VALUES (...);
     *  COMMIT;
     *  START TRANSACTION;
     *  INSERT INTO ... VALUES (...);
     *  COMMIT;
     *  START TRANSACTION;
     *  INSERT INTO ... VALUES (...);
     *  COMMIT;
     */
    it('(4) repo.save(row) each auto transaction', async () => {
        for (const row of rows) {
            await userRepo.save(row);
        }
    })

    /**
     *  START TRANSACTION;
     *  INSERT INTO ... VALUES (...);
     *  INSERT INTO ... VALUES (...);
     *  INSERT INTO ... VALUES (...);
     *  COMMIT;
     */
    it('(5) repo.save(rows) auto transaction', async () => {
        await userRepo.save(rows);
    })

    /**
     *  START TRANSACTION;
     *  INSERT INTO ... VALUES (...);
     *  INSERT INTO ... VALUES (...);
     *  INSERT INTO ... VALUES (...);
     *  COMMIT;
     */
    it('(6) manager.save(row) manual transaction', async () => {
        await connection.transaction(async (manager) => {
            for (const row of rows) {
                await manager.save(row);
            }
        })
    })

    /**
     *  START TRANSACTION;
     *  INSERT INTO ... VALUES (...);
     *  INSERT INTO ... VALUES (...);
     *  INSERT INTO ... VALUES (...);
     *  COMMIT;
     */
    it('(7) manager.save(rows) manual transaction', async () => {
        await connection.transaction(async (manager) => {
            await manager.save(rows);
        })
    })

    /**
     *  START TRANSACTION;
     *  INSERT INTO ... VALUES (...);
     *  INSERT INTO ... VALUES (...);
     *  INSERT INTO ... VALUES (...);
     *  COMMIT;
     */
    it('(8) queryRunner.manager.save(rows) manual transaction', async () => {
        const queryRunner = connection.createQueryRunner();

        await queryRunner.connect();

        await queryRunner.startTransaction();

        try {

            await queryRunner.manager.save(rows);
            await queryRunner.commitTransaction();

        } catch (err) {
            await queryRunner.rollbackTransaction();
        } finally {
            await queryRunner.release();
        }
    })
})
