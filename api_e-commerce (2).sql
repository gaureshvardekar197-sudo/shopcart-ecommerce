-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 19, 2026 at 11:49 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `api_e-commerce`
--

-- --------------------------------------------------------

--
-- Table structure for table `addresses`
--

CREATE TABLE `addresses` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `address_line1` varchar(255) NOT NULL,
  `address_line2` varchar(255) DEFAULT NULL,
  `city` varchar(255) NOT NULL,
  `state` varchar(255) NOT NULL,
  `pincode` varchar(255) NOT NULL,
  `landmark` varchar(255) DEFAULT NULL,
  `address_type` varchar(255) NOT NULL DEFAULT 'home',
  `is_default` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `addresses`
--

INSERT INTO `addresses` (`id`, `user_id`, `full_name`, `phone`, `email`, `address_line1`, `address_line2`, `city`, `state`, `pincode`, `landmark`, `address_type`, `is_default`, `created_at`, `updated_at`) VALUES
(1, 1, 'Rohit Sharma', '9087876765', 'Rohit45@gmail.com', 'mumbai', 'mumbai', 'mumbai', 'maharashtra', '416602', 'mumbai', 'home', 1, '2026-02-23 03:02:48', '2026-02-23 03:02:48'),
(2, 2, 'User', '8876545678', 'user@gmail.com', 'mumbai', 'mumbai', 'mumbai', 'maharashtra', '416602', 'IT Teamwork', 'home', 1, '2026-02-25 03:29:34', '2026-03-12 01:32:12'),
(3, 3, 'Gauresh Vardekar', '9970056668', 'gaureshvardekar@gmail.com', 'mumbai', 'mumbai', 'mumbai', 'maharashtra', '416602', 'mumbai', 'work', 1, '2026-02-27 03:32:22', '2026-02-27 03:32:22');

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cancellation_requests`
--

CREATE TABLE `cancellation_requests` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `reason` enum('changed_mind','wrong_item','shipping_delay','better_price','payment_issue','duplicate_order','other') NOT NULL DEFAULT 'other',
  `reason_note` text DEFAULT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `refund_status` enum('pending','processing','completed','failed') DEFAULT NULL,
  `refund_amount` decimal(10,2) DEFAULT NULL,
  `refund_transaction_id` varchar(255) DEFAULT NULL,
  `refunded_at` timestamp NULL DEFAULT NULL,
  `admin_response` text DEFAULT NULL,
  `processed_by` bigint(20) UNSIGNED DEFAULT NULL,
  `processed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cancellation_requests`
--

INSERT INTO `cancellation_requests` (`id`, `order_id`, `user_id`, `reason`, `reason_note`, `status`, `refund_status`, `refund_amount`, `refund_transaction_id`, `refunded_at`, `admin_response`, `processed_by`, `processed_at`, `created_at`, `updated_at`) VALUES
(9, 17, 2, 'changed_mind', 'qigoodhwqgdofw', 'rejected', NULL, 54998.99, NULL, NULL, 'ffyffgiif', 1, '2026-03-11 01:18:02', '2026-03-11 00:52:23', '2026-03-11 01:18:02'),
(10, 17, 2, 'wrong_item', 'fiyiytyuut', 'pending', NULL, 54998.99, NULL, NULL, 'fiytoogpg', 1, '2026-03-11 01:18:19', '2026-03-11 01:09:15', '2026-03-11 01:18:19'),
(11, 18, 2, 'better_price', 'hoikhkgkhfjddu', 'approved', NULL, 538.99, NULL, NULL, 'uitiryriyfffof', 1, '2026-03-11 01:37:35', '2026-03-11 01:33:56', '2026-03-11 01:37:35');

-- --------------------------------------------------------

--
-- Table structure for table `carts`
--

CREATE TABLE `carts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `size_id` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `popular` tinyint(1) NOT NULL DEFAULT 0,
  `image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `slug`, `status`, `popular`, `image`, `created_at`, `updated_at`) VALUES
(1, 'Electronics', 'electronics', 1, 1, 'categories/ENSUaLUNgFuRq5KHNbwGR8ORu3GXfD0qynH705qC.jpg', '2026-02-19 01:12:06', '2026-02-19 01:12:06'),
(2, 'Clothing', 'clothing', 1, 1, 'categories/7ddWdaldMzqdcO495R7yPvGjb7bFElspCnnbymnO.jpg', '2026-02-19 01:12:49', '2026-02-19 01:12:49'),
(3, 'Home Appliances', 'home-appliances', 1, 0, 'categories/UJABSg4i8yZJeX8hPWMDMvNzsM05cVq3XOJSh7Iq.jpg', '2026-02-19 01:13:11', '2026-02-19 01:13:11'),
(4, 'Books', 'books', 1, 0, 'categories/4ORWZuhPjNO6AyLnpdQezYFiG5yz5N683Ho4oUZc.jpg', '2026-02-19 01:13:35', '2026-02-19 01:13:35'),
(5, 'Beauty & Personal Care', 'beauty-personal-care', 1, 1, 'categories/CdpatsMKNnDeAjCptaJrQNlKrE0kkd0FbqqtqjJ9.jpg', '2026-02-19 01:14:01', '2026-02-19 01:14:01'),
(6, 'Sports & Fitness', 'sports-fitness', 1, 0, 'categories/02sYRHgMIIC2J9sDuVZHGa7AaLmKoHorAPgeCFN6.jpg', '2026-02-19 01:14:31', '2026-02-19 01:14:31'),
(7, 'Toys & Games', 'toys-games', 1, 0, 'categories/jW0Y2DhMgFXIJlIihJAuB0bPVXvj5L7AkXwkQNmb.jpg', '2026-02-19 01:15:07', '2026-02-19 01:15:07'),
(8, 'Mobile Accessories', 'mobile-accessories', 1, 1, 'categories/Sqeim4v1H3hQERhsj8Y3uv0qI4JktwWH4k1z9Tfc.jpg', '2026-02-19 01:15:50', '2026-02-19 01:15:50');

-- --------------------------------------------------------

--
-- Table structure for table `contacts`
--

CREATE TABLE `contacts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2026_02_13_065209_create_personal_access_tokens_table', 1),
(5, '2026_02_13_121652_create_categories_table', 1),
(6, '2026_02_14_103921_create_products_table', 1),
(7, '2026_02_19_062005_create_wishlists_table', 1),
(8, '2026_02_19_095454_create_carts_table', 2),
(9, '2026_02_21_062645_create_addresses_table', 3),
(10, '2026_02_21_063445_create_orders_table', 4),
(12, '2026_02_21_063457_create_order_items_table', 5),
(13, '2026_02_21_081702_create_orders_table', 6),
(14, '2026_02_21_083020_create_orders_table', 7),
(15, '2026_02_21_093354_create_order_items_table', 8),
(16, '2026_02_21_111934_create_addresses_table', 9),
(17, '2026_02_23_064908_create_orders_table', 10),
(18, '2026_02_25_060348_create_product_reviews_table', 11),
(19, '2026_02_27_121429_create_password_resets_table', 12),
(20, '2026_02_28_082557_create_contacts_table', 13),
(21, '2026_03_05_051824_create_product_sizes_table', 14),
(22, '2026_03_09_061536_add_size_id_to_carts_table', 15),
(23, '2026_03_10_123647_create_cancellation_requests_table', 16);

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `shipping_address` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`shipping_address`)),
  `billing_address` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`billing_address`)),
  `subtotal` decimal(10,2) NOT NULL,
  `delivery_charge` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total` decimal(10,2) NOT NULL,
  `payment_method` varchar(255) NOT NULL,
  `status` enum('pending','confirmed','processing','shipped','out_for_delivery','delivered','cancelled','refunded','failed') NOT NULL DEFAULT 'pending',
  `delivery_instructions` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `shipping_address`, `billing_address`, `subtotal`, `delivery_charge`, `total`, `payment_method`, `status`, `delivery_instructions`, `created_at`, `updated_at`) VALUES
(1, 1, '{\"full_name\":\"Rohit Sharma\",\"phone\":\"9087876765\",\"email\":\"Rohit45@gmail.com\",\"address_line1\":\"mumbai\",\"address_line2\":\"mumbai\",\"city\":\"mumbai\",\"state\":\"maharashtra\",\"pincode\":\"416602\",\"landmark\":\"mumbai\",\"address_type\":\"home\"}', '{\"full_name\":\"Rohit Sharma\",\"phone\":\"9087876765\",\"email\":\"Rohit45@gmail.com\",\"address_line1\":\"mumbai\",\"address_line2\":\"mumbai\",\"city\":\"mumbai\",\"state\":\"maharashtra\",\"pincode\":\"416602\",\"landmark\":\"mumbai\",\"address_type\":\"home\"}', 799.00, 0.00, 799.00, 'cod', 'failed', NULL, '2026-02-23 03:02:47', '2026-02-24 06:41:38'),
(2, 1, '{\"full_name\":\"Rohit Sharma\",\"phone\":\"9087876765\",\"email\":\"Rohit45@gmail.com\",\"address_line1\":\"mumbai\",\"address_line2\":\"mumbai\",\"city\":\"mumbai\",\"state\":\"maharashtra\",\"pincode\":\"416602\",\"landmark\":\"mumbai\",\"address_type\":\"home\"}', '{\"full_name\":\"Rohit Sharma\",\"phone\":\"9087876765\",\"email\":\"Rohit45@gmail.com\",\"address_line1\":\"mumbai\",\"address_line2\":\"mumbai\",\"city\":\"mumbai\",\"state\":\"maharashtra\",\"pincode\":\"416602\",\"landmark\":\"mumbai\",\"address_type\":\"home\"}', 3196.00, 0.00, 3196.00, 'online', 'delivered', NULL, '2026-02-24 04:48:34', '2026-02-24 04:50:46'),
(3, 2, '{\"full_name\":\"User\",\"phone\":\"9087876765\",\"email\":\"user@gmail.com\",\"address_line1\":\"mumbai\",\"address_line2\":\"mumbai\",\"city\":\"mumbai\",\"state\":\"maharashtra\",\"pincode\":\"416602\",\"landmark\":\"IT Teamwork\",\"address_type\":\"work\"}', '{\"full_name\":\"User\",\"phone\":\"9087876765\",\"email\":\"user@gmail.com\",\"address_line1\":\"mumbai\",\"address_line2\":\"mumbai\",\"city\":\"mumbai\",\"state\":\"maharashtra\",\"pincode\":\"416602\",\"landmark\":\"IT Teamwork\",\"address_type\":\"work\"}', 1998.00, 0.00, 1998.00, 'cod', 'delivered', NULL, '2026-02-25 03:29:34', '2026-02-25 03:30:11'),
(4, 2, '{\"full_name\":\"User\",\"phone\":\"9087876765\",\"email\":\"user@gmail.com\",\"address_line1\":\"mumbai\",\"address_line2\":\"mumbai\",\"city\":\"mumbai\",\"state\":\"maharashtra\",\"pincode\":\"416602\",\"landmark\":\"IT Teamwork\",\"address_type\":\"work\"}', '{\"full_name\":\"User\",\"phone\":\"9087876765\",\"email\":\"user@gmail.com\",\"address_line1\":\"mumbai\",\"address_line2\":\"mumbai\",\"city\":\"mumbai\",\"state\":\"maharashtra\",\"pincode\":\"416602\",\"landmark\":\"IT Teamwork\",\"address_type\":\"work\"}', 2398.00, 0.00, 2398.00, 'cod', 'delivered', NULL, '2026-02-26 03:45:58', '2026-02-26 03:46:35'),
(5, 2, '{\"full_name\":\"User\",\"phone\":\"9087876765\",\"email\":\"user@gmail.com\",\"address_line1\":\"mumbai\",\"address_line2\":\"mumbai\",\"city\":\"mumbai\",\"state\":\"maharashtra\",\"pincode\":\"416602\",\"landmark\":\"IT Teamwork\",\"address_type\":\"work\"}', '{\"full_name\":\"User\",\"phone\":\"9087876765\",\"email\":\"user@gmail.com\",\"address_line1\":\"mumbai\",\"address_line2\":\"mumbai\",\"city\":\"mumbai\",\"state\":\"maharashtra\",\"pincode\":\"416602\",\"landmark\":\"IT Teamwork\",\"address_type\":\"work\"}', 1199.00, 0.00, 1199.00, 'cod', 'delivered', NULL, '2026-02-26 04:19:42', '2026-02-26 04:20:27'),
(6, 2, '{\"full_name\":\"User\",\"phone\":\"9087876765\",\"email\":\"user@gmail.com\",\"address_line1\":\"mumbai\",\"address_line2\":\"mumbai\",\"city\":\"mumbai\",\"state\":\"maharashtra\",\"pincode\":\"416602\",\"landmark\":\"IT Teamwork\",\"address_type\":\"work\"}', '{\"full_name\":\"User\",\"phone\":\"9087876765\",\"email\":\"user@gmail.com\",\"address_line1\":\"mumbai\",\"address_line2\":\"mumbai\",\"city\":\"mumbai\",\"state\":\"maharashtra\",\"pincode\":\"416602\",\"landmark\":\"IT Teamwork\",\"address_type\":\"work\"}', 25998.99, 0.00, 25998.99, 'cod', 'delivered', NULL, '2026-02-26 04:34:11', '2026-02-26 04:34:39'),
(7, 2, '{\"full_name\":\"User\",\"phone\":\"9087876765\",\"email\":\"user@gmail.com\",\"address_line1\":\"mumbai\",\"address_line2\":\"mumbai\",\"city\":\"mumbai\",\"state\":\"maharashtra\",\"pincode\":\"416602\",\"landmark\":\"IT Teamwork\",\"address_type\":\"work\"}', '{\"full_name\":\"User\",\"phone\":\"9087876765\",\"email\":\"user@gmail.com\",\"address_line1\":\"mumbai\",\"address_line2\":\"mumbai\",\"city\":\"mumbai\",\"state\":\"maharashtra\",\"pincode\":\"416602\",\"landmark\":\"IT Teamwork\",\"address_type\":\"work\"}', 25998.99, 0.00, 25998.99, 'cod', 'delivered', NULL, '2026-02-26 04:38:36', '2026-02-26 04:38:54'),
(8, 1, '{\"full_name\":\"Rohit Sharma\",\"phone\":\"9087876765\",\"email\":\"Rohit45@gmail.com\",\"address_line1\":\"mumbai\",\"address_line2\":\"mumbai\",\"city\":\"mumbai\",\"state\":\"maharashtra\",\"pincode\":\"416602\",\"landmark\":\"mumbai\",\"address_type\":\"home\"}', '{\"full_name\":\"Rohit Sharma\",\"phone\":\"9087876765\",\"email\":\"Rohit45@gmail.com\",\"address_line1\":\"mumbai\",\"address_line2\":\"mumbai\",\"city\":\"mumbai\",\"state\":\"maharashtra\",\"pincode\":\"416602\",\"landmark\":\"mumbai\",\"address_type\":\"home\"}', 25998.99, 0.00, 25998.99, 'cod', 'delivered', NULL, '2026-02-26 05:06:05', '2026-02-26 05:06:27'),
(9, 2, '{\"full_name\":\"User\",\"phone\":\"9087876765\",\"email\":\"user@gmail.com\",\"address_line1\":\"mumbai\",\"address_line2\":\"mumbai\",\"city\":\"mumbai\",\"state\":\"maharashtra\",\"pincode\":\"416602\",\"landmark\":\"IT Teamwork\",\"address_type\":\"work\"}', '{\"full_name\":\"User\",\"phone\":\"9087876765\",\"email\":\"user@gmail.com\",\"address_line1\":\"mumbai\",\"address_line2\":\"mumbai\",\"city\":\"mumbai\",\"state\":\"maharashtra\",\"pincode\":\"416602\",\"landmark\":\"IT Teamwork\",\"address_type\":\"work\"}', 449.00, 40.00, 489.00, 'cod', 'delivered', NULL, '2026-02-26 05:08:25', '2026-02-26 05:08:36'),
(10, 1, '{\"full_name\":\"Rohit Sharma\",\"phone\":\"9087876765\",\"email\":\"Rohit45@gmail.com\",\"address_line1\":\"mumbai\",\"address_line2\":\"mumbai\",\"city\":\"mumbai\",\"state\":\"maharashtra\",\"pincode\":\"416602\",\"landmark\":\"mumbai\",\"address_type\":\"home\"}', '{\"full_name\":\"Rohit Sharma\",\"phone\":\"9087876765\",\"email\":\"Rohit45@gmail.com\",\"address_line1\":\"mumbai\",\"address_line2\":\"mumbai\",\"city\":\"mumbai\",\"state\":\"maharashtra\",\"pincode\":\"416602\",\"landmark\":\"mumbai\",\"address_type\":\"home\"}', 449.00, 40.00, 489.00, 'cod', 'delivered', NULL, '2026-02-26 07:55:52', '2026-02-26 07:56:12'),
(11, 2, '{\"full_name\":\"User\",\"phone\":\"9087876765\",\"email\":\"user@gmail.com\",\"address_line1\":\"mumbai\",\"address_line2\":\"mumbai\",\"city\":\"mumbai\",\"state\":\"maharashtra\",\"pincode\":\"416602\",\"landmark\":\"IT Teamwork\",\"address_type\":\"work\"}', '{\"full_name\":\"User\",\"phone\":\"9087876765\",\"email\":\"user@gmail.com\",\"address_line1\":\"mumbai\",\"address_line2\":\"mumbai\",\"city\":\"mumbai\",\"state\":\"maharashtra\",\"pincode\":\"416602\",\"landmark\":\"IT Teamwork\",\"address_type\":\"work\"}', 598.00, 0.00, 598.00, 'cod', 'delivered', NULL, '2026-02-27 01:22:02', '2026-02-27 01:25:04'),
(12, 2, '{\"full_name\":\"User\",\"phone\":\"9087876765\",\"email\":\"user@gmail.com\",\"address_line1\":\"mumbai\",\"address_line2\":\"mumbai\",\"city\":\"mumbai\",\"state\":\"maharashtra\",\"pincode\":\"416602\",\"landmark\":\"IT Teamwork\",\"address_type\":\"work\"}', '{\"full_name\":\"User\",\"phone\":\"9087876765\",\"email\":\"user@gmail.com\",\"address_line1\":\"mumbai\",\"address_line2\":\"mumbai\",\"city\":\"mumbai\",\"state\":\"maharashtra\",\"pincode\":\"416602\",\"landmark\":\"IT Teamwork\",\"address_type\":\"work\"}', 299.00, 40.00, 339.00, 'cod', 'delivered', NULL, '2026-02-27 02:57:41', '2026-02-27 02:57:56'),
(13, 3, '{\"full_name\":\"Gauresh Vardekar\",\"phone\":\"9970056668\",\"email\":\"gaureshvardekar@gmail.com\",\"address_line1\":\"mumbai\",\"address_line2\":\"mumbai\",\"city\":\"mumbai\",\"state\":\"maharashtra\",\"pincode\":\"416602\",\"landmark\":\"mumbai\",\"address_type\":\"work\"}', '{\"full_name\":\"Gauresh Vardekar\",\"phone\":\"9970056668\",\"email\":\"gaureshvardekar@gmail.com\",\"address_line1\":\"mumbai\",\"address_line2\":\"mumbai\",\"city\":\"mumbai\",\"state\":\"maharashtra\",\"pincode\":\"416602\",\"landmark\":\"mumbai\",\"address_type\":\"work\"}', 1199.00, 0.00, 1199.00, 'cod', 'delivered', NULL, '2026-02-27 03:32:21', '2026-02-27 03:32:48'),
(14, 2, '{\"full_name\":\"User\",\"phone\":\"9087876765\",\"email\":\"user@gmail.com\",\"address_line1\":\"mumbai\",\"address_line2\":\"mumbai\",\"city\":\"mumbai\",\"state\":\"maharashtra\",\"pincode\":\"416602\",\"landmark\":\"IT Teamwork\",\"address_type\":\"work\"}', '{\"full_name\":\"User\",\"phone\":\"9087876765\",\"email\":\"user@gmail.com\",\"address_line1\":\"mumbai\",\"address_line2\":\"mumbai\",\"city\":\"mumbai\",\"state\":\"maharashtra\",\"pincode\":\"416602\",\"landmark\":\"IT Teamwork\",\"address_type\":\"work\"}', 1199.00, 0.00, 1199.00, 'cod', 'delivered', NULL, '2026-02-27 03:40:17', '2026-02-27 03:40:36'),
(15, 2, '{\"full_name\":\"User\",\"phone\":\"9087876765\",\"email\":\"user@gmail.com\",\"address_line1\":\"mumbai\",\"address_line2\":\"mumbai\",\"city\":\"mumbai\",\"state\":\"maharashtra\",\"pincode\":\"416602\",\"landmark\":\"IT Teamwork\",\"address_type\":\"work\"}', '{\"full_name\":\"User\",\"phone\":\"9087876765\",\"email\":\"user@gmail.com\",\"address_line1\":\"mumbai\",\"address_line2\":\"mumbai\",\"city\":\"mumbai\",\"state\":\"maharashtra\",\"pincode\":\"416602\",\"landmark\":\"IT Teamwork\",\"address_type\":\"work\"}', 999.00, 0.00, 999.00, 'cod', 'delivered', NULL, '2026-02-28 04:51:10', '2026-02-28 04:51:10'),
(16, 2, '{\"full_name\":\"User\",\"phone\":\"9087876765\",\"email\":\"user@gmail.com\",\"address_line1\":\"mumbai\",\"address_line2\":\"mumbai\",\"city\":\"mumbai\",\"state\":\"maharashtra\",\"pincode\":\"416602\",\"landmark\":\"IT Teamwork\",\"address_type\":\"work\"}', '{\"full_name\":\"User\",\"phone\":\"9087876765\",\"email\":\"user@gmail.com\",\"address_line1\":\"mumbai\",\"address_line2\":\"mumbai\",\"city\":\"mumbai\",\"state\":\"maharashtra\",\"pincode\":\"416602\",\"landmark\":\"IT Teamwork\",\"address_type\":\"work\"}', 2398.00, 0.00, 2398.00, 'cod', 'delivered', NULL, '2026-03-01 23:58:30', '2026-03-02 00:44:52'),
(17, 2, '{\"full_name\":\"User\",\"phone\":\"9087876765\",\"email\":\"user@gmail.com\",\"address_line1\":\"mumbai\",\"address_line2\":\"mumbai\",\"city\":\"mumbai\",\"state\":\"maharashtra\",\"pincode\":\"416602\",\"landmark\":\"IT Teamwork\",\"address_type\":\"work\"}', '{\"full_name\":\"User\",\"phone\":\"9087876765\",\"email\":\"user@gmail.com\",\"address_line1\":\"mumbai\",\"address_line2\":\"mumbai\",\"city\":\"mumbai\",\"state\":\"maharashtra\",\"pincode\":\"416602\",\"landmark\":\"IT Teamwork\",\"address_type\":\"work\"}', 54998.99, 0.00, 54998.99, 'cod', 'cancelled', NULL, '2026-03-02 00:45:24', '2026-03-11 01:18:19'),
(18, 2, '{\"full_name\":\"User\",\"phone\":\"9087876765\",\"email\":\"user@gmail.com\",\"address_line1\":\"mumbai\",\"address_line2\":\"mumbai\",\"city\":\"mumbai\",\"state\":\"maharashtra\",\"pincode\":\"416602\",\"landmark\":\"IT Teamwork\",\"address_type\":\"work\"}', '{\"full_name\":\"User\",\"phone\":\"9087876765\",\"email\":\"user@gmail.com\",\"address_line1\":\"mumbai\",\"address_line2\":\"mumbai\",\"city\":\"mumbai\",\"state\":\"maharashtra\",\"pincode\":\"416602\",\"landmark\":\"IT Teamwork\",\"address_type\":\"work\"}', 498.99, 40.00, 538.99, 'cod', 'cancelled', NULL, '2026-03-02 00:47:19', '2026-03-11 01:37:36'),
(19, 3, '{\"full_name\":\"Gauresh Vardekar\",\"phone\":\"9970056668\",\"email\":\"gaureshvardekar@gmail.com\",\"address_line1\":\"mumbai\",\"address_line2\":\"mumbai\",\"city\":\"mumbai\",\"state\":\"maharashtra\",\"pincode\":\"416602\",\"landmark\":\"mumbai\",\"address_type\":\"work\"}', '{\"full_name\":\"Gauresh Vardekar\",\"phone\":\"9970056668\",\"email\":\"gaureshvardekar@gmail.com\",\"address_line1\":\"mumbai\",\"address_line2\":\"mumbai\",\"city\":\"mumbai\",\"state\":\"maharashtra\",\"pincode\":\"416602\",\"landmark\":\"mumbai\",\"address_type\":\"work\"}', 1598.00, 0.00, 1598.00, 'cod', 'delivered', NULL, '2026-03-02 00:58:07', '2026-03-02 00:58:23'),
(20, 3, '{\"full_name\":\"Gauresh Vardekar\",\"phone\":\"9970056668\",\"email\":\"gaureshvardekar@gmail.com\",\"address_line1\":\"mumbai\",\"address_line2\":\"mumbai\",\"city\":\"mumbai\",\"state\":\"maharashtra\",\"pincode\":\"416602\",\"landmark\":\"mumbai\",\"address_type\":\"work\"}', '{\"full_name\":\"Gauresh Vardekar\",\"phone\":\"9970056668\",\"email\":\"gaureshvardekar@gmail.com\",\"address_line1\":\"mumbai\",\"address_line2\":\"mumbai\",\"city\":\"mumbai\",\"state\":\"maharashtra\",\"pincode\":\"416602\",\"landmark\":\"mumbai\",\"address_type\":\"work\"}', 799.00, 0.00, 799.00, 'cod', 'delivered', NULL, '2026-03-02 01:17:36', '2026-03-02 01:17:51'),
(21, 3, '{\"full_name\":\"Gauresh Vardekar\",\"phone\":\"9970056668\",\"email\":\"gaureshvardekar@gmail.com\",\"address_line1\":\"mumbai\",\"address_line2\":\"mumbai\",\"city\":\"mumbai\",\"state\":\"maharashtra\",\"pincode\":\"416602\",\"landmark\":\"mumbai\",\"address_type\":\"work\"}', '{\"full_name\":\"Gauresh Vardekar\",\"phone\":\"9970056668\",\"email\":\"gaureshvardekar@gmail.com\",\"address_line1\":\"mumbai\",\"address_line2\":\"mumbai\",\"city\":\"mumbai\",\"state\":\"maharashtra\",\"pincode\":\"416602\",\"landmark\":\"mumbai\",\"address_type\":\"work\"}', 299.00, 40.00, 339.00, 'cod', 'delivered', NULL, '2026-03-02 01:19:19', '2026-03-02 01:19:33'),
(22, 2, '{\"full_name\":\"Sumit\",\"phone\":\"8876545678\",\"email\":\"user@gmail.com\",\"address_line1\":\"mumbai\",\"address_line2\":\"mumbai\",\"city\":\"mumbai\",\"state\":\"maharashtra\",\"pincode\":\"416602\",\"landmark\":\"IT Teamwork\",\"address_type\":\"home\"}', '{\"full_name\":\"Sumit\",\"phone\":\"8876545678\",\"email\":\"user@gmail.com\",\"address_line1\":\"mumbai\",\"address_line2\":\"mumbai\",\"city\":\"mumbai\",\"state\":\"maharashtra\",\"pincode\":\"416602\",\"landmark\":\"IT Teamwork\",\"address_type\":\"home\"}', 1599.00, 0.00, 1599.00, 'cod', 'delivered', NULL, '2026-03-12 01:45:48', '2026-03-12 03:06:13'),
(23, 2, '{\"full_name\":\"Sumit\",\"phone\":\"8876545678\",\"email\":\"user@gmail.com\",\"address_line1\":\"mumbai\",\"address_line2\":\"mumbai\",\"city\":\"mumbai\",\"state\":\"maharashtra\",\"pincode\":\"416602\",\"landmark\":\"IT Teamwork\",\"address_type\":\"home\"}', '{\"full_name\":\"Sumit\",\"phone\":\"8876545678\",\"email\":\"user@gmail.com\",\"address_line1\":\"mumbai\",\"address_line2\":\"mumbai\",\"city\":\"mumbai\",\"state\":\"maharashtra\",\"pincode\":\"416602\",\"landmark\":\"IT Teamwork\",\"address_type\":\"home\"}', 25998.99, 0.00, 25998.99, 'cod', 'pending', NULL, '2026-03-18 05:50:07', '2026-03-18 05:50:07');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `name`, `quantity`, `price`, `total`, `image`, `created_at`, `updated_at`) VALUES
(1, 1, 11, 'Fast Charging Adapter', 1, 799.00, 799.00, '1771490375_main_ExF83DNTCY.jpeg', '2026-02-23 03:02:47', '2026-02-23 03:02:47'),
(2, 2, 11, 'Fast Charging Adapter', 4, 799.00, 3196.00, '1771490375_main_ExF83DNTCY.jpeg', '2026-02-24 04:48:34', '2026-02-24 04:48:34'),
(3, 3, 8, 'Yonex Badminton Racket', 2, 999.00, 1998.00, '1771489965_main_h7ydoo3A7G.png', '2026-02-25 03:29:34', '2026-02-25 03:29:34'),
(4, 4, 9, 'Remote Control Car', 2, 1199.00, 2398.00, '1771490096_main_FzKVg8NPWM.jpg', '2026-02-26 03:45:58', '2026-02-26 03:45:58'),
(5, 5, 9, 'Remote Control Car', 1, 1199.00, 1199.00, '1771490096_main_FzKVg8NPWM.jpg', '2026-02-26 04:19:42', '2026-02-26 04:19:42'),
(6, 6, 5, 'LG 260L Double Door Refrigerator', 1, 25998.99, 25998.99, '1771489597_main_ICEsBGck6p.png', '2026-02-26 04:34:11', '2026-02-26 04:34:11'),
(7, 7, 5, 'LG 260L Double Door Refrigerator', 1, 25998.99, 25998.99, '1771489597_main_ICEsBGck6p.png', '2026-02-26 04:38:36', '2026-02-26 04:38:36'),
(8, 8, 5, 'LG 260L Double Door Refrigerator', 1, 25998.99, 25998.99, '1771489597_main_ICEsBGck6p.png', '2026-02-26 05:06:05', '2026-02-26 05:06:05'),
(9, 9, 7, 'Lakme 9 to 5 Foundation', 1, 449.00, 449.00, '1771489860_main_uUA40RZtOs.jpg', '2026-02-26 05:08:25', '2026-02-26 05:08:25'),
(10, 10, 7, 'Lakme 9 to 5 Foundation', 1, 449.00, 449.00, '1771489860_main_uUA40RZtOs.jpg', '2026-02-26 07:55:53', '2026-02-26 07:55:53'),
(11, 11, 6, 'The Psychology of Money', 2, 299.00, 598.00, '1771489696_main_jymWvyny4r.jpg', '2026-02-27 01:22:02', '2026-02-27 01:22:02'),
(12, 12, 6, 'The Psychology of Money', 1, 299.00, 299.00, '1771489696_main_jymWvyny4r.jpg', '2026-02-27 02:57:42', '2026-02-27 02:57:42'),
(13, 13, 9, 'Remote Control Car', 1, 1199.00, 1199.00, '1771490096_main_FzKVg8NPWM.jpg', '2026-02-27 03:32:21', '2026-02-27 03:32:21'),
(14, 14, 9, 'Remote Control Car', 1, 1199.00, 1199.00, '1771490096_main_FzKVg8NPWM.jpg', '2026-02-27 03:40:17', '2026-02-27 03:40:17'),
(15, 15, 10, 'Barbie Doll Set', 1, 999.00, 999.00, '1771490239_main_XnHvrFd4oE.jpg', '2026-02-28 04:51:10', '2026-02-28 04:51:10'),
(16, 16, 9, 'Remote Control Car', 2, 1199.00, 2398.00, '1771490096_main_FzKVg8NPWM.jpg', '2026-03-01 23:58:30', '2026-03-01 23:58:30'),
(17, 17, 2, 'Samsung 55\" 4K Smart TV', 1, 54998.99, 54998.99, '1771486320_main_4mk5YeynCW.jpg', '2026-03-02 00:45:24', '2026-03-02 00:45:24'),
(18, 18, 3, 'Men\'s Cotton T-Shirt', 1, 498.99, 498.99, '1771486440_main_CKMwfjxPkk.png', '2026-03-02 00:47:19', '2026-03-02 00:47:19'),
(19, 19, 11, 'Fast Charging Adapter', 2, 799.00, 1598.00, '1771490375_main_ExF83DNTCY.jpeg', '2026-03-02 00:58:07', '2026-03-02 00:58:07'),
(20, 20, 11, 'Fast Charging Adapter', 1, 799.00, 799.00, '1771490375_main_ExF83DNTCY.jpeg', '2026-03-02 01:17:36', '2026-03-02 01:17:36'),
(21, 21, 6, 'The Psychology of Money', 1, 299.00, 299.00, '1771489696_main_jymWvyny4r.jpg', '2026-03-02 01:19:19', '2026-03-02 01:19:19'),
(22, 22, 16, 'computer', 1, 1599.00, 1599.00, '1772693503_main_SaFthLMWkp.png', '2026-03-12 01:45:48', '2026-03-12 01:45:48'),
(23, 23, 5, 'LG 260L Double Door Refrigerator', 1, 25998.99, 25998.99, '1771489597_main_ICEsBGck6p.png', '2026-03-18 05:50:07', '2026-03-18 05:50:07');

-- --------------------------------------------------------

--
-- Table structure for table `password_resets`
--

CREATE TABLE `password_resets` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `email` varchar(255) NOT NULL,
  `otp` varchar(6) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `password_resets`
--

INSERT INTO `password_resets` (`id`, `email`, `otp`, `expires_at`, `created_at`, `updated_at`) VALUES
(26, 'gaureshvardekar197@gmail.com', '341020', '2026-02-28 00:49:05', '2026-02-28 00:28:07', '2026-02-28 00:39:05');

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(2, 'App\\Models\\User', 2, 'auth_token', '43250b448075ae1e32598abf9cd1184854f4a0406671a2f678a80c58eefb6852', '[\"*\"]', NULL, NULL, '2026-02-19 01:09:49', '2026-02-19 01:09:49'),
(6, 'App\\Models\\User', 1, 'auth_token', '8c4a2e1d6409ce1bda99e1519bfd4fa90558b5cd97a1ff8cd4f8960190455f27', '[\"*\"]', '2026-02-21 07:54:07', NULL, '2026-02-21 03:13:25', '2026-02-21 07:54:07'),
(7, 'App\\Models\\User', 2, 'auth_token', '95d8f8f8b5d183066362ff15af0abe19600d081f146e59eac3820f59932cd0b3', '[\"*\"]', '2026-02-21 07:18:51', NULL, '2026-02-21 03:35:37', '2026-02-21 07:18:51'),
(8, 'App\\Models\\User', 1, 'auth_token', '9a98aa7b1a5f3644cc4b9ccad2d98932f3380d740325bcbef8c6c0296e98de72', '[\"*\"]', '2026-02-23 08:00:26', NULL, '2026-02-22 23:27:44', '2026-02-23 08:00:26'),
(9, 'App\\Models\\User', 1, 'auth_token', '85b29c59524c37c6c200f60a496f5788bd2128c0d0c6926587d5f6cbd627578f', '[\"*\"]', '2026-02-24 00:23:54', NULL, '2026-02-23 23:39:25', '2026-02-24 00:23:54'),
(10, 'App\\Models\\User', 1, 'auth_token', '98f75a60f41cf72ba1fdb60a7d2d84193219ef9938dc38b299ffd2f687edea5d', '[\"*\"]', '2026-02-25 07:23:12', NULL, '2026-02-24 00:26:07', '2026-02-25 07:23:12'),
(11, 'App\\Models\\User', 1, 'auth_token', '9f6ff77de3a06410c09104c59a36b9f2872b5f2a24d295ca3e9f393572ef81ff', '[\"*\"]', '2026-02-25 00:45:43', NULL, '2026-02-25 00:45:33', '2026-02-25 00:45:43'),
(12, 'App\\Models\\User', 1, 'auth_token', '624fab69565edc60b91a6f42a9fe6743d263917d3a3093fa1dbe043f3d3c9d09', '[\"*\"]', '2026-02-25 03:56:59', NULL, '2026-02-25 00:45:51', '2026-02-25 03:56:59'),
(13, 'App\\Models\\User', 2, 'auth_token', 'bb3b33bfb716a9eee4b7f39769e2c5a2587533193b8bdb5834a46bb256d7fe1a', '[\"*\"]', '2026-02-25 04:56:14', NULL, '2026-02-25 03:27:21', '2026-02-25 04:56:14'),
(14, 'App\\Models\\User', 3, 'auth_token', '0f03790674e5c3073de1763f992d1fd14bf0a37a832329d7c50e387e14e2113d', '[\"*\"]', '2026-02-25 07:18:30', NULL, '2026-02-25 04:58:01', '2026-02-25 07:18:30'),
(15, 'App\\Models\\User', 1, 'auth_token', '785d996bda738d0ce3837da4a96335f030d8726829bd17a6b3c33938a48b90af', '[\"*\"]', '2026-02-26 07:56:54', NULL, '2026-02-26 01:41:30', '2026-02-26 07:56:54'),
(16, 'App\\Models\\User', 2, 'auth_token', 'b7926b7b1d8b9a1b0914a644652af6345ed8e3e53ade9808a960852ebe741d9b', '[\"*\"]', '2026-02-26 05:46:51', NULL, '2026-02-26 03:45:28', '2026-02-26 05:46:51'),
(17, 'App\\Models\\User', 1, 'auth_token', 'a02d496c085a06033834be7fe0fba38a6e717f49fdd911cd2f45a97e311c74d1', '[\"*\"]', '2026-02-27 07:03:47', NULL, '2026-02-26 23:27:27', '2026-02-27 07:03:47'),
(18, 'App\\Models\\User', 2, 'auth_token', '83c72a60ec1e36438cf7fb139b34ce25366a17ae1d03fb129e66d70d0640b708', '[\"*\"]', '2026-02-27 03:18:02', NULL, '2026-02-26 23:55:09', '2026-02-27 03:18:02'),
(19, 'App\\Models\\User', 1, 'auth_token', '9c84d580338cb6b82abbd9e6aca1d4d1e5319a7c2a9bfb9ac105f445c0129f8b', '[\"*\"]', '2026-02-27 02:06:32', NULL, '2026-02-27 02:03:07', '2026-02-27 02:06:32'),
(20, 'App\\Models\\User', 3, 'auth_token', 'f82a6eef716de73cbfcc27572556543ccdd7dcb2931fad813a9a5e1762cd6119', '[\"*\"]', '2026-02-27 03:33:14', NULL, '2026-02-27 03:31:22', '2026-02-27 03:33:14'),
(21, 'App\\Models\\User', 2, 'auth_token', '05c32e6b841cdfebc8d3ed1e0a2e2b4338854dfb280a56d1038c7cb011287b10', '[\"*\"]', '2026-02-27 04:45:53', NULL, '2026-02-27 03:39:53', '2026-02-27 04:45:53'),
(22, 'App\\Models\\User', 2, 'auth_token', '623fa83e9fa95d4cf24cd638e8e45f8397f6d103dc6e20fa7643f70988054784', '[\"*\"]', NULL, NULL, '2026-02-27 05:58:45', '2026-02-27 05:58:45'),
(23, 'App\\Models\\User', 4, 'auth_token', '14536e5ffc7042a6c9eae0fb062442927fa8facef78863447a41e9953a70f8b6', '[\"*\"]', NULL, NULL, '2026-02-27 07:26:28', '2026-02-27 07:26:28'),
(24, 'App\\Models\\User', 4, 'auth_token', '6a97f2dbfd143d616960e9678f4b755f88123a97052c0dadca857931f7ec58a9', '[\"*\"]', NULL, NULL, '2026-02-27 08:16:40', '2026-02-27 08:16:40'),
(25, 'App\\Models\\User', 4, 'auth_token', 'c27d1364cd5fbc9eb747b3aecc7c5b3ddd0b5e447fe29f00f70317f8ac95c0fe', '[\"*\"]', NULL, NULL, '2026-02-27 23:41:38', '2026-02-27 23:41:38'),
(26, 'App\\Models\\User', 5, 'auth_token', '6cca57db86fa19ff4212ecb51375ef562695a80b29f90496372f52e92c7552f9', '[\"*\"]', NULL, NULL, '2026-02-28 00:58:48', '2026-02-28 00:58:48'),
(27, 'App\\Models\\User', 7, 'auth_token', 'c77bc48b3aad09e4d2e965ca9250b6d53e063d387c0710f2f18888bde82220f5', '[\"*\"]', '2026-02-28 04:40:10', NULL, '2026-02-28 01:15:10', '2026-02-28 04:40:10'),
(28, 'App\\Models\\User', 1, 'auth_token', '502465c6c743d840279204c8e99390d3af387282bff86d0081043fada14fd72b', '[\"*\"]', '2026-02-28 04:47:29', NULL, '2026-02-28 04:43:03', '2026-02-28 04:47:29'),
(29, 'App\\Models\\User', 2, 'auth_token', '0b33a4f349e29776acc7233f3a6a41722c7db6970e10273c0215e2d8432022db', '[\"*\"]', '2026-02-28 04:54:24', NULL, '2026-02-28 04:48:14', '2026-02-28 04:54:24'),
(30, 'App\\Models\\User', 1, 'auth_token', 'fa15c52c41da49c3e0e79e9ea43d18407b97afe21400c45b8cc16ad5c370ce35', '[\"*\"]', '2026-03-04 06:52:53', NULL, '2026-03-01 23:55:48', '2026-03-04 06:52:53'),
(31, 'App\\Models\\User', 2, 'auth_token', '3d6255870590935d5750674323472482a4ab27070d7922f25470720cc3e4a747', '[\"*\"]', '2026-03-02 00:53:30', NULL, '2026-03-01 23:57:01', '2026-03-02 00:53:30'),
(32, 'App\\Models\\User', 3, 'auth_token', 'fb63483c0fcd78fc154a948b6d333508f48ed621a3853d4742163b96776c764c', '[\"*\"]', '2026-03-02 03:53:50', NULL, '2026-03-02 00:57:03', '2026-03-02 03:53:50'),
(33, 'App\\Models\\User', 1, 'auth_token', 'f68261e80ace56de35827923ef7d0191987c8235a977e3f96f715456d9768d96', '[\"*\"]', '2026-03-05 04:02:29', NULL, '2026-03-04 23:30:55', '2026-03-05 04:02:29'),
(34, 'App\\Models\\User', 2, 'auth_token', '554cbb35c218fe29b5ec5dd223360d8c7657e2f09a5b04022655818fa2768036', '[\"*\"]', '2026-03-05 04:02:28', NULL, '2026-03-05 03:39:43', '2026-03-05 04:02:28'),
(35, 'App\\Models\\User', 2, 'auth_token', '4608a7461f85071796150aa1275cddd64b6aff64dc42f1ec07273cdd2b07d527', '[\"*\"]', '2026-03-06 04:05:48', NULL, '2026-03-05 05:06:42', '2026-03-06 04:05:48'),
(36, 'App\\Models\\User', 1, 'auth_token', '2e7c67f67e6a549ace44b50eb88f779e781e1b2937b42c22975761131f736b10', '[\"*\"]', '2026-03-06 00:21:19', NULL, '2026-03-06 00:21:03', '2026-03-06 00:21:19'),
(37, 'App\\Models\\User', 2, 'auth_token', 'a07a4079c65be2c4ed03c41f9aea621a1400eeab3d9f2cabc8cdba0b280a1aa0', '[\"*\"]', '2026-03-07 07:42:41', NULL, '2026-03-06 05:43:10', '2026-03-07 07:42:41'),
(38, 'App\\Models\\User', 2, 'auth_token', '78371de84db9233dc093838d1f5c25b4f84a6e5b3fe86e810354889b14df51c9', '[\"*\"]', '2026-03-09 07:58:20', NULL, '2026-03-08 23:30:25', '2026-03-09 07:58:20'),
(39, 'App\\Models\\User', 2, 'auth_token', 'b780e2ce02eb3d4597e9fc76509b97ebdfae4f90160e2b43a6a2eac3d092fffb', '[\"*\"]', '2026-03-10 08:00:05', NULL, '2026-03-09 23:28:27', '2026-03-10 08:00:05'),
(40, 'App\\Models\\User', 1, 'auth_token', 'f82e37bcf56c5cedd5573fcc1272aec210878e2b404609fb1cb9e8cba0575001', '[\"*\"]', '2026-03-10 07:43:40', NULL, '2026-03-10 07:20:30', '2026-03-10 07:43:40'),
(41, 'App\\Models\\User', 1, 'auth_token', 'e479838815ff99d40f0283d6900519904c6e139cf85b57c4221dc187aa07d568', '[\"*\"]', '2026-03-11 07:13:19', NULL, '2026-03-10 23:21:07', '2026-03-11 07:13:19'),
(42, 'App\\Models\\User', 2, 'auth_token', '459b85bbb1c74f3879b5a817971a4e119eb99132eb7f6df48df42160dd6d9eb8', '[\"*\"]', '2026-03-11 06:43:54', NULL, '2026-03-11 00:05:13', '2026-03-11 06:43:54'),
(43, 'App\\Models\\User', 2, 'auth_token', 'aeb24df73cd11feb419c46d310a46079897dea547c0f22b1e49f0a65bd69dcef', '[\"*\"]', '2026-03-12 07:24:17', NULL, '2026-03-11 23:23:16', '2026-03-12 07:24:17'),
(44, 'App\\Models\\User', 1, 'auth_token', '19288da9aeb179f365a5a680c9a8e853bc70b0ffc2c4c813b03fa9a7cb75b992', '[\"*\"]', '2026-03-12 06:52:08', NULL, '2026-03-11 23:29:52', '2026-03-12 06:52:08'),
(45, 'App\\Models\\User', 1, 'auth_token', 'e5d58ad5e133a3543d72c03ae7d846ecb4f67282c80f2d727f9f0e66f4be6053', '[\"*\"]', '2026-03-13 06:06:12', NULL, '2026-03-12 23:32:24', '2026-03-13 06:06:12'),
(46, 'App\\Models\\User', 2, 'auth_token', 'c8ee0d88fb9d7052c9b5491cddd39b647e0a9db3839bc9aa2f1eba8794ef712e', '[\"*\"]', '2026-03-13 07:42:54', NULL, '2026-03-13 00:41:52', '2026-03-13 07:42:54'),
(47, 'App\\Models\\User', 1, 'auth_token', '2a69d2edb02f89054f37684cfc7c8e45d2e1116a7d7127f6822939562f4b47b5', '[\"*\"]', '2026-03-18 06:10:10', NULL, '2026-03-18 00:00:56', '2026-03-18 06:10:10'),
(48, 'App\\Models\\User', 2, 'auth_token', 'ae9acddc12fa23d2155d28ac9b928310daed2cb2b6f2a47c0e414ef1d812bdf1', '[\"*\"]', '2026-03-18 05:57:26', NULL, '2026-03-18 00:03:54', '2026-03-18 05:57:26'),
(49, 'App\\Models\\User', 1, 'auth_token', '063fa6baff2daaa3b6bc2ad43ec15d7623572b5554d0e1249ff3aa68db802efa', '[\"*\"]', '2026-03-19 05:16:28', NULL, '2026-03-19 01:50:10', '2026-03-19 05:16:28');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `cate_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `original_price` decimal(10,2) NOT NULL,
  `selling_price` decimal(10,2) NOT NULL,
  `qty` int(11) NOT NULL,
  `tax` decimal(5,2) DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `trending` tinyint(1) NOT NULL DEFAULT 0,
  `small_description` text DEFAULT NULL,
  `description` text NOT NULL,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_keywords` text DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `product_images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`product_images`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `cate_id`, `name`, `slug`, `original_price`, `selling_price`, `qty`, `tax`, `status`, `trending`, `small_description`, `description`, `meta_title`, `meta_keywords`, `meta_description`, `image`, `product_images`, `created_at`, `updated_at`) VALUES
