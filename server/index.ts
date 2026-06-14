import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { loginRouter } from "./middleware/auth";

// Load environment variables
dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

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

// GET all users
app.get("/api/users", async (req: Request, res: Response) => {
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

// GET single user
app.get("/api/users/:id", async (req: Request, res: Response) => {
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
});

// CREATE user
app.post("/api/users", async (req: Request, res: Response) => {
  try {
    const { email, name, password, phone } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

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

// UPDATE user
app.put("/api/users/:id", async (req: Request, res: Response) => {
  try {
    const { name, phone, avatar, password } = req.body;

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

// DELETE user
app.delete("/api/users/:id", async (req: Request, res: Response) => {
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

// GET all courses
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

// GET single course
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

// CREATE course
app.post("/api/courses", async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      instructor_name,
      price,
      duration_hours,
      level,
      image_url,
    } = req.body;

    if (!title || !description || !instructor_name || !price) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        instructor_name,
        price: parseFloat(price),
        duration_hours: parseInt(duration_hours) || 0,
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

// UPDATE course
app.put("/api/courses/:id", async (req: Request, res: Response) => {
  try {
    const course = await prisma.course.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: "Failed to update course" });
  }
});

// DELETE course
app.delete("/api/courses/:id", async (req: Request, res: Response) => {
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

// GET lessons for a course
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

// CREATE lesson
app.post("/api/lessons", async (req: Request, res: Response) => {
  try {
    const { course_id, title, description, video_url, duration_minutes } =
      req.body;

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

// GET enrollments
app.get("/api/enrollments", async (req: Request, res: Response) => {
  try {
    const enrollments = await prisma.courseEnrollment.findMany({
      include: { user: true, course: true },
    });
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch enrollments" });
  }
});

// CREATE enrollment
app.post("/api/enrollments", async (req: Request, res: Response) => {
  try {
    const { user_id, course_id, email, student_name, phone } = req.body;

    if (!user_id || !course_id || !email) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const enrollment = await prisma.courseEnrollment.create({
      data: {
        user_id,
        course_id,
        email,
        student_name,
        phone,
      },
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

// GET all products
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

// GET single product
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

// CREATE product
app.post("/api/products", async (req: Request, res: Response) => {
  try {
    const { title, description, price, category, stock, image_url } = req.body;

    if (!title || !price || !category) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const product = await prisma.product.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        category,
        stock: parseInt(stock) || 0,
        image_url,
      },
    });
    res.json(product);
  } catch (error) {
    console.error("❌ Error creating product:", error);
    res.status(500).json({ error: "Failed to create product" });
  }
});

// UPDATE product
app.put("/api/products/:id", async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Failed to update product" });
  }
});

// DELETE product
app.delete("/api/products/:id", async (req: Request, res: Response) => {
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

// GET all services
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

// CREATE service
app.post("/api/services", async (req: Request, res: Response) => {
  try {
    const { title, description, price, duration, icon_url } = req.body;

    if (!title || !price || !duration) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const service = await prisma.service.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        duration: parseInt(duration),
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

// GET all bookings
app.get("/api/bookings", async (req: Request, res: Response) => {
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

// GET user bookings
app.get("/api/bookings/user/:userId", async (req: Request, res: Response) => {
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
});

// CREATE booking
app.post("/api/bookings", async (req: Request, res: Response) => {
  try {
    const { user_id, service_id, date, time, notes } = req.body;

    if (!user_id || !service_id || !date || !time) {
      return res.status(400).json({ error: "Missing required fields" });
    }

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

// UPDATE booking status
app.put("/api/bookings/:id", async (req: Request, res: Response) => {
  try {
    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: "Failed to update booking" });
  }
});

// ==================== SHOPPING CART ====================

// GET cart items
app.get("/api/cart/:userId", async (req: Request, res: Response) => {
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

// ADD to cart
app.post("/api/cart", async (req: Request, res: Response) => {
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

// REMOVE from cart
app.delete("/api/cart/:id", async (req: Request, res: Response) => {
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

// GET all orders
app.get("/api/orders", async (req: Request, res: Response) => {
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

// GET user orders
app.get("/api/orders/user/:userId", async (req: Request, res: Response) => {
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
});

// CREATE order
app.post("/api/orders", async (req: Request, res: Response) => {
  try {
    const {
      user_id,
      total_price,
      payment_method,
      shipping_address,
      items,
    } = req.body;

    if (!user_id || !total_price || !items || items.length === 0) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const order = await prisma.order.create({
      data: {
        user_id,
        total_price: parseFloat(total_price),
        payment_method,
        shipping_address,
        items: {
          create: items.map(
            (item: { product_id: string; quantity: number; price: number }) => ({
              product_id: item.product_id,
              quantity: item.quantity,
              price: item.price,
            })
          ),
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

// GET reviews
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

// CREATE review
app.post("/api/reviews", async (req: Request, res: Response) => {
  try {
    const { user_id, course_id, product_id, rating, comment } = req.body;

    if (!user_id || !rating || !comment) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const review = await prisma.review.create({
      data: {
        user_id,
        course_id,
        product_id,
        rating,
        comment,
      },
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
