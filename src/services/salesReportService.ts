import api from './api';

// Sales data for a single day
export interface SalesDayData {
    day: string;
    day_ar: string;
    date: string;
    storeSales: number;
    merchantSales: number;
    storeOrdersCount: number;
    merchantOrdersCount: number;
}

// Sales report summary
export interface SalesReportSummary {
    total_store_sales: number;
    total_merchant_sales: number;
    total_sales: number;
}

// Public sales report response
export interface PublicSalesReportResponse {
    success: boolean;
    data: {
        sales_data: SalesDayData[];
        summary: SalesReportSummary;
        period: string;
        generated_at: string;
    };
    message?: string;
}

// Get public sales report for homepage (no auth required)
export const getPublicSalesReport = async (): Promise<PublicSalesReportResponse> => {
    const response = await api.get<PublicSalesReportResponse>('/reports/public-sales');
    return response.data;
};
