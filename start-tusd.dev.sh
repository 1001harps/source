tusd \
-s3-bucket=sourcedev \
-s3-object-prefix=tusd/ \
-hooks-http http://localhost:3000/internal/tusd/webhook \
-cors-allow-origin 'https?://localhost:5173' \
-cors-allow-headers X-API-KEY

