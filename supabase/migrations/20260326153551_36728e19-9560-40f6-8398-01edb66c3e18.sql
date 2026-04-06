CREATE TABLE public.reserved_doc_numbers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  doc_number text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, doc_number)
);

ALTER TABLE public.reserved_doc_numbers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reserved numbers"
  ON public.reserved_doc_numbers FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reserved numbers"
  ON public.reserved_doc_numbers FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);