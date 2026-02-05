/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ReportResponse } from '../models/ReportResponse';
import type { ReportStatus } from '../models/ReportStatus';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AdminService {
    /**
     * Approve Report
     * @param reportId
     * @returns ReportResponse Successful Response
     * @throws ApiError
     */
    public static approveReportApiReportsReportIdApprovePost(
        reportId: number,
    ): CancelablePromise<ReportResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admin/reports/{report_id}/approve',
            path: {
                'report_id': reportId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Reject Report
     * @param reportId
     * @returns ReportResponse Successful Response
     * @throws ApiError
     */
    public static rejectReportApiReportsReportIdRejectPost(
        reportId: number,
    ): CancelablePromise<ReportResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admin/reports/{report_id}/reject',
            path: {
                'report_id': reportId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Reports
     * @param status
     * @param skip
     * @param limit
     * @returns ReportResponse Successful Response
     * @throws ApiError
     */
    public static getReportsApiReportsGet(
        status?: (ReportStatus | null),
        skip?: number,
        limit: number = 100,
    ): CancelablePromise<Array<ReportResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/admin/reports',
            query: {
                'status': status,
                'skip': skip,
                'limit': limit,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
