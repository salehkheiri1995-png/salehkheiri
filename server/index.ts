import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { z } from "zod";
import { loginRouter, authMiddleware } from "./middleware/auth";

// Load environment variables
dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// ==================== ZOD SCHEMAS ====================

const userCreateSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).optional(),
  password: z.string().min(6),
  phone: z.string().min(5).optional(),
});

const userUpdateSchema = z
  .object({
    name: z.string().min(1).optional(),
    phone: z.string().min(5).optional(),
    avatar: z.string().url().optional(),
    password: z.string().min(6).optional(),
  })
  .strict();

const courseCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  instructor_name: z.string().min(1),
  price: z.union([z.number(), z.string()]),
  duration_hours: z.union([z.number(), z.string()]).optional(),
  level: z.string().optional(),
  image_url: z.string().url().optional(),
});

const courseUpdateSchema = courseCreateSchema.partial();

const productCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  price: z.union([z.number(), z.string()]),
  category: z.string().min(1),
  stock: z.union([z.number(), z.string()]).optional(),
  image_url: z.string().url().optional(),
});

const productUpdateSchema = productCreateSchema.partial();

const serviceCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  price: z.union([z.number(), z.string()]),
  duration: z.union([z.number(), z.string()]),
  icon_url: z.string().url().optional(),
});

const enrollmentCreateSchema = z.object({
  user_id: z.string().min(1),
  course_id: z.string().min(1),
  email: z.string().email(),
  student_name: z.string().optional(),
  phone: z.string().optional(),
});

const bookingCreateSchema = z.object({
  user_id: z.string().min(1),
  service_id: z.string().min(1),
  date: z.string().min(1),
  time: z.string().min(1),
  notes: z.string().optional(),
});

const bookingUpdateSchema = z
  .object({
    date: z.string().optional(),
    time: z.string().optional(),
    notes: z.string().optional(),
  })
  .partial();

const orderItemSchema = z.object({
  product_id: z.string().min(1),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
});

const orderCreateSchema = z.object({
  user_id: z.string().min(1),
  total_price: z.union([z.number(), z.string()]),
  payment_method: z.string().optional(),
  shipping_address: z.string().optional(),
  items: z.array(orderItemSchema).min(1),
});

const reviewCreateSchema = z.object({
  user_id: z.string().min(1),
  course_id: z.string().optional(),
  product_id: z.string().optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1),
});

// ==================== MIDDLEWARE ====================
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

// ==================== AUTH ROUTES ====================
app.use("/api/auth", loginRouter);

// ==================== HEALTH CHECK ====================
app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    message: "Server is running",
    database: "PostgreSQL (Local)",
    timestamp: new Date().toISOString(),
  });
});

// ==================== USERS ====================

// GET all users (protected)
app.get("/api/users", authMiddleware, async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        created_at: true,
      },
    });
    res.json(users);
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// GET single user (protected)
app.get(
  "/api/users/:id",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.params.id },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          avatar: true,
          created_at: true,
          enrollments: true,
          reviews: true,
          bookings: true,
        },
      });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  }
);

// CREATE user (public - signup)
app.post("/api/users", async (req: Request, res: Response) => {
  try {
    const parsed = userCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid user data", details: parsed.error.flatten() });
    }

    const { email, name, password, phone } = parsed.data;

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        phone,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        created_at: true,
      },
    });
    res.json(user);
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(400).json({ error: "Email already exists" });
    }
    console.error("❌ Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// UPDATE user (protected)
app.put("/api/users/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const parsed = userUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: "Invalid user update data", details: parsed.error.flatten() });
    }

    const { name, phone, avatar, password } = parsed.data;

    const data: any = { name, phone, avatar };

    if (password) {
      data.password = await bcrypt.hash(password, 12);
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        created_at: true,
      },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to update user" });
  }
});

// DELETE user (protected)
app.delete("/api/users/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.delete({
      where: { id: req.params.id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        created_at: true,
      },
    });
    res.json({ message: "User deleted", user });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// ==================== COURSES ====================

// GET all courses (public)
app.get("/api/courses", async (req: Request, res: Response) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        lessons: true,
        enrollments: true,
        reviews: true,
      },
      orderBy: { created_at: "desc" },
    });
    res.json(courses);
  } catch (error) {
    console.error("❌ Error fetching courses:", error);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
});

// GET single course (public)
app.get("/api/courses/:id", async (req: Request, res: Response) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
      include: {
        lessons: { orderBy: { order_index: "asc" } },
        enrollments: true,
        reviews: true,
      },
    });
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch course" });
  }
});

// CREATE course (protected)
app.post("/api/courses", authMiddleware, async (req: Request, res: Response) => {
  try {
    const parsed = courseCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: "Invalid course data", details: parsed.error.flatten() });
    }

    const {
      title,
      description,
      instructor_name,
      price,
      duration_hours,
      level,
      image_url,
    } = parsed.data;

    const course = await prisma.course.create({
      data: {
        title,
        description,
        instructor_name,
        price: typeof price === "string" ? parseFloat(price) : price,
        duration_hours:
          typeof duration_hours === "string"
            ? parseInt(duration_hours)
            : duration_hours || 0,
        level: level || "مبتدی",
        image_url,
      },
    });
    res.json(course);
  } catch (error) {
    console.error("❌ Error creating course:", error);
    res.status(500).json({ error: "Failed to create course" });
  }
});

