-- Ensure credit_documents table has correct schema
DO $$
BEGIN
    -- Ensure file_name exists (renaming document_name if it exists)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'credit_documents' AND column_name = 'document_name') AND
       NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'credit_documents' AND column_name = 'file_name') THEN
        ALTER TABLE public.credit_documents RENAME COLUMN document_name TO file_name;
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'credit_documents' AND column_name = 'file_name') THEN
        ALTER TABLE public.credit_documents ADD COLUMN file_name TEXT;
    END IF;

    -- Add missing patient_id column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'credit_documents' AND column_name = 'patient_id') THEN
        ALTER TABLE public.credit_documents ADD COLUMN patient_id UUID REFERENCES public.profiles(id);
    END IF;
    
    -- Ensure document_type is TEXT or appropriate VARCHAR
    ALTER TABLE public.credit_documents ALTER COLUMN document_type TYPE TEXT;
END $$;

-- Update RLS policies for credit_documents to use patient_id
DROP POLICY IF EXISTS "Users can view their own credit documents" ON public.credit_documents;
CREATE POLICY "Users can view their own credit documents" ON public.credit_documents
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM public.profiles 
            WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert their own credit documents" ON public.credit_documents;
CREATE POLICY "Users can insert their own credit documents" ON public.credit_documents
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM public.profiles 
            WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update their own credit documents" ON public.credit_documents;
CREATE POLICY "Users can update their own credit documents" ON public.credit_documents
    FOR UPDATE USING (
        patient_id IN (
            SELECT id FROM public.profiles 
            WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete their own credit documents" ON public.credit_documents;
CREATE POLICY "Users can delete their own credit documents" ON public.credit_documents
    FOR DELETE USING (
        patient_id IN (
            SELECT id FROM public.profiles 
            WHERE user_id = auth.uid()
        )
    );
