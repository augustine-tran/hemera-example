FROM node:8.3.0

# Set environment variables
ENV appDir /app

RUN npm install -g fuge
RUN npm install -g json-server

# Set the work directory
VOLUME /app
WORKDIR ${appDir}

#Expose the port
EXPOSE 3000

RUN ls -la /app

CMD ["json-server", "--watch", "/app/fake/db.json"]