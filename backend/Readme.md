# commands to create db schema and data
npx prisma generate
npx prisma migrate dev --schema [schema.prisma path]
npx prisma db push dev --schema [schema.prisma path]