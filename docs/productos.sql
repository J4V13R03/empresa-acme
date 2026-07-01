CREATE TABLE `productos` (
	`productId` INTEGER AUTO_INCREMENT NOT NULL,
	`productName` VARCHAR(100) NOT NULL,
	`productCode` VARCHAR(10) NOT NULL,
	`releaseDate` DATE NOT NULL,
	`price` INTEGER NOT NULL,
	`description` TEXT NOT NULL,
	`starRating` DOUBLE NOT NULL,
	`imageUrl` VARCHAR(255) NOT NULL,
	PRIMARY KEY(`productId`)
) ENGINE=INNODB;