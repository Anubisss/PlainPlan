CREATE DATABASE `plainplan` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;

CREATE USER 'plainplan_api'@'localhost' IDENTIFIED BY '';

GRANT SELECT, INSERT, DELETE ON `plainplan`.`registration_requests` TO 'plainplan_api'@'localhost';
GRANT SELECT, INSERT, UPDATE ON `plainplan`.`accounts` TO 'plainplan_api'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON `plainplan`.`password_resets` TO 'plainplan_api'@'localhost';
GRANT SELECT, INSERT ON `plainplan`.`teams` TO 'plainplan_api'@'localhost';
