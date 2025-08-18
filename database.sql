-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: overrun
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `carbon_tracking`
--

DROP TABLE IF EXISTS `carbon_tracking`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carbon_tracking` (
  `id` int NOT NULL AUTO_INCREMENT,
  `crop_declaration_id` int NOT NULL,
  `week_start_date` date NOT NULL,
  `week_end_date` date NOT NULL,
  `carbon_credits` float NOT NULL COMMENT 'Tín chỉ carbon tính bằng tấn CO2',
  `measured_at` datetime NOT NULL COMMENT 'Thời gian thực hiện đo lường',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `crop_declaration_id` (`crop_declaration_id`),
  KEY `ix_carbon_tracking_id` (`id`),
  CONSTRAINT `carbon_tracking_ibfk_1` FOREIGN KEY (`crop_declaration_id`) REFERENCES `crop_declarations` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carbon_tracking`
--

LOCK TABLES `carbon_tracking` WRITE;
/*!40000 ALTER TABLE `carbon_tracking` DISABLE KEYS */;
/*!40000 ALTER TABLE `carbon_tracking` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `commitments`
--

DROP TABLE IF EXISTS `commitments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `commitments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `crop_declaration_id` int NOT NULL,
  `commitment_text` text NOT NULL,
  `signature_data` text NOT NULL,
  `signer_name` varchar(255) NOT NULL,
  `signed_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `pdf_path` varchar(500) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `crop_declaration_id` (`crop_declaration_id`),
  KEY `ix_commitments_id` (`id`),
  CONSTRAINT `commitments_ibfk_1` FOREIGN KEY (`crop_declaration_id`) REFERENCES `crop_declarations` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `commitments`
--

LOCK TABLES `commitments` WRITE;
/*!40000 ALTER TABLE `commitments` DISABLE KEYS */;
/*!40000 ALTER TABLE `commitments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `companies`
--

DROP TABLE IF EXISTS `companies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `companies` (
  `id` char(36) NOT NULL,
  `organization_name` varchar(255) NOT NULL COMMENT 'Tên tổ chức hoặc đại diện',
  `email` varchar(255) NOT NULL COMMENT 'Email đăng nhập',
  `password_hash` varchar(255) NOT NULL COMMENT 'Mật khẩu đã hash',
  `payment_completed` tinyint(1) DEFAULT NULL COMMENT 'Đã hoàn tất thanh toán',
  `payment_date` datetime DEFAULT NULL COMMENT 'Ngày thanh toán',
  `payment_amount` int DEFAULT NULL COMMENT 'Số tiền thanh toán (VNĐ)',
  `terms_agreed` tinyint(1) DEFAULT NULL COMMENT 'Đã đồng ý điều khoản',
  `terms_agreed_date` datetime DEFAULT NULL COMMENT 'Ngày đồng ý điều khoản',
  `is_active` tinyint(1) DEFAULT NULL COMMENT 'Tài khoản hoạt động',
  `is_verified` tinyint(1) DEFAULT NULL COMMENT 'Đã xác thực email',
  `last_login` datetime DEFAULT NULL COMMENT 'Lần đăng nhập cuối',
  `login_count` int DEFAULT NULL COMMENT 'Số lần đăng nhập',
  `created_at` datetime DEFAULT NULL COMMENT 'Ngày tạo',
  `updated_at` datetime DEFAULT NULL COMMENT 'Ngày cập nhật',
  `notes` text COMMENT 'Ghi chú thêm',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `companies`
--

LOCK TABLES `companies` WRITE;
/*!40000 ALTER TABLE `companies` DISABLE KEYS */;
INSERT INTO `companies` VALUES ('6411beda-43b9-415b-a0d3-285a735d5550','Viettel','green.company@example.com','$2b$12$e7x9G0x85KDILZ1yt1CV/uAOhFzlQElRm6F9tVtcBzcdNzM7ok2K6',0,NULL,2000000,0,NULL,1,0,NULL,0,'2025-08-18 03:01:48','2025-08-18 03:01:48',NULL);
/*!40000 ALTER TABLE `companies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `company_activity_logs`
--

DROP TABLE IF EXISTS `company_activity_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `company_activity_logs` (
  `id` char(36) NOT NULL,
  `company_id` char(36) NOT NULL COMMENT 'ID công ty',
  `action` varchar(100) NOT NULL COMMENT 'Hành động thực hiện',
  `description` text COMMENT 'Mô tả chi tiết',
  `status` varchar(20) DEFAULT NULL COMMENT 'Trạng thái: completed, pending, failed',
  `ip_address` varchar(45) DEFAULT NULL COMMENT 'Địa chỉ IP',
  `user_agent` text COMMENT 'User agent',
  `created_at` datetime DEFAULT NULL COMMENT 'Thời gian thực hiện',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `company_activity_logs`
--

LOCK TABLES `company_activity_logs` WRITE;
/*!40000 ALTER TABLE `company_activity_logs` DISABLE KEYS */;
INSERT INTO `company_activity_logs` VALUES ('10b2bc3e-67f6-4a17-a3d6-b461dc7c612c','6411beda-43b9-415b-a0d3-285a735d5550','Đăng ký tài khoản','Hoàn tất đăng ký và tạo tài khoản mới','completed','127.0.0.1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36','2025-08-18 03:01:48');
/*!40000 ALTER TABLE `company_activity_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `crop_declarations`
--

DROP TABLE IF EXISTS `crop_declarations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `crop_declarations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `area_name` varchar(255) NOT NULL,
  `latitude` float NOT NULL,
  `longitude` float NOT NULL,
  `area_size` float NOT NULL,
  `crop_type` varchar(255) NOT NULL,
  `planting_years` int NOT NULL,
  `evidence_image_path` varchar(500) DEFAULT NULL,
  `status` enum('DRAFT','COMMITTED','PENDING','APPROVED','REJECTED') NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `approved_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `approved_by` (`approved_by`),
  KEY `ix_crop_declarations_id` (`id`),
  CONSTRAINT `crop_declarations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `crop_declarations_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `crop_declarations`
--

LOCK TABLES `crop_declarations` WRITE;
/*!40000 ALTER TABLE `crop_declarations` DISABLE KEYS */;
/*!40000 ALTER TABLE `crop_declarations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_history`
--

DROP TABLE IF EXISTS `payment_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_history` (
  `id` char(36) NOT NULL,
  `company_id` char(36) NOT NULL COMMENT 'ID công ty',
  `amount` decimal(15,2) NOT NULL COMMENT 'Số tiền thanh toán',
  `currency` varchar(10) DEFAULT NULL COMMENT 'Đơn vị tiền tệ',
  `payment_method` varchar(50) DEFAULT NULL COMMENT 'Phương thức thanh toán',
  `transaction_id` varchar(255) DEFAULT NULL COMMENT 'Mã giao dịch',
  `period_start` datetime NOT NULL COMMENT 'Ngày bắt đầu gói dịch vụ',
  `period_end` datetime NOT NULL COMMENT 'Ngày kết thúc gói dịch vụ',
  `period_name` varchar(100) NOT NULL COMMENT 'Tên gói dịch vụ (VD: Tháng 1/2024)',
  `payment_type` varchar(20) DEFAULT NULL COMMENT 'Loại thanh toán: monthly, free, bonus',
  `status` varchar(20) DEFAULT NULL COMMENT 'Trạng thái: pending, completed, failed, active',
  `is_bonus` tinyint(1) DEFAULT NULL COMMENT 'Có phải tháng miễn phí bonus không',
  `consecutive_count` int DEFAULT NULL COMMENT 'Số lần thanh toán liên tiếp',
  `payment_date` datetime DEFAULT NULL COMMENT 'Ngày thanh toán thực tế',
  `created_at` datetime DEFAULT NULL COMMENT 'Ngày tạo',
  `updated_at` datetime DEFAULT NULL COMMENT 'Ngày cập nhật',
  PRIMARY KEY (`id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `payment_history_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_history`
--

LOCK TABLES `payment_history` WRITE;
/*!40000 ALTER TABLE `payment_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `payment_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promotion_registrations`
--

DROP TABLE IF EXISTS `promotion_registrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `promotion_registrations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `company_name` varchar(255) NOT NULL,
  `business_license` varchar(50) NOT NULL,
  `address` text NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `representative_name` varchar(255) NOT NULL,
  `representative_position` varchar(100) DEFAULT NULL,
  `representative_phone` varchar(20) DEFAULT NULL,
  `representative_email` varchar(100) DEFAULT NULL,
  `project_name` varchar(255) NOT NULL,
  `project_location` varchar(255) NOT NULL,
  `project_area` float NOT NULL,
  `project_description` text,
  `terms_accepted` tinyint(1) NOT NULL,
  `signature_data` text,
  `status` varchar(20) NOT NULL,
  `payment_status` varchar(20) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL,
  `admin_notes` text,
  PRIMARY KEY (`id`),
  KEY `ix_promotion_registrations_id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promotion_registrations`
--

LOCK TABLES `promotion_registrations` WRITE;
/*!40000 ALTER TABLE `promotion_registrations` DISABLE KEYS */;
INSERT INTO `promotion_registrations` VALUES (1,'Test Company Ltd','1234567890','123 Test Street, Test City','0123456789','test@company.com','John Doe','Đại diện','0987654321','john.doe@company.com','Dự án carbon tại 100.5','Test Farm Location',100.5,'Gói theo dõi: Gói theo dõi: 6',1,'data:image/png;base64,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','pending','unpaid','2025-08-18 10:01:36',NULL,NULL),(3,'Test Company Ltd','1234567890','123 Test Street, Test City','0123456789','test@company.com','John Doe','Đại diện','0987654321','john.doe@company.com','Dự án carbon tại 100.5','Test Farm Location',100.5,'Gói theo dõi: 6',1,'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAABkCAYAAADDhn8LAAAFBUlEQVR4AeyYTS4EQRSAX42/sLBhI1Zs2HACCycQLiERG0dwAxuxsXICEgewcAM2LISFWLGwkAiC1CQ9qe7pmZ7udHXXzzdJRfdMdb33vldfpkznjxcEIDCQQEd4QQACAwkgyEA0fAABEQRhF0BgCAEEGQKHjyBgURDgQsB/Agjifw+pwCIBBLEIl6X9J4Ag/veQCiwSQBCLcFnafwJ+CuI/dyrwhACCeNIo0myHAIK0w52onhBAEE8aRZrtEECQdrgT1RMCCJJpFLcQMAkgiEmDawhkCCBIBgi3EDAJIIhJg2sIZAggSAYItxAwCSCIScPuNat7SABBPGwaKTdHAEGaY00kDwkgiIdNI+XmCCBIc6yJ5CEBBPGwaf0p844tAghiiyzrBkEAQYJoI0XYIoAgtsiybhAEECSINlKELQIIYotsKOtGXgeCRL4BKH84AQQZzodPIyeAIJFvAMofTgBBhvPh08gJIEjkG6DN8n2IjSA+dIkcWyOAIK2hJ7APBBDEhy6RY2sEEKQ19AT2gQCC+NAlcixLoLb5CFIbShYKkQCChNhVaqqNAILUhpKFQiSAICF2lZpqI4AgtaFkoRAJ9AsSYpXUBIGKBBCkIjgei4MAgsTRZ6qsSABBKoKL7bHd3V3pdDqilBp56PmTk5OyuroqOzs74uOr42PS5NwMAVOK09NT+fv7KxVYz//+/pb7+3u5uLjoiTU2NiYTExOpMT09LUtLS3J4eFgqhu3JjQpiuxjWL0dga2tL5ufnextXKZW6zpNCKSVra2u5Y2NjQ8yxvb0tKysrXRGUUr3kfn9/5efnJzU+Pz/l6elJzs7OevNcuEAQF7pQIof19XXRxxZ9fFFKpTa0UuXuLy8v5e3trTC6Uqr77aG/EfTmvrm5kbxxfX0t5jg/P5e7uzv5+voS/Zx+/uTkRPb39/vG0dGRXF1dyePjY2E+TU5AkCZpl4ilz+36GKJUetPf3t6KPrbozVZiucKpc3NzsrCwkBo6hh56cxcuMOKEvb09OT4+7hsHBweyubk54irNTUOQ5lgPjJQngz6362PIwIeMD7RIU1NTkh0zMzOSjNnZWTGH3vjmeH19lZeXl9QwQkR7iSANt16p9DeCUqr7T+wwGcbHx7tnfnNDm9f6CKPP8Nnx8fEhyXh/fxdzNFy2t+FCEcTbBmQT1zKYm19f6yOVPvNn53JvnwCC2GecirC8vCz6Z85kPD8/9/4BTmRIPcBNqwQQpGH8Dw8PqZ83FxcXG86AcGUIIEgZWsyNjgCCRNdyCi5DAEEKaTEhZgIIEnP3qb2QAIIUImJCzAQQJObuU3shAQQpRMSEmAkgSJvdJ7bzBBDE+RaRYJsEEKRN+sR2ngCCON8iEmyTAIK0SZ/YzhNAEOdbVC1BnqqHAILUw5FVAiWAIIE2lrLqIYAg9XBklUAJIEigjaWsegggSD0cY1olqloRJKp2U2xZAghSlhjzoyKAIFG1m2LLEkCQssSYHxUBBImq3a4X615+COJeT8jIIQII4lAzSMU9AgjiXk/IyCECCOJQM0jFPQII4l5PyMgGgYprIkhFcDwWBwEEiaPPVFmRAIJUBMdjcRBAkDj6TJUVCSBIRXA8FgeBUQSJgwRVQiCHAILkQOEtCCQEECQhwV8I5BBAkBwovAWBhACCJCT4C4EcAi0LkpMRb0HAIQII4lAzSMU9AgjiXk/IyCEC/wAAAP//xb8o5AAAAAZJREFUAwAi2EPlNPdiYgAAAABJRU5ErkJggg==','pending','unpaid','2025-08-18 10:06:23',NULL,NULL);
/*!40000 ALTER TABLE `promotion_registrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `regions`
--

DROP TABLE IF EXISTS `regions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `regions` (
  `id` char(36) NOT NULL,
  `region_id` int NOT NULL COMMENT 'ID vùng gốc',
  `region_name` varchar(255) NOT NULL COMMENT 'Tên vùng',
  `area_ha` float DEFAULT NULL COMMENT 'Diện tích (ha)',
  `longitude` float NOT NULL COMMENT 'Kinh độ',
  `latitude` float NOT NULL COMMENT 'Vĩ độ',
  `chm_m` float DEFAULT NULL COMMENT 'CHM (m) - Canopy Height Model',
  `vegetation_coverage` float DEFAULT NULL COMMENT 'Độ phủ thực vật (%)',
  `polygon_points` int DEFAULT NULL COMMENT 'Số điểm POLYGON',
  `created_at` datetime DEFAULT NULL COMMENT 'Ngày tạo',
  `updated_at` datetime DEFAULT NULL COMMENT 'Ngày cập nhật',
  PRIMARY KEY (`id`),
  UNIQUE KEY `region_id` (`region_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `regions`
--

LOCK TABLES `regions` WRITE;
/*!40000 ALTER TABLE `regions` DISABLE KEYS */;
INSERT INTO `regions` VALUES ('1267f072-7be0-11f0-bb70-00155d6a78fb',153,'Sierra County, Ca Li, Hoa Kỳ',0,-121.022,39.5256,23.4124,0.855426,5,'2025-08-18 10:04:36','2025-08-18 10:04:36'),('1267f68c-7be0-11f0-bb70-00155d6a78fb',131,'Sierra County, Ca Li, Hoa Kỳ',0,-121.026,39.4645,19.3583,0.763319,15,'2025-08-18 10:04:36','2025-08-18 10:04:36'),('1267f7d3-7be0-11f0-bb70-00155d6a78fb',676,'El Dorado County, Ca Li, Hoa Kỳ',0,-120.665,38.9066,14.7184,0.765626,6,'2025-08-18 10:04:36','2025-08-18 10:04:36'),('1267f86a-7be0-11f0-bb70-00155d6a78fb',1059,'Thurston County, Washington, Hoa Kỳ',0,-123.105,46.9324,19.5092,0.893338,5,'2025-08-18 10:04:36','2025-08-18 10:04:36'),('1267f8f6-7be0-11f0-bb70-00155d6a78fb',1,'Nevada County, Ca Li, Hoa Kỳ',0,-120.905,39.1991,15.272,0.669135,12,'2025-08-18 10:04:36','2025-08-18 10:04:36'),('1267f97f-7be0-11f0-bb70-00155d6a78fb',451,'Sierra County, Ca Li, Hoa Kỳ',0,-120.883,39.4988,17.5443,0.578415,13,'2025-08-18 10:04:36','2025-08-18 10:04:36'),('1267fa1c-7be0-11f0-bb70-00155d6a78fb',196,'Sierra County, Ca Li, Hoa Kỳ',0,-120.781,39.5039,12.7027,0.416461,15,'2025-08-18 10:04:36','2025-08-18 10:04:36'),('1267fad9-7be0-11f0-bb70-00155d6a78fb',197,'Sierra County, Ca Li, Hoa Kỳ',0,-120.782,39.5072,12.2404,0.416005,15,'2025-08-18 10:04:36','2025-08-18 10:04:36'),('1267fc05-7be0-11f0-bb70-00155d6a78fb',174,'Yuba County, Ca Li, Hoa Kỳ',0,-121.111,39.4195,14.948,0.797601,5,'2025-08-18 10:04:36','2025-08-18 10:04:36'),('1267fc9c-7be0-11f0-bb70-00155d6a78fb',1207,'Chelan County, Washington, Hoa Kỳ',0,-120.68,47.8505,10.3229,0.443844,12,'2025-08-18 10:04:36','2025-08-18 10:04:36'),('1267ff48-7be0-11f0-bb70-00155d6a78fb',648,'El Dorado County, Ca Li, Hoa Kỳ',0,-120.652,38.8996,15.6466,0.604698,7,'2025-08-18 10:04:36','2025-08-18 10:04:36'),('12680028-7be0-11f0-bb70-00155d6a78fb',152,'Sierra County, Ca Li, Hoa Kỳ',0,-120.464,39.5028,9.2573,0.486217,5,'2025-08-18 10:04:36','2025-08-18 10:04:36'),('126800b4-7be0-11f0-bb70-00155d6a78fb',273,'Nevada County, Ca Li, Hoa Kỳ',0,-120.442,39.4328,15.8664,0.503452,5,'2025-08-18 10:04:36','2025-08-18 10:04:36'),('1268013b-7be0-11f0-bb70-00155d6a78fb',1063,'Thurston County, Washington, Hoa Kỳ',0,-123.114,46.8979,26.4038,0.892848,5,'2025-08-18 10:04:36','2025-08-18 10:04:36'),('126801d1-7be0-11f0-bb70-00155d6a78fb',709,'El Dorado County, Ca Li, Hoa Kỳ',0,-120.665,38.9057,15.3307,0.778443,5,'2025-08-18 10:04:36','2025-08-18 10:04:36'),('12680253-7be0-11f0-bb70-00155d6a78fb',97,'Yuba County, Ca Li, Hoa Kỳ',0,-121.06,39.4789,20.208,0.763596,5,'2025-08-18 10:04:36','2025-08-18 10:04:36'),('126802f0-7be0-11f0-bb70-00155d6a78fb',309,'Sierra County, Ca Li, Hoa Kỳ',0,-120.477,39.5073,10.9308,0.44004,14,'2025-08-18 10:04:36','2025-08-18 10:04:36'),('12680383-7be0-11f0-bb70-00155d6a78fb',260,'Nevada County, Ca Li, Hoa Kỳ',0,-120.56,39.4804,9.84752,0.512347,5,'2025-08-18 10:04:36','2025-08-18 10:04:36'),('1268041a-7be0-11f0-bb70-00155d6a78fb',106,'Sierra County, Ca Li, Hoa Kỳ',0,-120.926,39.5959,9.00388,0.527661,5,'2025-08-18 10:04:36','2025-08-18 10:04:36'),('126804e9-7be0-11f0-bb70-00155d6a78fb',646,'El Dorado County, Ca Li, Hoa Kỳ',0,-120.652,38.8993,12.3745,0.540242,5,'2025-08-18 10:04:36','2025-08-18 10:04:36'),('12680570-7be0-11f0-bb70-00155d6a78fb',1422,'Sierra County, Ca Li, Hoa Kỳ',0,-120.809,39.5115,13.4034,0.727991,6,'2025-08-18 10:04:36','2025-08-18 10:04:36'),('126805ff-7be0-11f0-bb70-00155d6a78fb',1435,'Sierra County, Ca Li, Hoa Kỳ',0,-120.888,39.4953,19.2478,0.752295,5,'2025-08-18 10:04:36','2025-08-18 10:04:36'),('12680684-7be0-11f0-bb70-00155d6a78fb',781,'Tuolumne County, Ca Li, Hoa Kỳ',0,-120.017,38.1843,17.3407,0.427077,14,'2025-08-18 10:04:36','2025-08-18 10:04:36'),('1268070c-7be0-11f0-bb70-00155d6a78fb',143,'Sierra County, Ca Li, Hoa Kỳ',0,-120.666,39.5935,13.098,0.533282,6,'2025-08-18 10:04:36','2025-08-18 10:04:36'),('12680794-7be0-11f0-bb70-00155d6a78fb',157,'Sierra County, Ca Li, Hoa Kỳ',0,-120.987,39.5452,10.7535,0.813098,5,'2025-08-18 10:04:36','2025-08-18 10:04:36'),('12680818-7be0-11f0-bb70-00155d6a78fb',100,'Sierra County, Ca Li, Hoa Kỳ',0,-120.951,39.4948,16.7125,0.880288,7,'2025-08-18 10:04:36','2025-08-18 10:04:36'),('1268089f-7be0-11f0-bb70-00155d6a78fb',1061,'Thurston County, Washington, Hoa Kỳ',0,-123.093,46.9018,37.7966,0.904214,5,'2025-08-18 10:04:36','2025-08-18 10:04:36'),('12680920-7be0-11f0-bb70-00155d6a78fb',1039,'Clallam County, Washington, Hoa Kỳ',0,-124.067,48.0619,31.781,0.973108,5,'2025-08-18 10:04:36','2025-08-18 10:04:36'),('126809b8-7be0-11f0-bb70-00155d6a78fb',1067,'Pacific County, Washington, Hoa Kỳ',0,-123.704,46.6172,9.3238,0.805491,16,'2025-08-18 10:04:36','2025-08-18 10:04:36'),('12680a44-7be0-11f0-bb70-00155d6a78fb',1072,'Boulder County, Colorado, Hoa Kỳ',0,-105.547,40.0394,8.74923,0.66427,8,'2025-08-18 10:04:36','2025-08-18 10:04:36'),('12680ac6-7be0-11f0-bb70-00155d6a78fb',450,'Sierra County, Ca Li, Hoa Kỳ',0,-120.998,39.4771,18.8369,0.467257,20,'2025-08-18 10:04:36','2025-08-18 10:04:36'),('12680b62-7be0-11f0-bb70-00155d6a78fb',439,'El Dorado County, Ca Li, Hoa Kỳ',0,-120.088,38.967,11.4647,0.472333,6,'2025-08-18 10:04:36','2025-08-18 10:04:36'),('12680be9-7be0-11f0-bb70-00155d6a78fb',782,'Tuolumne County, Ca Li, Hoa Kỳ',0,-120.017,38.1844,17.3721,0.411553,13,'2025-08-18 10:04:36','2025-08-18 10:04:36'),('12680c6d-7be0-11f0-bb70-00155d6a78fb',299,'Placer County, Ca Li, Hoa Kỳ',0,-120.653,39.2882,8.22205,0.407017,13,'2025-08-18 10:04:36','2025-08-18 10:04:36'),('12680cf4-7be0-11f0-bb70-00155d6a78fb',778,'Sierra County, Ca Li, Hoa Kỳ',0,-121.021,39.5243,21.0356,0.406535,7,'2025-08-18 10:04:36','2025-08-18 10:04:36'),('12680d73-7be0-11f0-bb70-00155d6a78fb',1057,'Thurston County, Washington, Hoa Kỳ',0,-123.123,46.9053,16.275,0.847822,5,'2025-08-18 10:04:36','2025-08-18 10:04:36'),('12680df9-7be0-11f0-bb70-00155d6a78fb',168,'Sierra County, Ca Li, Hoa Kỳ',0,-120.896,39.6044,12.2956,0.446124,5,'2025-08-18 10:04:36','2025-08-18 10:04:36'),('12680ea1-7be0-11f0-bb70-00155d6a78fb',435,'El Dorado County, Ca Li, Hoa Kỳ',0,-120.088,38.9665,10.1582,0.400891,14,'2025-08-18 10:04:36','2025-08-18 10:04:36'),('12680f25-7be0-11f0-bb70-00155d6a78fb',266,'Nevada County, Ca Li, Hoa Kỳ',0,-120.555,39.4825,10.099,0.457844,5,'2025-08-18 10:04:36','2025-08-18 10:04:36'),('12680fac-7be0-11f0-bb70-00155d6a78fb',1047,'Jefferson County, Washington, Hoa Kỳ',0,-124.035,47.5745,27.8336,0.967883,5,'2025-08-18 10:04:36','2025-08-18 10:04:36'),('12681046-7be0-11f0-bb70-00155d6a78fb',1016,'Jefferson County, Washington, Hoa Kỳ',0,-122.991,47.6481,20.4626,0.487273,7,'2025-08-18 10:04:36','2025-08-18 10:04:36'),('126810c9-7be0-11f0-bb70-00155d6a78fb',745,'Sierra County, Ca Li, Hoa Kỳ',0,-121.027,39.4652,16.1945,0.57718,5,'2025-08-18 10:04:36','2025-08-18 10:04:36'),('12681160-7be0-11f0-bb70-00155d6a78fb',167,'Sierra County, Ca Li, Hoa Kỳ',0,-120.905,39.6095,9.46967,0.421486,6,'2025-08-18 10:04:36','2025-08-18 10:04:36'),('126811e4-7be0-11f0-bb70-00155d6a78fb',1044,'Clallam County, Washington, Hoa Kỳ',0,-124.214,48.0419,29.5926,0.560233,8,'2025-08-18 10:04:36','2025-08-18 10:04:36'),('12681268-7be0-11f0-bb70-00155d6a78fb',162,'Sierra County, Ca Li, Hoa Kỳ',0,-120.865,39.6469,9.72314,0.500602,5,'2025-08-18 10:04:36','2025-08-18 10:04:36'),('126812ec-7be0-11f0-bb70-00155d6a78fb',1049,'Grays Harbor County, Washington, Hoa Kỳ',0,-123.184,46.8623,17.4741,0.950199,5,'2025-08-18 10:04:36','2025-08-18 10:04:36'),('12681392-7be0-11f0-bb70-00155d6a78fb',142,'Sierra County, Ca Li, Hoa Kỳ',0,-120.669,39.5945,11.0191,0.420977,5,'2025-08-18 10:04:36','2025-08-18 10:04:36'),('1268141e-7be0-11f0-bb70-00155d6a78fb',128,'Sierra County, Ca Li, Hoa Kỳ',0,-121.026,39.4635,20.4608,0.646078,13,'2025-08-18 10:04:36','2025-08-18 10:04:36'),('126814d6-7be0-11f0-bb70-00155d6a78fb',227,'Tuolumne County, Ca Li, Hoa Kỳ',0,-120.018,38.1842,17.5173,0.437629,13,'2025-08-18 10:04:36','2025-08-18 10:04:36'),('12681655-7be0-11f0-bb70-00155d6a78fb',262,'Nevada County, Ca Li, Hoa Kỳ',0,-120.547,39.4699,9.59537,0.489855,5,'2025-08-18 10:04:36','2025-08-18 10:04:36'),('12681713-7be0-11f0-bb70-00155d6a78fb',173,'Yuba County, Ca Li, Hoa Kỳ',0,-121.11,39.4192,15.0069,0.823572,6,'2025-08-18 10:04:36','2025-08-18 10:04:36'),('126817ae-7be0-11f0-bb70-00155d6a78fb',1410,'Sierra County, Ca Li, Hoa Kỳ',0,-120.25,39.505,12.2072,0.416107,5,'2025-08-18 10:04:36','2025-08-18 10:04:36'),('12681839-7be0-11f0-bb70-00155d6a78fb',135,'Yuba County, Ca Li, Hoa Kỳ',0,-121.113,39.4167,21.1761,0.790217,15,'2025-08-18 10:04:36','2025-08-18 10:04:36');
/*!40000 ALTER TABLE `regions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(255) NOT NULL,
  `birth_date` date NOT NULL,
  `gender` varchar(10) NOT NULL,
  `cccd` varchar(20) NOT NULL,
  `current_address` varchar(500) NOT NULL,
  `hometown` varchar(500) NOT NULL,
  `issue_date` date NOT NULL,
  `issue_place` varchar(255) NOT NULL,
  `phone_number` varchar(15) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('FARMER','ADMIN') NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `phone_number` (`phone_number`),
  UNIQUE KEY `ix_users_cccd` (`cccd`),
  KEY `ix_users_id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-18 10:07:48
