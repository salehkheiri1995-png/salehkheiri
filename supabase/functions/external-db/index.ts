import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Pool } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Connection pool for better performance
let pool: Pool | null = null;

function sanitizeDatabaseUrl(raw: string): string {
  // Secrets sometimes get pasted with quotes or whitespace/newlines
  let url = raw.trim();
  url = url.replace(/^"(.+)"$/, "$1");
  url = url.replace(/^'(.+)'$/, "$1");
  // Some providers use postgresql:// which is equivalent
  url = url.replace(/^postgresql:\/\//i, "postgres://");
  return url;
}

function getPool(): Pool {
  if (!pool) {
    const raw = Deno.env.get("EXTERNAL_DATABASE_URL");
    if (!raw) {
      throw new Error("EXTERNAL_DATABASE_URL is not set");
    }

    const databaseUrl = sanitizeDatabaseUrl(raw);

    // Validate format early with safe debug info (no credentials)
    try {
      const u = new URL(databaseUrl);
      console.log("External DB URL:", `${u.protocol}//${u.hostname}${u.port ? ":" + u.port : ""}${u.pathname}`);
    } catch {
      throw new Error("EXTERNAL_DATABASE_URL is invalid (could not parse)");
    }

    pool = new Pool(databaseUrl, 3, true);
  }
  return pool;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace('/external-db', '');
    const method = req.method;

    const pool = getPool();
    const client = await pool.connect();

    try {
      let result;

      // Parse request body for POST/PUT
      let body = null;
      if (method === 'POST' || method === 'PUT') {
        body = await req.json();
      }

      // ===== COURSES =====
      if (path === '/courses' && method === 'GET') {
        result = await client.queryObject(`
          SELECT * FROM "Course" 
          WHERE is_active = true 
          ORDER BY created_at DESC
        `);
        return new Response(JSON.stringify(result.rows), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (path.match(/^\/courses\/[^/]+$/) && method === 'GET') {
        const id = path.split('/')[2];
        result = await client.queryObject(
          `SELECT * FROM "Course" WHERE id = $1`,
          [id]
        );
        return new Response(JSON.stringify(result.rows[0] || null), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (path === '/courses' && method === 'POST') {
        const { title, description, price, instructor_name, duration_hours, level, image_url, is_active, is_new, course_type } = body;
        result = await client.queryObject(
          `INSERT INTO "Course" (title, description, price, instructor_name, duration_hours, level, image_url, is_active, is_new, course_type, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
           RETURNING *`,
          [title, description, price || 0, instructor_name, duration_hours || 0, level || 'مبتدی', image_url, is_active ?? true, is_new ?? false, course_type || 'ویدیویی']
        );
        return new Response(JSON.stringify(result.rows[0]), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 201,
        });
      }

      if (path.match(/^\/courses\/[^/]+$/) && method === 'PUT') {
        const id = path.split('/')[2];
        const { title, description, price, instructor_name, duration_hours, level, image_url, is_active, is_new, course_type } = body;
        result = await client.queryObject(
          `UPDATE "Course" SET 
            title = $1, description = $2, price = $3, instructor_name = $4, 
            duration_hours = $5, level = $6, image_url = $7, is_active = $8, 
            is_new = $9, course_type = $10, updated_at = NOW()
           WHERE id = $11
           RETURNING *`,
          [title, description, price, instructor_name, duration_hours, level, image_url, is_active, is_new, course_type, id]
        );
        return new Response(JSON.stringify(result.rows[0]), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (path.match(/^\/courses\/[^/]+$/) && method === 'DELETE') {
        const id = path.split('/')[2];
        await client.queryObject(`DELETE FROM "Course" WHERE id = $1`, [id]);
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // ===== LESSONS =====
      if (path.match(/^\/courses\/[^/]+\/lessons$/) && method === 'GET') {
        const courseId = path.split('/')[2];
        result = await client.queryObject(
          `SELECT * FROM "CourseLessonItem" WHERE course_id = $1 ORDER BY order_index`,
          [courseId]
        );
        return new Response(JSON.stringify(result.rows), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (path.match(/^\/courses\/[^/]+\/lessons$/) && method === 'POST') {
        const courseId = path.split('/')[2];
        const { title, description, video_url, duration_minutes, order_index, is_free } = body;
        result = await client.queryObject(
          `INSERT INTO "CourseLessonItem" (course_id, title, description, video_url, duration_minutes, order_index, is_free, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
           RETURNING *`,
          [courseId, title, description, video_url, duration_minutes || 0, order_index || 0, is_free ?? false]
        );
        return new Response(JSON.stringify(result.rows[0]), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 201,
        });
      }

      // ===== ENROLLMENTS =====
      if (path.match(/^\/courses\/[^/]+\/enrollments$/) && method === 'GET') {
        const courseId = path.split('/')[2];
        result = await client.queryObject(
          `SELECT ce.*, u.email, u.name as full_name 
           FROM "CourseEnrollment" ce 
           LEFT JOIN "User" u ON ce.user_id = u.id 
           WHERE ce.course_id = $1`,
          [courseId]
        );
        return new Response(JSON.stringify(result.rows), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (path.match(/^\/courses\/[^/]+\/enroll$/) && method === 'POST') {
        const courseId = path.split('/')[2];
        const { user_id } = body;
        result = await client.queryObject(
          `INSERT INTO "CourseEnrollment" (course_id, user_id, enrolled_at, progress_percent, created_at, updated_at)
           VALUES ($1, $2, NOW(), 0, NOW(), NOW())
           RETURNING *`,
          [courseId, user_id]
        );
        return new Response(JSON.stringify(result.rows[0]), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 201,
        });
      }

      // ===== SERVICES =====
      if (path === '/services' && method === 'GET') {
        result = await client.queryObject(`
          SELECT * FROM "Service" 
          WHERE is_active = true 
          ORDER BY created_at DESC
        `);
        return new Response(JSON.stringify(result.rows), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // ===== PRODUCTS =====
      if (path === '/products' && method === 'GET') {
        result = await client.queryObject(`
          SELECT * FROM "Product" 
          WHERE is_active = true 
          ORDER BY created_at DESC
        `);
        return new Response(JSON.stringify(result.rows), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // ===== SPECIALISTS =====
      if (path === '/specialists' && method === 'GET') {
        result = await client.queryObject(`
          SELECT * FROM "Specialist" 
          WHERE is_active = true 
          ORDER BY created_at DESC
        `);
        return new Response(JSON.stringify(result.rows), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // ===== BOOKINGS =====
      if (path === '/bookings' && method === 'GET') {
        result = await client.queryObject(`
          SELECT b.*, s.name as service_name, sp.full_name as specialist_name
          FROM "Booking" b
          LEFT JOIN "Service" s ON b.service_id = s.id
          LEFT JOIN "Specialist" sp ON b.specialist_id = sp.id
          ORDER BY b.booking_date DESC, b.booking_time DESC
        `);
        return new Response(JSON.stringify(result.rows), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // ===== ORDERS =====
      if (path === '/orders' && method === 'GET') {
        result = await client.queryObject(`
          SELECT * FROM "Order" 
          ORDER BY created_at DESC
        `);
        return new Response(JSON.stringify(result.rows), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // ===== USERS =====
      if (path === '/users' && method === 'GET') {
        result = await client.queryObject(`
          SELECT id, email, name, created_at FROM "User" 
          ORDER BY created_at DESC
        `);
        return new Response(JSON.stringify(result.rows), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Not found
      return new Response(JSON.stringify({ error: 'Not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });

    } finally {
      client.release();
    }

  } catch (error: unknown) {
    console.error('Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
