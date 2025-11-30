# blog-backend

This is a backend repo of the blog-api project

Framework: Express
Database: Postgres
Authentication: Local + JWT

Packages used: express cors helmet passport passport-local passport-jwt bcrypt jsonwebtoken pg dotenv

# API Documentation

Base URL: `/api`

---

## Auth Routes

### Register User

**POST** `/auth/register`  
**Auth:** No  
**Body:**

```json
{
  "username": "string",
  "password": "string",
  "confirmPassword": "string"
}
```

**Response Example:**

```json
{
  "id": 1,
  "username": "john"
}
```

**Description:** Create a new user account.

---

### Login User

**POST** `/auth/login`  
**Auth:** No  
**Body:**

```json
{
  "username": "string",
  "password": "string"
}
```

**Response Example:**

```json
{
  "token": "JWT_TOKEN_HERE",
  "user": {
    "id": 1,
    "username": "john"
  }
}
```

**Description:** Authenticate user and return JWT token.

---

## Posts Routes

### Get Published Posts

**GET** `/posts`  
**Auth:** No  
**Query Parameters (optional):**

- `limit` (default 10)
- `offset` (default 0)
- `commentLimit` (default 5)

**Response Example:**

```json
[
  {
    "id": 1,
    "title": "Oil prices going up!",
    "body": "Funny or serious content",
    "published": true,
    "published_at": "2025-11-30T10:00:00Z",
    "created_at": "2025-11-29T15:00:00Z",
    "updated_at": "2025-11-29T15:00:00Z",
    "author": {
      "id": 1,
      "username": "johndoe"
    },
    "comments": [
      {
        "id": 10,
        "body": "Crazy!",
        "created_at": "2025-11-30T11:00:00Z",
        "author": {
          "id": 2,
          "username": "janedoe"
        }
      }
    ],
    "total_comments": 3
  }
]
```

**Description:** Fetch paginated list of published posts with optional nested comments.

---

### Get Single Post

**GET** `/posts/:postId`  
**Auth:** No

**Response Example:**

```json
{
  "id": 1,
  "title": "Oil prices going up!",
  "body": "Funny or serious content",
  "published": true,
  "published_at": "2025-11-30T10:00:00Z",
  "created_at": "2025-11-29T15:00:00Z",
  "updated_at": "2025-11-29T15:00:00Z",
  "author": {
    "id": 1,
    "username": "johndoe"
  },
  "comments": [
    {
      "id": 10,
      "body": "Crazy!",
      "created_at": "2025-11-30T11:00:00Z",
      "author": {
        "id": 2,
        "username": "janedoe"
      }
    }
  ],
  "total_comments": 3
}
```

**Description:** Fetch a single post by ID with nested comments.

---

### Create Post

**POST** `/posts`  
**Auth:** Yes  
**Body:**

```json
{
  "title": "string",
  "body": "string"
}
```

**Response Example:**

```json
{
  "id": 1,
  "title": "Oil prices going up!",
  "body": "Funny or serious content",
  "published": false,
  "published_at": null,
  "created_at": "2025-11-29T15:00:00Z",
  "updated_at": "2025-11-29T15:00:00Z",
  "author": {
    "id": 1,
    "username": "johndoe"
  },
  "comments": [],
  "total_comments": 0
}
```

**Description:** Create a new post (draft).

---

### Update Post

**PUT** `/posts/:postId`  
**Auth:** Yes  
**Body:**

```json
{
  "title": "string",
  "body": "string"
}
```

**Response Example:**

```json
{
  "id": 1,
  "title": "Updated title",
  "body": "Updated content",
  "published": false,
  "published_at": null,
  "created_at": "2025-11-29T15:00:00Z",
  "updated_at": "2025-11-30T12:00:00Z",
  "author": {
    "id": 1,
    "username": "johndoe"
  },
  "comments": [],
  "total_comments": 0
}
```

**Description:** Update an existing post.

