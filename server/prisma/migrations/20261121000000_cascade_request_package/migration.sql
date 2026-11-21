-- Deleting a listing also deletes its packages and requests, even when a request points to a package.
ALTER TABLE `SponsorshipRequest` DROP FOREIGN KEY `SponsorshipRequest_packageId_fkey`;
ALTER TABLE `SponsorshipRequest` ADD CONSTRAINT `SponsorshipRequest_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `Package`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
