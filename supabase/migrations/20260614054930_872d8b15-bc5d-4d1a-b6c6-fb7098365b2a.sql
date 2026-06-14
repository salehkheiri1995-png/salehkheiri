
-- Fix: orders INSERT must enforce user_id matches auth.uid() or be NULL (guest)
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
CREATE POLICY "Anyone can create orders"
ON public.orders
FOR INSERT
WITH CHECK (
  user_id IS NULL OR user_id = auth.uid()
);

-- Fix: order_items INSERT must reference an order owned by the inserter
-- (or a freshly-created guest order). Prevents injecting items into other users' orders.
DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;
CREATE POLICY "Users can create items for own orders"
ON public.order_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_items.order_id
      AND (
        o.user_id = auth.uid()
        OR (o.user_id IS NULL AND o.created_at > now() - INTERVAL '5 minutes')
      )
  )
);
