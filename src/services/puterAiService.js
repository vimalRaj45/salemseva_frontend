// Puter.js Dynamic Loader and AI RAG Synthesis Service for Shazu One Admin Operations

let puterLoadingPromise = null;

export function loadPuterScript() {
  if (typeof window !== 'undefined' && window.puter && window.puter.ai) {
    return Promise.resolve(window.puter);
  }
  if (puterLoadingPromise) {
    return puterLoadingPromise;
  }

  puterLoadingPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('Window is undefined'));

    // Check if script tag already exists
    const existing = document.querySelector('script[src*="js.puter.com"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.puter));
      existing.addEventListener('error', () => reject(new Error('Puter script failed to load')));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.puter.com/v2/';
    script.async = true;
    script.onload = () => {
      if (window.puter) {
        resolve(window.puter);
      } else {
        reject(new Error('Puter object not found on window after script load'));
      }
    };
    script.onerror = () => {
      reject(new Error('Unable to connect to Puter.js CDN'));
    };
    document.head.appendChild(script);
  });

  return puterLoadingPromise;
}

const SYSTEM_PROMPT = `You are the Shazu One Operations Intelligence Copilot for Salem, Tamil Nadu.
Your job is to assist the Operations Admin by answering questions based strictly on the retrieved database records from the Neon PostgreSQL schema.

Shazu One Context:
- Operating localities: Fairlands, Hasthampatti, Suramangalam, Ammapet, Shevapet, Gugai, Alagapuram, Meyyanur, Kondalampatti, Kannankurichi, Gorimedu, Steel Plant Area.
- Primary trades: AC Repair (ac), Electrician (electrician), Plumber (plumber), Cleaning (cleaning).

Admin Dashboard Navigation System:
- Live Dispatch Queue: tab = "ops", filter = <customerName or phone or status>
- Customer 360 Dossier: tab = "customers", search = <customerPhone or name>, customerId = <uuid>
- Technician Fleet & KYC: tab = "technicians", filter = <techName or trade or "pending_kyc">
- . & QR Settlements: tab = "settlements", filter = <"pending_verification" or customerUtr>
- Support Tickets Desk: tab = "tickets", filter = <ticketNumber or customerPhone>
- Settings & Pricing: tab = "rewards"

Response Guidelines:
1. Provide a direct, professional, concise response in 2-4 sentences explaining what was found.
2. Formulate 1 to 4 actionable navigation items linking to the appropriate Admin Dashboard tabs so the admin can review or take immediate operational action.
3. Output a strictly valid JSON action block at the end delimited by:
\`\`\`json:actions
{
  "summary": "Brief summary sentence",
  "actions": [
    {
      "label": "Clickable Button Label",
      "tab": "ops | customers | technicians | settlements | tickets | rewards",
      "filter": "search query or filter keyword",
      "bookingId": "optional booking UUID",
      "customerId": "optional customer UUID",
      "techId": "optional technician UUID"
    }
  ]
}
\`\`\``;

export async function askPuterRag({
  query,
  ragContext,
  data,
  suggestedActions = [],
  model = 'gpt-4o-mini'
}) {
  try {
    const puter = await loadPuterScript();
    if (!puter || !puter.ai || !puter.ai.chat) {
      throw new Error('Puter AI chat engine unavailable');
    }

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Operations Question: "${query}"\n\nDatabase Retrieved Data (RAG Context):\n${ragContext || 'No records matched.'}`
      }
    ];

    const response = await puter.ai.chat(messages, { model });
    const replyText = typeof response === 'string' ? response : (response?.message?.content || response?.text || String(response));

    // Parse actions JSON from ```json:actions ... ``` or ```json ... ```
    let parsedActions = null;
    const jsonMatch = replyText.match(/```(?:json:actions|json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        parsedActions = JSON.parse(jsonMatch[1]);
      } catch (_) { }
    }

    // Clean conversational explanation text without the JSON block
    const cleanExplanation = replyText.replace(/```(?:json:actions|json)?[\s\S]*?```/g, '').trim();

    const finalActions = (parsedActions?.actions && Array.isArray(parsedActions.actions) && parsedActions.actions.length > 0)
      ? parsedActions.actions
      : suggestedActions;

    return {
      success: true,
      explanation: cleanExplanation || parsedActions?.summary || 'Operational lookup completed.',
      actions: finalActions,
      rawReply: replyText
    };
  } catch (err) {
    console.warn('Puter AI note, using native deterministic fallback:', err.message);

    // High quality offline / direct deterministic fallback
    let fallbackText = 'Retrieved operational data from Shazu One database.';
    if (data?.bookings?.length > 0) {
      fallbackText = `Found ${data.bookings.length} matching booking(s). Most recent: ${data.bookings[0].service_id?.toUpperCase()} in ${data.bookings[0].locality} (Status: ${data.bookings[0].status}).`;
    } else if (data?.customers?.length > 0) {
      fallbackText = `Found ${data.customers.length} customer record(s). Customer: ${data.customers[0].full_name} (${data.customers[0].phone}) in ${data.customers[0].locality}.`;
    } else if (data?.technicians?.length > 0) {
      fallbackText = `Found ${data.technicians.length} technician record(s). Top partner: ${data.technicians[0].full_name} (${data.technicians[0].primary_trade}, Rating: ${data.technicians[0].rating_avg}).`;
    } else if (data?.payments?.length > 0) {
      fallbackText = `Found ${data.payments.length} payment record(s) matching your request.`;
    } else if (data?.tickets?.length > 0) {
      fallbackText = `Found ${data.tickets.length} support ticket(s). Ticket #${data.tickets[0].ticket_number} (Status: ${data.tickets[0].status}).`;
    } else {
      fallbackText = `No records matching "${query}" were found in Shazu One operations database.`;
    }

    return {
      success: true,
      explanation: fallbackText,
      actions: suggestedActions,
      isFallback: true
    };
  }
}
