# Typeorm transactions work
\#typeorm \#mysql \#nodejs \#jest \#docker-compose \#transactions

Hello. I've decided to figure out how save methods work with transactions in typeorm (mysql). This project makes clear the atomicity
of transaction execution in database by seeing the speed of the tests.

P.s: I do not pretend to be correct, but the result is quite clear.

## My results on 1000 rows: 
 
```
  Insert rows to db
    ✓ (1) repo.insert(row) (2944 ms)
    ✓ (2) repo.insert(row) manual transaction does not work (2762 ms)
    ✓ (3) repo.insert(rows) (104 ms)
    ✓ (4) repo.save(row) each auto transaction (3552 ms)
    ✓ (5) repo.save(rows) auto transaction (459 ms)
    ✓ (6) manager.save(row) manual transaction (394 ms)
    ✓ (7) manager.save(rows) manual transaction (242 ms)
```
In this file (`./src/test.ts`) can see structures of execution db query. 

## Run
For running execute the command:
```
$ docker-compose up
....
$ CTR+C
```

After making changes restart via command: 
```
$ docker-compose up --build
```

Remove containers:
```
$ docker-compose down
```
