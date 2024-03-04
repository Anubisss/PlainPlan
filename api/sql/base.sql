-- SET GLOBAL event_scheduler = ON;

DROP TABLE IF EXISTS `registration_requests`;
DROP EVENT IF EXISTS `delete_expired_requests`;
DROP TABLE IF EXISTS `accounts`;
DROP TABLE IF EXISTS `password_resets`;
DROP TABLE IF EXISTS `teams`;

CREATE TABLE `registration_requests` (
  `email` VARCHAR(64) NOT NULL UNIQUE,
  `uuid` VARCHAR(36) PRIMARY KEY,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

delimiter |

CREATE EVENT `delete_expired_requests`
  ON SCHEDULE
    EVERY 10 MINUTE
  DO
    BEGIN
      DELETE FROM `registration_requests` WHERE `created` < DATE_SUB(NOW(), INTERVAL 2 HOUR);
      DELETE FROM `password_resets` WHERE `created` < DATE_SUB(NOW(), INTERVAL 1 HOUR);
    END |

delimiter ;

CREATE TABLE `accounts` (
  `email` VARCHAR(64) PRIMARY KEY,
  `password` BINARY(60) NOT NULL,
  `name` VARCHAR(32) NOT NULL,
  `location` VARCHAR(32) NOT NULL DEFAULT '',
  `website` VARCHAR(64) NOT NULL DEFAULT '',
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE `password_resets` (
  `email` VARCHAR(64) NOT NULL UNIQUE,
  `uuid` VARCHAR(36) PRIMARY KEY,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE `teams` (
  `id` MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `owner` VARCHAR(64) NOT NULL,
  `name` VARCHAR(32) NOT NULL UNIQUE,
  `description` VARCHAR(128) NOT NULL DEFAULT '',
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