// UPDATE course (protected)
app.put("/api/courses/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const parsed = courseUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: "Invalid course update data", details: parsed.error.flatten() });
    }

    const data: any = { ...parsed.data };

    if (data.price && typeof data.price === "string") {
      data.price = parseFloat(data.price);
    }
    if (data.duration_hours && typeof data.duration_hours === "string") {
      data.duration_hours = parseInt(data.duration_hours);
    }

    const course = await prisma.course.update({
      where: { id: req.params.id },
      data,
    });
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: "Failed to update course" });
  }
});

// DELETE course (protected)
app.delete("/api/courses/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const course = await prisma.course.delete({
      where: { id: req.params.id },
    });
    res.json({ message: "Course deleted", course });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete course" });
  }
});

// ==================== COURSE LESSONS ====================

// GET lessons for a course (public)
app.get("/api/courses/:courseId/lessons", async (req: Request, res: Response) => {
  try {
    const lessons = await prisma.courseLessonItem.findMany({
      where: { course_id: req.params.courseId },
      orderBy: { order_index: "asc" },
    });
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch lessons" });
  }
});

// CREATE lesson (protected)
app.post("/api/lessons", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { course_id, title, description, video_url, duration_minutes } = req.body;

    if (!course_id || !title) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const lesson = await prisma.courseLessonItem.create({
      data: {
        course_id,
        title,
        description,
        video_url,
        duration_minutes: parseInt(duration_minutes) || 0,
        order_index: 0,
      },
    });
    res.json(lesson);
  } catch (error) {
    console.error("❌ Error creating lesson:", error);
    res.status(500).json({ error: "Failed to create lesson" });
  }
});

// ==================== COURSE ENROLLMENTS ====================

// GET enrollments (protected)
app.get("/api/enrollments", authMiddleware, async (req: Request, res: Response) => {
  try {
    const enrollments = await prisma.courseEnrollment.findMany({
      include: { user: true, course: true },
    });
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch enrollments" });
  }
});

// CREATE enrollment (protected)
app.post("/api/enrollments", authMiddleware, async (req: Request, res: Response) => {
  try {
    const parsed = enrollmentCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: "Invalid enrollment data", details: parsed.error.flatten() });
    }

    const enrollment = await prisma.courseEnrollment.create({
      data: parsed.data,
    });
    res.json(enrollment);
  } catch (error: any) {
    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ error: "User already enrolled in this course" });
    }
    console.error("❌ Error creating enrollment:", error);
    res.status(500).json({ error: "Failed to create enrollment" });
  }
});

// ==================== PRODUCTS ====================

// GET all products (public)
app.get("/api/products", async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: { reviews: true },
      orderBy: { created_at: "desc" },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// GET single product (public)
app.get("/api/products/:id", async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { reviews: true },
    });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// CREATE product (protected)
app.post("/api/products", authMiddleware, async (req: Request, res: Response) => {
  try {
    const parsed = productCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: "Invalid product data", details: parsed.error.flatten() });
    }

    const { title, description, price, category, stock, image_url } = parsed.data;

    const product = await prisma.product.create({
      data: {
        title,
        description,
        price: typeof price === "string" ? parseFloat(price) : price,
        category,
        stock: typeof stock === "string" ? parseInt(stock) : stock || 0,
        image_url,
      },
    });
    res.json(product);
  } catch (error) {
    console.error("❌ Error creating product:", error);
    res.status(500).json({ error: "Failed to create product" });
  }
});

// UPDATE product (protected)
app.put("/api/products/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const parsed = productUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: "Invalid product update data", details: parsed.error.flatten() });
    }

    const data: any = { ...parsed.data };
    if (data.price && typeof data.price === "string") {
      data.price = parseFloat(data.price);
    }
    if (data.stock && typeof data.stock === "string") {
      data.stock = parseInt(data.stock);
    }

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data,
    });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Failed to update product" });
  }
});

// DELETE product (protected)
app.delete("/api/products/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.delete({
      where: { id: req.params.id },
    });
    res.json({ message: "Product deleted", product });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete product" });
  }
});

// ==================== SERVICES ====================

// GET all services (public)
app.get("/api/services", async (req: Request, res: Response) => {
  try {
    const services = await prisma.service.findMany({
      orderBy: { created_at: "desc" },
    });
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch services" });
  }
});

// CREATE service (protected)
app.post("/api/services", authMiddleware, async (req: Request, res: Response) => {
  try {
    const parsed = serviceCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: "Invalid service data", details: parsed.error.flatten() });
    }

    const { title, description, price, duration, icon_url } = parsed.data;

    const service = await prisma.service.create({
      data: {
        title,
        description,
        price: typeof price === "string" ? parseFloat(price) : price,
        duration: typeof duration === "string" ? parseInt(duration) : duration,
        icon_url,
      },
    });
    res.json(service);
  } catch (error) {
    console.error("❌ Error creating service:", error);
    res.status(500).json({ error: "Failed to create service" });
  }
});

