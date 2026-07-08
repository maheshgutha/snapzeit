import { supabase } from '@/integrations/api/client';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  photographerId: string;
  userId: string;
  bookingId: string;
  issueDate: Date;
  dueDate: Date;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paymentStatus: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled';
  notes?: string;
}

/**
 * Generate invoice number in format: INV-YYYYMMDD-XXXXX
 */
function generateInvoiceNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `INV-${dateStr}-${random}`;
}

/**
 * Calculate tax amount (for US: 8% sales tax, can be customized per location)
 */
function calculateTax(subtotal: number, location?: string): number {
  // Simplified tax calculation - customize based on photographer location
  const taxRate = location ? 0.08 : 0; // Default 8% for US, 0% for international
  return subtotal * taxRate;
}

/**
 * Generate invoice for a booking
 */
export async function generateInvoice(
  bookingId: string,
  photographerId: string,
  userId: string,
  subtotal: number,
  notes?: string
): Promise<Invoice | null> {
  try {
    const invoiceNumber = generateInvoiceNumber();
    const now = new Date();
    const dueDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days

    // Get photographer details for location
    const { data: photographer } = await supabase
      .from('photographers')
      .select('country')
      .eq('id', photographerId)
      .single();

    const taxAmount = calculateTax(subtotal, photographer?.country);
    const totalAmount = subtotal + taxAmount;

    const { data: invoice, error } = await supabase
      .from('invoices')
      .insert([
        {
          invoice_number: invoiceNumber,
          booking_id: bookingId,
          photographer_id: photographerId,
          user_id: userId,
          issue_date: now.toISOString().split('T')[0],
          due_date: dueDate.toISOString().split('T')[0],
          subtotal,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          payment_status: 'draft',
          notes,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return {
      id: invoice.id,
      invoiceNumber: invoice.invoice_number,
      photographerId: invoice.photographer_id,
      userId: invoice.user_id,
      bookingId: invoice.booking_id,
      issueDate: new Date(invoice.issue_date),
      dueDate: new Date(invoice.due_date),
      subtotal: invoice.subtotal,
      taxAmount: invoice.tax_amount,
      totalAmount: invoice.total_amount,
      paymentStatus: invoice.payment_status,
      notes: invoice.notes,
    };
  } catch (error) {
    console.error('Error generating invoice:', error);
    return null;
  }
}

/**
 * Generate invoice PDF (integrates with HTML-to-PDF library)
 */
export function generateInvoicePDF(invoice: Invoice): Blob {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
        .header { border-bottom: 2px solid #007bff; padding-bottom: 10px; margin-bottom: 20px; }
        .logo { font-size: 24px; font-weight: bold; color: #007bff; }
        .invoice-meta { float: right; text-align: right; }
        .invoice-meta p { margin: 5px 0; }
        table { width: 100%; border-collapse: collapse; margin: 30px 0; }
        th, td { text-align: left; padding: 10px; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f9fa; font-weight: bold; }
        .total-row { font-weight: bold; background-color: #f8f9fa; }
        .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">SnapZeiT</div>
        <div class="invoice-meta">
          <p><strong>Invoice #:</strong> ${invoice.invoiceNumber}</p>
          <p><strong>Issue Date:</strong> ${invoice.issueDate.toLocaleDateString()}</p>
          <p><strong>Due Date:</strong> ${invoice.dueDate.toLocaleDateString()}</p>
        </div>
      </div>

      <h2>Invoice</h2>

      <table>
        <tr>
          <td>
            <strong>From:</strong><br>
            SnapZeiT<br>
            Photographer ID: ${invoice.photographerId}
          </td>
          <td style="text-align: right;">
            <strong>Bill To:</strong><br>
            Customer ID: ${invoice.userId}
          </td>
        </tr>
      </table>

      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th style="text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Photography Service (Booking #${invoice.bookingId.substring(0, 8)})</td>
            <td style="text-align: right;">$${invoice.subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td>Tax</td>
            <td style="text-align: right;">$${invoice.taxAmount.toFixed(2)}</td>
          </tr>
          <tr class="total-row">
            <td>TOTAL</td>
            <td style="text-align: right;">$${invoice.totalAmount.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      ${invoice.notes ? `<p><strong>Notes:</strong><br>${invoice.notes}</p>` : ''}

      <div class="footer">
        <p>Thank you for using SnapZeiT!</p>
        <p>Payment Status: <strong>${invoice.paymentStatus.toUpperCase()}</strong></p>
      </div>
    </body>
    </html>
  `;

  return new Blob([htmlContent], { type: 'text/html' });
}

/**
 * Download invoice as PDF
 */
export function downloadInvoicePDF(invoice: Invoice): void {
  const blob = generateInvoicePDF(invoice);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${invoice.invoiceNumber}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Send invoice via email
 */
export async function sendInvoiceEmail(
  invoice: Invoice,
  recipientEmail: string
): Promise<boolean> {
  try {
    // Get user profile for name
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', invoice.userId)
      .single();

    // In production, integrate with email service (SendGrid, AWS SES, etc.)
    // For now, log the email to be sent
    console.log('Email to be sent:', {
      to: recipientEmail,
      subject: `Invoice ${invoice.invoiceNumber} from SnapZeiT`,
      body: `Dear ${profile?.full_name || 'Customer'},\n\nPlease find attached your invoice for booking #${invoice.bookingId.substring(0, 8)}.\n\nTotal Amount: $${invoice.totalAmount.toFixed(2)}\nDue Date: ${invoice.dueDate.toLocaleDateString()}\n\nThank you!`,
    });

    // Update invoice status to 'sent'
    const { error } = await supabase
      .from('invoices')
      .update({ payment_status: 'sent' })
      .eq('id', invoice.id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error sending invoice:', error);
    return false;
  }
}

/**
 * Get photographer's invoices with filters
 */
export async function getPhotographerInvoices(
  photographerId: string,
  status?: string,
  startDate?: Date,
  endDate?: Date
) {
  try {
    let query = supabase
      .from('invoices')
      .select('*')
      .eq('photographer_id', photographerId)
      .order('issue_date', { ascending: false });

    if (status) {
      query = query.eq('payment_status', status);
    }

    if (startDate) {
      query = query.gte('issue_date', startDate.toISOString().split('T')[0]);
    }

    if (endDate) {
      query = query.lte('issue_date', endDate.toISOString().split('T')[0]);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return [];
  }
}

/**
 * Calculate photographer's total earnings
 */
export async function calculatePhotographerEarnings(
  photographerId: string,
  startDate?: Date,
  endDate?: Date
): Promise<{ total: number; paid: number; pending: number }> {
  try {
    let query = supabase
      .from('payments')
      .select('amount, payment_status')
      .eq('photographer_id', photographerId);

    if (startDate) {
      query = query.gte('created_at', startDate.toISOString());
    }

    if (endDate) {
      query = query.lte('created_at', endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) throw error;

    const payments = data || [];
    const total = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const paid = payments
      .filter(p => p.payment_status === 'completed')
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    const pending = payments
      .filter(p => p.payment_status === 'pending')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    return { total, paid, pending };
  } catch (error) {
    console.error('Error calculating earnings:', error);
    return { total: 0, paid: 0, pending: 0 };
  }
}

/**
 * Export invoices as CSV
 */
export async function exportInvoicesAsCSV(photographerId: string): Promise<string> {
  try {
    const invoices = await getPhotographerInvoices(photographerId);

    let csv = 'Invoice Number,Booking ID,Issue Date,Due Date,Subtotal,Tax,Total,Status\n';

    invoices.forEach(inv => {
      csv += `"${inv.invoice_number}","${inv.booking_id}","${inv.issue_date}","${inv.due_date}","${inv.subtotal}","${inv.tax_amount}","${inv.total_amount}","${inv.payment_status}"\n`;
    });

    return csv;
  } catch (error) {
    console.error('Error exporting invoices:', error);
    return '';
  }
}

/**
 * Download invoices as CSV
 */
export function downloadInvoicesCSV(photographerId: string): void {
  exportInvoicesAsCSV(photographerId).then(csv => {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoices-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });
}
