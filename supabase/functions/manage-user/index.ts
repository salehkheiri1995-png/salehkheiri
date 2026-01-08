import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Verify the requesting user is an admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user: requestingUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !requestingUser) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if requesting user is admin
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', requestingUser.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError || !roleData) {
      console.error('Role check failed:', roleError);
      return new Response(
        JSON.stringify({ error: 'شما دسترسی ادمین ندارید' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { action, user_id, full_name, phone, role, delete_options } = await req.json();

    console.log('Managing user:', user_id, 'Action:', action);

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'شناسه کاربر الزامی است' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prevent admin from deleting themselves
    if (action === 'delete' && user_id === requestingUser.id) {
      return new Response(
        JSON.stringify({ error: 'شما نمی‌توانید خودتان را حذف کنید' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'update') {
      // Update profile
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({ 
          full_name: full_name || null,
          phone: phone || null 
        })
        .eq('id', user_id);

      if (profileError) {
        console.error('Profile update error:', profileError);
        return new Response(
          JSON.stringify({ error: 'خطا در به‌روزرسانی پروفایل' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update role if provided
      if (role) {
        // First delete existing roles for this user
        await supabaseAdmin
          .from('user_roles')
          .delete()
          .eq('user_id', user_id);

        // Insert new role if not 'user' (user is default with no role entry)
        if (role !== 'user') {
          const { error: roleInsertError } = await supabaseAdmin
            .from('user_roles')
            .insert({
              user_id: user_id,
              role: role
            });

          if (roleInsertError) {
            console.error('Role insert error:', roleInsertError);
            return new Response(
              JSON.stringify({ error: 'خطا در تنظیم نقش' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }
      }

      console.log('User updated successfully:', user_id);
      return new Response(
        JSON.stringify({ success: true, message: 'کاربر با موفقیت به‌روزرسانی شد' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (action === 'delete') {
      const options = delete_options || { orders: true, bookings: true, enrollments: true, reviews: true };
      
      console.log('Delete options:', options);

      // Delete or nullify related data based on options
      if (options.orders) {
        // Delete order items first, then orders
        const { data: userOrders } = await supabaseAdmin
          .from('orders')
          .select('id')
          .eq('user_id', user_id);
        
        if (userOrders && userOrders.length > 0) {
          const orderIds = userOrders.map(o => o.id);
          await supabaseAdmin
            .from('order_items')
            .delete()
            .in('order_id', orderIds);
          
          await supabaseAdmin
            .from('orders')
            .delete()
            .eq('user_id', user_id);
        }
        console.log('Deleted orders for user:', user_id);
      } else {
        // Set user_id to null (preserve data)
        await supabaseAdmin
          .from('orders')
          .update({ user_id: null })
          .eq('user_id', user_id);
        console.log('Nullified orders user_id for:', user_id);
      }

      if (options.bookings) {
        await supabaseAdmin
          .from('bookings')
          .delete()
          .eq('user_id', user_id);
        console.log('Deleted bookings for user:', user_id);
      } else {
        await supabaseAdmin
          .from('bookings')
          .update({ user_id: null })
          .eq('user_id', user_id);
        console.log('Nullified bookings user_id for:', user_id);
      }

      if (options.enrollments) {
        // Delete lesson progress first
        await supabaseAdmin
          .from('lesson_progress')
          .delete()
          .eq('user_id', user_id);
        
        await supabaseAdmin
          .from('course_enrollments')
          .delete()
          .eq('user_id', user_id);
        console.log('Deleted enrollments for user:', user_id);
      }

      if (options.reviews) {
        await supabaseAdmin
          .from('reviews')
          .delete()
          .eq('user_id', user_id);
        console.log('Deleted reviews for user:', user_id);
      }

      // Delete notifications
      await supabaseAdmin
        .from('notifications')
        .delete()
        .eq('user_id', user_id);

      // Delete user roles
      await supabaseAdmin
        .from('user_roles')
        .delete()
        .eq('user_id', user_id);

      // Delete profile
      await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', user_id);

      // Finally delete the user from auth
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user_id);

      if (deleteError) {
        console.error('Delete user error:', deleteError);
        return new Response(
          JSON.stringify({ error: 'خطا در حذف کاربر: ' + deleteError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('User deleted successfully:', user_id);
      return new Response(
        JSON.stringify({ success: true, message: 'کاربر با موفقیت حذف شد' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else {
      return new Response(
        JSON.stringify({ error: 'عملیات نامعتبر' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'خطای غیرمنتظره' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});