// ==================== BOOKINGS ====================

// GET all bookings (protected)
app.get("/api/bookings", authMiddleware, async (req: Request, res: Response) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: { user: true, service: true },
      orderBy: { created_at: "desc" },
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// GET user bookings (protected)
app.get(
  "/api/bookings/user/:userId",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const bookings = await prisma.booking.findMany({
        where: { user_id: req.params.userId },
        include: { service: true },
        orderBy: { created_at: "desc" },
      });
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  }
);

// CREATE booking (protected)
app.post("/api/bookings", authMiddleware, async (req: Request, res: Response) => {
  try {
    const parsed = bookingCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: "Invalid booking data", details: parsed.error.flatten() });
    }

    const { user_id, service_id, date, time, notes } = parsed.data;

    const booking = await prisma.booking.create({
      data: {
        user_id,
        service_id,
        date: new Date(date),
        time,
        notes,
      },
    });
    res.json(booking);
  } catch (error) {
    console.error("❌ Error creating booking:", error);
    res.status(500).json({ error: "Failed to create booking" });
  }
});

// UPDATE booking status (protected)
app.put("/api/bookings/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const parsed = bookingUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: "Invalid booking update data", details: parsed.error.flatten() });
    }

    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data: parsed.data,
    });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: "Failed to update booking" });
  }
});

// ==================== SHOPPING CART ====================

// GET cart items (protected)
app.get("/api/cart/:userId", authMiddleware, async (req: Request, res: Response) => {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { user_id: req.params.userId },
      include: { product: true },
    });
    res.json(cartItems);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch cart" });
  }
});

// ADD to cart (protected)
app.post("/api/cart", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { user_id, product_id, quantity } = req.body;

    if (!user_id || !product_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const cartItem = await prisma.cartItem.upsert({
      where: { user_id_product_id: { user_id, product_id } },
      create: { user_id, product_id, quantity: quantity || 1 },
      update: { quantity: quantity || 1 },
    });
    res.json(cartItem);
  } catch (error) {
    console.error("❌ Error adding to cart:", error);
    res.status(500).json({ error: "Failed to add to cart" });
  }
});

// REMOVE from cart (protected)
app.delete("/api/cart/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const cartItem = await prisma.cartItem.delete({
      where: { id: req.params.id },
    });
    res.json({ message: "Item removed from cart", cartItem });
  } catch (error) {
    res.status(500).json({ error: "Failed to remove from cart" });
  }
});

// ==================== ORDERS ====================

// GET all orders (protected)
app.get("/api/orders", authMiddleware, async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: { items: { include: { product: true } }, user: true },
      orderBy: { created_at: "desc" },
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// GET user orders (protected)
app.get(
  "/api/orders/user/:userId",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const orders = await prisma.order.findMany({
        where: { user_id: req.params.userId },
        include: { items: { include: { product: true } } },
        orderBy: { created_at: "desc" },
      });
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  }
);

// CREATE order (protected)
app.post("/api/orders", authMiddleware, async (req: Request, res: Response) => {
  try {
    const parsed = orderCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: "Invalid order data", details: parsed.error.flatten() });
    }

    const { user_id, total_price, payment_method, shipping_address, items } =
      parsed.data;

    const order = await prisma.order.create({
      data: {
        user_id,
        total_price:
          typeof total_price === "string" ? parseFloat(total_price) : total_price,
        payment_method,
        shipping_address,
        items: {
          create: items.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: { items: true },
    });
    res.json(order);
  } catch (error) {
    console.error("❌ Error creating order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// ==================== REVIEWS ====================

// GET reviews (public)
app.get("/api/reviews", async (req: Request, res: Response) => {
  try {
    const reviews = await prisma.review.findMany({
      include: { user: true },
      orderBy: { created_at: "desc" },
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// CREATE review (protected)
app.post("/api/reviews", authMiddleware, async (req: Request, res: Response) => {
  try {
    const parsed = reviewCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: "Invalid review data", details: parsed.error.flatten() });
    }

    const review = await prisma.review.create({
      data: parsed.data,
    });
    res.json(review);
  } catch (error) {
    console.error("❌ Error creating review:", error);
    res.status(500).json({ error: "Failed to create review" });
  }
});

// ==================== ERROR HANDLING ====================

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found", path: req.path });
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("❌ Unhandled error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

// ==================== SERVER START ====================

app.listen(PORT, () => {
  console.log("🎉 ================================");
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`🔌 API: http://localhost:${PORT}/api`);
  console.log(`📊 Database: PostgreSQL (Local - salehkheiri)`);
  console.log(`🗄️  Prisma Studio: npm run db:studio`);
  console.log("🎉 ================================");
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n⏹️  Shutting down...");
  await prisma.$disconnect();
  process.exit(0);
});
