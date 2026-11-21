CREATE INDEX CONCURRENTLY IF NOT EXISTS "users_createdAt_idx" ON "users"("createdAt");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "users_role_createdAt_idx" ON "users"("role", "createdAt");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "users_activeStatus_createdAt_idx" ON "users"("activeStatus", "createdAt");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "users_role_activeStatus_createdAt_idx" ON "users"("role", "activeStatus", "createdAt");

CREATE INDEX CONCURRENTLY IF NOT EXISTS "technicianProfiles_isAvailable_createdAt_idx" ON "technicianProfiles"("isAvailable", "createdAt");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "technicianProfiles_hourlyRate_idx" ON "technicianProfiles"("hourlyRate");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "technicianProfiles_averageRating_idx" ON "technicianProfiles"("averageRating");

CREATE INDEX CONCURRENTLY IF NOT EXISTS "services_technicianId_idx" ON "services"("technicianId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "services_categoryId_createdAt_idx" ON "services"("categoryId", "createdAt");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "services_price_idx" ON "services"("price");

CREATE INDEX CONCURRENTLY IF NOT EXISTS "bookings_customerId_createdAt_idx" ON "bookings"("customerId", "createdAt");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "bookings_technicianId_createdAt_idx" ON "bookings"("technicianId", "createdAt");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "bookings_status_createdAt_idx" ON "bookings"("status", "createdAt");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "bookings_serviceId_idx" ON "bookings"("serviceId");

CREATE INDEX CONCURRENTLY IF NOT EXISTS "reviews_technicianId_createdAt_idx" ON "reviews"("technicianId", "createdAt");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "reviews_rating_idx" ON "reviews"("rating");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "payments_createdAt_idx" ON "payments"("createdAt");
