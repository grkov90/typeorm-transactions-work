FROM node:15.2.1-alpine3.10

WORKDIR /opt/typeorm-transactions-work

ENV WAIT_VERSION 2.7.2
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/$WAIT_VERSION/wait /wait
RUN chmod +x /wait

COPY package.json .
COPY yarn.lock .

RUN yarn install --prod

CMD ["yarn", "jest"]

COPY . .
