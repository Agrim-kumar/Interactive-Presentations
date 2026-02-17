FROM node:18-bookworm

# Install poppler, ghostscript, and LibreOffice for PDF/PPT conversion
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    poppler-utils \
    ghostscript \
    libreoffice \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Verify tools
RUN echo "--- Verifying tools ---" && \
    pdftoppm -v 2>&1 && \
    gs --version && \
    libreoffice --version && \
    echo "--- All tools OK ---"

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --production

COPY . .

RUN mkdir -p uploads converted-slides

EXPOSE 5000

CMD ["node", "server.js"]