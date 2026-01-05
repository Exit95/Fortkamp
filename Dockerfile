# Build Stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

# Build the Astro site
RUN npm run build

# Production Stage
FROM httpd:2.4-alpine

# Enable required Apache modules
RUN sed -i \
    -e 's/^#\(LoadModule .*mod_rewrite.so\)/\1/' \
    -e 's/^#\(LoadModule .*mod_deflate.so\)/\1/' \
    -e 's/^#\(LoadModule .*mod_expires.so\)/\1/' \
    -e 's/^#\(LoadModule .*mod_headers.so\)/\1/' \
    /usr/local/apache2/conf/httpd.conf

# Copy built files from builder
COPY --from=builder /app/dist /usr/local/apache2/htdocs

# Copy Apache configuration
COPY apache.conf /usr/local/apache2/conf/extra/httpd-vhosts.conf
COPY .htaccess /usr/local/apache2/htdocs/.htaccess

# Enable virtual hosts
RUN echo "Include conf/extra/httpd-vhosts.conf" >> /usr/local/apache2/conf/httpd.conf

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["httpd-foreground"]

