ALTER DATABASE CHARACTER SET utf8mb4;


CREATE TABLE `Admins` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `Name` longtext CHARACTER SET utf8mb4 NOT NULL,
    `Email` longtext CHARACTER SET utf8mb4 NOT NULL,
    `Password` longtext CHARACTER SET utf8mb4 NOT NULL,
    `PhotoUrl` longtext CHARACTER SET utf8mb4 NULL,
    CONSTRAINT `PK_Admins` PRIMARY KEY (`Id`)
) CHARACTER SET=utf8mb4;


CREATE TABLE `Coaches` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `Name` longtext CHARACTER SET utf8mb4 NOT NULL,
    `Specialty` longtext CHARACTER SET utf8mb4 NOT NULL,
    `Email` longtext CHARACTER SET utf8mb4 NOT NULL,
    `Password` longtext CHARACTER SET utf8mb4 NOT NULL,
    `IsApproved` tinyint(1) NOT NULL,
    `PhotoUrl` longtext CHARACTER SET utf8mb4 NULL,
    CONSTRAINT `PK_Coaches` PRIMARY KEY (`Id`)
) CHARACTER SET=utf8mb4;


CREATE TABLE `JobOffers` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `Title` longtext CHARACTER SET utf8mb4 NOT NULL,
    `Description` longtext CHARACTER SET utf8mb4 NOT NULL,
    `CreatedAt` datetime(6) NOT NULL,
    `IsActive` tinyint(1) NOT NULL,
    CONSTRAINT `PK_JobOffers` PRIMARY KEY (`Id`)
) CHARACTER SET=utf8mb4;


CREATE TABLE `Offres` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `Name` longtext CHARACTER SET utf8mb4 NOT NULL,
    `Price` decimal(65,30) NOT NULL,
    `Duration` longtext CHARACTER SET utf8mb4 NOT NULL,
    `Description` longtext CHARACTER SET utf8mb4 NULL,
    `FeaturesJson` longtext CHARACTER SET utf8mb4 NOT NULL,
    CONSTRAINT `PK_Offres` PRIMARY KEY (`Id`)
) CHARACTER SET=utf8mb4;


CREATE TABLE `PasswordResetTokens` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `Email` longtext CHARACTER SET utf8mb4 NOT NULL,
    `Token` longtext CHARACTER SET utf8mb4 NOT NULL,
    `ExpiryDate` datetime(6) NOT NULL,
    `IsUsed` tinyint(1) NOT NULL,
    CONSTRAINT `PK_PasswordResetTokens` PRIMARY KEY (`Id`)
) CHARACTER SET=utf8mb4;


CREATE TABLE `Reviews` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `MemberName` longtext CHARACTER SET utf8mb4 NOT NULL,
    `Content` longtext CHARACTER SET utf8mb4 NOT NULL,
    `Rating` int NOT NULL,
    `CreatedAt` datetime(6) NOT NULL,
    `MemberId` int NULL,
    CONSTRAINT `PK_Reviews` PRIMARY KEY (`Id`)
) CHARACTER SET=utf8mb4;


CREATE TABLE `Subscriptions` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `Name` longtext CHARACTER SET utf8mb4 NOT NULL,
    `DurationInMonths` int NOT NULL,
    `Price` decimal(65,30) NOT NULL,
    `Type` longtext CHARACTER SET utf8mb4 NULL,
    CONSTRAINT `PK_Subscriptions` PRIMARY KEY (`Id`)
) CHARACTER SET=utf8mb4;


CREATE TABLE `Courses` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `Title` longtext CHARACTER SET utf8mb4 NOT NULL,
    `Description` longtext CHARACTER SET utf8mb4 NULL,
    `StartAt` datetime(6) NULL,
    `DurationMinutes` int NOT NULL,
    `MaxParticipants` int NOT NULL,
    `CoachId` int NULL,
    CONSTRAINT `PK_Courses` PRIMARY KEY (`Id`),
    CONSTRAINT `FK_Courses_Coaches_CoachId` FOREIGN KEY (`CoachId`) REFERENCES `Coaches` (`Id`)
) CHARACTER SET=utf8mb4;


CREATE TABLE `JobApplications` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `CandidateName` longtext CHARACTER SET utf8mb4 NULL,
    `CvPath` longtext CHARACTER SET utf8mb4 NOT NULL,
    `AppliedAt` datetime(6) NOT NULL,
    `Status` longtext CHARACTER SET utf8mb4 NOT NULL,
    `JobOfferId` int NOT NULL,
    CONSTRAINT `PK_JobApplications` PRIMARY KEY (`Id`),
    CONSTRAINT `FK_JobApplications_JobOffers_JobOfferId` FOREIGN KEY (`JobOfferId`) REFERENCES `JobOffers` (`Id`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;


CREATE TABLE `Members` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `Name` longtext CHARACTER SET utf8mb4 NOT NULL,
    `Age` int NOT NULL,
    `Email` longtext CHARACTER SET utf8mb4 NOT NULL,
    `Password` longtext CHARACTER SET utf8mb4 NOT NULL,
    `IsApproved` tinyint(1) NOT NULL,
    `PhotoUrl` longtext CHARACTER SET utf8mb4 NULL,
    `SubscriptionId` int NULL,
    `PaymentStatus` longtext CHARACTER SET utf8mb4 NOT NULL,
    `SubscriptionEndDate` datetime(6) NULL,
    `CoachId` int NULL,
    CONSTRAINT `PK_Members` PRIMARY KEY (`Id`),
    CONSTRAINT `FK_Members_Coaches_CoachId` FOREIGN KEY (`CoachId`) REFERENCES `Coaches` (`Id`),
    CONSTRAINT `FK_Members_Subscriptions_SubscriptionId` FOREIGN KEY (`SubscriptionId`) REFERENCES `Subscriptions` (`Id`)
) CHARACTER SET=utf8mb4;


CREATE TABLE `CourseMember` (
    `CoursesId` int NOT NULL,
    `MembersId` int NOT NULL,
    CONSTRAINT `PK_CourseMember` PRIMARY KEY (`CoursesId`, `MembersId`),
    CONSTRAINT `FK_CourseMember_Courses_CoursesId` FOREIGN KEY (`CoursesId`) REFERENCES `Courses` (`Id`) ON DELETE CASCADE,
    CONSTRAINT `FK_CourseMember_Members_MembersId` FOREIGN KEY (`MembersId`) REFERENCES `Members` (`Id`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;


CREATE INDEX `IX_CourseMember_MembersId` ON `CourseMember` (`MembersId`);


CREATE INDEX `IX_Courses_CoachId` ON `Courses` (`CoachId`);


CREATE INDEX `IX_JobApplications_JobOfferId` ON `JobApplications` (`JobOfferId`);


CREATE INDEX `IX_Members_CoachId` ON `Members` (`CoachId`);


CREATE INDEX `IX_Members_SubscriptionId` ON `Members` (`SubscriptionId`);


