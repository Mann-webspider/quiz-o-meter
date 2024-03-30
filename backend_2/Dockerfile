FROM node:latest

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install 
COPY ./src ./src
# VOLUME [ "./" , "./" ]
# VOLUME [ "./node_modules" ]
EXPOSE 3001

CMD npm run dev