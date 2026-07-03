const getReportServiceBaseUrl = () => String(process.env.REPORT_SERVICE_URL || 'http://localhost:3001').replace(/\/+$/, '');

const getInternalToken = () => {
  return process.env.INTERNAL_SERVICE_TOKEN || (process.env.NODE_ENV !== 'production' ? 'dev-internal-token' : '');
};

type ReportClientFilters = Record<string, string | number | boolean | null | undefined>;
type ReportUpdatePayload = Record<string, string | number | boolean | null | undefined>;

const buildHeaders = (extraHeaders: Record<string, string> = {}) => {
  const token = getInternalToken();
  if (!token) {
    throw new Error('Missing INTERNAL_SERVICE_TOKEN for report service calls');
  }

  return {
    'x-internal-service-token': token,
    ...extraHeaders
  };
};

const parseResponse = async (response) => {
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const error = new Error(data?.message || `Report service request failed with status ${response.status}`) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  return data;
};

class ReportClient {
  static async getReports(page = 1, limit = 20, filters: ReportClientFilters = {}) {
    const url = new URL('/internal/reports', getReportServiceBaseUrl());
    url.searchParams.set('page', String(page));
    url.searchParams.set('limit', String(limit));

    for (const [key, value] of Object.entries(filters || {})) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: buildHeaders()
    });

    return parseResponse(response);
  }

  static async updateReport(reportId, data: ReportUpdatePayload, adminId) {
    const url = new URL(`/internal/reports/${reportId}`, getReportServiceBaseUrl());
    const response = await fetch(url, {
      method: 'PATCH',
      headers: buildHeaders({
        'content-type': 'application/json',
        'x-admin-user-id': String(adminId)
      }),
      body: JSON.stringify(data || {})
    });

    return parseResponse(response);
  }
}

export default ReportClient;
