-- Restore individual infection screening columns expected by the app schema.
-- Safe for DBs that already have these columns (e.g. from init migration).
ALTER TABLE "Patient" ADD COLUMN IF NOT EXISTS "tbScreening" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Patient" ADD COLUMN IF NOT EXISTS "hepBSurfaceAg" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Patient" ADD COLUMN IF NOT EXISTS "hepBSurfaceAb" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Patient" ADD COLUMN IF NOT EXISTS "hepBCoreAb" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Patient" ADD COLUMN IF NOT EXISTS "antiHcv" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Patient" ADD COLUMN IF NOT EXISTS "antiHiv" TEXT NOT NULL DEFAULT '';