(1, 1, 'iPhone 14 Pro', 'iphone-14-pro', 129999.00, 119998.99, 25, 18.00, 1, 1, 'Apple flagship smartphone with advanced camera.', 'iPhone 14 Pro comes with A16 Bionic chip, 48MP camera system, Dynamic Island, and a Super Retina XDR display with ProMotion technology.', 'Buy iPhone 14 Pro Online', 'iphone, apple, smartphone, iphone14pro', 'Get the latest iPhone 14 Pro at best price with fast delivery.', '1771484146_main_9ohv1CNgtx.png', '[\"1771484147_1_tsMQJP0b0r.png\",\"1771484147_2_FfGTU0cS82.png\",\"1771484147_3_eQ4sXAhWlx.png\",\"1771484147_4_4GJLs7f7uJ.png\"]', '2026-02-19 01:25:47', '2026-02-19 01:25:47'),
(2, 1, 'Samsung 55\" 4K Smart TV', 'samsung-55-4k-smart-tv', 59999.00, 54998.99, 15, 17.99, 1, 0, 'Ultra HD smart television with HDR.', 'Samsung 55-inch Smart TV delivers stunning 4K resolution, HDR support, built-in streaming apps, and voice control features.', 'Samsung 55 Inch Smart TV', 'samsung tv, smart tv, 4k tv', 'Experience cinematic visuals with Samsung 55-inch 4K Smart TV.', '1771486320_main_4mk5YeynCW.jpg', '[\"1771486321_1_0aLFEQF6iF.png\",\"1771486321_2_eADTLS0Yug.png\",\"1771486321_3_CY0I0C7LEJ.png\"]', '2026-02-19 02:02:01', '2026-02-19 02:02:01'),
(3, 2, 'Men\'s Cotton T-Shirt', 'mens-cotton-tshirt', 699.00, 498.99, 100, 4.99, 1, 1, 'Soft and breathable cotton T-shirt.', 'Casual everyday T-shirt made from 100% cotton fabric for comfort and durability.', 'Men\'s Cotton T-Shirt', 'tshirt, mens wear, cotton tshirt', 'Buy comfortable men\'s cotton T-shirt at best price.', '1771486440_main_CKMwfjxPkk.png', '[\"1771486440_1_w0e4PEPedV.png\",\"1771486440_2_toDZSkiezL.png\",\"1771486440_3_yVi3Yri6uo.png\"]', '2026-02-19 02:04:00', '2026-02-19 02:04:00'),
(4, 2, 'Women\'s Summer Dress', 'womens-summer-dress', 1599.00, 1299.00, 60, 4.99, 1, 0, 'Lightweight floral summer dress.', 'Stylish and comfortable dress made from breathable fabric, perfect for casual outings.', 'Women\'s Summer Dress', 'dress, women clothing, summer dress', 'Trendy women\'s summer dress at best price.', '1771489441_main_4kxEmDlQUm.png', '[\"1771489441_1_cirS18xlbM.png\",\"1771489441_2_sjem2cPeUh.png\"]', '2026-02-19 02:54:01', '2026-02-19 02:54:01'),
(5, 3, 'LG 260L Double Door Refrigerator', 'lg-260l-double-door-refrigerator', 28999.00, 25998.99, 18, 17.99, 1, 1, 'Energy-efficient double door refrigerator.', 'LG 260L refrigerator with smart inverter compressor, fast cooling, and toughened glass shelves.', 'LG 260L Double Door Fridge', 'lg fridge, refrigerator, double door', 'Buy LG 260L double door refrigerator online at best price.', '1771489597_main_ICEsBGck6p.png', '[\"1771489597_1_6bLpC1XqP5.png\",\"1771489597_2_uXP4aWuqze.png\",\"1771489597_3_JrQ1xekwmH.png\"]', '2026-02-19 02:56:37', '2026-02-19 02:56:37'),
(6, 4, 'The Psychology of Money', 'the-psychology-of-money', 399.00, 299.00, 120, 4.98, 1, 1, 'Timeless lessons on wealth and happiness.', 'A bestselling book explaining how money works in human behavior and decision-making.', NULL, NULL, NULL, '1771489696_main_jymWvyny4r.jpg', NULL, '2026-02-19 02:58:16', '2026-02-19 02:58:16'),
(7, 5, 'Lakme 9 to 5 Foundation', 'lakme-9-to-5-foundation', 499.00, 449.00, 150, 12.00, 1, 1, 'Long-lasting liquid foundation.', 'Lakme 9 to 5 foundation provides smooth coverage and stays fresh for up to 12 hours.', NULL, NULL, NULL, '1771489860_main_uUA40RZtOs.jpg', '[\"1771489861_1_bl1RwwenJe.png\",\"1771489861_2_mD3mJvkFVU.jpg\",\"1771489861_3_LJPD2WNTx7.jpg\"]', '2026-02-19 03:01:01', '2026-02-19 03:01:01'),
(8, 6, 'Yonex Badminton Racket', 'yonex-badminton-racket', 1199.00, 999.00, 75, 11.99, 1, 1, 'Lightweight badminton racket for beginners.', 'Yonex GR 303 provides excellent control and durability for daily practice sessions.', NULL, NULL, NULL, '1771489965_main_h7ydoo3A7G.png', '[\"1771489965_1_bGYCHBHL4h.jpg\",\"1771489965_2_BuRsdPysaQ.jpg\"]', '2026-02-19 03:02:45', '2026-02-19 03:02:45'),
(9, 7, 'Remote Control Car', 'remote-control-car', 1499.00, 1199.00, 80, 11.99, 1, 1, 'Fast remote control racing car for kids.', 'High-speed remote control car with durable body, long battery life, and easy controls for children.', 'Remote Control Racing Car for Kids', 'rc car, kids toy, racing car', 'Buy remote control racing car for kids at best price.', '1771490096_main_FzKVg8NPWM.jpg', '[\"1771490096_1_4JdAsxGi0q.jpg\",\"1771490096_2_i5pTvSobt2.jpg\",\"1771490096_3_7JPYlOhSz7.jpg\"]', '2026-02-19 03:04:56', '2026-02-19 03:04:56'),
(10, 7, 'Barbie Doll Set', 'barbie-doll-set', 1299.00, 999.00, 80, 12.00, 1, 1, 'Fashion doll with accessories.', 'Stylish Barbie doll with dresses, shoes, and accessories for imaginative play.', 'Barbie Doll Set', 'barbie, doll set, girls toy', NULL, '1771490239_main_XnHvrFd4oE.jpg', '[\"1771490239_1_hxLSC5j9Zk.jpg\",\"1771490239_2_905m6BCN7y.jpg\"]', '2026-02-19 03:07:19', '2026-02-19 03:07:19'),
(11, 8, 'Fast Charging Adapter', 'fast-charging-adapter', 999.00, 799.00, 150, 17.98, 1, 1, 'Fast charging adapter for smartphones.', '25W fast charger compatible with Android and iOS devices, providing quick and safe charging.', '25W Fast Charging Adapter', 'fast charger, mobile adapter, 25w charger', 'Buy 25W fast charging adapter online.', '1771490375_main_ExF83DNTCY.jpeg', '[\"1771490375_1_EfXbaR5cZX.jpeg\",\"1771490375_2_KXFoQha3dO.jpeg\"]', '2026-02-19 03:09:35', '2026-02-19 03:09:35'),
(14, 2, 'Shirts', 'shirts', 1500.00, 999.00, 80, 4.99, 1, 1, 'aasdfefertrioireoire', 'dfwdwdgowiwed', 'We’ve trained a model called ChatGPT which interacts in a conversational way.', 'gyit,io', 'ygiiggjfyuytftdtr', '1772691351_main_Q8Eb736Gd9.png', '[\"1772691351_1_KSJDHs9XFw.png\",\"1772691351_2_SmPEoHdP93.png\"]', '2026-03-05 00:45:51', '2026-03-12 06:01:53'),
(15, 2, 'pant', 'pant', 1000.00, 900.00, 10, 4.99, 1, 0, 'qwdwfwefwehfoweow', 'fwefwfwdhoweow', NULL, NULL, NULL, '1772691774_main_YoKEActeP2.jpg', '[\"1772691774_1_GnFlS5krZI.jpg\",\"1772691774_2_XhkzBuWE1v.jpg\"]', '2026-03-05 00:52:54', '2026-03-05 00:52:54'),
(16, 1, 'computer', 'computer', 20000.00, 15999.00, 45, 20.00, 1, 0, 'adefefereytrfd', 'dsferefw', 'defrewe', 'swefere', 'refrere', '1772693503_main_SaFthLMWkp.png', '[\"1772693503_1_P8qL1lCVez.jpg\"]', '2026-03-05 01:21:43', '2026-03-05 01:59:09');

