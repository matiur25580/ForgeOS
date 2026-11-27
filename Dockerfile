FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm install
COPY . .
RUN npm run build
ENV NODE_ENV=production
EXPOSE 4000
CMD ["npm", "--workspace", "@forgeos/api", "run", "start"]
