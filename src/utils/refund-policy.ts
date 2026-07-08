import { apiClient, supabase } from '@/integrations/api/client';

export interface RefundPolicy {
  id: string;
  policyType: 'standard' | 'flexible' | 'strict' | 'custom';
  name: string;
  description: string;
  refundPercentage: number; // 0-100
  daysBeforeEvent: number;
  isActive: boolean;
  photographerId?: string;
}

export interface RefundRequest {
  id: string;
  paymentId: string;
  bookingId: string;
  requesterId: string;
  reason: string;
  requestedAmount: number;
  refundStatus: 'pending' | 'approved' | 'rejected' | 'processed';
  approvedAmount?: number;
  approvedBy?: string;
  approvalNotes?: string;
  processedDate?: Date;
}

/**
 * Get applicable refund policy for a booking
 */
export async function getApplicableRefundPolicy(
  bookingId: string,
  photographerId: string
): Promise<RefundPolicy | null> {
  try {
    // Check if photographer has custom policy
    const { data: customPolicy } = await apiClient
      .from('refund_policies')
      .select('*')
      .eq('photographer_id', photographerId)
      .eq('is_active', true)
      .single();

    if (customPolicy) {
      return {
        id: customPolicy.id,
        policyType: customPolicy.policy_type,
        name: customPolicy.name,
        description: customPolicy.description,
        refundPercentage: customPolicy.refund_percentage,
        daysBeforeEvent: customPolicy.days_before_event,
        isActive: customPolicy.is_active,
        photographerId: customPolicy.photographer_id,
      };
    }

    // Fall back to default standard policy
    const { data: defaultPolicy } = await supabase
      .from('refund_policies')
      .select('*')
      .eq('policy_type', 'standard')
      .eq('photographer_id', null)
      .is('photographer_id', null)
      .eq('is_active', true)
      .single();

    if (defaultPolicy) {
      return {
        id: defaultPolicy.id,
        policyType: defaultPolicy.policy_type,
        name: defaultPolicy.name,
        description: defaultPolicy.description,
        refundPercentage: defaultPolicy.refund_percentage,
        daysBeforeEvent: defaultPolicy.days_before_event,
        isActive: defaultPolicy.is_active,
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting refund policy:', error);
    return null;
  }
}

/**
 * Calculate refund eligibility and amount
 */
export async function calculateRefundEligibility(
  bookingId: string,
  photographerId: string,
  totalPaid: number
): Promise<{ eligible: boolean; refundAmount: number; reason: string }> {
  try {
    // Get booking details
    const { data: booking } = await supabase
      .from('bookings')
      .select('booking_date, status')
      .eq('id', bookingId)
      .single();

    if (!booking) {
      return { eligible: false, refundAmount: 0, reason: 'Booking not found' };
    }

    // Get refund policy
    const policy = await getApplicableRefundPolicy(bookingId, photographerId);

    if (!policy) {
      return { eligible: false, refundAmount: 0, reason: 'No refund policy found' };
    }

    // Check booking status
    if (booking.status === 'completed') {
      return { eligible: false, refundAmount: 0, reason: 'Cannot refund completed booking' };
    }

    if (booking.status === 'cancelled') {
      return { eligible: false, refundAmount: 0, reason: 'Booking already cancelled' };
    }

    // Calculate days until event
    const now = new Date();
    const eventDate = new Date(booking.booking_date);
    const daysUntilEvent = Math.floor((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Check if within refund window
    if (daysUntilEvent < policy.daysBeforeEvent) {
      return {
        eligible: false,
        refundAmount: 0,
        reason: `Refunds not allowed less than ${policy.daysBeforeEvent} days before event`,
      };
    }

    // Calculate refund amount
    const refundAmount = (totalPaid * policy.refundPercentage) / 100;

    return {
      eligible: true,
      refundAmount,
      reason: `Eligible for ${policy.refundPercentage}% refund (${policy.name})`,
    };
  } catch (error) {
    console.error('Error calculating refund eligibility:', error);
    return { eligible: false, refundAmount: 0, reason: 'Error calculating eligibility' };
  }
}

/**
 * Create refund request
 */
export async function createRefundRequest(
  paymentId: string,
  bookingId: string,
  requesterId: string,
  reason: string,
  requestedAmount: number,
  photographerId: string
): Promise<RefundRequest | null> {
  try {
    // Check eligibility
    const eligibility = await calculateRefundEligibility(bookingId, photographerId, requestedAmount);

    if (!eligibility.eligible && requestedAmount > eligibility.refundAmount) {
      throw new Error(`Refund amount exceeds eligible amount: $${eligibility.refundAmount}`);
    }

    // Create refund request
    const { data: refundRequest, error } = await supabase
      .from('refund_requests')
      .insert([
        {
          payment_id: paymentId,
          booking_id: bookingId,
          requester_id: requesterId,
          reason,
          requested_amount: requestedAmount,
          refund_status: 'pending',
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return {
      id: refundRequest.id,
      paymentId: refundRequest.payment_id,
      bookingId: refundRequest.booking_id,
      requesterId: refundRequest.requester_id,
      reason: refundRequest.reason,
      requestedAmount: refundRequest.requested_amount,
      refundStatus: refundRequest.refund_status,
    };
  } catch (error) {
    console.error('Error creating refund request:', error);
    return null;
  }
}

/**
 * Approve refund request (Admin only)
 */
export async function approveRefundRequest(
  refundRequestId: string,
  approvedAmount: number,
  approvalNotes: string,
  approvedByUserId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('refund_requests')
      .update({
        refund_status: 'approved',
        approved_amount: approvedAmount,
        approval_notes: approvalNotes,
        approved_by: approvedByUserId,
      })
      .eq('id', refundRequestId);

    if (error) throw error;

    // Update payment status to refunded
    const { data: refundRequest } = await supabase
      .from('refund_requests')
      .select('payment_id')
      .eq('id', refundRequestId)
      .single();

    if (refundRequest) {
      await supabase
        .from('payments')
        .update({ payment_status: 'refunded' })
        .eq('id', refundRequest.payment_id);
    }

    return true;
  } catch (error) {
    console.error('Error approving refund:', error);
    return false;
  }
}

/**
 * Reject refund request (Admin only)
 */
export async function rejectRefundRequest(
  refundRequestId: string,
  rejectionReason: string,
  rejectedByUserId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('refund_requests')
      .update({
        refund_status: 'rejected',
        approval_notes: rejectionReason,
        approved_by: rejectedByUserId,
      })
      .eq('id', refundRequestId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error rejecting refund:', error);
    return false;
  }
}

/**
 * Process refund (Admin only)
 */
export async function processRefund(refundRequestId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('refund_requests')
      .update({
        refund_status: 'processed',
        processed_date: new Date().toISOString(),
      })
      .eq('id', refundRequestId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error processing refund:', error);
    return false;
  }
}

/**
 * Get refund requests for booking
 */
export async function getRefundRequests(bookingId: string): Promise<RefundRequest[]> {
  try {
    const { data, error } = await supabase
      .from('refund_requests')
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(r => ({
      id: r.id,
      paymentId: r.payment_id,
      bookingId: r.booking_id,
      requesterId: r.requester_id,
      reason: r.reason,
      requestedAmount: r.requested_amount,
      refundStatus: r.refund_status,
      approvedAmount: r.approved_amount,
      approvedBy: r.approved_by,
      approvalNotes: r.approval_notes,
      processedDate: r.processed_date ? new Date(r.processed_date) : undefined,
    }));
  } catch (error) {
    console.error('Error fetching refund requests:', error);
    return [];
  }
}

/**
 * Get refund policy text for display
 */
export function getRefundPolicyText(policy: RefundPolicy): string {
  return `
    <div class="refund-policy">
      <h3>${policy.name}</h3>
      <p>${policy.description}</p>
      <ul>
        <li>Refund Percentage: ${policy.refundPercentage}%</li>
        <li>Eligible if cancelled at least ${policy.daysBeforeEvent} days before event</li>
        <li>Status: ${policy.isActive ? 'Active' : 'Inactive'}</li>
      </ul>
    </div>
  `;
}

/**
 * Get default refund policies
 */
export function getDefaultRefundPolicies(): RefundPolicy[] {
  return [
    {
      id: '1',
      policyType: 'standard',
      name: 'Standard Refund Policy',
      description: 'Full refund if cancelled at least 7 days before the event.',
      refundPercentage: 100,
      daysBeforeEvent: 7,
      isActive: true,
    },
    {
      id: '2',
      policyType: 'flexible',
      name: 'Flexible Refund Policy',
      description: 'Full refund up to 24 hours before the event.',
      refundPercentage: 100,
      daysBeforeEvent: 1,
      isActive: true,
    },
    {
      id: '3',
      policyType: 'strict',
      name: 'Non-Refundable',
      description: 'No refunds once booking is confirmed.',
      refundPercentage: 0,
      daysBeforeEvent: 0,
      isActive: true,
    },
  ];
}