-- --------------------------------------------------------

--
-- Table structure for table `product_reviews`
--

CREATE TABLE `product_reviews` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED DEFAULT NULL,
  `rating` int(11) NOT NULL COMMENT '1 to 5 stars',
  `comment` text DEFAULT NULL,
  `is_approved` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_reviews`
--

INSERT INTO `product_reviews` (`id`, `user_id`, `product_id`, `order_id`, `rating`, `comment`, `is_approved`, `created_at`, `updated_at`) VALUES
(2, 2, 6, 11, 4, 'A bestselling book explaining how money works in human behavior and decision-making.', 1, '2026-02-27 02:58:42', '2026-02-27 03:17:16'),
(3, 3, 9, 13, 5, 'High-speed remote control car', 1, '2026-02-27 03:33:13', '2026-02-27 03:41:30'),
(4, 2, 9, 4, 3, 'super fast car', 0, '2026-02-27 03:41:17', '2026-02-28 04:47:26'),
(5, 2, 10, 15, 4, 'good product', 1, '2026-02-28 04:53:41', '2026-02-28 04:53:41'),
(6, 2, 2, 17, 4, 'television1234', 0, '2026-03-02 00:46:30', '2026-03-02 00:46:30'),
(7, 2, 3, 18, 2, 'clothes are good', 1, '2026-03-02 00:48:55', '2026-03-02 00:48:55'),
(8, 2, 7, 9, 4, 'SDEFRETRRFTH', 1, '2026-03-02 00:53:28', '2026-03-02 00:53:28'),
(9, 3, 11, 19, 4, '25W fast charger compatible with Android and iOS devices, providing quick and safe charging.', 1, '2026-03-02 00:58:59', '2026-03-02 00:58:59'),
(10, 3, 6, 21, 3, 'Secure packaging', 0, '2026-03-02 01:20:27', '2026-03-02 03:53:36'),
(11, 2, 16, 22, 4, 'this product are good', 1, '2026-03-12 03:07:11', '2026-03-12 03:07:11');

-- --------------------------------------------------------

--
-- Table structure for table `product_sizes`
--

CREATE TABLE `product_sizes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `size_category` enum('clothing','shoes','kids','numeric') NOT NULL DEFAULT 'clothing',
  `size` varchar(50) NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `price` decimal(10,2) DEFAULT NULL,
  `original_price` decimal(10,2) DEFAULT NULL,
  `selling_price` decimal(10,2) DEFAULT NULL,
  `price_adjustment` decimal(10,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_sizes`
--

INSERT INTO `product_sizes` (`id`, `product_id`, `size_category`, `size`, `stock`, `price`, `original_price`, `selling_price`, `price_adjustment`, `created_at`, `updated_at`) VALUES
(3, 15, 'kids', '2T', 10, 600.00, 1000.00, 600.00, -300.00, '2026-03-05 00:52:54', '2026-03-05 00:52:54'),
(5, 16, 'clothing', 'M', 45, 1599.00, 20000.00, 1599.00, -14400.00, '2026-03-05 01:59:09', '2026-03-05 01:59:09'),
(8, 14, 'clothing', 'L', 50, 799.00, 1500.00, 799.00, -200.00, '2026-03-12 06:01:53', '2026-03-12 06:01:53'),
(9, 14, 'clothing', 'XL', 30, 849.00, 1500.00, 849.00, -150.00, '2026-03-12 06:01:53', '2026-03-12 06:01:53');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('gqiiHsSsbQhzzJpXd8UM2ezZYI3k2qUUQlVDEcGj', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiT2hmVUdSa3ZjbGJubGl5RWdzVlFuTlVSdVJzbW9EVFJidVg3R2N3TiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1771825015);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` tinyint(4) NOT NULL DEFAULT 0,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `phone`, `email_verified_at`, `password`, `role`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'Admin', 'admin@gmail.com', '8010809489', NULL, '$2y$12$EaryYC7b43wJk8QqJl7piu13KEj0t.CL7NSR6KJnB9n6xcqOEtyMu', 1, NULL, '2026-02-19 01:06:35', '2026-02-19 01:06:35'),
(2, 'User', 'user@gmail.com', '8010840157', NULL, '$2y$12$zw3rJw6rV5keKUr0yKjn/.EdphyazTX.izRdz7G8RQIxfQcf4TVCy', 0, NULL, '2026-02-19 01:09:48', '2026-03-12 02:56:42'),
(3, 'Gauresh Vardekar', 'gaureshvardekar@gmail.com', '9089767865', NULL, '$2y$10$6Vxf9NHI0eL6KLztyL0Rzeobzp89vWLJoOVum8zMqu9cMox4VV3ty', 0, NULL, '2026-02-25 04:58:01', '2026-02-25 04:58:01'),
(4, 'Gauresh Vardekar', 'gaureshvardekar197@gmail.com', '9387684784', NULL, '$2y$12$tpRivV4G6Pit7mcbX8mZB.qKf2xEHzcezpQV.U1zuIsug9lGJzAIm', 0, NULL, '2026-02-27 07:26:27', '2026-02-27 23:41:29'),
(6, 'Moiz Khan', 'khanmoiz0110@gmail.com', '9089096546', NULL, '$2y$12$rqd2gEkDvU3zUMjsNqUlJOqFUc60swSGQjfS4M7/1vwQY2YH/x/h2', 0, NULL, '2026-02-28 01:07:22', '2026-02-28 01:07:22'),
(7, 'partik', 'pratik12@gmail.com', '7789454635', NULL, '$2y$12$wXpbEOCk1pf68oxQ4knha.NeI.mxyc9LGxDWxBl5StXr7KRtR.3AC', 0, NULL, '2026-02-28 01:15:10', '2026-02-28 01:15:10');

