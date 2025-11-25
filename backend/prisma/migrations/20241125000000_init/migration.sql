-- CreateTable
CREATE TABLE "visitor_logs" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "visitor_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hourly_statistics" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "hour" INTEGER NOT NULL,
    "entry_count" INTEGER NOT NULL DEFAULT 0,
    "exit_count" INTEGER NOT NULL DEFAULT 0,
    "peak_visitors" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hourly_statistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configurations" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "current_status" (
    "id" TEXT NOT NULL,
    "current_visitors" INTEGER NOT NULL DEFAULT 0,
    "max_capacity" INTEGER NOT NULL DEFAULT 100,
    "is_open" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "current_status_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "visitor_logs_timestamp_idx" ON "visitor_logs"("timestamp");

-- CreateIndex
CREATE INDEX "visitor_logs_type_idx" ON "visitor_logs"("type");

-- CreateIndex
CREATE INDEX "hourly_statistics_date_idx" ON "hourly_statistics"("date");

-- CreateIndex
CREATE UNIQUE INDEX "hourly_statistics_date_hour_key" ON "hourly_statistics"("date", "hour");

-- CreateIndex
CREATE UNIQUE INDEX "configurations_key_key" ON "configurations"("key");
