---
title: api-documentation

---

# API Documentation

## Authentication

### Register
**POST** `/api/auth/register`

**Body**
| Field | Type | Description |
|-------|------|-------------|
| username | string | Desired username |
| email | string | User email address |
| password | string | User password |

**Example**
![dfe1fc33-4da7-4234-bae3-6aaa2d8b842a](https://hackmd.io/_uploads/SJcQVVoJzl.png)


---

### Login
**POST** `/api/auth/login`

**Body**
| Field | Type | Description |
|-------|------|-------------|
| email | string | User email address |
| password | string | User password |

**Response** — Returns a JWT token signed with `user_id`, stored in a cookie upon successful login.
```json
{
  "success": true,
  "message": "Login successful",
  "data": { ... }
}
```

**Example**
![b4b42c64-03f4-4b8e-8dfd-67503db63434](https://hackmd.io/_uploads/SJRPE4sJfl.png)

---

### Get Current User
**GET** `/api/auth/me`

Retrieves the full user data from the database based on the `user_id` from the authenticated JWT token.

**Example**
![bc3564d5-a067-4387-a341-6d376161963b](https://hackmd.io/_uploads/r14oNEjyfe.png)


---

### Logout
**POST** `/api/auth/logout`

Logs the user out by clearing the user data stored in the cookie.

---

## Categories

### Get All Categories
**GET** `/api/categories`

Returns all available categories on the platform. Used as metadata on the frontend for navigating items by category.

**Query Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| name | string | Filter categories by name |

**Example**
![11b7568c-ff82-4936-8a81-4af08d711cf8](https://hackmd.io/_uploads/B1UAE4i1zx.png)


---

## Items

### Get All Items
**GET** `/api/items`

Returns a paginated list of items with optional filters. Used on the homepage and for viewing all items from a specific seller's profile (e.g., `/api/items?seller_id=<user_id>`).

**Query Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| query | string | Search keyword |
| page | number | Page number |
| limit | number | Number of items per page |
| category | string | Filter by category |
| seller_id | string | Filter by seller's user ID |

**Example**
![4efa69c6-9b0f-4bd3-a3b2-74f92a9d1e4f](https://hackmd.io/_uploads/H1GxHNi1fl.png)

---

### Get Item by ID
**GET** `/api/items/:id`

Fetches a single item by its ID.

**Path Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | The item's unique ID |

**Example**
![2477b82f-25dc-4bc2-a309-b722f527d437](https://hackmd.io/_uploads/Syp8BEo1fx.png)


---

### Create Item
**POST** `/api/items` *Requires authentication*

**Body (form-data)**
| Field | Type | Description |
|-------|------|-------------|
| name | string | Item name |
| description | string | Item description |
| category | string | Item category |
| specs | string (stringify of an object) | Item specifications |
| price | number | Item price |
| stock | number | Available stock |
| condition | string | Item condition (e.g., new, used) |
| picture_url | string | Image URL from Cloudinary |

**Response**
```json
{
  "success": true,
  "message": "Item created successfully",
  "data": { ... }
}
```

**Example**
![676d9a10-7356-429c-92c3-ad456819abda](https://hackmd.io/_uploads/Byf9BVs1zg.png)


---

### Update Item
**PUT** `/api/items/:id` *Requires authentication*

**Path Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | The item's unique ID |

**Body (form-data)**
| Field | Type | Description |
|-------|------|-------------|
| name | string | Item name |
| description | string | Item description |
| category | string | Item category |
| specs | string/object | Item specifications |
| price | number | Item price |
| stock | number | Available stock |
| condition | string | Item condition |
| picture_url | string | Image URL from Cloudinary |

**Response**
```json
{
  "success": true,
  "message": "Item updated successfully",
  "data": { ... }
}
```

**Example**
![dd9dff94-c75d-4f8f-8281-d97762557871](https://hackmd.io/_uploads/HyLTSEskGg.png)


---

### Delete Item
**DELETE** `/api/items/:id` *Requires authentication*

**Path Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | The item's unique ID |

**Example**
![43b5fa67-e4f1-49f1-8fd5-3a445f7b30fb](https://hackmd.io/_uploads/B1s1UNikMg.png)

---

## Reviews

### Create Review
**POST** `/api/reviews` *Requires authentication*

**Body**
| Field | Type | Description |
|-------|------|-------------|
| item_id | string | The ID of the item being reviewed |
| rating | number | Rating score |
| comment | string | Review comment |

**Example**
![9f8b5eb6-b572-4378-88b1-bc1aaaaaed13](https://hackmd.io/_uploads/SkaZLVokGl.png)

---

### Delete Review
**DELETE** `/api/reviews/:id` *Requires authentication*

Deletes a review. Only the owner of the review can delete it (`user_id` must match the authenticated user's ID).

**Path Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | The review's unique ID |

**Body**
| Field | Type | Description |
|-------|------|-------------|
| item_id | string | The ID of the associated item |

**Example**
![da64e5e8-457b-4b42-bfe7-3a2cb5eeae89](https://hackmd.io/_uploads/r1tPI4j1zg.png)

---

## Users

### Get User Profile
**GET** `/api/users/:id`

Returns the public profile of a user by their ID.

**Path Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | The user's unique ID |

**Example**
![bc956cce-91b3-4f99-846e-1c450f5d06a9](https://hackmd.io/_uploads/SJeK8VikGe.png)

---

### Add Balance
**PUT** `/api/users/add-balance` *Requires authentication*

Adds balance to the authenticated user's account. *(Dummy implementationm, no payment gateway integration at this time.)*

**Example**
![6a1d835e-e460-4aa3-a1e0-38f595ae7f9f](https://hackmd.io/_uploads/HknjL4ikGl.png)

---

### Get Cart
**GET** `/api/users/cart` *Requires authentication*

Returns all items currently in the authenticated user's cart.

**Example**
![image](https://hackmd.io/_uploads/ryTewEs1Mg.png)

---

### Add Item to Cart
**PUT** `/api/users/cart` *Requires authentication*

Adds an item to the authenticated user's cart.
![2c5ef792-93d9-478c-ae6c-b21994d18109](https://hackmd.io/_uploads/BkOGDNj1Mx.png)

---

### Remove Item from Cart
**DELETE** `/api/users/cart/:id` *Requires authentication*

Removes a specific item from the cart.

**Path Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | The cart item's unique ID |

**Example**
![e60318f6-7460-4b7c-8351-38e6f127af24](https://hackmd.io/_uploads/SyHIDEjyze.png)

---

## Transactions

### Create Transaction
**POST** `/api/transaction`

Processes a checkout transaction. Before completing, the following conditions are validated:
- Buyer has sufficient balance
- Item is in stock

If conditions are met, the following actions are performed:
- Buyer's balance is deducted
- Seller's balance is increased
- Item stock is reduced
- Transaction snapshot is recorded
- Item is removed from the buyer's cart

**Body**
| Field | Type | Description |
|-------|------|-------------|
| item_id | string | The ID of the item being purchased |

**Example**
![e9496d92-8dc6-462a-8a03-51266345f3d7](https://hackmd.io/_uploads/BkKwDNo1Gl.png)


---

### Get Transaction History
**GET** `/api/transaction`

Returns the transaction history for the authenticated user.

**Example**
![3688939d-5102-4eca-922b-e2e688bae70b](https://hackmd.io/_uploads/rJMKvEoyzg.png)