-- --------------------------------------------------------

--
-- Table structure for table `wishlists`
--

CREATE TABLE `wishlists` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `size_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `addresses`
--
ALTER TABLE `addresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `addresses_user_id_index` (`user_id`),
  ADD KEY `addresses_is_default_index` (`is_default`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_expiration_index` (`expiration`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_locks_expiration_index` (`expiration`);

--
-- Indexes for table `cancellation_requests`
--
ALTER TABLE `cancellation_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cancellation_requests_processed_by_foreign` (`processed_by`),
  ADD KEY `cancellation_requests_order_id_index` (`order_id`),
  ADD KEY `cancellation_requests_user_id_index` (`user_id`),
  ADD KEY `cancellation_requests_status_index` (`status`),
  ADD KEY `cancellation_requests_status_created_at_index` (`status`,`created_at`);

--
-- Indexes for table `carts`
--
ALTER TABLE `carts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `carts_product_id_foreign` (`product_id`),
  ADD KEY `carts_size_id_foreign` (`size_id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `categories_slug_unique` (`slug`);

--
-- Indexes for table `contacts`
--
ALTER TABLE `contacts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `orders_user_id_index` (`user_id`),
  ADD KEY `orders_status_index` (`status`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_items_order_id_foreign` (`order_id`),
  ADD KEY `order_items_product_id_foreign` (`product_id`);

--
-- Indexes for table `password_resets`
--
ALTER TABLE `password_resets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `password_resets_email_index` (`email`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `products_slug_unique` (`slug`),
  ADD KEY `products_cate_id_foreign` (`cate_id`);

--
-- Indexes for table `product_reviews`
--
ALTER TABLE `product_reviews`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `product_reviews_user_id_product_id_unique` (`user_id`,`product_id`),
  ADD KEY `product_reviews_product_id_foreign` (`product_id`),
  ADD KEY `product_reviews_order_id_foreign` (`order_id`);

--
-- Indexes for table `product_sizes`
--
ALTER TABLE `product_sizes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `product_sizes_product_id_size_unique` (`product_id`,`size`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- Indexes for table `wishlists`
--
ALTER TABLE `wishlists`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `wishlists_user_product_size_unique` (`user_id`,`product_id`,`size_id`),
  ADD KEY `wishlists_product_id_foreign` (`product_id`),
  ADD KEY `wishlists_size_id_foreign` (`size_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `addresses`
--
ALTER TABLE `addresses`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `cancellation_requests`
--
ALTER TABLE `cancellation_requests`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `carts`
--
ALTER TABLE `carts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `contacts`
--
ALTER TABLE `contacts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `password_resets`
--
ALTER TABLE `password_resets`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `product_reviews`
--
ALTER TABLE `product_reviews`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `product_sizes`
--
ALTER TABLE `product_sizes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `wishlists`
--
ALTER TABLE `wishlists`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=54;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `addresses`
--
ALTER TABLE `addresses`
  ADD CONSTRAINT `addresses_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `cancellation_requests`
--
ALTER TABLE `cancellation_requests`
  ADD CONSTRAINT `cancellation_requests_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cancellation_requests_processed_by_foreign` FOREIGN KEY (`processed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `cancellation_requests_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_cate_id_foreign` FOREIGN KEY (`cate_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_reviews`
--
ALTER TABLE `product_reviews`
  ADD CONSTRAINT `product_reviews_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `product_reviews_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `product_reviews_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_sizes`
--
ALTER TABLE `product_sizes`
  ADD CONSTRAINT `product_sizes_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `wishlists`
--
ALTER TABLE `wishlists`
  ADD CONSTRAINT `wishlists_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `wishlists_size_id_foreign` FOREIGN KEY (`size_id`) REFERENCES `product_sizes` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `wishlists_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
