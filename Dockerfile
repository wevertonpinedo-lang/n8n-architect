# Build Node
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Serve Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Config custom nginx se precisar (fazer depois)
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
