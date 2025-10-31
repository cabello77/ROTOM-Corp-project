web: node backend/server.js
# Temporary drift-sync: baseline both migrations, then push current schema
release: cd backend && \
  npx prisma migrate resolve --applied 20251031182517_init || true && \
  npx prisma migrate resolve --applied 20251031182924_add_reply_backref || true && \
  npx prisma db push --accept-data-loss && \
  npx prisma generate

