import { apiRequest } from '../client'

export async function subscribeNewsletter(email: string): Promise<{ unsubscribeToken?: string }> {
  return apiRequest('/newsletter/subscribe', {
    method: 'POST',
    body: { email },
    auth: false,
    cart: false,
  })
}

export async function unsubscribeNewsletter(token: string): Promise<void> {
  await apiRequest('/newsletter/unsubscribe', {
    method: 'POST',
    body: { token },
    auth: false,
    cart: false,
  })
}

export async function submitPartnershipInquiry(input: {
  email: string
  name: string
  message: string
}): Promise<void> {
  await apiRequest('/partnerships/inquiries', {
    method: 'POST',
    body: input,
    auth: false,
    cart: false,
  })
}

export async function submitQuotation(input: { email: string; details: string }): Promise<void> {
  await apiRequest('/quotations', {
    method: 'POST',
    body: input,
    auth: false,
    cart: false,
  })
}

export async function submitAgentRequest(input: { email: string; message: string }): Promise<void> {
  await apiRequest('/support/agent-requests', {
    method: 'POST',
    body: input,
    auth: false,
    cart: false,
  })
}