---

### Delete Post

**DELETE** `/posts/:postId`  
**Auth:** Yes

**Response Example:**

```json
{
  "id": 1,
  "title": "Oil prices going up!",
  "body": "Funny or serious content",
  "published": false,
  "published_at": null,
  "created_at": "2025-11-29T15:00:00Z",
  "updated_at": "2025-11-29T15:00:00Z",
  "author": {
    "id": 1,
    "username": "johndoe"
  },
  "comments": [],
  "total_comments": 0
}
```

**Description:** Delete a post.

---

### Publish Post

**PATCH** `/posts/:postId/publish`  
**Auth:** Yes

**Response Example:**

```json
{
  "id": 1,
  "title": "Oil prices going up!",
  "body": "Funny or serious content",
  "published": true,
  "published_at": "2025-11-30T10:00:00Z",
  "created_at": "2025-11-29T15:00:00Z",
  "updated_at": "2025-11-30T10:00:00Z",
  "author": {
    "id": 1,
    "username": "johndoe"
  },
  "comments": [],
  "total_comments": 0
}
```

**Description:** Publish a post.

---

### Get Author Posts

**GET** `/posts/author`  
**Auth:** Yes  
**Query Parameters (optional):**

- `limit` (default 10)
- `offset` (default 0)
- `commentLimit` (default 5)

**Response Example:**

```json
[
  {
    "id": 1,
    "title": "Oil prices going up!",
    "body": "Funny or serious content",
    "published": true,
    "published_at": "2025-11-30T10:00:00Z",
    "created_at": "2025-11-29T15:00:00Z",
    "updated_at": "2025-11-29T15:00:00Z",
    "author": {
      "id": 1,
      "username": "johndoe"
    },
    "comments": [],
    "total_comments": 0
  }
]
```

**Description:** Get posts created by the logged-in author.

---

## Comments Routes (Nested under `/posts/:postId/comments`)

### Get Post Comments

**GET** `/posts/:postId/comments`  
**Auth:** No  
**Query Parameters (optional):**

- `limit` (default 5)
- `offset` (default 0)

**Response Example:**

```json
[
  {
    "id": 10,
    "body": "Crazy!",
    "created_at": "2025-11-30T11:00:00Z",
    "author": {
      "id": 2,
      "username": "janedoe"
    }
  }
]
```

**Description:** Fetch comments for a specific post with pagination.

---

### Create Comment

**POST** `/posts/:postId/comments`  
**Auth:** Yes  
**Body:**

```json
{
  "body": "string"
}
```

**Response Example:**

```json
{
  "id": 10,
  "post_id": 1,
  "user_id": 2,
  "body": "Great post!",
  "created_at": "2025-11-30T11:00:00Z",
  "updated_at": "2025-11-30T11:00:00Z",
  "author": {
    "id": 2,
    "username": "janedoe"
  }
}
```

**Description:** Add a comment to a post.

---

### Update Comment

**PUT** `/posts/:postId/comments/:commentId`  
**Auth:** Yes  
**Body:**

```json
{
  "body": "string"
}
```

**Response Example:**

```json
{
  "id": 10,
  "post_id": 1,
  "user_id": 2,
  "body": "Updated comment!",
  "created_at": "2025-11-30T11:00:00Z",
  "updated_at": "2025-11-30T12:00:00Z",
  "author": {
    "id": 2,
    "username": "janedoe"
  }
}
```

**Description:** Update a specific comment.

---

### Delete Comment

**DELETE** `/posts/:postId/comments/:commentId`  
**Auth:** Yes

**Response Example:**

```json
{
  "id": 10,
  "post_id": 1,
  "user_id": 2,
  "body": "Great post!",
  "created_at": "2025-11-30T11:00:00Z",
  "updated_at": "2025-11-30T11:00:00Z",
  "author": {
    "id": 2,
    "username": "janedoe"
  }
}
```

**Description:** Delete a specific comment.
