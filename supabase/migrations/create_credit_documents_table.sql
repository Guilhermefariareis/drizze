-- Create credit_documents table
CREATE TABLE IF NOT EXISTS public.credit_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    credit_request_id UUID NOT NULL REFERENCES public.credit_requests(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'pending',
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES auth.users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_credit_documents_credit_request_id ON public.credit_documents(credit_request_id);
CREATE INDEX IF NOT EXISTS idx_credit_documents_status ON public.credit_documents(status);
CREATE INDEX IF NOT EXISTS idx_credit_documents_document_type ON public.credit_documents(document_type);

-- Enable RLS (Row Level Security)
ALTER TABLE public.credit_documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own credit documents" ON public.credit_documents
    FOR SELECT USING (
        credit_request_id IN (
            SELECT id FROM public.credit_requests 
            WHERE patient_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all credit documents" ON public.credit_documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can insert their own credit documents" ON public.credit_documents
    FOR INSERT WITH CHECK (
        credit_request_id IN (
            SELECT id FROM public.credit_requests 
            WHERE patient_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all credit documents" ON public.credit_documents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_credit_documents_updated_at 
    BEFORE UPDATE ON public.credit_documents 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE public.credit_documents IS 'Stores documents uploaded for credit requests';
COMMENT ON COLUMN public.credit_documents.document_type IS 'Type of document (e.g., identity, income_proof, bank_statement)';
COMMENT ON COLUMN public.credit_documents.status IS 'Document verification status (pending, approved, rejected)';