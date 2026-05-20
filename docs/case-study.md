---
title: case-study

---

## Real-World Case Study
- **Company**: eBay
- **Specific Use Case**: Flexible Product Catalog Management and High-Performance Search
### Research Summary
In managing millions of products across various categories, eBay requires a database system capable of handling highly diverse and dynamic data structures. Each product has different attributes depending on its type, such as laptops with RAM and CPU specifications, or smartphones with camera and battery details. This creates a need for a flexible, schema-less system that can efficiently accommodate varying data formats. 

Initially, the use of relational databases introduced several challenges, including the need for multiple tables, unused columns, and complex JOIN operations. These issues led to decreased performance, particularly in product search and data retrieval at scale. 

To address these limitations, eBay adopted the Document Store paradigm using MongoDB. This approach allows each product to be stored as a JSON-like document with a flexible structure tailored to its specifications. By embedding related data within a single document, the system eliminates the need for complex JOIN operations, resulting in improved read performance.

Furthermore, the Document Store model enables the system to adapt to continuously evolving product data without requiring significant schema modifications. This is especially important in a read-heavy marketplace environment, where users frequently search and browse product information.

### Creative Project Idea
- Title: TradeSpace
A student-focused marketplace platform for buying and selling tech gadgets and electronics among verified university students. The platform accommodates a wide variety of product categories such as laptops, smartphones, and peripherals, where each listing can have different and flexible attributes depending on its product type. Access is restricted to verified university students through campus email verification, creating a trusted and focused trading community.

### Comparison Between Using MongoDB and PostgreSQL for Retrieving Items Data
#### UML Diagram of GET /api/items using Mongodb database
![Flowchart Framework-2026-05-20-103526](https://hackmd.io/_uploads/Hy9BJEjJfg.png)

#### UML Diagram of GET /api/items using PostgreSQL database
![Flowchart Framework-2026-05-20-125710](https://hackmd.io/_uploads/HkU3JNo1fl.png)

#### Result of Stress Testing for GET /api/items using Mongodb database
![Screenshot 2026-05-20 105423](https://hackmd.io/_uploads/S1LyxVikzg.png)

#### Result of Stress Testing for GET /api/items using PostgreSQL database
![Screenshot 2026-05-20 105453](https://hackmd.io/_uploads/Sk4MgVsyfl.png)

#### Graph Comparison of Latency
![comparison_improved](https://hackmd.io/_uploads/Hys4l4skMl.png)

#### Graph Comparison of Throughput
![throughput_comparison](https://hackmd.io/_uploads/rkYUeVskzx.png)

#### Summary
|Metric              | NoSQL (MongoDB) | SQL (PostgreSQL) | Difference |
|-----               |--------|-----|--------|
|Average Latency (ms)| 159.26       | 625.97     | NoSQL 4x faster |
|Max Latency (ms)    | 746.11      | 2,693.67     | SQL spiked  |
|Throughput (req/s)  | 101.17      | 25.84     | NoSQL 4x higher  |
